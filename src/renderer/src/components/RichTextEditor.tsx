import { memo, useRef, useEffect, useCallback } from 'react'
import type { JSX } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const TOOLBAR_BUTTONS = [
  { cmd: 'bold', label: 'B', title: 'In đậm' },
  { cmd: 'italic', label: 'I', title: 'In nghiêng' },
  { cmd: 'underline', label: 'U', title: 'Gạch chân' },
  { cmd: 'strikeThrough', label: 'S̶', title: 'Gạch ngang' },
] as const

const RichTextEditor = memo(function RichTextEditor({ value, onChange, placeholder }: Props): JSX.Element {
  const editorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }, [onChange])

  const execCommand = useCallback((cmd: string) => {
    document.execCommand(cmd, false)
    editorRef.current?.focus()
    handleInput()
  }, [handleInput])

  return (
    <div className="rounded-lg border border-black/[0.06] dark:border-white/[0.06] overflow-hidden bg-hover">
      <div className="flex items-center gap-0.5 border-b border-black/[0.04] dark:border-white/[0.04] bg-white/[0.03] dark:bg-white/[0.02] px-1.5 py-1">
        {TOOLBAR_BUTTONS.map(({ cmd, label, title }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              execCommand(cmd)
            }}
            title={title}
            className="flex h-6 w-7 items-center justify-center rounded text-[12px] font-medium text-theme-tertiary hover:bg-hover hover:text-theme-primary transition-colors"
          >
            {label}
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-black/[0.06] dark:bg-white/[0.06]" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            execCommand('removeFormat')
          }}
          title="Xóa định dạng"
          className="flex h-6 items-center justify-center rounded px-1.5 text-[11px] font-medium text-theme-tertiary hover:bg-hover hover:text-theme-secondary transition-colors"
        >
          Clear
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        data-placeholder={placeholder}
        className="min-h-[120px] w-full px-3 py-2.5 text-[13px] text-theme-primary outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-theme-tertiary"
        style={{ lineHeight: 1.6 }}
      />
    </div>
  )
})

export default RichTextEditor
