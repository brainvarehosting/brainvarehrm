'use client';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '16px', borderRadius = 'var(--radius-md)', style }: SkeletonProps) {
  return <div className={styles.skeleton} style={{ width, height, borderRadius, ...style }} />;
}

export function SkeletonText({ lines = 3, widths }: { lines?: number; widths?: string[] }) {
  return (
    <div className={styles.textGroup}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={widths?.[i] || (i === lines - 1 ? '60%' : '100%')} height="14px" />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <Skeleton width="40px" height="40px" borderRadius="var(--radius-full)" />
        <div className={styles.cardMeta}>
          <Skeleton width="140px" height="14px" />
          <Skeleton width="90px" height="12px" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className={styles.table}>
      <div className={styles.tableHeader}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={i === 0 ? '30%' : '20%'} height="12px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className={styles.tableRow} style={{ animationDelay: `${r * 50}ms` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={c === 0 ? '50%' : `${40 + Math.random() * 30}%`} height="14px" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.statCard} style={{ animationDelay: `${i * 60}ms` }}>
            <Skeleton width="46px" height="46px" borderRadius="var(--radius-lg)" />
            <div style={{ flex: 1 }}>
              <Skeleton width="80px" height="10px" />
              <Skeleton width="50px" height="20px" style={{ marginTop: 6 }} />
              <Skeleton width="100px" height="10px" style={{ marginTop: 4 }} />
            </div>
          </div>
        ))}
      </div>
      <div className={styles.contentGrid}>
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
