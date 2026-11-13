// ============================================================
// GaugeBar.tsx – Reusable HUD gauge / progress bar
// ============================================================

interface GaugeBarProps {
  value: number
  max: number
  label: string
  unit?: string
  color?: 'cyan' | 'green' | 'yellow' | 'red' | 'blue'
  showValue?: boolean
  warningThreshold?: number  // below this → yellow  (or above if inverse)
  dangerThreshold?: number   // below this → red     (or above if inverse)
  inverse?: boolean          // true = high value is danger (e.g. temperature)
  className?: string
}

// ─────────────────────────────────────────────
// Colour maps
// ─────────────────────────────────────────────
const BAR_COLORS: Record<string, string> = {
  cyan:   'bg-cyan-400',
  green:  'bg-green-400',
  yellow: 'bg-yellow-400',
  red:    'bg-red-500',
  blue:   'bg-blue-400',
}

const GLOW_COLORS: Record<string, string> = {
  cyan:   'shadow-cyan-500/60',
  green:  'shadow-green-500/60',
  yellow: 'shadow-yellow-400/60',
  red:    'shadow-red-500/60',
  blue:   'shadow-blue-500/60',
}

const TEXT_COLORS: Record<string, string> = {
  cyan:   'text-cyan-300',
  green:  'text-green-300',
  yellow: 'text-yellow-300',
  red:    'text-red-400',
  blue:   'text-blue-300',
}

const TRACK_COLORS: Record<string, string> = {
  cyan:   'bg-cyan-900/40',
  green:  'bg-green-900/40',
  yellow: 'bg-yellow-900/40',
  red:    'bg-red-900/40',
  blue:   'bg-blue-900/40',
}

// ─────────────────────────────────────────────
// Resolve effective colour based on thresholds
// ─────────────────────────────────────────────
function resolveColor(
  value: number,
  max: number,
  base: string,
  warningThreshold?: number,
  dangerThreshold?: number,
  inverse?: boolean
): string {
  if (max === 0) return base

  if (inverse) {
    // High value = danger (e.g. temperature, radiation)
    const pct = value / max
    if (dangerThreshold !== undefined && pct >= dangerThreshold / max) return 'red'
    if (warningThreshold !== undefined && pct >= warningThreshold / max) return 'yellow'
  } else {
    // Low value = danger (e.g. fuel, power)
    if (dangerThreshold !== undefined && value <= dangerThreshold) return 'red'
    if (warningThreshold !== undefined && value <= warningThreshold) return 'yellow'
  }

  return base
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function GaugeBar({
  value,
  max,
  label,
  unit = '',
  color = 'cyan',
  showValue = true,
  warningThreshold,
  dangerThreshold,
  inverse = false,
  className = '',
}: GaugeBarProps) {
  const effectiveColor = resolveColor(
    value,
    max,
    color,
    warningThreshold,
    dangerThreshold,
    inverse
  )

  const clampedPct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const displayValue = Number.isInteger(value) ? value : value.toFixed(1)
  const displayMax = Number.isInteger(max) ? max : max.toFixed(1)

  const barColor   = BAR_COLORS[effectiveColor]   ?? BAR_COLORS.cyan
  const glowColor  = GLOW_COLORS[effectiveColor]  ?? GLOW_COLORS.cyan
  const textColor  = TEXT_COLORS[effectiveColor]  ?? TEXT_COLORS.cyan
  const trackColor = TRACK_COLORS[effectiveColor] ?? TRACK_COLORS.cyan

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          {label}
        </span>
        {showValue && (
          <span className={`text-xs font-mono font-semibold ${textColor}`}>
            {displayValue}
            {unit && <span className="ml-0.5 text-slate-500">{unit}</span>}
            <span className="ml-1 text-slate-600">/ {displayMax}{unit}</span>
          </span>
        )}
      </div>

      {/* Track + fill */}
      <div
        className={`relative h-2 w-full overflow-hidden rounded-full ${trackColor} border border-slate-700/50`}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${barColor}
            shadow-sm ${glowColor}
          `}
          style={{ width: `${clampedPct}%` }}
        />

        {/* Subtle shine overlay */}
        <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
      </div>
    </div>
  )
}
