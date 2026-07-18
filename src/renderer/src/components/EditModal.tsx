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
      className="fixed inset-0 z-50 flex items-center justify-center vibrancy-overlay"
      onClick={handleBackdropClick}
    >
      <div className="flex max-h-[90vh] w-[600px] flex-col rounded-2xl vibrancy-modal">
        <div className="flex items-center justify-between border-b border-theme-default px-5 py-4">
          <h2 className="text-sm font-semibold text-theme-primary">Chỉnh sửa</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
              title="Hủy"
            >
              ✕
            </button>
            {!isImage && (
              <button
                onClick={handleSave}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white hover:opacity-90"
                title="Lưu"
              >
                ✓
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {isImage ? (
            <p className="text-sm text-theme-secondary">Không thể chỉnh sửa hình ảnh.</p>
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
              className="h-full min-h-[300px] w-full rounded-lg border border-theme-default bg-theme-card px-3 py-2 text-sm text-theme-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default EditModal
