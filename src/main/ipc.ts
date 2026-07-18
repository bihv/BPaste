import { ipcMain, clipboard, nativeImage, BrowserWindow, app } from 'electron'
import { exec, execFile } from 'child_process'
import { readFileSync } from 'fs'
import { join, basename, isAbsolute, normalize } from 'path'
import { createRequire } from 'module'
import {
  listClips,
  searchClips,
  getClip,
  deleteClip,
  setPinned,
  updateClip,
  clearAll,
  type ClipRecord
} from './database'
import { markSelfWrite } from './clipboard-watcher'

const require = createRequire(import.meta.url)
const DOMPurify = require('dompurify')

export function readFileAsDataUrl(filePath: string): string | null {
  try {
    const ext = filePath.toLowerCase()
    const mimeType = ext.endsWith('.png') ? 'image/png' : 'image/jpeg'
    const data = readFileSync(filePath)
    return `data:${mimeType};base64,${data.toString('base64')}`
  } catch {
    return null
  }
}

export interface PasteResult {
  ok: boolean
}

function writeClipToClipboard(record: ClipRecord): void {
  if (record.type === 'image' && record.image_path) {
    const img = nativeImage.createFromBuffer(readFileSync(record.image_path))
    clipboard.writeImage(img)
  } else if (record.type === 'richtext' || record.type === 'link') {
    clipboard.write({
      text: record.preview || record.content.replace(/<[^>]+>/g, ' '),
      html: record.type === 'richtext' ? record.content : undefined,
      rtf: record.rtf ?? undefined
    })
  } else {
    clipboard.writeText(record.content)
  }

  markSelfWrite(record.hash)
}

function writeClipAsPlainText(record: ClipRecord): void {
  let plainText = ''
  if (record.type === 'link') {
    plainText = record.content
  } else if (record.type === 'richtext') {
    plainText = record.preview || record.content.replace(/<[^>]+>/g, ' ')
  } else if (record.type === 'image') {
    return
  } else {
    plainText = record.content
  }
  clipboard.writeText(plainText)
  markSelfWrite(record.hash)
}

// AppleScript bundle identifiers are a strict charset; reject anything else to
// avoid AppleScript-level `&`-injection via CFBundleIdentifier contents.
const SAFE_BUNDLE_ID = /^[A-Za-z0-9.\-]{1,256}$/

function simulatePaste(previousAppBundleId?: string | null): void {
  if (process.platform === 'darwin') {
    // The bundle id is passed as an argv string literal (via `on run argv`), so
    // it can never be parsed as AppleScript source.
    const safeBundleId =
      previousAppBundleId && SAFE_BUNDLE_ID.test(previousAppBundleId) ? previousAppBundleId : ''
    const script = safeBundleId
      ? 'on run argv\n' +
        '  set bundleId to item 1 of argv\n' +
        '  tell application id bundleId to activate\n' +
        '  delay 0.05\n' +
        '  tell application "System Events" to keystroke "v" using command down\n' +
        'end run'
      : 'tell application "System Events" to keystroke "v" using command down'
    const args = safeBundleId ? ['-e', script, safeBundleId] : ['-e', script]
    execFile('osascript', args, () => {})
  } else if (process.platform === 'win32') {
    exec(
      'powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).SendKeys(\'^v\')"',
      () => {}
    )
  } else {
    exec('xdotool key --clearmodifiers ctrl+v', () => {})
  }
}

export function registerIpcHandlers(
  getWindow: () => BrowserWindow | null,
  getPreviousAppBundleId: () => string | null = () => null
): void {
  ipcMain.handle('clips:list', () => listClips())

  ipcMain.handle('clips:search', (_e, query: string) => {
    if (!query || !query.trim()) return listClips()
    return searchClips(query.trim())
  })

  ipcMain.handle('clips:delete', (_e, id: number) => {
    deleteClip(id)
    return true
  })

  ipcMain.handle('clips:pin', (_e, id: number, pinned: boolean) => {
    setPinned(id, pinned)
    return true
  })

  ipcMain.handle('clips:update', (_e, id: number, content: string, preview: string) => {
    const sanitized = DOMPurify.sanitize(content, { USE_PROFILES: { html: true } })
    const record = updateClip(id, sanitized, preview)
    return record ?? null
  })

  ipcMain.handle('clips:clear', () => {
    clearAll()
    return true
  })

  ipcMain.handle('clips:paste', (_e, id: number) => {
    const record = getClip(id)
    if (!record) return { ok: false }
    writeClipToClipboard(record)
    const previousAppBundleId = getPreviousAppBundleId()
    const win = getWindow()
    if (win) win.hide()
    setTimeout(() => simulatePaste(previousAppBundleId), 120)
    return { ok: true }
  })

  ipcMain.handle('clips:pastePlain', (_e, id: number) => {
    const record = getClip(id)
    if (!record) return { ok: false }
    writeClipAsPlainText(record)
    const previousAppBundleId = getPreviousAppBundleId()
    const win = getWindow()
    if (win) win.hide()
    setTimeout(() => simulatePaste(previousAppBundleId), 120)
    return { ok: true }
  })

  ipcMain.handle('window:hide', () => {
    getWindow()?.hide()
    return true
  })

  ipcMain.handle('icons:read', (_e, filePath: string) => {
    const iconDir = join(app.getPath('userData'), 'icons')
    const safeName = basename(filePath)
    const requestedPath = join(iconDir, safeName)
    return readFileAsDataUrl(requestedPath)
  })

  ipcMain.handle('images:read', (_e, filePath: string) => {
    const normalized = normalize(filePath)
    if (!isAbsolute(normalized)) return null
    return readFileAsDataUrl(normalized)
  })

  ipcMain.handle('rtf:sanitize', (_e, rtf: string) => {
    return DOMPurify.sanitize(rtf, { USE_PROFILES: { html: true } })
  })
}
