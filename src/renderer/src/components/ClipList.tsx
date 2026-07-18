import { useRef, useCallback } from 'react'
import type { JSX } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { ClipRecord } from '../types'
import ClipCard from './ClipCard'

const CARD_WIDTH = 224 // w-56 = 14rem = 224px
const CARD_GAP = 12 // gap-3 = 0.75rem = 12px

interface Props {
  clips: ClipRecord[]
  activeIndex: number
  onSelect: (index: number) => void
  onPaste: (id: number) => void
  onTogglePin: (record: ClipRecord) => void
  onDelete: (id: number) => void
}

export default function ClipList({
  clips,
  activeIndex,
  onSelect,
  onPaste,
  onTogglePin,
  onDelete
}: Props): JSX.Element {
  const activeRef = useRef<HTMLDivElement>(null)
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: clips.length,
    getScrollElement: () => parentRef.current,
    horizontal: true,
    estimateSize: () => CARD_WIDTH + CARD_GAP,
    overscan: 3,
  })

  const handleSelect = useCallback(
    (index: number) => () => onSelect(index),
    [onSelect]
  )
  const handlePaste = useCallback(
    (id: number) => () => onPaste(id),
    [onPaste]
  )
  const handleTogglePin = useCallback(
    (record: ClipRecord) => () => onTogglePin(record),
    [onTogglePin]
  )
  const handleDelete = useCallback(
    (id: number) => () => onDelete(id),
    [onDelete]
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
      className="no-scrollbar flex flex-1 items-stretch overflow-x-auto overflow-y-hidden px-4 py-3"
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
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
