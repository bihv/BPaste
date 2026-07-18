import { memo } from 'react'
import type { JSX } from 'react'
import type { ClipRecord } from '../types'

interface Props {
  record: ClipRecord
  onClose: () => void
}

function fileUrl(path: string): string {
  const encodedPath = path.replace(/\\/g, '/').replace(/ /g, '%20')
  return `file://${encodedPath}`
}

const PreviewModal = memo(function PreviewModal({ record, onClose }: Props): JSX.Element {
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade vibrancy-overlay"
      onClick={handleBackdropClick}
    >
      <div className="flex max-h-[85vh] w-[580px] flex-col rounded-xl animate-scale vibrancy-modal">
        <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] px-4 py-3">
          <h2 className="text-[13px] font-semibold text-theme-primary">Xem trước</h2>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {record.type === 'image' && record.image_path && (
            <img
              src={fileUrl(record.image_path)}
              alt="preview"
              className="max-w-full rounded-lg"
            />
          )}
          {record.type === 'richtext' && record.content && (
            <div
              className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-theme-primary"
              dangerouslySetInnerHTML={{ __html: record.content }}
            />
          )}
          {(record.type === 'text' || record.type === 'link') && (
            <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-theme-primary">
              {record.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
})

export default PreviewModal
