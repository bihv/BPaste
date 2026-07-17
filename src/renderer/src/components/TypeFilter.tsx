import type { JSX } from 'react'
import type { FilterType } from '../types'

const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'text', label: 'Văn bản' },
  { id: 'link', label: 'Liên kết' },
  { id: 'image', label: 'Hình ảnh' },
  { id: 'richtext', label: 'Rich text' }
]

interface Props {
  value: FilterType
  onChange: (f: FilterType) => void
}

export default function TypeFilter({ value, onChange }: Props): JSX.Element {
  return (
    <div className="flex items-center gap-1">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === f.id
              ? 'bg-white/20 text-white'
              : 'text-white/55 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
