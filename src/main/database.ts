import { app } from 'electron'
import Database from 'better-sqlite3'
import { join } from 'path'
import { mkdirSync } from 'fs'

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
  source_name: string | null
  source_icon: string | null
}

export interface NewClip {
  type: ClipType
  content: string
  rtf?: string | null
  image_path?: string | null
  preview: string
  hash: string
  source_name?: string | null
  source_icon?: string | null
}

const MAX_ITEMS = 500

let db: Database.Database

export function initDatabase(): void {
  const dir = join(app.getPath('userData'), 'data')
  mkdirSync(dir, { recursive: true })
  db = new Database(join(dir, 'bpaste.db'))
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS clips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      rtf TEXT,
      image_path TEXT,
      preview TEXT NOT NULL DEFAULT '',
      hash TEXT NOT NULL,
      pinned INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      source_name TEXT,
      source_icon TEXT
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_clips_hash ON clips(hash);
    CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(created_at DESC);
  `)
}

export function upsertClip(clip: NewClip): { record: ClipRecord; isNew: boolean } {
  const now = Date.now()
  const existing = db.prepare('SELECT * FROM clips WHERE hash = ?').get(clip.hash) as
    | ClipRecord
    | undefined

  if (existing) {
    db.prepare('UPDATE clips SET created_at = ?, source_name = ?, source_icon = ? WHERE id = ?').run(
      now,
      clip.source_name ?? null,
      clip.source_icon ?? null,
      existing.id
    )
    return {
      record: { ...existing, created_at: now, source_name: clip.source_name ?? null, source_icon: clip.source_icon ?? null },
      isNew: false
    }
  }

  const info = db
    .prepare(
      `INSERT INTO clips (type, content, rtf, image_path, preview, hash, pinned, created_at, source_name, source_icon)
       VALUES (@type, @content, @rtf, @image_path, @preview, @hash, 0, @created_at, @source_name, @source_icon)`
    )
    .run({
      type: clip.type,
      content: clip.content,
      rtf: clip.rtf ?? null,
      image_path: clip.image_path ?? null,
      preview: clip.preview,
      hash: clip.hash,
      created_at: now,
      source_name: clip.source_name ?? null,
      source_icon: clip.source_icon ?? null
    })

  pruneOld()

  const record = db
    .prepare('SELECT * FROM clips WHERE id = ?')
    .get(info.lastInsertRowid) as ClipRecord
  return { record, isNew: true }
}

export function listClips(limit = 200): ClipRecord[] {
  return db
    .prepare('SELECT * FROM clips ORDER BY pinned DESC, created_at DESC LIMIT ?')
    .all(limit) as ClipRecord[]
}

export function searchClips(query: string, limit = 200): ClipRecord[] {
  const like = `%${query}%`
  return db
    .prepare(
      `SELECT * FROM clips
       WHERE content LIKE ? OR preview LIKE ?
       ORDER BY pinned DESC, created_at DESC LIMIT ?`
    )
    .all(like, like, limit) as ClipRecord[]
}

export function getClip(id: number): ClipRecord | undefined {
  return db.prepare('SELECT * FROM clips WHERE id = ?').get(id) as ClipRecord | undefined
}

export function deleteClip(id: number): ClipRecord | undefined {
  const record = getClip(id)
  db.prepare('DELETE FROM clips WHERE id = ?').run(id)
  db.exec('VACUUM')
  return record
}

export function setPinned(id: number, pinned: boolean): void {
  db.prepare('UPDATE clips SET pinned = ? WHERE id = ?').run(pinned ? 1 : 0, id)
}

export function clearAll(): ClipRecord[] {
  const removed = db.prepare('SELECT * FROM clips WHERE pinned = 0').all() as ClipRecord[]
  db.prepare('DELETE FROM clips WHERE pinned = 0').run()
  db.exec('VACUUM')
  return removed
}

function pruneOld(): void {
  db.prepare(
    `DELETE FROM clips WHERE pinned = 0 AND id NOT IN (
       SELECT id FROM clips WHERE pinned = 0 ORDER BY created_at DESC LIMIT ?
     )`
  ).run(MAX_ITEMS)
}
