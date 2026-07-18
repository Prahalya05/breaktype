interface StatTileProps {
  label: string
  value: string
}

export function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
      <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</span>
      <span className="font-mono text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
