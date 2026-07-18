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
  source_name: string | null
  source_icon: string | null
  pinboard_id: number | null
}

export interface Pinboard {
  id: number
  name: string
  color: string
  created_at: number
  sort_order: number
}

const api = {
  list: (): Promise<ClipRecord[]> => ipcRenderer.invoke('clips:list'),
  search: (query: string): Promise<ClipRecord[]> => ipcRenderer.invoke('clips:search', query),
  paste: (id: number): Promise<{ ok: boolean }> => ipcRenderer.invoke('clips:paste', id),
  pastePlain: (id: number): Promise<{ ok: boolean }> => ipcRenderer.invoke('clips:pastePlain', id),
  update: (id: number, content: string, preview: string): Promise<ClipRecord | null> => ipcRenderer.invoke('clips:update', id, content, preview),
  delete: (id: number): Promise<boolean> => ipcRenderer.invoke('clips:delete', id),
  pin: (id: number, pinned: boolean): Promise<boolean> => ipcRenderer.invoke('clips:pin', id, pinned),
  clear: (): Promise<boolean> => ipcRenderer.invoke('clips:clear'),
  hide: (): Promise<void> => ipcRenderer.invoke('window:hide'),
  readIcon: (filePath: string): Promise<string | null> => ipcRenderer.invoke('icons:read', filePath),
  readImage: (filePath: string): Promise<string | null> => ipcRenderer.invoke('images:read', filePath),
  sanitizeRtf: (rtf: string): Promise<string> => ipcRenderer.invoke('rtf:sanitize', rtf),
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
  },
  listPinboards: (): Promise<Pinboard[]> => ipcRenderer.invoke('pinboards:list'),
  createPinboard: (name: string, color: string): Promise<Pinboard> => ipcRenderer.invoke('pinboards:create', name, color),
  updatePinboard: (id: number, name: string, color: string): Promise<Pinboard | null> => ipcRenderer.invoke('pinboards:update', id, name, color),
  deletePinboard: (id: number): Promise<boolean> => ipcRenderer.invoke('pinboards:delete', id),
  reorderPinboards: (orderedIds: number[]): Promise<boolean> => ipcRenderer.invoke('pinboards:reorder', orderedIds),
  addToPinboard: (clipId: number, pinboardId: number | null): Promise<boolean> => ipcRenderer.invoke('pinboards:addClip', clipId, pinboardId),
  getPinboardClips: (pinboardId: number | null): Promise<ClipRecord[]> => ipcRenderer.invoke('pinboards:clips', pinboardId),
  showClipContextMenu: (clip: ClipRecord, pinboards: Pinboard[]): Promise<void> =>
    ipcRenderer.invoke('contextMenu:showClip', clip, pinboards),
  showPinboardContextMenu: (pinboard: Pinboard): Promise<void> =>
    ipcRenderer.invoke('contextMenu:showPinboard', pinboard),
  onContextMenuAction: (cb: (data: { action: string; clip: ClipRecord; pinboardId?: number }) => void): (() => void) => {
    const handler = (_e: unknown, data: { action: string; clip: ClipRecord; pinboardId?: number }): void => cb(data)
    ipcRenderer.on('contextMenuAction', handler)
    return () => ipcRenderer.removeListener('contextMenuAction', handler)
  },
  onPinboardContextMenuAction: (cb: (data: { action: string; pinboard: Pinboard }) => void): (() => void) => {
    const handler = (_e: unknown, data: { action: string; pinboard: Pinboard }): void => cb(data)
    ipcRenderer.on('pinboardContextMenuAction', handler)
    return () => ipcRenderer.removeListener('pinboardContextMenuAction', handler)
  },
  getSetting: (key: string): Promise<string | null> => ipcRenderer.invoke('settings:get', key),
  setSetting: (key: string, value: string): Promise<void> => ipcRenderer.invoke('settings:set', key, value),
  getAllSettings: (): Promise<Record<string, string>> => ipcRenderer.invoke('settings:all')
}

contextBridge.exposeInMainWorld('bpaste', api)

export type BPasteApi = typeof api
