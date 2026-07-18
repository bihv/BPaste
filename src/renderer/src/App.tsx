import { useCallback, useEffect, useState } from 'react'
import type { JSX } from 'react'
import { useClipboard } from './hooks/useClipboard'
import { SearchBar } from './components/SearchBar'
import TypeFilter from './components/TypeFilter'
import ClipList from './components/ClipList'

export default function App(): JSX.Element {
  const {
    filtered,
    query,
    setQuery,
    filter,
    setFilter,
    paste,
    remove,
    togglePin,
    clearAll
  } = useClipboard()

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [filter, query, filtered.length])

  const clampIndex = useCallback(
    (index: number) => Math.max(0, Math.min(index, filtered.length - 1)),
    [filtered.length]
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        window.bpaste.hide()
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        setActiveIndex((i) => clampIndex(i + 1))
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setActiveIndex((i) => clampIndex(i - 1))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const record = filtered[activeIndex]
        if (record) void paste(record.id)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && e.metaKey === false && e.ctrlKey) {
        e.preventDefault()
        const record = filtered[activeIndex]
        if (record) void remove(record.id)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [filtered, activeIndex, paste, remove, clampIndex])

  return (
    <div className="flex h-screen w-screen flex-col bg-paste-bg animate-rise">
      <header className="flex items-center justify-between border-b border-black/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-slate-800">BPaste</span>
          <TypeFilter value={filter} onChange={setFilter} />
        </div>
        <div className="flex items-center gap-2">
          <SearchBar value={query} onChange={setQuery} />
          <button
            onClick={() => void clearAll()}
            title="Xóa tất cả (giữ mục đã ghim)"
            className="rounded-lg px-2.5 py-1.5 text-xs text-slate-500 ring-1 ring-black/10 hover:bg-black/5 hover:text-slate-700"
          >
            Xóa hết
          </button>
        </div>
      </header>

      <ClipList
        clips={filtered}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        onPaste={(id) => void paste(id)}
        onTogglePin={(record) => void togglePin(record)}
        onDelete={(id) => void remove(id)}
      />

      <footer className="flex items-center justify-center gap-4 border-t border-black/5 px-4 py-1.5 text-[11px] text-slate-400">
        <span>← → di chuyển</span>
        <span>Enter dán</span>
        <span>Ctrl+Delete xóa</span>
        <span>Esc ẩn</span>
      </footer>
    </div>
  )
}
