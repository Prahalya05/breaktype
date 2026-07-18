import type { TestConfig } from '../../lib/engine/types'

const WORD_COUNTS = [10, 25, 50, 100]
const TIME_OPTIONS = [15, 30, 60, 120]

interface ConfigBarProps {
  config: TestConfig
  onChange: (config: TestConfig) => void
  disabled?: boolean
}

function Pill({ active, onClick, children, disabled }: { active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2.5 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-40"
      style={{
        color: active ? 'var(--bg)' : 'var(--text-subtle)',
        backgroundColor: active ? 'var(--accent)' : 'transparent',
      }}
    >
      {children}
    </button>
  )
}

export function ConfigBar({ config, onChange, disabled }: ConfigBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-subtle)' }}>
      <div className="flex items-center gap-1">
        <Pill active={config.punctuation} disabled={disabled} onClick={() => onChange({ ...config, punctuation: !config.punctuation })}>
          @ punctuation
        </Pill>
        <Pill active={config.numbers} disabled={disabled} onClick={() => onChange({ ...config, numbers: !config.numbers })}>
          # numbers
        </Pill>
      </div>

      <div className="h-4 w-px" style={{ backgroundColor: 'var(--border)' }} />

      <div className="flex items-center gap-1">
        <Pill active={config.mode.type === 'time'} disabled={disabled} onClick={() => onChange({ ...config, mode: { type: 'time', seconds: 30 } })}>
          time
        </Pill>
        <Pill active={config.mode.type === 'words'} disabled={disabled} onClick={() => onChange({ ...config, mode: { type: 'words', count: 25 } })}>
          words
        </Pill>
      </div>

      <div className="h-4 w-px" style={{ backgroundColor: 'var(--border)' }} />

      <div className="flex items-center gap-1">
        {config.mode.type === 'time'
          ? TIME_OPTIONS.map((seconds) => (
              <Pill key={seconds} active={config.mode.type === 'time' && config.mode.seconds === seconds} disabled={disabled} onClick={() => onChange({ ...config, mode: { type: 'time', seconds } })}>
                {seconds}
              </Pill>
            ))
          : WORD_COUNTS.map((count) => (
              <Pill key={count} active={config.mode.type === 'words' && config.mode.count === count} disabled={disabled} onClick={() => onChange({ ...config, mode: { type: 'words', count } })}>
                {count}
              </Pill>
            ))}
      </div>
    </div>
  )
}
