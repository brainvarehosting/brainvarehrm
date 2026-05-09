'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './MobileNav.module.css';

const mobileNavItems = [
  { label: 'Home', icon: '🏠', path: '/dashboard' },
  { label: 'People', icon: '👥', path: '/employees' },
  { label: 'Approvals', icon: '✅', path: '/approvals' },
  { label: 'Analytics', icon: '📊', path: '/analytics' },
  { label: 'More', icon: '☰', path: '/masters' },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.mobileNav}>
      {mobileNavItems.map(item => {
        const isActive = pathname === item.path;
        return (
          <Link key={item.path} href={item.path} className={styles.navItem} data-active={isActive}>
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {isActive && <span className={styles.activeDot} />}
          </Link>
        );
      })}
    </nav>
  );
}
