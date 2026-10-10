'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface DayData {
  date: string
  revenue: number
}

interface MetricsChartProps {
  data: DayData[]
  width?: number
  height?: number
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
}

function formatCurrencyCompact(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`
  return `$${n.toFixed(0)}`
}

export default function MetricsChart({ data, width = 600, height = 180 }: MetricsChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    date: string
    revenue: number
  } | null>(null)
  const [dimensions, setDimensions] = useState({ width, height })

  // Responsive width
  useEffect(() => {
    const el = svgRef.current?.parentElement
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      if (w > 0) setDimensions({ width: w, height })
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [height])

  const W = dimensions.width
  const H = dimensions.height
  const PAD = { top: 16, right: 16, bottom: 36, left: 48 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1)
  const points = data.map((d, i) => ({
    x: PAD.left + (i / (data.length - 1 || 1)) * chartW,
    y: PAD.top + chartH - (d.revenue / maxRevenue) * chartH,
    date: d.date,
    revenue: d.revenue,
  }))

  // Smooth bezier path
  function buildPath(pts: { x: number; y: number }[]): string {
    if (pts.length < 2) return ''
    let d = `M ${pts[0].x},${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1]
      const curr = pts[i]
      const cpX = (prev.x + curr.x) / 2
      d += ` C ${cpX},${prev.y} ${cpX},${curr.y} ${curr.x},${curr.y}`
    }
    return d
  }

  const linePath = buildPath(points)

  // Area path (closed below)
  const areaPath =
    linePath +
    ` L ${points[points.length - 1].x},${PAD.top + chartH}` +
    ` L ${points[0].x},${PAD.top + chartH} Z`

  // Y-axis labels (4 ticks)
  const yTicks = [0, 0.33, 0.67, 1].map((t) => ({
    y: PAD.top + chartH - t * chartH,
    label: formatCurrencyCompact(t * maxRevenue),
  }))

  // Path draw animation
  const pathProgress = useMotionValue(0)
  const [pathLength, setPathLength] = useState(0)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength()
      setPathLength(len)
      pathProgress.set(0)
      const ctrl = animate(pathProgress, len, { duration: 1.4, ease: 'easeInOut', delay: 0.2 })
      return () => ctrl.stop()
    }
  }, [linePath]) // eslint-disable-line react-hooks/exhaustive-deps

  const strokeDashoffset = useTransform(pathProgress, (v) => pathLength - v)

  const gradientId = 'revenue-gradient'
  const glowId = 'line-glow'

  return (
    <div className="relative w-full select-none">
      <svg
        ref={svgRef}
        width="100%"
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        className="overflow-visible"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39ff14" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#39ff14" stopOpacity="0" />
          </linearGradient>
          <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={tick.y}
              x2={PAD.left + chartW}
              y2={tick.y}
              stroke="#242424"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text
              x={PAD.left - 8}
              y={tick.y + 4}
              textAnchor="end"
              fontSize="10"
              fill="#64748b"
              fontFamily="var(--font-body)"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((pt, i) => (
          <text
            key={i}
            x={pt.x}
            y={PAD.top + chartH + 20}
            textAnchor="middle"
            fontSize="9"
            fill="#64748b"
            fontFamily="var(--font-body)"
          >
            {new Date(pt.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'short',
            })}
          </text>
        ))}

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        />

        {/* Line */}
        {pathLength > 0 && (
          <motion.path
            ref={pathRef}
            d={linePath}
            fill="none"
            stroke="#39ff14"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#${glowId})`}
            style={{
              strokeDasharray: pathLength,
              strokeDashoffset,
            }}
          />
        )}
        {/* Hidden path just to measure length */}
        <path
          ref={pathRef}
          d={linePath}
          fill="none"
          stroke="transparent"
          strokeWidth="0"
        />

        {/* Hover dots */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={14}
              fill="transparent"
              className="cursor-crosshair"
              onMouseEnter={() =>
                setTooltip({ x: pt.x, y: pt.y, date: pt.date, revenue: pt.revenue })
              }
              onMouseLeave={() => setTooltip(null)}
            />
            <motion.circle
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill="#0d0d0d"
              stroke="#39ff14"
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.2 + i * 0.05, type: 'spring', stiffness: 400 }}
            />
          </g>
        ))}

        {/* Tooltip */}
        {tooltip && (() => {
          const tW = 110
          const tH = 44
          const tx = Math.min(Math.max(tooltip.x - tW / 2, PAD.left), W - PAD.right - tW)
          const ty = tooltip.y - tH - 12

          return (
            <g>
              <rect
                x={tx}
                y={ty}
                width={tW}
                height={tH}
                rx={6}
                fill="#161616"
                stroke="#242424"
                strokeWidth="1"
              />
              <text
                x={tx + tW / 2}
                y={ty + 14}
                textAnchor="middle"
                fontSize="9"
                fill="#64748b"
                fontFamily="var(--font-body)"
              >
                {formatShortDate(tooltip.date)}
              </text>
              <text
                x={tx + tW / 2}
                y={ty + 30}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#39ff14"
                fontFamily="var(--font-body)"
              >
                ${tooltip.revenue.toFixed(2)}
              </text>
            </g>
          )
        })()}
      </svg>
    </div>
  )
}
