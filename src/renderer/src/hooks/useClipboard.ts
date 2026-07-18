import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ClipRecord, FilterType } from '../types'

export function useClipboard(): {
  clips: ClipRecord[]
  filtered: ClipRecord[]
  query: string
  setQuery: (q: string) => void
  filter: FilterType
  setFilter: (f: FilterType) => void
  paste: (id: number) => Promise<void>
  pastePlain: (id: number) => Promise<void>
  update: (id: number, content: string, preview: string) => Promise<void>
  remove: (id: number) => Promise<void>
  togglePin: (record: ClipRecord) => Promise<void>
  clearAll: () => Promise<void>
  reload: () => Promise<void>
} {
  const [clips, setClips] = useState<ClipRecord[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const reload = useCallback(async () => {
    const data = query.trim() ? await window.bpaste.search(query) : await window.bpaste.list()
    setClips(data)
  }, [query])

  useEffect(() => {
    void reload()
  }, [reload])

  useEffect(() => {
    const offChanged = window.bpaste.onChanged(() => {
      void reload()
    })
    const offShown = window.bpaste.onWindowShown(() => {
      setQuery('')
      setFilter('all')
      void reload()
    })
    return () => {
      offChanged()
      offShown()
    }
  }, [reload])

  const filtered = useMemo(() => {
    if (filter === 'all') return clips
    if (filter === 'text') {
      return clips.filter((c) => c.type === 'text' || c.type === 'richtext')
    }
    return clips.filter((c) => c.type === filter)
  }, [clips, filter])

  const paste = useCallback(async (id: number) => {
    await window.bpaste.paste(id)
  }, [])

  const pastePlain = useCallback(async (id: number) => {
    await window.bpaste.pastePlain(id)
  }, [])

  const update = useCallback(
    async (id: number, content: string, preview: string) => {
      await window.bpaste.update(id, content, preview)
      await reload()
    },
    [reload]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.bpaste.delete(id)
      await reload()
    },
    [reload]
  )

  const togglePin = useCallback(
    async (record: ClipRecord) => {
      await window.bpaste.pin(record.id, record.pinned === 0)
      await reload()
    },
    [reload]
  )

  const clearAll = useCallback(async () => {
    await window.bpaste.clear()
    await reload()
  }, [reload])

  return {
    clips,
    filtered,
    query,
    setQuery,
    filter,
    setFilter,
    paste,
    pastePlain,
    update,
    remove,
    togglePin,
    clearAll,
    reload
  }
}
