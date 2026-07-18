import { useState, useEffect, useMemo, memo } from 'react'
import type { JSX } from 'react'
import type { ClipRecord } from '../types'

const MAX_COLOR_CACHE_SIZE = 1000
const colorCache = new Map<string, string>()

function getCachedColor(iconPath: string): string | null {
  const cached = colorCache.get(iconPath)
  if (cached !== undefined) return cached

  if (colorCache.size >= MAX_COLOR_CACHE_SIZE) {
    const firstKey = colorCache.keys().next().value
    if (firstKey !== undefined) colorCache.delete(firstKey)
  }

  return null
}

async function extractDominantColor(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }

        const size = 32
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)

        const imageData = ctx.getImageData(0, 0, size, size)
        const { data: pixels } = imageData

        let r = 0, g = 0, b = 0, count = 0

        for (let i = 0; i < pixels.length; i += 4) {
          const alpha = pixels[i + 3]
          if (alpha < 128) continue

          const pr = pixels[i]
          const pg = pixels[i + 1]
          const pb = pixels[i + 2]

          if (pr < 20 && pg < 20 && pb < 20) continue
          if (pr > 235 && pg > 235 && pb > 235) continue

          r += pr
          g += pg
          b += pb
          count++
        }

        if (count === 0) {
          resolve(null)
          return
        }

        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)

        resolve(`rgb(${r}, ${g}, ${b})`)
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = dataUrl
  })
}

function useDominantColor(iconPath: string | null, dataUrl: string | null): string | null {
  const [color, setColor] = useState<string | null>(() =>
    iconPath ? getCachedColor(iconPath) : null
  )

  useEffect(() => {
    if (!iconPath || !dataUrl) {
      setColor(null)
      return
    }

    const cached = getCachedColor(iconPath)
    if (cached) {
      setColor(cached)
      return
    }

    let cancelled = false
    extractDominantColor(dataUrl).then((extracted) => {
      if (cancelled) return
      if (extracted) {
        colorCache.set(iconPath, extracted)
        setColor(extracted)
      }
    })
    return () => {
      cancelled = true
    }
  }, [iconPath, dataUrl])

  return color
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
  const encodedPath = path.replace(/\\/g, '/').replace(/ /g, '%20')
  return `file://${encodedPath}`
}

function useFileDataUrl(
  filePath: string | null,
  readFn: (path: string) => Promise<string | null>
): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!filePath) {
      setDataUrl(null)
      return
    }

    let cancelled = false
    readFn(filePath).then((result) => {
      if (!cancelled) {
        setDataUrl(result)
      }
    })
    return () => {
      cancelled = true
    }
  }, [filePath, readFn])

  return dataUrl
}

function useIconUrl(iconPath: string | null): string | null {
  return useFileDataUrl(iconPath, (path) => window.bpaste.readIcon(path))
}

function useImageDataUrl(imagePath: string | null): string | null {
  return useFileDataUrl(imagePath, (path) => window.bpaste.readImage(path))
}

const CardBody = memo(function CardBody({ record }: { record: ClipRecord }): JSX.Element {
  const imageDataUrl = useImageDataUrl(record.type === 'image' ? record.image_path : null)
  const [rtfHtml, setRtfHtml] = useState<string>('')

  useEffect(() => {
    if (record.type === 'richtext' && record.rtf) {
      window.bpaste.sanitizeRtf(record.rtf).then(setRtfHtml)
    } else {
      setRtfHtml('')
    }
  }, [record.type, record.rtf])

  if (record.type === 'image' && record.image_path) {
    const src = imageDataUrl || fileUrl(record.image_path)
    return (
      <img
        src={src}
        alt="clip"
        className="h-full w-full rounded-lg object-cover"
        draggable={false}
      />
    )
  }
  if (record.type === 'link') {
    return (
      <div className="flex flex-col gap-1">
        <span className="break-all text-[13px] font-medium text-blue-500">{record.content}</span>
      </div>
    )
  }
  if (record.type === 'richtext' && rtfHtml) {
    return (
      <div
        className="whitespace-pre-wrap break-words text-[13px] leading-snug text-slate-700"
        dangerouslySetInnerHTML={{ __html: rtfHtml }}
      />
    )
  }
  return (
    <p className="whitespace-pre-wrap break-words text-[13px] leading-snug text-slate-700">
      {record.preview || record.content}
    </p>
  )
})

const ClipCard = memo(function ClipCard({
  record,
  active,
  onSelect,
  onPaste,
  onTogglePin,
  onDelete
}: Props): JSX.Element {
  const iconDataUrl = useIconUrl(record.source_icon)
  const dominantColor = useDominantColor(record.source_icon, iconDataUrl)

  const headerBg = useMemo(() => {
    if (!dominantColor) return '#f0f2f5'
    const rgb = dominantColor.match(/\d+/g)
    if (!rgb) return '#f0f2f5'
    const [r, g, b] = rgb.map(Number)
    const factor = 0.85
    return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`
  }, [dominantColor])

  const headerTextColor = useMemo(() => {
    if (!dominantColor) return '#1d1d1f'
    const rgb = dominantColor.match(/\d+/g)
    if (!rgb) return '#1d1d1f'
    const [r, g, b] = rgb.map(Number)
    const total = r + g + b
    return total > 384 ? '#1d1d1f' : '#ffffff'
  }, [dominantColor])

  return (
    <div
      onClick={onPaste}
      onMouseEnter={onSelect}
      className={`group relative flex h-full w-56 shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover ${
        active ? 'shadow-cardActive ring-2 ring-blue-500/50' : ''
      }`}
    >
      <div
        className="relative flex h-14 items-center gap-2.5 border-b border-black/5 px-3"
        style={{ backgroundColor: headerBg }}
      >
        {iconDataUrl ? (
          <img
            src={iconDataUrl}
            alt=""
            className="h-8 w-8 rounded-lg object-contain"
            draggable={false}
          />
        ) : (
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            <span className="text-sm font-medium" style={{ color: headerTextColor }}>
              {record.source_name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          {record.source_name && (
            <span className="truncate block text-[12px] font-semibold" style={{ color: headerTextColor }}>
              {record.source_name}
            </span>
          )}
          <span className="block text-[10px]" style={{ color: headerTextColor, opacity: 0.7 }}>
            {timeAgo(record.created_at)}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-3">
        <CardBody record={record} />
      </div>

      <div className="absolute right-2 top-16 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onTogglePin()
          }}
          title={record.pinned ? 'Bỏ ghim' : 'Ghim'}
          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] shadow-sm transition-colors ${
            record.pinned
              ? 'bg-amber-400 text-amber-900'
              : 'bg-white text-slate-500 hover:bg-slate-100'
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
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] text-slate-500 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
        >
          ✕
        </button>
      </div>

      {record.pinned === 1 && (
        <div className="absolute left-2 top-16 text-[10px] text-amber-500">★</div>
      )}
    </div>
  )
})

export default ClipCard
