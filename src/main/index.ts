import { app, BrowserWindow, Tray, Menu, globalShortcut, screen, nativeImage } from 'electron'
import { execFileSync } from 'child_process'
import { join } from 'path'
import { initDatabase } from './database'
import { startWatcher, stopWatcher } from './clipboard-watcher'
import { registerIpcHandlers } from './ipc'

const WINDOW_HEIGHT = 360
const HOTKEY = 'CommandOrControl+Shift+V'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let previousAppBundleId: string | null = null

function getWindow(): BrowserWindow | null {
  return mainWindow
}

function getPreviousAppBundleId(): string | null {
  return previousAppBundleId
}

const SAFE_BUNDLE_ID = /^[A-Za-z0-9.\-]{1,256}$/

function captureFrontmostApp(): void {
  if (process.platform !== 'darwin') return
  try {
    const out = execFileSync('osascript', [
      '-e',
      'tell application "System Events" to get bundle identifier of first application process whose frontmost is true'
    ])
    const id = out.toString().trim()
    previousAppBundleId = id && SAFE_BUNDLE_ID.test(id) ? id : null
  } catch {
    previousAppBundleId = null
  }
}

function createWindow(): void {
  const { width } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height: WINDOW_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    hasShadow: false,
    vibrancy: process.platform === 'darwin' ? 'under-window' : undefined,
    visualEffectState: 'active',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('blur', () => {
    mainWindow?.hide()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // The renderer never legitimately navigates away from the loaded local file.
  // Block any in-window navigation and any new window to keep an injected
  // `dangerouslySetInnerHTML` payload from steering the always-on-top window
  // off-site or spawning a lookalike BrowserWindow.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = new URL(mainWindow!.webContents.getURL()).origin
    if (new URL(url).origin !== allowed) event.preventDefault()
  })
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
}

function positionWindow(): void {
  if (!mainWindow) return
  const { workArea } = screen.getDisplayNearestPoint(screen.getCursorScreenPoint())
  mainWindow.setBounds({
    x: workArea.x,
    y: workArea.y + workArea.height - WINDOW_HEIGHT,
    width: workArea.width,
    height: WINDOW_HEIGHT
  })
}

function toggleWindow(): void {
  if (!mainWindow) return
  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    // Remember which app is active right now so we can restore focus to it before pasting.
    captureFrontmostApp()
    positionWindow()
    mainWindow.show()
    mainWindow.focus()
    mainWindow.webContents.send('window:shown')
  }
}

function createTray(): void {
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon)
  tray.setToolTip('BPaste')
  const menu = Menu.buildFromTemplate([
    { label: 'Hiện BPaste', click: toggleWindow },
    { type: 'separator' },
    { label: 'Thoát', click: () => app.quit() }
  ])
  tray.setContextMenu(menu)
  tray.on('click', toggleWindow)
}

app.whenReady().then(() => {
  initDatabase()
  createWindow()
  createTray()
  registerIpcHandlers(getWindow, getPreviousAppBundleId)

  startWatcher((record, isNew) => {
    mainWindow?.webContents.send('clips:changed', { record, isNew })
  })

  globalShortcut.register(HOTKEY, toggleWindow)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  // Keep running in the tray; do not quit on window close.
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
  stopWatcher()
})

if (process.platform === 'darwin') {
  // Accessory apps never become the active application, so hiding the window
  // returns focus to the previously active app (required for auto-paste to land).
  app.setActivationPolicy('accessory')
  app.dock?.hide()
}
