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
      className="fixed inset-0 z-50 flex items-center justify-center vibrancy-overlay"
      onClick={handleBackdropClick}
    >
      <div className="flex max-h-[90vh] w-[600px] flex-col rounded-2xl vibrancy-modal">
        <div className="flex items-center justify-between border-b border-theme-default px-5 py-4">
          <h2 className="text-sm font-semibold text-theme-primary">Xem trước</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {record.type === 'image' && record.image_path && (
            <img
              src={fileUrl(record.image_path)}
              alt="preview"
              className="max-w-full rounded-lg"
            />
          )}
          {record.type === 'richtext' && record.content && (
            <div
              className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-theme-primary"
              dangerouslySetInnerHTML={{ __html: record.content }}
            />
          )}
          {(record.type === 'text' || record.type === 'link') && (
            <pre className="whitespace-pre-wrap break-words text-[14px] leading-relaxed text-theme-primary">
              {record.content}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
})

export default PreviewModal
