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

const isSettingsWindow = window.location.hash === '#/settings'

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
        if (selectedPinboardId === data.pinboard.id) {
          setSelectedPinboard(null)
        }
        void deletePinboard(data.pinboard.id)
      }
    })

    return () => {
      unsubClip()
      unsubPinboard()
    }
  }, [pastePlain, togglePin, remove, addToPinboard, deletePinboard, handleStartEditingPinboard, selectedPinboardId, setSelectedPinboard])

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

  // Settings-only window view
  if (isSettingsWindow) {
    return (
      <ThemeProvider>
        <div className="h-screen w-screen bg-theme-bg">
          <SettingsModal />
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen flex-col bg-paste-bg animate-rise vibrancy-bg">
        <header className="flex items-center justify-between px-4 py-2.5 vibrancy-header">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold tracking-tight text-theme-primary">BPaste</span>
            <TypeFilter value={filter} onChange={setFilter} />
          </div>
          <div className="flex items-center gap-2">
            <SearchBar value={query} onChange={setQuery} />
            <button
              onClick={() => {
                console.log('[Renderer] Settings button clicked')
                void window.bpaste.openSettingsWindow().then(() => {
                  console.log('[Renderer] openSettingsWindow promise resolved')
                }).catch((err) => {
                  console.error('[Renderer] openSettingsWindow error:', err)
                })
              }}
              title="Cài đặt"
              className="rounded-lg p-1.5 text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 0 .238-.912c.07-.23.07-.476 0-.78-.07-.197-.11-.394-.19-.592a1.125 1.125 0 0 1 .46-1.028l1.276-1.276a1.125 1.125 0 0 1 1.37-.49l1.216.456c.355.133.73.082.985-.126.074-.06.15-.124.22-.181.332-.183.583-.496.645-.87l.214-1.281c.088-.542-.56-.94-1.108-.94h-2.594c-.55 0-1.019.398-1.11.94l-.213 1.281c-.063.374-.312.686-.644.87a4.34 4.34 0 0 1-.22.127c-.324.195-.72.257-1.074.124l-1.217-.456a1.125 1.125 0 0 0-1.37.49l-1.297 2.247a1.125 1.125 0 0 1-1.43.26l-1.003-.827a1.125 1.125 0 0 0-.492-.59l-1.192-.454-.007-.001-.003-.001-.002-.001a1.125 1.125 0 0 1 .26-1.43l1.275-1.275a1.125 1.125 0 0 0-1.37-.49l-1.216.456c-.355.133-.73.082-.985-.126a3.15 3.15 0 0 1-.22-.181c-.332-.183-.583-.495-.645-.87l-.214-1.281Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <button
              onClick={() => void clearAll()}
              title="Xóa tất cả (giữ mục đã ghim)"
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-theme-secondary bg-hover hover:bg-active hover:text-theme-primary transition-colors"
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

        <footer className="flex items-center justify-center gap-6 border-t border-black/[0.04] dark:border-white/[0.04] px-4 py-1.5 vibrancy-footer">
          <span className="text-[11px] text-theme-tertiary">← → di chuyển</span>
          <span className="text-[11px] text-theme-tertiary">Enter dán</span>
          <span className="text-[11px] text-theme-tertiary">P xem</span>
          <span className="text-[11px] text-theme-tertiary">E sửa</span>
          <span className="text-[11px] text-theme-tertiary">Ctrl+Del xóa</span>
          <span className="text-[11px] text-theme-tertiary">Esc đóng</span>
        </footer>
      </div>
    </ThemeProvider>
  )
}
