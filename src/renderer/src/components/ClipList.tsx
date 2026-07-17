import { useEffect, useRef } from 'react'
import type { JSX } from 'react'
import type { ClipRecord } from '../types'
import ClipCard from './ClipCard'

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

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeIndex])

  if (clips.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-white/40">
        Chưa có nội dung nào. Sao chép gì đó để bắt đầu.
      </div>
    )
  }

  return (
    <div className="no-scrollbar flex flex-1 items-stretch gap-3 overflow-x-auto overflow-y-hidden px-4 pb-4">
      {clips.map((clip, index) => (
        <ClipCard
          key={clip.id}
          ref={index === activeIndex ? activeRef : undefined}
          record={clip}
          active={index === activeIndex}
          onSelect={() => onSelect(index)}
          onPaste={() => onPaste(clip.id)}
          onTogglePin={() => onTogglePin(clip)}
          onDelete={() => onDelete(clip.id)}
        />
      ))}
    </div>
  )
}
