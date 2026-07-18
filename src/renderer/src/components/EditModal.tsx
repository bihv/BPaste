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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="flex max-h-[90vh] w-[600px] flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-800">Chỉnh sửa</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-black/5 hover:text-slate-600"
              title="Hủy"
            >
              ✕
            </button>
            {!isImage && (
              <button
                onClick={handleSave}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white hover:bg-blue-600"
                title="Lưu"
              >
                ✓
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-5">
          {isImage ? (
            <p className="text-sm text-slate-500">Không thể chỉnh sửa hình ảnh.</p>
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
              className="h-full min-h-[300px] w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  )
})

export default EditModal
