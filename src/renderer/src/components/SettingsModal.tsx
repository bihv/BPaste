import { useCallback } from 'react'
import type { JSX } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeMode } from '../types'

interface Props {
  onClose: () => void
}

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: string }[] = [
  { value: 'system', label: 'Hệ thống', icon: '🖥️' },
  { value: 'light', label: 'Sáng', icon: '☀️' },
  { value: 'dark', label: 'Tối', icon: '🌙' }
]

export default function SettingsModal({ onClose }: Props): JSX.Element {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = useCallback((newTheme: ThemeMode) => {
    setTheme(newTheme)
  }, [setTheme])

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  return (
    <div
      className="vibrancy-overlay fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="vibrancy-modal w-80 rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-theme-primary">Cài đặt</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-theme-secondary hover:bg-black/5 hover:text-theme-primary"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-theme-secondary">
              Giao diện
            </label>
            <div className="flex gap-2">
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-3 py-3 text-sm transition-all ${
                    theme === option.value
                      ? 'bg-accent text-white'
                      : 'bg-theme-card text-theme-secondary hover:bg-black/5'
                  }`}
                >
                  <span className="text-lg">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
