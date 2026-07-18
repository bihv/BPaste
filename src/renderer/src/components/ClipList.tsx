import { useRef, useCallback, useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ClipRecord, ClipType } from '../types'
import ClipCard from './ClipCard'

const CARD_WIDTH = 224 // w-56 = 14rem = 224px
const CARD_GAP = 12 // gap-3 = 0.75rem = 12px

interface Props {
  clips: ClipRecord[]
  activeIndex: number
  onSelect: (index: number) => void
  onPaste: (id: number) => void
  onPastePlain: (id: number) => void
  onTogglePin: (record: ClipRecord) => void
  onDelete: (id: number) => void
}

export default function ClipList({
  clips,
  activeIndex,
  onSelect,
  onPaste,
  onPastePlain,
  onTogglePin,
  onDelete
}: Props): JSX.Element {
  const activeRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; clipId: number; pinned: boolean; type: ClipType } | null>(null)

  const rowVirtualizer = useVirtualizer({
    count: clips.length,
    getScrollElement: () => parentRef.current,
    horizontal: true,
    estimateSize: () => CARD_WIDTH + CARD_GAP,
    overscan: 3,
  })

  const closeContextMenu = useCallback(() => setContextMenu(null), [])

  useEffect(() => {
    if (!contextMenu) return
    const handler = () => closeContextMenu()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [contextMenu, closeContextMenu])

  const handleContextMenu = useCallback(
    (clipId: number, pinned: boolean, type: ClipType) => (e: React.MouseEvent) => {
      e.preventDefault()
      onSelect(clips.findIndex(c => c.id === clipId))
      setContextMenu({ x: e.clientX, y: e.clientY, clipId, pinned, type })
    },
    [clips, onSelect]
  )

  const handlePastePlain = useCallback(
    (id: number) => () => {
      onPastePlain(id)
      closeContextMenu()
    },
    [onPastePlain, closeContextMenu]
  )

  const handleSelect = useCallback(
    (index: number) => () => onSelect(index),
    [onSelect]
  )
  const handlePaste = useCallback(
    (id: number) => () => onPaste(id),
    [onPaste]
  )
  const handleTogglePin = useCallback(
    (record: ClipRecord) => () => {
      onTogglePin(record)
      closeContextMenu()
    },
    [onTogglePin, closeContextMenu]
  )
  const handleDelete = useCallback(
    (id: number) => () => {
      onDelete(id)
      closeContextMenu()
    },
    [onDelete, closeContextMenu]
  )

  if (clips.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-slate-400">
        Chưa có nội dung nào. Sao chép gì đó để bắt đầu.
      </div>
    )
  }

  const totalWidth = clips.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP

  return (
    <div
      ref={parentRef}
      className="no-scrollbar relative flex flex-1 items-stretch overflow-x-auto overflow-y-hidden px-4 py-3"
    >
      <div
        className="relative flex gap-3"
        style={{
          width: `${totalWidth}px`,
          height: '100%',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const clip = clips[virtualItem.index]
          const isActive = virtualItem.index === activeIndex
          return (
            <div
              key={clip.id}
              ref={isActive ? activeRef : undefined}
              className="absolute top-0 h-full shrink-0"
              style={{
                width: `${CARD_WIDTH}px`,
                transform: `translateX(${virtualItem.start}px)`,
              }}
            >
              <ClipCard
                record={clip}
                active={isActive}
                onSelect={handleSelect(virtualItem.index)}
                onPaste={handlePaste(clip.id)}
                onTogglePin={handleTogglePin(clip)}
                onDelete={handleDelete(clip.id)}
                onContextMenu={handleContextMenu(clip.id, clip.pinned === 1, clip.type)}
              />
            </div>
          )
        })}
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 rounded-lg border border-black/10 bg-white py-1 shadow-lg"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {(contextMenu.type === 'link' || contextMenu.type === 'richtext') && (
            <button
              onClick={handlePastePlain(contextMenu.clipId)}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
            >
              <span>T</span>
              <span>Dán text thuần</span>
            </button>
          )}
          <button
            onClick={handleTogglePin(clips.find(c => c.id === contextMenu.clipId)!)}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
          >
            <span>{contextMenu.pinned ? '☆' : '★'}</span>
            <span>{contextMenu.pinned ? 'Bỏ ghim' : 'Ghim'}</span>
          </button>
          <button
            onClick={handleDelete(contextMenu.clipId)}
            className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <span>✕</span>
            <span>Xóa</span>
          </button>
        </div>
      )}
    </div>
  )
}
