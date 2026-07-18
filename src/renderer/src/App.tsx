import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useClipboard } from './hooks/useClipboard'
import { SearchBar } from './components/SearchBar'
import TypeFilter from './components/TypeFilter'
import ClipList from './components/ClipList'
import PreviewModal from './components/PreviewModal'
import EditModal from './components/EditModal'
import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'
import { ThemeProvider } from './contexts/ThemeContext'
import type { ClipRecord, Pinboard } from './types'

export default function App(): JSX.Element {
  const {
    filtered,
    clips,
    query,
    setQuery,
    filter,
    setFilter,
    paste,
    pastePlain,
    update,
    remove,
    togglePin,
    clearAll,
    pinboards,
    selectedPinboardId,
    setSelectedPinboard,
    createPinboard,
    updatePinboard,
    deletePinboard,
    addToPinboard
  } = useClipboard()

  console.log('[App] Rendering, filtered:', filtered?.length ?? 0, 'clips:', clips?.length ?? 0, 'pinboards:', pinboards?.length ?? 0)

  const [activeIndex, setActiveIndex] = useState(0)
  const [previewRecord, setPreviewRecord] = useState<ClipRecord | null>(null)
  const [editRecord, setEditRecord] = useState<ClipRecord | null>(null)
  const [editingPinboardId, setEditingPinboardId] = useState<number | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)

  useEffect(() => {
    setActiveIndex(0)
  }, [filter, query, filtered.length])

  const handleStartEditingPinboard = useCallback((pinboard: Pinboard) => {
    console.log('[App] handleStartEditingPinboard called:', pinboard)
    setEditingPinboardId(pinboard.id)
  }, [])

  useEffect(() => {
    console.log('[App] Context menu effect setup')
    const unsubClip = window.bpaste.onContextMenuAction((data) => {
      console.log('[App] Context menu action:', data.action)
      switch (data.action) {
        case 'preview':
          setPreviewRecord(data.clip)
          break
        case 'pastePlain':
          void pastePlain(data.clip.id)
          break
        case 'edit':
          setEditRecord(data.clip)
          break
        case 'togglePin':
          void togglePin(data.clip)
          break
        case 'delete':
          void remove(data.clip.id)
          break
        case 'addToPinboard':
          void addToPinboard(data.clip.id, data.pinboardId ?? null)
          break
      }
    })

    const unsubPinboard = window.bpaste.onPinboardContextMenuAction((data) => {
      console.log('[App] Pinboard context menu action:', data.action, data.pinboard)
      if (data.action === 'rename') {
        handleStartEditingPinboard(data.pinboard)
      } else if (data.action === 'delete') {
        void deletePinboard(data.pinboard.id)
      }
    })

    return () => {
      unsubClip()
      unsubPinboard()
    }
  }, [pastePlain, togglePin, remove, addToPinboard, deletePinboard, handleStartEditingPinboard])

  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(index, filtered.length - 1)),
    [filtered.length]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        if (previewRecord) { setPreviewRecord(null); return }
        if (editRecord) { setEditRecord(null); return }
        window.bpaste.hide()
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveIndex((i) => clampIndex(i + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveIndex((i) => clampIndex(i - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const record = filtered[activeIndex]
        if (record) void paste(record.id)
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        const record = filtered[activeIndex]
        if (record && (record.type === 'text' || record.type === 'richtext')) {
          setPreviewRecord(record)
        }
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault()
        const record = filtered[activeIndex]
        if (record && record.type !== 'image') {
          setEditRecord(record)
        }
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && e.metaKey === false && e.ctrlKey) {
        e.preventDefault()
        const record = filtered[activeIndex]
        if (record) void remove(record.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filtered, activeIndex, paste, remove, clampIndex, previewRecord, editRecord])

  const handleCreatePinboard = useCallback(async (name: string, color: string) => {
    await createPinboard(name, color)
  }, [createPinboard])

  const handleUpdatePinboard = useCallback(async (id: number, name: string, color: string) => {
    await updatePinboard(id, name, color)
  }, [updatePinboard])

  const handleRenamePinboard = useCallback((pinboard: Pinboard) => {
    setEditingPinboardId(pinboard.id)
  }, [setEditingPinboardId])

  const handleEditingComplete = useCallback(() => {
    setEditingPinboardId(null)
  }, [])

  const handleDeletePinboard = useCallback(async (id: number) => {
    await deletePinboard(id)
    if (selectedPinboardId === id) {
      setSelectedPinboard(null)
    }
  }, [deletePinboard, selectedPinboardId, setSelectedPinboard])

  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen flex-col bg-paste-bg animate-rise vibrancy-bg">
        <header className="flex items-center justify-between border-b border-theme-default px-4 py-3 vibrancy-header">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wide text-theme-primary">BPaste</span>
            <TypeFilter value={filter} onChange={setFilter} />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar value={query} onChange={setQuery} />
            <button
              onClick={() => setShowSettings(true)}
              title="Cài đặt"
              className="rounded-lg p-1.5 text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
            >
              ⚙️
            </button>
            <button
              onClick={() => void clearAll()}
              title="Xóa tất cả (giữ mục đã ghim)"
              className="rounded-lg px-2.5 py-1.5 text-xs text-theme-secondary ring-1 ring-black/10 hover:bg-black/5 hover:text-theme-primary"
            >
              Xóa hết
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            pinboards={pinboards}
            selectedId={selectedPinboardId}
            onSelect={setSelectedPinboard}
            onCreate={handleCreatePinboard}
            onUpdate={handleUpdatePinboard}
            onRename={handleRenamePinboard}
            onStartEditing={handleStartEditingPinboard}
            editingPinboardId={editingPinboardId}
            onEditingComplete={handleEditingComplete}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(c => !c)}
          />

          <ClipList
            clips={filtered}
            pinboards={pinboards}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
            onPaste={(id) => void paste(id)}
            onTogglePin={(record) => void togglePin(record)}
            onDelete={(id) => void remove(id)}
          />
        </div>

        {previewRecord && (
          <PreviewModal record={previewRecord} onClose={() => setPreviewRecord(null)} />
        )}

        {editRecord && (
          <EditModal
            record={editRecord}
            onSave={(content, preview) => void update(editRecord.id, content, preview)}
            onClose={() => setEditRecord(null)}
          />
        )}

        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}

        <footer className="flex items-center justify-center gap-4 border-t border-theme-default px-4 py-1.5 text-[11px] text-theme-tertiary vibrancy-footer">
          <span>← → di chuyển</span>
          <span>Enter dán</span>
          <span>P xem trước</span>
          <span>E sửa</span>
          <span>Ctrl+Delete xóa</span>
          <span>Esc đóng</span>
        </footer>
      </div>
    </ThemeProvider>
  )
}
