import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ClipRecord, FilterType, Pinboard } from '../types'

console.log('[useClipboard] Module loaded')

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
  pinboards: Pinboard[]
  selectedPinboardId: number | null
  setSelectedPinboard: (id: number | null) => void
  createPinboard: (name: string, color: string) => Promise<void>
  updatePinboard: (id: number, name: string, color: string) => Promise<void>
  deletePinboard: (id: number) => Promise<void>
  addToPinboard: (clipId: number, pinboardId: number | null) => Promise<void>
  reloadPinboards: () => Promise<void>
} {
  console.log('[useClipboard] Hook called')
  const [clips, setClips] = useState<ClipRecord[]>([])
  const [pinboards, setPinboards] = useState<Pinboard[]>([])
  const [selectedPinboardId, setSelectedPinboardId] = useState<number | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  console.log('[useClipboard] State initialized, clips:', clips.length, 'pinboards:', pinboards.length)

  const reloadPinboards = useCallback(async () => {
    console.log('[useClipboard] reloadPinboards called')
    const data = await window.bpaste.listPinboards()
    console.log('[useClipboard] pinboards loaded:', data.length)
    setPinboards(data)
  }, [])

  const reload = useCallback(async () => {
    console.log('[useClipboard] reload called, query:', query, 'selectedPinboardId:', selectedPinboardId)
    let data: ClipRecord[]
    if (query.trim()) {
      data = await window.bpaste.search(query)
    } else if (selectedPinboardId !== null) {
      data = await window.bpaste.getPinboardClips(selectedPinboardId)
    } else {
      data = await window.bpaste.list()
    }
    console.log('[useClipboard] clips loaded:', data.length)
    setClips(data)
  }, [query, selectedPinboardId])

  useEffect(() => {
    console.log('[useClipboard] Effect: calling reloadPinboards')
    void reloadPinboards()
  }, [reloadPinboards])

  useEffect(() => {
    console.log('[useClipboard] Effect: calling reload')
    void reload()
  }, [reload])

  useEffect(() => {
    const offChanged = window.bpaste.onChanged(() => {
      console.log('[useClipboard] onChanged triggered')
      void reload()
    })
    const offShown = window.bpaste.onWindowShown(() => {
      console.log('[useClipboard] onWindowShown triggered')
      setQuery('')
      setFilter('all')
      setSelectedPinboardId(null)
      void reload()
    })
    return () => {
      offChanged()
      offShown()
    }
  }, [reload])

  const setSelectedPinboard = useCallback((id: number | null) => {
    setSelectedPinboardId(id)
  }, [])

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

  const createPinboard = useCallback(
    async (name: string, color: string) => {
      await window.bpaste.createPinboard(name, color)
      await reloadPinboards()
    },
    [reloadPinboards]
  )

  const updatePinboard = useCallback(
    async (id: number, name: string, color: string) => {
      await window.bpaste.updatePinboard(id, name, color)
      await reloadPinboards()
    },
    [reloadPinboards]
  )

  const deletePinboard = useCallback(
    async (id: number) => {
      await window.bpaste.deletePinboard(id)
      await reloadPinboards()
    },
    [reloadPinboards]
  )

  const addToPinboard = useCallback(
    async (clipId: number, pinboardId: number | null) => {
      await window.bpaste.addToPinboard(clipId, pinboardId)
      await reload()
    },
    [reload]
  )

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
    reload,
    pinboards,
    selectedPinboardId,
    setSelectedPinboard,
    createPinboard,
    updatePinboard,
    deletePinboard,
    addToPinboard,
    reloadPinboards
  }
}
