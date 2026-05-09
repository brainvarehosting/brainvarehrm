'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';

interface HeaderProps {
  user: any;
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function Header({ user, onMenuClick, onLogout }: HeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [pathname]);

  // Load notification count
  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(data => {
        if (data.unreadCount !== undefined) setNotifCount(data.unreadCount);
      })
      .catch(() => {});
  }, []);

  // Generate breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '),
    href: '/' + segments.slice(0, i + 1).join('/'),
    isLast: i === segments.length - 1,
  }));

  const firstName = user?.firstName || user?.employee?.firstName || 'User';
  const lastName = user?.lastName || user?.employee?.lastName || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`;

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button
          className={styles.menuBtn}
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Breadcrumb */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {i > 0 && <span className={styles.breadcrumbSep}>/</span>}
              {crumb.isLast ? (
                <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className={styles.breadcrumbItem}>
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className={styles.headerRight}>
        {/* Search */}
        <button className={styles.searchBox} onClick={() => {
          // TODO: Open command palette
        }} aria-label="Search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className={styles.searchText}>Search...</span>
          <kbd className={styles.searchKbd}>⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          className={styles.iconBtn}
          onClick={() => router.push('/notifications')}
          aria-label="Notifications"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {notifCount > 0 && <span className={styles.notifBadge} />}
        </button>

        {/* Settings */}
        <button
          className={styles.iconBtn}
          onClick={() => router.push('/settings')}
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* User Menu */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className={styles.userBtn}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            data-open={dropdownOpen}
            aria-label="User menu"
          >
            <div className={styles.userBtnAvatar}>{initials}</div>
            <span className={styles.userBtnName}>{firstName}</span>
            <svg className={styles.userBtnChevron} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-primary)', marginBottom: '4px' }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {firstName} {lastName}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                  {user?.email || user?.employee?.email || ''}
                </div>
              </div>

              <button className={styles.dropdownItem} onClick={() => router.push('/settings')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Profile
              </button>
              <button className={styles.dropdownItem} onClick={() => router.push('/settings')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2m0 18v2m-9-11h2m18 0h-2m-3.5-6.5 1.4-1.4M4.1 19.9l1.4-1.4m0-13L4.1 4.1m15.8 15.8-1.4-1.4" />
                </svg>
                Settings
              </button>
              <div className={styles.dropdownSeparator} />
              <button className={styles.dropdownItem} data-danger="true" onClick={onLogout}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
