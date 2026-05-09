'use client';
import toast from '@/lib/toast';

import { useState, useEffect } from 'react';
import styles from './settings.module.css';

const roles = [
  { name: 'SUPER_ADMIN', displayName: 'Super Admin', description: 'Full system access', users: 1, isSystem: true },
  { name: 'HR_ADMIN', displayName: 'HR Admin', description: 'Full HR module access', users: 0, isSystem: true },
  { name: 'MANAGER', displayName: 'Manager', description: 'Team management & approvals', users: 0, isSystem: true },
  { name: 'EMPLOYEE', displayName: 'Employee', description: 'Self-service access', users: 9, isSystem: true },
];

const auditLogs = [
  { id: '1', action: 'LOGIN', user: 'Admin', email: 'admin@brainvare.com', resource: 'Auth', timestamp: '2026-04-19 22:45:00', ip: '192.168.1.33' },
  { id: '2', action: 'CREATE', user: 'Admin', email: 'admin@brainvare.com', resource: 'Employee', timestamp: '2026-04-19 22:30:00', ip: '192.168.1.33' },
  { id: '3', action: 'UPDATE', user: 'Admin', email: 'admin@brainvare.com', resource: 'Organization', timestamp: '2026-04-19 21:15:00', ip: '192.168.1.33' },
  { id: '4', action: 'CREATE', user: 'Admin', email: 'admin@brainvare.com', resource: 'Leave Type', timestamp: '2026-04-19 20:00:00', ip: '192.168.1.33' },
  { id: '5', action: 'LOGIN', user: 'Priya Patel', email: 'priya.patel@brainvare.com', resource: 'Auth', timestamp: '2026-04-19 18:30:00', ip: '192.168.1.55' },
];

const modules = ['employees', 'attendance', 'leave', 'payroll', 'documents', 'letters', 'onboarding', 'exit', 'reports'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'audit' | 'permissions'>('general');
  const [org, setOrg] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      if (d.organization) setOrg(d.organization);
      if (d.users) setUsers(d.users);
    }).catch(() => {});
  }, []);

  const handleSaveOrg = async (field: string) => {
    const val = prompt(`New value for ${field}:`);
    if (!val) return;
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target: 'organization', [field]: val }) });
      setOrg((prev: any) => ({ ...prev, [field]: val }));
      toast(`${field} updated!`, 'success');
    } catch { toast('Failed to update', 'error'); }
  };

  const tabs = [
    { key: 'general', label: 'General' },
    { key: 'roles', label: 'Roles' },
    { key: 'permissions', label: 'Permission Matrix' },
    { key: 'audit', label: 'Audit Logs' },
  ] as const;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>System configuration, security, and audit trails</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button key={tab.key} className={styles.tab} data-active={activeTab === tab.key} onClick={() => setActiveTab(tab.key as any)}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'general' && (
        <div className={styles.generalGrid}>
          <div className={styles.settingCard}>
            <h3>Security</h3>
            <div className={styles.settingRow}>
              <div><strong>Password Policy</strong><p>Minimum 8 characters, mixed case</p></div>
              <button className={styles.configBtn} onClick={() => handleSaveOrg('name')}>Configure</button>
            </div>
            <div className={styles.settingRow}>
              <div><strong>Account Lockout</strong><p>Lock after 5 failed attempts</p></div>
              <span className={styles.enabledBadge}>Enabled</span>
            </div>
            <div className={styles.settingRow}>
              <div><strong>Session Timeout</strong><p>Auto-logout after 30 minutes of inactivity</p></div>
              <button className={styles.configBtn} onClick={() => toast('Session timeout configured via env vars', 'info')}>Configure</button>
            </div>
          </div>
          <div className={styles.settingCard}>
            <h3>Notifications</h3>
            <div className={styles.settingRow}>
              <div><strong>Email Notifications</strong><p>Leave approvals, payslip, announcements</p></div>
              <span className={styles.enabledBadge}>Enabled</span>
            </div>
            <div className={styles.settingRow}>
              <div><strong>Slack Integration</strong><p>Post updates to Slack channels</p></div>
              <span className={styles.disabledBadge}>Not configured</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className={styles.rolesGrid}>
          {roles.map((role) => (
            <div key={role.name} className={styles.roleCard}>
              <div className={styles.roleHeader}>
                <h4>{role.displayName}</h4>
                {role.isSystem && <span className={styles.systemBadge}>System</span>}
              </div>
              <p className={styles.roleDesc}>{role.description}</p>
              <div className={styles.roleFooter}>
                <span>{role.users} user{role.users !== 1 ? 's' : ''}</span>
                <button className={styles.configBtn} onClick={() => toast("Action completed", "success")}>Edit Permissions</button>
              </div>
            </div>
          ))}
          <button className={styles.addRoleCard} onClick={() => toast("Action completed", "success")}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Custom Role
          </button>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className={styles.permTable}>
          <table>
            <thead>
              <tr>
                <th>Module</th>
                {roles.map((r) => <th key={r.name}>{r.displayName}</th>)}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <tr key={mod}>
                  <td className={styles.modName}>{mod.charAt(0).toUpperCase() + mod.slice(1)}</td>
                  {roles.map((r) => (
                    <td key={r.name}>
                      <div className={styles.permIcons}>
                        {r.name === 'SUPER_ADMIN' ? (
                          <span className={styles.fullAccess}>Full</span>
                        ) : r.name === 'HR_ADMIN' ? (
                          <span className={styles.fullAccess}>RWA</span>
                        ) : r.name === 'MANAGER' ? (
                          ['employees', 'attendance', 'leave', 'reports'].includes(mod) ?
                            <span className={styles.partialAccess}>RA</span> :
                            <span className={styles.noAccess}>—</span>
                        ) : (
                          ['attendance', 'leave', 'payroll', 'documents'].includes(mod) ?
                            <span className={styles.partialAccess}>R</span> :
                            <span className={styles.noAccess}>—</span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className={styles.permLegend}>
            <span><strong>R</strong> = Read</span>
            <span><strong>W</strong> = Write</span>
            <span><strong>A</strong> = Approve</span>
            <span><strong>Full</strong> = All permissions</span>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className={styles.auditCard}>
          <table className={styles.auditTable}>
            <thead>
              <tr><th>Action</th><th>User</th><th>Resource</th><th>Timestamp</th><th>IP Address</th></tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td><span className={styles.actionBadge} data-action={log.action.toLowerCase()}>{log.action}</span></td>
                  <td><div><strong>{log.user}</strong><br/><span className={styles.auditEmail}>{log.email}</span></div></td>
                  <td>{log.resource}</td>
                  <td className={styles.monoText}>{log.timestamp}</td>
                  <td className={styles.monoText}>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
