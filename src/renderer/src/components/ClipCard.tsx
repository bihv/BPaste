import { forwardRef, useState, useEffect } from 'react'
import type { JSX } from 'react'
import DOMPurify from 'dompurify'
import type { ClipRecord, ClipType } from '../types'

const TYPE_META: Record<ClipType, { label: string; icon: string }> = {
  text: { label: 'Văn bản', icon: 'T' },
  link: { label: 'Liên kết', icon: '↗' },
  image: { label: 'Hình ảnh', icon: '▦' },
  richtext: { label: 'Rich text', icon: '¶' }
}

interface Props {
  record: ClipRecord
  active: boolean
  onSelect: () => void
  onPaste: () => void
  onTogglePin: () => void
  onDelete: () => void
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'vừa xong'
  if (min < 60) return `${min} phút trước`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} giờ trước`
  return `${Math.floor(hr / 24)} ngày trước`
}

function fileUrl(path: string): string {
  return `file://${path}`
}

function useIconUrl(iconPath: string | null): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!iconPath) {
      setDataUrl(null)
      return
    }

    let cancelled = false
    window.bpaste.readIcon(iconPath).then((result) => {
      if (!cancelled) {
        setDataUrl(result)
      }
    })
    return () => {
      cancelled = true
    }
  }, [iconPath])

  return dataUrl
}

const RICHTEXT_ALLOWED_TAGS = [
  'p', 'br', 'span', 'div', 'b', 'i', 'u', 'em', 'strong', 's',
  'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'h1', 'h2', 'h3', 'h4'
]

function sanitizeRichtext(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: RICHTEXT_ALLOWED_TAGS,
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#)/i,
    FORBID_TAGS: ['style', 'form', 'base', 'meta', 'iframe', 'object', 'embed', 'script'],
    FORBID_ATTR: ['style', 'target', 'src', 'srcdoc']
  })
}

function CardBody({ record }: { record: ClipRecord }): JSX.Element {
  if (record.type === 'image' && record.image_path) {
    return (
      <img
        src={fileUrl(record.image_path)}
        alt="clip"
        className="h-full w-full rounded-md object-cover"
        draggable={false}
      />
    )
  }
  if (record.type === 'richtext') {
    return (
      <div
        className="prose-preview text-[13px] leading-snug text-white/85"
        dangerouslySetInnerHTML={{ __html: sanitizeRichtext(record.content) }}
      />
    )
  }
  if (record.type === 'link') {
    return (
      <div className="flex flex-col gap-1">
        <span className="break-all text-[13px] font-medium text-sky-300">{record.content}</span>
      </div>
    )
  }
  return (
    <p className="whitespace-pre-wrap break-words text-[13px] leading-snug text-white/85">
      {record.preview || record.content}
    </p>
  )
}

const ClipCard = forwardRef<HTMLDivElement, Props>(function ClipCard(
  { record, active, onSelect, onPaste, onTogglePin, onDelete },
  ref
): JSX.Element {
  const meta = TYPE_META[record.type]
  const iconDataUrl = useIconUrl(record.source_icon)
  return (
    <div
      ref={ref}
      onClick={onPaste}
      onMouseEnter={onSelect}
      className={`group relative flex h-full w-56 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl border p-3 shadow-card transition-all ${
        active
          ? 'border-white/40 bg-paste-cardActive ring-2 ring-white/30'
          : 'border-paste-border bg-paste-card hover:bg-white/10'
      }`}
    >
      <div className="mb-2 flex items-center justify-between text-[11px] text-white/45">
        <div className="flex items-center gap-2">
          {record.source_name && (
            <span className="flex items-center gap-1 text-white/40">
              {iconDataUrl && (
                <img
                  src={iconDataUrl}
                  alt=""
                  className="h-3.5 w-3.5 rounded"
                />
              )}
              <span>{record.source_name}</span>
            </span>
          )}
        </div>
        <span>{timeAgo(record.created_at)}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <CardBody record={record} />
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin()
          }}
          title={record.pinned ? 'Bỏ ghim' : 'Ghim'}
          className={`rounded px-1.5 py-0.5 text-[11px] ${
            record.pinned ? 'text-amber-300' : 'text-white/50 hover:text-white'
          }`}
        >
          ★
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Xóa"
          className="rounded px-1.5 py-0.5 text-[11px] text-white/50 hover:text-red-300"
        >
          ✕
        </button>
      </div>

      {record.pinned === 1 && (
        <span className="absolute left-2 top-2 text-[11px] text-amber-300">★</span>
      )}
    </div>
  )
})

export default ClipCard
