import { execSync } from 'child_process'
import { join } from 'path'
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'fs'

interface LinuxAppInfo {
  name: string
  iconPath: string | null
}

function getFrontmostApp(): string | null {
  try {
    const result = execSync(
      'xdotool getactivewindow getwindowpid 2>/dev/null || echo ""',
      { encoding: 'utf8' }
    ).trim()

    if (!result) return null

    const pid = result.trim()
    const commPath = `/proc/${pid}/comm`

    if (existsSync(commPath)) {
      return readFileSync(commPath, 'utf8').trim()
    }

    return null
  } catch {
    return null
  }
}

function findDesktopFile(processName: string): { name: string; icon: string | null } | null {
  try {
    const desktopDirs = [
      '/usr/share/applications',
      '/usr/local/share/applications',
      join(process.env.HOME || '', '.local/share/applications')
    ]

    for (const dir of desktopDirs) {
      if (!existsSync(dir)) continue

      const files = execSync(
        `find "${dir}" -name "*.desktop" 2>/dev/null`,
        { encoding: 'utf8' }
      ).trim().split('\n').filter(Boolean)

      for (const file of files) {
        try {
          const content = readFileSync(file, 'utf8')
          const execMatch = content.match(/^Exec=([^\s]+)/m)
          const nameMatch = content.match(/^Name=([^\n]+)/m)
          const iconMatch = content.match(/^Icon=([^\n]+)/m)

          if (execMatch) {
            const execCmd = execMatch[1]
            if (execCmd.includes(processName) || processName.includes(execCmd.split('/').pop() || '')) {
              return {
                name: nameMatch?.[1] || processName,
                icon: iconMatch?.[1] || null
              }
            }
          }
        } catch {
          continue
        }
      }
    }
  } catch {
    return null
  }

  return null
}

function resolveIconPath(iconRef: string | null): string | null {
  if (!iconRef) return null

  if (iconRef.startsWith('/') && existsSync(iconRef)) {
    return iconRef
  }

  const iconDirs = [
    '/usr/share/pixmaps',
    '/usr/share/icons/hicolor/48x48/apps',
    '/usr/share/icons/Adwaita/48x48/apps'
  ]

  const extensions = ['', '.png', '.svg', '.xpm']

  for (const dir of iconDirs) {
    for (const ext of extensions) {
      const fullPath = join(dir, iconRef + ext)
      if (existsSync(fullPath)) {
        return fullPath
      }
    }
  }

  return null
}

let iconDir = ''

export function initIconDir(userDataPath: string): void {
  iconDir = join(userDataPath, 'icons')
  mkdirSync(iconDir, { recursive: true })
}

export function linuxGetSource(): { name: string; iconPath: string | null } {
  const processName = getFrontmostApp()

  if (!processName) {
    return { name: 'Unknown', iconPath: null }
  }

  const appInfo = findDesktopFile(processName)

  if (appInfo) {
    return {
      name: appInfo.name,
      iconPath: resolveIconPath(appInfo.icon)
    }
  }

  return {
    name: processName,
    iconPath: null
  }
}
