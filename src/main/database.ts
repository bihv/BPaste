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
  pinboard_id: number | null
}

export interface Pinboard {
  id: number
  name: string
  color: string
  created_at: number
  sort_order: number
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
  pinboard_id?: number | null
}

const MAX_ITEMS = 500

let db: Database.Database

export function initDatabase(): void {
  const dir = join(app.getPath('userData'), 'data')
  mkdirSync(dir, { recursive: true })
  db = new Database(join(dir, 'bpaste.db'))
  db.pragma('journal_mode = WAL')
  db.exec(`
    CREATE TABLE IF NOT EXISTS pinboards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6366f1',
      created_at INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
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
      source_icon TEXT,
      pinboard_id INTEGER,
      FOREIGN KEY (pinboard_id) REFERENCES pinboards(id) ON DELETE SET NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_clips_hash ON clips(hash);
    CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_clips_pinboard ON clips(pinboard_id);
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  // Initialize default settings
  const defaults: Record<string, string> = {
    theme: 'system'
  }
  const insertStmt = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)')
  for (const [key, value] of Object.entries(defaults)) {
    insertStmt.run(key, value)
  }
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

export function updateClip(id: number, content: string, preview: string): ClipRecord | undefined {
  db.prepare('UPDATE clips SET content = ?, preview = ? WHERE id = ?').run(content, preview, id)
  return getClip(id)
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

// Pinboard functions
export function listPinboards(): Pinboard[] {
  return db
    .prepare('SELECT * FROM pinboards ORDER BY sort_order ASC, created_at DESC')
    .all() as Pinboard[]
}

export function createPinboard(name: string, color: string): Pinboard {
  const now = Date.now()
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM pinboards').get() as { max: number | null }
  const sortOrder = (maxOrder?.max ?? -1) + 1

  const info = db
    .prepare('INSERT INTO pinboards (name, color, created_at, sort_order) VALUES (?, ?, ?, ?)')
    .run(name, color, now, sortOrder)

  return db.prepare('SELECT * FROM pinboards WHERE id = ?').get(info.lastInsertRowid) as Pinboard
}

export function updatePinboard(id: number, name: string, color: string): Pinboard | undefined {
  db.prepare('UPDATE pinboards SET name = ?, color = ? WHERE id = ?').run(name, color, id)
  return db.prepare('SELECT * FROM pinboards WHERE id = ?').get(id) as Pinboard | undefined
}

export function deletePinboard(id: number): void {
  db.prepare('DELETE FROM pinboards WHERE id = ?').run(id)
}

export function reorderPinboards(orderedIds: number[]): void {
  const stmt = db.prepare('UPDATE pinboards SET sort_order = ? WHERE id = ?')
  orderedIds.forEach((id, index) => {
    stmt.run(index, id)
  })
}

export function addClipToPinboard(clipId: number, pinboardId: number | null): void {
  if (pinboardId === null) {
    db.prepare('UPDATE clips SET pinboard_id = NULL WHERE id = ?').run(clipId)
  } else {
    db.prepare('UPDATE clips SET pinboard_id = ? WHERE id = ?').run(pinboardId, clipId)
  }
}

export function getClipsByPinboard(pinboardId: number | null, limit = 200): ClipRecord[] {
  if (pinboardId === null) {
    return db
      .prepare('SELECT * FROM clips WHERE pinboard_id IS NULL ORDER BY pinned DESC, created_at DESC LIMIT ?')
      .all(limit) as ClipRecord[]
  }
  return db
    .prepare('SELECT * FROM clips WHERE pinboard_id = ? ORDER BY pinned DESC, created_at DESC LIMIT ?')
    .all(pinboardId, limit) as ClipRecord[]
}

// Settings functions
export function getSetting(key: string): string | null {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value ?? null
}

export function setSetting(key: string, value: string): void {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}

export function getAllSettings(): Record<string, string> {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}
