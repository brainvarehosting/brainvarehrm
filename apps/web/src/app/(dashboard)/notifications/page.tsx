'use client';

import { useState } from 'react';
import styles from './notifications.module.css';

const mockNotifications = [
  { id: '1', type: 'leave', title: 'Leave Request Approved', message: 'Your casual leave for Apr 21-22 has been approved by Sneha Reddy.', time: '10 minutes ago', read: false, link: '/leave' },
  { id: '2', type: 'attendance', title: 'Missed Clock-Out', message: 'You forgot to clock out yesterday. Please regularize your attendance.', time: '2 hours ago', read: false, link: '/attendance' },
  { id: '3', type: 'payroll', title: 'Payslip Available', message: 'Your March 2026 payslip is now available for download.', time: '1 day ago', read: false, link: '/payroll' },
  { id: '4', type: 'system', title: 'Password Expiry Warning', message: 'Your password will expire in 7 days. Please update it from Settings.', time: '2 days ago', read: true, link: '/settings' },
  { id: '5', type: 'leave', title: 'Leave Request — Pending Approval', message: 'Rohit Mehta has applied for Sick Leave (Apr 25-26). Please review.', time: '3 days ago', read: true, link: '/leave' },
  { id: '6', type: 'onboarding', title: 'Onboarding Task Assigned', message: 'You have been assigned "Laptop Setup" for new joiner Karan Malhotra.', time: '4 days ago', read: true, link: '/onboarding' },
  { id: '7', type: 'performance', title: 'Self-Assessment Due', message: 'H1 2026 self-assessment is due by June 15. Please complete your goals review.', time: '5 days ago', read: true, link: '/performance' },
  { id: '8', type: 'helpdesk', title: 'Ticket Resolved', message: 'Your ticket TKT-002 "Salary slip discrepancy" has been resolved.', time: '1 week ago', read: true, link: '/helpdesk' },
  { id: '9', type: 'system', title: 'Scheduled Maintenance', message: 'System will be under maintenance on Apr 27, 2-4 AM IST.', time: '1 week ago', read: true },
  { id: '10', type: 'attendance', title: 'Monthly Attendance Summary', message: 'Your March 2026 attendance: 21 present, 1 absent, 0 late. 95.5% rate.', time: '2 weeks ago', read: true, link: '/attendance' },
];

const typeConfig: Record<string, { emoji: string; color: string }> = {
  leave: { emoji: '📅', color: 'var(--color-primary-400)' },
  attendance: { emoji: '🕐', color: 'var(--color-warning-400)' },
  payroll: { emoji: '💰', color: 'var(--color-accent-400)' },
  system: { emoji: '⚙️', color: 'var(--text-muted)' },
  onboarding: { emoji: '🎉', color: '#a78bfa' },
  performance: { emoji: '🎯', color: 'var(--color-info-400)' },
  helpdesk: { emoji: '🛟', color: 'var(--color-danger-400)' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'leave', label: '📅 Leave' },
    { key: 'attendance', label: '🕐 Attendance' },
    { key: 'payroll', label: '💰 Payroll' },
    { key: 'system', label: '⚙️ System' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Notifications</h1>
          <p className={styles.pageSubtitle}>{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button className={styles.markAllBtn} onClick={markAllRead}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Mark all as read
          </button>
        )}
      </div>

      <div className={styles.filters}>
        {filters.map(f => (
          <button key={f.key} className={styles.filterBtn} data-active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
      </div>

      <div className={styles.notifList}>
        {filtered.map((n, i) => {
          const tc = typeConfig[n.type] || typeConfig.system;
          return (
            <div key={n.id} className={styles.notifCard} data-read={n.read} style={{ animationDelay: `${i * 30}ms` }}>
              <span className={styles.notifEmoji}>{tc.emoji}</span>
              <div className={styles.notifContent}>
                <div className={styles.notifTitle}>
                  {!n.read && <span className={styles.unreadDot} style={{ background: tc.color }} />}
                  {n.title}
                </div>
                <p className={styles.notifMessage}>{n.message}</p>
                <div className={styles.notifFooter}>
                  <span className={styles.notifTime}>{n.time}</span>
                  {n.link && <a href={n.link} className={styles.notifLink}>View →</a>}
                </div>
              </div>
              <button className={styles.notifAction} onClick={() => toggleRead(n.id)} title={n.read ? 'Mark as unread' : 'Mark as read'}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {n.read ? <><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></> : <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>}
                </svg>
              </button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <span style={{ fontSize: 48 }}>🔔</span>
            <h3>All caught up!</h3>
            <p>No notifications to show.</p>
          </div>
        )}
      </div>
    </div>
  );
}
