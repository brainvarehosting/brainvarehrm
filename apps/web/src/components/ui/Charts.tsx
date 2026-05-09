'use client';

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  animated?: boolean;
}

export function BarChart({ data, height = 120, showLabels = true, showValues = true, animated = true }: BarChartProps) {
  const max = Math.max(...data.map(d => d.value), 1);
  const barWidth = Math.min(32, (280 / data.length) - 8);
  const chartWidth = data.length * (barWidth + 8) + 16;
  const chartHeight = height;
  const barArea = chartHeight - (showLabels ? 24 : 0) - (showValues ? 18 : 0);

  return (
    <svg width="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
      {data.map((d, i) => {
        const barH = (d.value / max) * barArea;
        const x = 8 + i * (barWidth + 8);
        const y = (showValues ? 18 : 0) + barArea - barH;
        const color = d.color || 'var(--color-primary-500)';

        return (
          <g key={i}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.85}
              style={animated ? { animation: `growUp 0.5s ease ${i * 60}ms both`, transformOrigin: `${x + barWidth/2}px ${(showValues ? 18 : 0) + barArea}px` } : undefined}
            >
              <title>{d.label}: {d.value}</title>
            </rect>
            {/* Value */}
            {showValues && (
              <text x={x + barWidth/2} y={y - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-secondary)">{d.value}</text>
            )}
            {/* Label */}
            {showLabels && (
              <text x={x + barWidth/2} y={chartHeight - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{d.label}</text>
            )}
          </g>
        );
      })}
      <style>{`
        @keyframes growUp { from { transform: scaleY(0); } to { transform: scaleY(1); } }
      `}</style>
    </svg>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({ data, size = 140, thickness = 20, centerLabel, centerValue }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background ring */}
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--bg-tertiary)" strokeWidth={thickness} />
      {/* Segments */}
      {data.map((d, i) => {
        const pct = d.value / total;
        const dashLength = pct * circumference;
        const dashOffset = -offset * circumference;
        offset += pct;

        return (
          <circle
            key={i}
            cx={size/2}
            cy={size/2}
            r={radius}
            fill="none"
            stroke={d.color}
            strokeWidth={thickness}
            strokeDasharray={`${dashLength} ${circumference - dashLength}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: 'stroke-dasharray 0.6s ease', opacity: 0.9 }}
          >
            <title>{d.label}: {d.value} ({(pct * 100).toFixed(1)}%)</title>
          </circle>
        );
      })}
      {/* Center text */}
      {centerValue !== undefined && (
        <>
          <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--text-primary)">{centerValue}</text>
          {centerLabel && <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">{centerLabel}</text>}
        </>
      )}
    </svg>
  );
}

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillOpacity?: number;
}

export function Sparkline({ data, width = 120, height = 40, color = 'var(--color-primary-500)', fillOpacity = 0.15 }: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const padding = 2;
  const w = width - padding * 2;
  const h = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * w;
    const y = padding + h - ((v - min) / range) * h;
    return `${x},${y}`;
  });

  const linePath = `M${points.join(' L')}`;
  const fillPath = `${linePath} L${padding + w},${padding + h} L${padding},${padding + h} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={fillPath} fill={color} opacity={fillOpacity} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      <circle cx={padding + w} cy={padding + h - ((data[data.length - 1] - min) / range) * h} r="3" fill={color} />
    </svg>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ value, max = 100, color = 'var(--color-primary-500)', height = 8, showLabel = false, label }: ProgressBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 'var(--text-xs)' }}>
          <span style={{ color: 'var(--text-secondary)' }}>{label || ''}</span>
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{Math.round(pct)}%</span>
        </div>
      )}
      <div style={{ height, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color, borderRadius: 'var(--radius-full)',
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
    </div>
  );
}
