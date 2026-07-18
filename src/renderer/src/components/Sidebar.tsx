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
      <div className="flex h-full w-11 flex-col items-center border-r border-black/[0.04] dark:border-white/[0.04] py-2.5 vibrancy-sidebar">
        <button
          onClick={onToggleCollapse}
          title="Mở rộng sidebar"
          className="flex h-7 w-7 items-center justify-center rounded-md text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full w-44 flex-col border-r border-black/[0.04] dark:border-white/[0.04] vibrancy-sidebar">
      <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] px-3 py-2">
        <span className="text-[11px] font-medium text-theme-tertiary uppercase tracking-wide">Pinboards</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setIsCreating(true)}
            className="flex h-6 w-6 items-center justify-center rounded-md text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
            title="Tạo pinboard mới"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={onToggleCollapse}
            title="Thu gọn sidebar"
            className="flex h-6 w-6 items-center justify-center rounded-md text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1.5">
        <button
          onClick={() => onSelect(null)}
          className={`flex w-full items-center gap-2 px-3 py-1.5 text-[13px] rounded-md mx-1 transition-colors ${
            selectedId === null
              ? 'bg-accent-light text-accent font-medium'
              : 'text-theme-secondary hover:bg-hover'
          }`}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: '#94a3b8' }}
          />
          <span>Tất cả</span>
        </button>

        {pinboards.map((pinboard) => (
          <div key={pinboard.id}>
            {editingId === pinboard.id ? (
              <div className="px-3 py-1.5 mx-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleUpdate()
                    if (e.key === 'Escape') closeMenus()
                  }}
                  className="mb-1.5 w-full rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-transparent px-2 py-1 text-[13px] text-theme-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  autoFocus
                />
                <div className="mb-1.5 flex flex-wrap gap-1">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColor(color)}
                      className={`h-5 w-5 rounded-full transition-transform ${
                        newColor === color ? 'ring-2 ring-accent ring-offset-1 dark:ring-offset-0 scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => void handleUpdate()}
                    className="flex-1 rounded-md bg-accent py-1 text-[12px] font-medium text-white hover:bg-accent-hover transition-colors"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={closeMenus}
                    className="flex-1 rounded-md bg-hover py-1 text-[12px] font-medium text-theme-secondary hover:bg-active transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onSelect(pinboard.id)}
                onContextMenu={handleContextMenu(pinboard)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-[13px] rounded-md mx-1 transition-colors ${
                  selectedId === pinboard.id
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-theme-secondary hover:bg-hover'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: pinboard.color }}
                />
                <span className="flex-1 truncate text-left">{pinboard.name}</span>
              </button>
            )}
          </div>
        ))}

        {isCreating && (
          <div className="px-3 py-1.5 mx-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleCreate()
                if (e.key === 'Escape') closeMenus()
              }}
              placeholder="Tên pinboard"
              className="mb-1.5 w-full rounded-md border border-black/[0.08] dark:border-white/[0.08] bg-transparent px-2 py-1 text-[13px] text-theme-primary placeholder:text-theme-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
              autoFocus
            />
            <div className="mb-1.5 flex flex-wrap gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewColor(color)}
                  className={`h-5 w-5 rounded-full transition-transform ${
                    newColor === color ? 'ring-2 ring-accent ring-offset-1 dark:ring-offset-0 scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => void handleCreate()}
                className="flex-1 rounded-md bg-accent py-1 text-[12px] font-medium text-white hover:bg-accent-hover transition-colors"
              >
                Tạo
              </button>
              <button
                onClick={closeMenus}
                className="flex-1 rounded-md bg-hover py-1 text-[12px] font-medium text-theme-secondary hover:bg-active transition-colors"
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
