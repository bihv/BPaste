import { contextBridge, ipcRenderer } from 'electron'

export interface ClipRecord {
  id: number
  type: 'text' | 'link' | 'image' | 'richtext'
  content: string
  rtf: string | null
  image_path: string | null
  preview: string
  hash: string
  pinned: number
  created_at: number
}

const api = {
  list: (): Promise<ClipRecord[]> => ipcRenderer.invoke('clips:list'),
  search: (query: string): Promise<ClipRecord[]> => ipcRenderer.invoke('clips:search', query),
  paste: (id: number): Promise<{ ok: boolean }> => ipcRenderer.invoke('clips:paste', id),
  delete: (id: number): Promise<boolean> => ipcRenderer.invoke('clips:delete', id),
  pin: (id: number, pinned: boolean): Promise<boolean> => ipcRenderer.invoke('clips:pin', id, pinned),
  clear: (): Promise<boolean> => ipcRenderer.invoke('clips:clear'),
  hide: (): Promise<void> => ipcRenderer.invoke('window:hide'),
  onChanged: (cb: (payload: { record: ClipRecord; isNew: boolean }) => void): (() => void) => {
    const handler = (_e: unknown, payload: { record: ClipRecord; isNew: boolean }): void =>
      cb(payload)
    ipcRenderer.on('clips:changed', handler)
    return () => ipcRenderer.removeListener('clips:changed', handler)
  },
  onWindowShown: (cb: () => void): (() => void) => {
    const handler = (): void => cb()
    ipcRenderer.on('window:shown', handler)
    return () => ipcRenderer.removeListener('window:shown', handler)
  }
}

contextBridge.exposeInMainWorld('bpaste', api)

export type BPasteApi = typeof api
