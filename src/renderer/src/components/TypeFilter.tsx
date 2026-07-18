import type { JSX } from 'react'
import type { FilterType } from '../types'

const FILTERS: { id: FilterType; label: string; types?: ClipType[] }[] = [
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
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
