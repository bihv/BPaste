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
    <div className="flex items-center gap-0.5 bg-hover rounded-lg p-0.5">
      {FILTERS.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-150 ${
            value === f.id
              ? 'bg-white dark:bg-white/10 text-theme-primary shadow-sm'
              : 'text-theme-tertiary hover:text-theme-secondary'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
