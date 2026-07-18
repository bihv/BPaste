import { useRef, useCallback } from 'react'
import type { JSX } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ClipRecord, Pinboard } from '../types'
import ClipCard from './ClipCard'

console.log('[ClipList] Module loaded')

const CARD_WIDTH = 224 // w-56 = 14rem = 224px
const CARD_GAP = 12 // gap-3 = 0.75rem = 12px

interface Props {
  clips: ClipRecord[]
  pinboards: Pinboard[]
  activeIndex: number
  onSelect: (index: number) => void
  onPaste: (id: number) => void
  onTogglePin: (record: ClipRecord) => void
  onDelete: (id: number) => void
}

export default function ClipList({
  clips,
  pinboards,
  activeIndex,
  onSelect,
  onPaste,
  onTogglePin,
  onDelete
}: Props): JSX.Element {
  console.log('[ClipList] Rendering, clips:', clips.length)
  const activeRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: clips.length,
    getScrollElement: () => parentRef.current,
    horizontal: true,
    estimateSize: () => CARD_WIDTH + CARD_GAP,
    overscan: 3,
  })

  const handlePaste = useCallback(
    (id: number) => () => onPaste(id),
    [onPaste]
  )

  if (clips.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-theme-secondary">
        Chưa có nội dung nào. Sao chép gì đó để bắt đầu.
      </div>
    )
  }

  const totalWidth = clips.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP

  return (
    <div
      ref={parentRef}
      className="no-scrollbar vibrancy-bg relative flex flex-1 items-stretch overflow-x-auto overflow-y-hidden px-4 py-3"
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
                onSelect={() => onSelect(virtualItem.index)}
                onPaste={handlePaste(clip.id)}
                onTogglePin={() => onTogglePin(clip)}
                onDelete={() => onDelete(clip.id)}
                onContextMenuAction={(clip) => (e: React.MouseEvent) => {
                  e.preventDefault()
                  onSelect(clips.findIndex(c => c.id === clip.id))
                  void window.bpaste.showClipContextMenu(clip, pinboards)
                }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
