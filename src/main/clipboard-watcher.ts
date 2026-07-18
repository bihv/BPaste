import { app, clipboard } from 'electron'
import { createHash } from 'crypto'
import { join } from 'path'
import { mkdirSync, writeFileSync } from 'fs'
import { upsertClip, type ClipType, type NewClip, type ClipRecord } from './database'
import { getActiveAppSource, initSourceIconDir } from './sources'

const POLL_INTERVAL = 600
const URL_REGEX = /^(https?:\/\/|www\.)[^\s]+$/i

const SELF_WRITE_WINDOW = POLL_INTERVAL + 400

let timer: NodeJS.Timeout | null = null
let lastHash = ''
let imageDir = ''
let selfWriteExpiry = 0

function sha256(input: string | Buffer): string {
  return createHash('sha256').update(input).digest('hex')
}

function classify(text: string, _html: string): ClipType {
  if (text && URL_REGEX.test(text.trim())) return 'link'
  return 'text'
}

function buildPreview(text: string, limit = 280): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, limit)
}

function readClipboard(): NewClip | null {
  const image = clipboard.readImage()
  if (!image.isEmpty()) {
    const png = image.toPNG()
    const hash = sha256(png)
    if (hash === lastHash) return null
    const size = image.getSize()
    const fileName = `${hash.slice(0, 16)}.png`
    const filePath = join(imageDir, fileName)
    writeFileSync(filePath, png)
    const source = getActiveAppSource()
    return {
      type: 'image',
      content: '',
      image_path: filePath,
      preview: `Image ${size.width}x${size.height}`,
      hash,
      source_name: source.name,
      source_icon: source.iconPath
    }
  }

  const text = clipboard.readText()
  const html = clipboard.readHTML()
  const rtf = clipboard.readRTF()

  if (!text && !html) return null

  const type = classify(text, html)
  const hashSource = html || rtf || text
  const hash = sha256(hashSource)
  if (hash === lastHash) return null

  const source = getActiveAppSource()
  return {
    type,
    content: html || text,
    rtf: rtf || null,
    preview: buildPreview(text || html.replace(/<[^>]+>/g, ' ')),
    hash,
    source_name: source.name,
    source_icon: source.iconPath
  }
}

export function startWatcher(onChange: (record: ClipRecord, isNew: boolean) => void): void {
  imageDir = join(app.getPath('userData'), 'images')
  mkdirSync(imageDir, { recursive: true })

  initSourceIconDir()

  const initial = clipboard.readImage()
  if (!initial.isEmpty()) {
    lastHash = sha256(initial.toPNG())
  } else {
    const t = clipboard.readText()
    if (t) lastHash = sha256(t.trim())
  }

  timer = setInterval(() => {
    try {
      const clip = readClipboard()
      if (!clip) return
      lastHash = clip.hash
      // A paste we triggered writes to the clipboard, but macOS may normalize the
      // content (e.g. rewrite HTML) so its hash no longer matches what we wrote.
      // Swallow the first change seen within the self-write window instead of
      // relying on a hash match.
      if (Date.now() < selfWriteExpiry) {
        selfWriteExpiry = 0
        return
      }
      const { record, isNew } = upsertClip(clip)
      onChange(record, isNew)
    } catch (err) {
      console.error('[watcher] poll error', err)
    }
  }, POLL_INTERVAL)
}

export function stopWatcher(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

export function markSelfWrite(hash: string): void {
  lastHash = hash
  selfWriteExpiry = Date.now() + SELF_WRITE_WINDOW
}
