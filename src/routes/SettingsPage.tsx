import { useTheme } from '../components/layout/ThemeProvider'
import { useDB } from '../hooks/useDB'

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-lg border px-4 py-3 w-full text-left"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}
    >
      <span style={{ color: 'var(--text-primary)' }}>{label}</span>
      <span
        className="w-10 h-6 rounded-full relative transition-colors"
        style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--border)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full transition-transform"
          style={{ backgroundColor: 'var(--bg)', transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
        />
      </span>
    </button>
  )
}

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const { db, updateSettings, resetAll } = useDB()

  function handleExport() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `breaktype-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    const confirmed = window.confirm('This deletes all your local typing history, stats, and lesson progress. This cannot be undone. Continue?')
    if (confirmed) resetAll()
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div>
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Your defaults and data — all stored locally in this browser.</p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-subtle)' }}>Appearance</h2>
        <Toggle label="Dark theme" checked={theme === 'dark'} onChange={toggleTheme} />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-subtle)' }}>Test defaults</h2>
        <Toggle
          label="Punctuation by default"
          checked={db.settings.defaultPunctuation}
          onChange={(v) => updateSettings({ defaultPunctuation: v })}
        />
        <Toggle
          label="Numbers by default"
          checked={db.settings.defaultNumbers}
          onChange={(v) => updateSettings({ defaultNumbers: v })}
        />
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-subtle)' }}>Your data</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Everything you do here stays in this browser — nothing is sent anywhere. You can export a backup or wipe it and start fresh.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-lg text-sm font-medium border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            Export data
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ backgroundColor: 'var(--incorrect-bg)', color: 'var(--incorrect)' }}
          >
            Reset all data
          </button>
        </div>
      </div>
    </div>
  )
}
