'use client';

import { useState, useEffect } from 'react';
import styles from './audit.module.css';

const mockLogs = [
  { id: '1', action: 'Employee Created', module: 'Employees', user: 'Priya Patel', role: 'HR Admin', details: 'Created employee record for Ravi Kumar (EMP-011)', ip: '192.168.1.45', timestamp: '2026-04-20 03:42:18' },
  { id: '2', action: 'Leave Approved', module: 'Leave', user: 'Sneha Reddy', role: 'Manager', details: 'Approved CL for Priya Patel (Apr 21-22)', ip: '192.168.1.12', timestamp: '2026-04-20 03:30:05' },
  { id: '3', action: 'Salary Structure Modified', module: 'Payroll', user: 'Admin', role: 'Super Admin', details: 'Updated CTC for Karan Malhotra—₹18L → ₹20L', ip: '192.168.1.1', timestamp: '2026-04-20 02:15:33' },
  { id: '4', action: 'Policy Published', module: 'Policies', user: 'Priya Patel', role: 'HR Admin', details: 'Published "WFH Policy v2.0"', ip: '192.168.1.45', timestamp: '2026-04-19 18:22:10' },
  { id: '5', action: 'Login', module: 'Auth', user: 'Sneha Reddy', role: 'Manager', details: 'Successful login from Chrome/macOS', ip: '49.207.12.88', timestamp: '2026-04-19 17:45:00' },
  { id: '6', action: 'Bulk Export', module: 'Employees', user: 'Admin', role: 'Super Admin', details: 'Exported 10 employee records to CSV', ip: '192.168.1.1', timestamp: '2026-04-19 16:30:22' },
  { id: '7', action: 'Role Changed', module: 'Settings', user: 'Admin', role: 'Super Admin', details: 'Changed Priya Patel role from "HR Executive" to "HR Admin"', ip: '192.168.1.1', timestamp: '2026-04-19 14:12:55' },
  { id: '8', action: 'Attendance Override', module: 'Attendance', user: 'Priya Patel', role: 'HR Admin', details: 'Manual punch override for Amit Kumar (Apr 18)', ip: '192.168.1.45', timestamp: '2026-04-19 11:05:18' },
  { id: '9', action: 'Document Uploaded', module: 'Documents', user: 'Rahul Sharma', role: 'Employee', details: 'Uploaded PAN card scan', ip: '192.168.1.22', timestamp: '2026-04-18 15:30:00' },
  { id: '10', action: 'Failed Login Attempt', module: 'Auth', user: 'unknown@mail.com', role: '—', details: '3 failed attempts — account NOT locked', ip: '103.21.58.12', timestamp: '2026-04-18 10:22:44' },
];

const actionColors: Record<string, string> = {
  'Employee Created': '#10b981', 'Leave Approved': '#3b82f6', 'Salary Structure Modified': '#f59e0b',
  'Policy Published': '#8b5cf6', 'Login': '#64748b', 'Bulk Export': '#06b6d4',
  'Role Changed': '#ec4899', 'Attendance Override': '#f59e0b', 'Document Uploaded': '#3b82f6',
  'Failed Login Attempt': '#ef4444',
};

export default function AuditPage() {
  const [tab, setTab] = useState<'logs' | 'stats'>('logs');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [logs, setLogs] = useState(mockLogs);

  useEffect(() => {
    fetch('/api/audit-logs').then(r => r.json()).then(d => {
      if (d.data?.length) {
        setLogs(d.data.map((l: any) => ({
          id: l.id, action: l.action || l.type || '—', module: l.module || '—',
          user: l.performedBy || '—', role: l.role || '—', details: l.details || l.description || '—',
          ip: l.ipAddress || '—', timestamp: l.createdAt ? new Date(l.createdAt).toLocaleString('en-IN') : '—',
        })));
      }
    }).catch(() => {});
  }, []);

  const modules = ['all', ...Array.from(new Set(logs.map(l => l.module)))];
  const filtered = moduleFilter === 'all' ? logs : logs.filter(l => l.module === moduleFilter);

  const exportCSV = () => {
    const rows = [['Action', 'Module', 'User', 'Role', 'Details', 'IP', 'Timestamp'], ...filtered.map(l => [l.action, l.module, l.user, l.role, l.details, l.ip, l.timestamp])];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'audit-logs.csv'; a.click();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📋 Audit Logs</h1>
          <p className={styles.pageSubtitle}>Complete system audit trail — every action tracked and timestamped</p>
        </div>
        <button className={styles.exportBtn} onClick={exportCSV}>📥 Export Logs</button>
      </div>

      <div className={styles.tabs}>
        {[{ key: 'logs', label: '📋 Activity Log' }, { key: 'stats', label: '📊 Statistics' }].map(t => (
          <button key={t.key} className={styles.tab} data-active={tab === t.key} onClick={() => setTab(t.key as any)}>{t.label}</button>
        ))}
      </div>

      {tab === 'logs' && (
        <>
          <div className={styles.filterRow}>
            {modules.map(m => (
              <button key={m} className={styles.filterPill} data-active={moduleFilter === m} onClick={() => setModuleFilter(m)}>{m === 'all' ? 'All Modules' : m}</button>
            ))}
          </div>
          <div className={styles.logList}>
            {filtered.map((log, i) => {
              const color = actionColors[log.action] || 'var(--text-secondary)';
              return (
                <div key={log.id} className={styles.logItem} style={{ animationDelay: `${i * 25}ms` }}>
                  <div className={styles.logDot} style={{ background: color }} />
                  <div className={styles.logMain}>
                    <div className={styles.logTop}>
                      <span className={styles.logAction} style={{ color }}>{log.action}</span>
                      <span className={styles.logModule}>{log.module}</span>
                    </div>
                    <p className={styles.logDetails}>{log.details}</p>
                    <div className={styles.logMeta}>
                      <span>👤 {log.user} ({log.role})</span>
                      <span>🌐 {log.ip}</span>
                      <span>🕐 {log.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'stats' && (
        <div className={styles.statsGrid}>
          {[
            { label: 'Total Events (Today)', value: '47', color: 'var(--text-primary)' },
            { label: 'Unique Users', value: '6', color: 'var(--color-primary-400)' },
            { label: 'Failed Logins', value: '1', color: 'var(--color-danger-400)' },
            { label: 'Data Exports', value: '3', color: '#f59e0b' },
            { label: 'Policy Changes', value: '2', color: '#8b5cf6' },
            { label: 'Salary Modifications', value: '1', color: 'var(--color-warning-400)' },
          ].map((s, i) => (
            <div key={i} className={styles.statCard} style={{ animationDelay: `${i * 50}ms` }}>
              <span className={styles.statVal} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
