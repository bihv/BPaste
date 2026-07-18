import type { JSX } from 'react'
import type { FilterType } from '../types'

const FILTERS: { id: FilterType; label: string; types?: string[] }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'text', label: 'Văn bản', types: ['text', 'richtext'] },
  { id: 'link', label: 'Liên kết', types: ['link'] },
  { id: 'image', label: 'Hình ảnh', types: ['image'] }
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
              ? 'bg-accent text-white shadow-sm'
              : 'text-theme-secondary hover:bg-black/5 hover:text-theme-primary'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
