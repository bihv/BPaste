import { app } from 'electron'
import { execSync } from 'child_process'
import { join } from 'path'
import { mkdirSync, existsSync } from 'fs'

interface DarwinAppInfo {
  name: string
  bundlePath: string | null
}

function getFrontmostApp(): DarwinAppInfo | null {
  try {
    const script = `
      tell application "System Events"
        set frontmostApp to first application process whose frontmost is true
        set appName to name of frontmostApp
      end tell
      return appName
    `
    const appName = execSync(`osascript -e '${script}'`, { encoding: 'utf8', timeout: 5000 }).trim()

    if (!appName) {
      return null
    }

    const bundlePath = findAppInApplications(appName)

    return { name: appName, bundlePath }
  } catch {
    return null
  }
}

function findAppInApplications(appName: string): string | null {
  try {
    const locations = [
      '/Applications',
      '/System/Applications',
      process.env.HOME + '/Applications'
    ]

    const escapedName = appName.replace(/'/g, "'\\''")
    const exactResult = execSync(
      `mdfind "kMDItemFSName == '${escapedName}.app'" 2>/dev/null | head -1`,
      { encoding: 'utf8' }
    ).trim()

    if (exactResult && existsSync(exactResult)) {
      return exactResult
    }

    for (const baseDir of locations) {
      if (!existsSync(baseDir)) continue

      const findResult = execSync(
        `find "${baseDir}" -maxdepth 2 -name "*.app" -inum 2 2>/dev/null | xargs -I {} sh -c 'echo {}' 2>/dev/null || true`,
        { encoding: 'utf8', timeout: 3000 }
      ).trim()

      if (findResult) {
        const apps = findResult.split('\n').filter(Boolean)
        const matched = apps.find(a => a.toLowerCase().includes(appName.toLowerCase()))
        if (matched && existsSync(matched)) {
          return matched
        }
      }
    }

    return null
  } catch {
    return null
  }
}

function extractIconToPng(appPath: string, iconDir: string, appName: string): string | null {
  try {
    if (!appPath || !existsSync(appPath)) {
      return null
    }

    const resourcesPath = join(appPath, 'Contents/Resources')

    let icnsPath: string | null = null

    const mainIcns = join(resourcesPath, 'App.icns')
    if (existsSync(mainIcns)) {
      icnsPath = mainIcns
    } else {
      const lsResult = execSync(`ls "${resourcesPath}"/*.icns 2>/dev/null | head -1`, {
        encoding: 'utf8'
      }).trim()
      if (lsResult) {
        icnsPath = lsResult
      }
    }

    if (!icnsPath) {
      return null
    }

    return convertIcnsToPng(icnsPath, iconDir, appName)
  } catch {
    return null
  }
}

function convertIcnsToPng(icnsPath: string, iconDir: string, appName: string): string | null {
  try {
    const safeName = appName.replace(/[^a-zA-Z0-9]/g, '_')
    const pngFileName = `${safeName}_icon.png`
    const pngPath = join(iconDir, pngFileName)

    if (existsSync(pngPath)) {
      return pngPath
    }

    try {
      execSync(`qlmanage -t -s 128 -o "${iconDir}" "${icnsPath}" 2>/dev/null`, { stdio: 'ignore' })
      const thumbPath = join(iconDir, `${icnsPath.split('/').pop()}.png`)
      if (existsSync(thumbPath)) {
        execSync(`mv "${thumbPath}" "${pngPath}"`, { stdio: 'ignore' })
        return pngPath
      }
    } catch {}

    try {
      const tmpDir = join(iconDir, 'tmp')
      mkdirSync(tmpDir, { recursive: true })
      const tmpIcnPath = join(tmpDir, 'app.icns')
      execSync(`cp "${icnsPath}" "${tmpIcnPath}"`, { stdio: 'ignore' })
      execSync(`iconutil -c icns "${tmpIcnPath}" -o "${pngPath}" 2>/dev/null || iconutil -c png "${icnsPath}" -o "${pngPath}" 2>/dev/null`, { stdio: 'ignore' })
      execSync(`rm -rf "${tmpDir}"`, { stdio: 'ignore' })
      if (existsSync(pngPath)) {
        return pngPath
      }
    } catch {}

    try {
      const tiffPath = join(iconDir, `${safeName}_icon.tiff`)
      execSync(`sips -s format tiff "${icnsPath}" --out "${tiffPath}" 2>/dev/null`, { stdio: 'ignore' })
      if (existsSync(tiffPath)) {
        execSync(`sips -s format png "${tiffPath}" --out "${pngPath}" 2>/dev/null`, { stdio: 'ignore' })
        execSync(`rm -f "${tiffPath}"`, { stdio: 'ignore' })
        if (existsSync(pngPath)) {
          return pngPath
        }
      }
    } catch {}

    return null
  } catch {
    return null
  }
}

let iconDir = ''

export function initIconDir(userDataPath: string): void {
  iconDir = join(userDataPath, 'icons')
  mkdirSync(iconDir, { recursive: true })
}

export function darwinGetSource(): { name: string; iconPath: string | null } {
  const appInfo = getFrontmostApp()

  if (!appInfo) {
    return { name: 'Unknown', iconPath: null }
  }

  let iconPath: string | null = null

  if (appInfo.bundlePath) {
    iconPath = extractIconToPng(appInfo.bundlePath, iconDir, appInfo.name)
  }

  return {
    name: appInfo.name,
    iconPath
  }
}
