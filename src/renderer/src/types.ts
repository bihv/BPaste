export type ClipType = 'text' | 'link' | 'image' | 'richtext'

export type ThemeMode = 'light' | 'dark' | 'system'

export interface ClipRecord {
  id: number
  type: ClipType
  content: string
  rtf: string | null
  image_path: string | null
  preview: string
  hash: string
  pinned: number
  created_at: number
  source_name: string | null
  source_icon: string | null
  pinboard_id: number | null
}

export type FilterType = 'all' | 'text' | 'link' | 'image'

export interface Pinboard {
  id: number
  name: string
  color: string
  created_at: number
  sort_order: number
}
