import type { ChangeEvent, JSX } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: Props): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 ring-1 ring-white/10 focus-within:ring-white/25">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white/50"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        autoFocus
        spellCheck={false}
        placeholder="Tìm kiếm..."
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-48 bg-transparent text-sm text-white placeholder-white/40 outline-none"
      />
    </div>
  )
}
