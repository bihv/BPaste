import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import type { Pinboard } from '../types'

const PRESET_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
]

interface Props {
  pinboards: Pinboard[]
  selectedId: number | null
  onSelect: (id: number | null) => void
  onCreate: (name: string, color: string) => Promise<void>
  onUpdate: (id: number, name: string, color: string) => Promise<void>
  onRename: (pinboard: Pinboard) => void
  onStartEditing: (pinboard: Pinboard) => void
  editingPinboardId: number | null
  onEditingComplete: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export default function Sidebar({
  pinboards,
  selectedId,
  onSelect,
  onCreate,
  onUpdate,
  onRename,
  onStartEditing,
  editingPinboardId,
  onEditingComplete,
  collapsed,
  onToggleCollapse
}: Props): JSX.Element {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  useEffect(() => {
    if (editingPinboardId !== null) {
      const pb = pinboards.find(p => p.id === editingPinboardId)
      if (pb) {
        setEditingId(pb.id)
        setNewName(pb.name)
        setNewColor(pb.color)
        onRename(pb)
      }
    }
  }, [editingPinboardId, pinboards, onRename])

  const closeMenus = useCallback(() => {
    setIsCreating(false)
    setEditingId(null)
    setNewName('')
    onEditingComplete()
  }, [onEditingComplete])

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) return
    await onCreate(newName.trim(), newColor)
    setNewName('')
    setNewColor(PRESET_COLORS[0])
    setIsCreating(false)
  }, [newName, newColor, onCreate])

  const handleUpdate = useCallback(async () => {
    if (!editingId || !newName.trim()) return
    await onUpdate(editingId, newName.trim(), newColor)
    closeMenus()
  }, [editingId, newName, newColor, onUpdate, closeMenus])

  const handleContextMenu = useCallback(
    (pinboard: Pinboard) => (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      void window.bpaste.showPinboardContextMenu(pinboard)
    },
    []
  )

  if (collapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-r border-theme-default py-2 vibrancy-sidebar">
        <button
          onClick={onToggleCollapse}
          title="Mở rộng sidebar"
          className="flex h-8 w-8 items-center justify-center rounded text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-48 flex-col border-r border-theme-default vibrancy-sidebar">
      <div className="flex items-center justify-between border-b border-theme-default px-3 py-2">
        <span className="text-xs font-medium text-theme-secondary">Pinboards</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreating(true)}
            className="flex h-5 w-5 items-center justify-center rounded text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
            title="Tạo pinboard mới"
          >
            +
          </button>
          <button
            onClick={onToggleCollapse}
            title="Thu gọn sidebar"
            className="flex h-5 w-5 items-center justify-center rounded text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
            selectedId === null
              ? 'bg-accent-light text-accent'
              : 'text-theme-secondary hover:bg-black/5'
          }`}
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: '#94a3b8' }}
          />
          <span>Tất cả</span>
        </button>

        {pinboards.map((pinboard) => (
          <div key={pinboard.id}>
            {editingId === pinboard.id ? (
              <div className="px-3 py-1.5">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleUpdate()
                    if (e.key === 'Escape') closeMenus()
                  }}
                  className="mb-1 w-full rounded border border-theme-default bg-transparent px-2 py-0.5 text-sm text-theme-primary focus:outline-none focus:ring-1 focus:ring-accent"
                  autoFocus
                />
                <div className="mb-1 flex flex-wrap gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`h-5 w-5 rounded-full ${
                        newColor === color ? 'ring-2 ring-offset-1 ring-accent' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => void handleUpdate()}
                    className="flex-1 rounded bg-accent py-0.5 text-xs text-white hover:opacity-90"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={closeMenus}
                    className="flex-1 rounded bg-theme-card py-0.5 text-xs text-theme-secondary hover:opacity-80"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSelect(pinboard.id)}
                onContextMenu={handleContextMenu(pinboard)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
                  selectedId === pinboard.id
                    ? 'bg-accent-light text-accent'
                    : 'text-theme-secondary hover:bg-black/5'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: pinboard.color }}
                />
                <span className="flex-1 truncate text-left">{pinboard.name}</span>
              </button>
            )}
          </div>
        ))}

        {isCreating && (
          <div className="px-3 py-1.5">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreate()
                if (e.key === 'Escape') closeMenus()
              }}
              placeholder="Tên pinboard"
              className="mb-1 w-full rounded border border-theme-default bg-transparent px-2 py-0.5 text-sm text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
            <div className="mb-1 flex flex-wrap gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`h-5 w-5 rounded-full ${
                    newColor === color ? 'ring-2 ring-offset-1 ring-accent' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => void handleCreate()}
                className="flex-1 rounded bg-accent py-0.5 text-xs text-white hover:opacity-90"
              >
                Tạo
              </button>
              <button
                onClick={closeMenus}
                className="flex-1 rounded bg-theme-card py-0.5 text-xs text-theme-secondary hover:opacity-80"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
