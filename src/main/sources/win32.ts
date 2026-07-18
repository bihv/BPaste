import { execSync } from 'child_process'
import { join } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'

interface Win32AppInfo {
  name: string
  iconPath: string | null
}

function getFrontmostApp(): Win32AppInfo | null {
  try {
    const script = `
      Add-Type @"
        using System;
        using System.Runtime.InteropServices;
        using System.Text;
        public class Win32 {
          [DllImport("user32.dll")]
          public static extern IntPtr GetForegroundWindow();
          [DllImport("user32.dll")]
          public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
        }
"@
      $hwnd = [Win32]::GetForegroundWindow()
      $pid = 0
      [Win32]::GetWindowThreadProcessId($hwnd, [ref]$pid) | Out-Null
      if ($pid -gt 0) {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($proc) {
          Write-Output $proc.ProcessName
        }
      }
    `

    const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim()

    if (result) {
      return { name: result, iconPath: null }
    }
  } catch {
    return null
  }

  return null
}

function findExePath(processName: string): string | null {
  try {
    const script = `
      $proc = Get-Process -Name "${processName}" -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($proc) {
        Write-Output $proc.Path
      }
    `
    const result = execSync(`powershell -Command "${script.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim()

    if (result && existsSync(result)) {
      return result
    }
  } catch {
    return null
  }

  return null
}

let iconDir = ''

export function initIconDir(userDataPath: string): void {
  iconDir = join(userDataPath, 'icons')
  mkdirSync(iconDir, { recursive: true })
}

export function win32GetSource(): { name: string; iconPath: string | null } {
  const appInfo = getFrontmostApp()

  if (!appInfo) {
    return { name: 'Unknown', iconPath: null }
  }

  return {
    name: appInfo.name,
    iconPath: null
  }
}
