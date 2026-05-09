'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Breadcrumb.module.css';

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  attendance: 'Attendance',
  leave: 'Leave Management',
  payroll: 'Payroll',
  organization: 'Organization',
  documents: 'Documents',
  letters: 'Letters',
  onboarding: 'Onboarding',
  exit: 'Exit Management',
  reports: 'Reports',
  settings: 'Settings',
  performance: 'Performance',
  helpdesk: 'Helpdesk',
  notifications: 'Notifications',
  training: 'Training',
  'bulk-import': 'Bulk Import',
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link href="/dashboard" className={styles.crumb}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      </Link>
      {segments.map((seg, i) => {
        const path = '/' + segments.slice(0, i + 1).join('/');
        const label = routeLabels[seg] || (isNaN(Number(seg)) ? seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ') : `#${seg}`);
        const isLast = i === segments.length - 1;

        return (
          <span key={path} className={styles.crumbWrap}>
            <svg className={styles.sep} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            {isLast ? (
              <span className={styles.crumbActive}>{label}</span>
            ) : (
              <Link href={path} className={styles.crumb}>{label}</Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
