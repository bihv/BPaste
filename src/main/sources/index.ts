import { app } from 'electron'
import { darwinGetSource, initIconDir as initDarwinIconDir } from './darwin'
import { linuxGetSource, initIconDir as initLinuxIconDir } from './linux'
import { win32GetSource, initIconDir as initWin32IconDir } from './win32'

export interface SourceInfo {
  name: string
  iconPath: string | null
}

export function initSourceIconDir(): void {
  const userDataPath = app.getPath('userData')

  if (process.platform === 'darwin') {
    initDarwinIconDir(userDataPath)
  } else if (process.platform === 'linux') {
    initLinuxIconDir(userDataPath)
  } else if (process.platform === 'win32') {
    initWin32IconDir(userDataPath)
  }
}

export function getActiveAppSource(): { name: string; iconPath: string | null } {
  if (process.platform === 'darwin') {
    return darwinGetSource()
  } else if (process.platform === 'linux') {
    return linuxGetSource()
  } else if (process.platform === 'win32') {
    return win32GetSource()
  }

  return { name: 'Unknown', iconPath: null }
}
