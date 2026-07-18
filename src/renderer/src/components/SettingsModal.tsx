import { useState } from 'react'
import type { JSX } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeMode } from '../types'

type TabType = 'appearance' | 'paste' | 'history' | 'behavior' | 'shortcuts' | 'rules'

interface NavItem {
  id: TabType
  label: string
  icon: JSX.Element
}

const NavIcon = ({ id, active }: { id: TabType; active: boolean }) => {
  const color = active ? 'text-accent' : 'text-theme-secondary'

  switch (id) {
    case 'appearance':
      return (
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      )
    case 'paste':
      return (
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
        </svg>
      )
    case 'history':
      return (
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'behavior':
      return (
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h2.594c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v2.594c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-2.594c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'shortcuts':
      return (
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )
    case 'rules':
      return (
        <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      )
    default:
      return null
  }
}

const navItems: NavItem[] = [
  { id: 'appearance', label: 'Appearance', icon: <NavIcon id="appearance" active={false} /> },
  { id: 'paste', label: 'Paste', icon: <NavIcon id="paste" active={false} /> },
  { id: 'history', label: 'History', icon: <NavIcon id="history" active={false} /> },
  { id: 'behavior', label: 'Behavior', icon: <NavIcon id="behavior" active={false} /> },
  { id: 'shortcuts', label: 'Shortcuts', icon: <NavIcon id="shortcuts" active={false} /> },
  { id: 'rules', label: 'Rules', icon: <NavIcon id="rules" active={false} /> },
]

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps): JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function Section({ title, children }: { title?: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="mb-6">
      {title && (
        <h3 className="text-[11px] font-semibold text-theme-tertiary uppercase tracking-wide mb-2 px-1">
          {title}
        </h3>
      )}
      <div className="rounded-xl bg-theme-card border border-black/[0.05] dark:border-white/[0.05] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function Row({
  label,
  description,
  children,
  border = true
}: {
  label: string
  description?: string
  children?: React.ReactNode
  border?: boolean
}): JSX.Element {
  return (
    <div className={`flex items-center justify-between px-4 py-3 ${border ? 'border-b border-black/[0.04] dark:border-white/[0.04]' : ''}`}>
      <div className="flex-1 pr-4">
        <div className="text-[13px] text-theme-primary">{label}</div>
        {description && (
          <div className="text-[11px] text-theme-tertiary mt-0.5 leading-relaxed">{description}</div>
        )}
      </div>
      <div className="text-theme-primary">{children}</div>
    </div>
  )
}

function AppearanceTab(): JSX.Element {
  const { theme, setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>(theme)

  const handleThemeChange = (newTheme: ThemeMode) => {
    setSelectedTheme(newTheme)
    setTheme(newTheme)
  }

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold text-theme-primary mb-6">Appearance</h2>

      <Section title="Theme">
        <div className="p-1.5 flex gap-1.5">
          {[
            { value: 'system', label: 'System', desc: 'Follow macOS' },
            { value: 'light', label: 'Light', desc: 'Always light' },
            { value: 'dark', label: 'Dark', desc: 'Always dark' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => handleThemeChange(item.value as ThemeMode)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg transition-all duration-150 ${
                selectedTheme === item.value
                  ? 'bg-accent text-white shadow-sm'
                  : 'hover:bg-hover text-theme-primary'
              }`}
            >
              <span className="text-[14px] font-medium">{item.label}</span>
              <span className={`text-[10px] ${selectedTheme === item.value ? 'text-white/70' : 'text-theme-tertiary'}`}>
                {item.desc}
              </span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent Color">
        <Row label="Color" description="Customize the accent color for BPaste">
          <div className="flex gap-2">
            {['#007aff', '#5856d6', '#af52de', '#ff2d55', '#ff9500', '#34c759'].map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                  color === '#007aff' ? 'ring-2 ring-accent ring-offset-2 dark:ring-offset-0' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </Row>
      </Section>
    </div>
  )
}

function PasteTab(): JSX.Element {
  const [pasteTarget, setPasteTarget] = useState<'active' | 'clipboard'>('active')
  const [plainText, setPlainText] = useState(false)

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold text-theme-primary mb-6">Paste</h2>

      <Section title="Paste Destination">
        <Row label="Default target" description="Where to paste copied content">
          <select
            value={pasteTarget}
            onChange={(e) => setPasteTarget(e.target.value as 'active' | 'clipboard')}
            className="text-[13px] bg-theme-card border border-black/[0.08] dark:border-white/[0.08] rounded-md px-2 py-1 text-theme-primary focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="active">Active Application</option>
            <option value="clipboard">Clipboard</option>
          </select>
        </Row>
        <Row label="Always paste as plain text" border={false}>
          <Toggle checked={plainText} onChange={setPlainText} />
        </Row>
      </Section>

      <Section title="Rich Text">
        <Row label="Preserve formatting" description="Keep original formatting when pasting">
          <Toggle checked={true} onChange={() => {}} />
        </Row>
        <Row label="Convert to plain text" description="Strip all formatting" border={false}>
          <Toggle checked={false} onChange={() => {}} />
        </Row>
      </Section>
    </div>
  )
}

function HistoryTab(): JSX.Element {
  const [historyDays, setHistoryDays] = useState(7)
  const [maxItems, setMaxItems] = useState(500)

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold text-theme-primary mb-6">History</h2>

      <Section title="Retention">
        <Row label="Keep history for" description="Automatically delete older items">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={historyDays}
              onChange={(e) => setHistoryDays(Number(e.target.value))}
              className="w-16 text-center text-[13px] bg-theme-card border border-black/[0.08] dark:border-white/[0.08] rounded-md px-2 py-1 text-theme-primary focus:outline-none focus:ring-1 focus:ring-accent"
              min={1}
              max={365}
            />
            <span className="text-[13px] text-theme-secondary">days</span>
          </div>
        </Row>
        <Row label="Maximum items" description="Maximum number of items to keep">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={maxItems}
              onChange={(e) => setMaxItems(Number(e.target.value))}
              className="w-20 text-center text-[13px] bg-theme-card border border-black/[0.08] dark:border-white/[0.08] rounded-md px-2 py-1 text-theme-primary focus:outline-none focus:ring-1 focus:ring-accent"
              min={100}
              max={10000}
              step={100}
            />
          </div>
        </Row>
      </Section>

      <Section title="Storage">
        <Row label="Estimated storage" description="Storage used by clipboard history">
          <span className="text-[13px] text-theme-secondary">~12 MB</span>
        </Row>
        <Row label="Clear history" description="Remove all clipboard history" border={false}>
          <button className="text-[13px] text-red-500 hover:text-red-600 font-medium">
            Clear All
          </button>
        </Row>
      </Section>
    </div>
  )
}

function BehaviorTab(): JSX.Element {
  const [launchAtLogin, setLaunchAtLogin] = useState(false)
  const [runInBackground, setRunInBackground] = useState(true)
  const [showInMenuBar, setShowInMenuBar] = useState(true)
  const [soundEffects, setSoundEffects] = useState(false)

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold text-theme-primary mb-6">Behavior</h2>

      <Section title="Startup">
        <Row label="Launch at login">
          <Toggle checked={launchAtLogin} onChange={setLaunchAtLogin} />
        </Row>
        <Row label="Start minimized" description="Start BPaste in the background">
          <Toggle checked={false} onChange={() => {}} />
        </Row>
      </Section>

      <Section title="Menu Bar">
        <Row label="Show in menu bar">
          <Toggle checked={showInMenuBar} onChange={setShowInMenuBar} />
        </Row>
        <Row label="Show icon badge" description="Show count of new items">
          <Toggle checked={true} onChange={() => {}} />
        </Row>
      </Section>

      <Section title="General">
        <Row label="Run in background">
          <Toggle checked={runInBackground} onChange={setRunInBackground} />
        </Row>
        <Row label="Sound effects" border={false}>
          <Toggle checked={soundEffects} onChange={setSoundEffects} />
        </Row>
      </Section>
    </div>
  )
}

function ShortcutsTab(): JSX.Element {
  const shortcuts = [
    { label: 'Show/Hide BPaste', key: '⌘⇧V' },
    { label: 'New item', key: '⌘N' },
    { label: 'Search', key: '⌘F' },
    { label: 'Delete item', key: '⌫' },
    { label: 'Edit item', key: '⏎' },
    { label: 'Toggle pin', key: '⌘P' },
    { label: 'Clear all', key: '⌘⇧⌫' },
  ]

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold text-theme-primary mb-6">Shortcuts</h2>

      <Section>
        {shortcuts.map((shortcut, index) => (
          <Row
            key={shortcut.label}
            label={shortcut.label}
            border={index < shortcuts.length - 1}
          >
            <div className="flex gap-1">
              {shortcut.key.split('').map((char, i) => (
                <kbd
                  key={i}
                  className="px-2 py-1 text-[11px] font-medium rounded bg-hover text-theme-secondary border border-black/[0.06] dark:border-white/[0.06]"
                >
                  {char}
                </kbd>
              ))}
            </div>
          </Row>
        ))}
      </Section>

      <p className="text-[11px] text-theme-tertiary px-1">
        Click on a shortcut to customize it. Some shortcuts may conflict with system or app shortcuts.
      </p>
    </div>
  )
}

function RulesTab(): JSX.Element {
  const [ignoreConfidential, setIgnoreConfidential] = useState(true)
  const [ignoreTransient, setIgnoreTransient] = useState(false)
  const [generatePreviews, setGeneratePreviews] = useState(true)

  return (
    <div className="animate-fade">
      <h2 className="text-xl font-semibold text-theme-primary mb-6">Rules</h2>

      <Section title="Content Filtering">
        <Row
          label="Ignore confidential content"
          description="Do not save passwords and sensitive data when detected"
        >
          <Toggle checked={ignoreConfidential} onChange={setIgnoreConfidential} />
        </Row>
        <Row
          label="Ignore transient content"
          description="Do not save temporary data generated by other apps"
        >
          <Toggle checked={ignoreTransient} onChange={setIgnoreTransient} />
        </Row>
        <Row
          label="Generate link previews"
          description="Create rich previews for URLs (may affect privacy)"
          border={false}
        >
          <Toggle checked={generatePreviews} onChange={setGeneratePreviews} />
        </Row>
      </Section>

      <Section title="Ignored Applications">
        <div className="p-3">
          <div className="flex items-center gap-2.5 py-1.5">
            <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center text-xs">
              🔑
            </div>
            <span className="text-[13px] text-theme-primary">Keychain Access</span>
          </div>
          <div className="h-px bg-black/[0.04] dark:bg-white/[0.04] my-1" />
          <div className="flex items-center gap-2.5 py-1.5">
            <div className="w-6 h-6 rounded bg-blue-500/10 flex items-center justify-center text-xs">
              🔒
            </div>
            <span className="text-[13px] text-theme-primary">Passwords</span>
          </div>
        </div>
        <div className="flex gap-2 px-3 pb-3">
          <button className="flex-1 py-1.5 text-[12px] font-medium rounded-md border border-black/[0.08] dark:border-white/[0.08] text-theme-secondary hover:bg-hover transition-colors">
            Remove
          </button>
          <button className="flex-1 py-1.5 text-[12px] font-medium rounded-md bg-accent text-white hover:bg-accent-hover transition-colors">
            Add App
          </button>
        </div>
      </Section>
    </div>
  )
}

export default function SettingsModal(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>('appearance')

  const renderContent = () => {
    switch (activeTab) {
      case 'appearance':
        return <AppearanceTab />
      case 'paste':
        return <PasteTab />
      case 'history':
        return <HistoryTab />
      case 'behavior':
        return <BehaviorTab />
      case 'shortcuts':
        return <ShortcutsTab />
      case 'rules':
        return <RulesTab />
      default:
        return null
    }
  }

  return (
    <div className="h-full w-full p-5 vibrancy-bg">
      <div className="h-full flex gap-5 max-w-[700px] mx-auto">
        {/* Sidebar Navigation */}
        <nav className="w-48 shrink-0">
          <div className="sticky top-0 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all duration-150 ${
                  activeTab === item.id
                    ? 'bg-accent-light text-accent font-medium'
                    : 'text-theme-secondary hover:bg-hover hover:text-theme-primary'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="pb-6">{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}
