export type ClipType = 'text' | 'link' | 'image' | 'richtext'

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
}

export type FilterType = 'all' | ClipType
