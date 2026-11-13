// ============================================================
// StatusIndicator.tsx – Compact system-health row with
// pulsing coloured dot and optional value readout
// ============================================================

interface StatusIndicatorProps {
  label: string
  status: 'nominal' | 'warning' | 'critical' | 'offline'
  value?: string
}

// ─────────────────────────────────────────────
// Status config
// ─────────────────────────────────────────────
const STATUS_CONFIG = {
  nominal: {
    dot:   'bg-green-400',
    glow:  'shadow-green-400/80',
    text:  'text-green-400',
    label: 'NOMINAL',
    pulse: true,
  },
  warning: {
    dot:   'bg-yellow-400',
    glow:  'shadow-yellow-400/80',
    text:  'text-yellow-300',
    label: 'WARNING',
    pulse: true,
  },
  critical: {
    dot:   'bg-red-500',
    glow:  'shadow-red-500/80',
    text:  'text-red-400',
    label: 'CRITICAL',
    pulse: true,
  },
  offline: {
    dot:   'bg-slate-600',
    glow:  '',
    text:  'text-slate-500',
    label: 'OFFLINE',
    pulse: false,
  },
} as const

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function StatusIndicator({
  label,
  status,
  value,
}: StatusIndicatorProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-slate-700/40 bg-slate-800/30 px-2.5 py-1.5">
      {/* Left: dot + label */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Pulsing indicator dot */}
        <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
          {cfg.pulse && (
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full ${cfg.dot} opacity-60`}
            />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${cfg.dot} shadow-sm ${cfg.glow}`}
          />
        </span>

        {/* System label */}
        <span className="truncate text-xs font-medium uppercase tracking-widest text-slate-300">
          {label}
        </span>
      </div>

      {/* Right: status badge + optional value */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {value !== undefined && (
          <span className="font-mono text-xs text-slate-400">{value}</span>
        )}
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-widest ${cfg.text} bg-slate-900/60 border border-current/20`}
        >
          {cfg.label}
        </span>
      </div>
    </div>
  )
}
