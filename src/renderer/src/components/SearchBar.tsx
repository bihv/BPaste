import type { ChangeEvent, JSX } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: Props): JSX.Element {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-hover px-3 py-1.5 transition-all duration-150 focus-within:bg-active focus-within:ring-1 focus-within:ring-accent/30">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-theme-tertiary"
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
        className="w-44 bg-transparent text-[13px] text-theme-primary placeholder:text-theme-tertiary outline-none"
      />
    </div>
  )
}
