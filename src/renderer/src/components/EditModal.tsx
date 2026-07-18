import { memo, useState, useEffect } from 'react'
import type { JSX } from 'react'
import type { ClipRecord } from '../types'
import RichTextEditor from './RichTextEditor'

function stripHtml(html: string): string {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

interface Props {
  record: ClipRecord
  onSave: (content: string, preview: string) => void
  onClose: () => void
}

const EditModal = memo(function EditModal({ record, onSave, onClose }: Props): JSX.Element {
  const [content, setContent] = useState(record.content)

  useEffect(() => {
    setContent(record.content)
  }, [record])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleSave = () => {
    const plainText = isRichText ? stripHtml(content) : content
    const preview = plainText.slice(0, 100) || '...'
    onSave(content, preview)
    onClose()
  }

  const isImage = record.type === 'image'
  const isRichText = record.type === 'richtext'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-fade vibrancy-overlay"
      onClick={handleBackdropClick}
    >
      <div className="flex max-h-[85vh] w-[580px] flex-col rounded-xl animate-scale vibrancy-modal">
        <div className="flex items-center justify-between border-b border-black/[0.04] dark:border-white/[0.04] px-4 py-3">
          <h2 className="text-[13px] font-semibold text-theme-primary">Chỉnh sửa</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
              title="Hủy"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {!isImage && (
              <button
                onClick={handleSave}
                className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white hover:bg-accent-hover transition-colors"
                title="Lưu"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isImage ? (
            <p className="text-[13px] text-theme-secondary">Không thể chỉnh sửa hình ảnh.</p>
          ) : isRichText ? (
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Nhập nội dung..."
            />
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-full min-h-[280px] w-full rounded-lg border border-black/[0.06] dark:border-white/[0.06] bg-hover px-3 py-2 text-[13px] text-theme-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default EditModal
