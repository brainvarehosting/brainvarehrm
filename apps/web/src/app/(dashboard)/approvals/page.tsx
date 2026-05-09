'use client';

import { useState, useEffect } from 'react';
import styles from './approvals.module.css';

type ApprovalCategory = 'all' | 'leave' | 'onboarding' | 'exit';

const typeConfig: Record<string, { color: string; icon: string }> = {
  LEAVE: { color: '#3b82f6', icon: '📅' },
  ONBOARDING: { color: '#10b981', icon: '📋' },
  EXIT: { color: '#ef4444', icon: '🚪' },
};

export default function ApprovalsPage() {
  const [filter, setFilter] = useState<ApprovalCategory>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [approvals, setApprovals] = useState<any[]>([]);
  const [summary, setSummary] = useState({ leaves: 0, onboarding: 0, exit: 0, total: 0 });

  useEffect(() => {
    fetch('/api/approvals').then(r => r.json()).then(d => {
      const items: any[] = [];
      (d.pendingLeaves || []).forEach((l: any) => items.push({
        id: l.id, type: 'LEAVE', title: `${l.leaveType?.name || 'Leave'} Request`,
        from: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''}`,
        dept: l.employee?.department?.name || '', description: `${l.days || 1} day(s) — ${new Date(l.startDate).toLocaleDateString('en-IN')} to ${new Date(l.endDate).toLocaleDateString('en-IN')}`,
        date: l.appliedAt ? new Date(l.appliedAt).toLocaleDateString('en-IN') : '—',
        avatar: `${(l.employee?.firstName?.[0] || '')}${(l.employee?.lastName?.[0] || '')}`,
      }));
      (d.pendingOnboarding || []).forEach((t: any) => items.push({
        id: t.id, type: 'ONBOARDING', title: t.title,
        from: `${t.employee?.firstName || ''} ${t.employee?.lastName || ''}`,
        dept: t.category || '', description: t.description || 'Pending task',
        date: t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-IN') : '—',
        avatar: `${(t.employee?.firstName?.[0] || '')}${(t.employee?.lastName?.[0] || '')}`,
      }));
      (d.pendingExit || []).forEach((c: any) => items.push({
        id: c.id, type: 'EXIT', title: c.title,
        from: `${c.exitCase?.employee?.firstName || ''} ${c.exitCase?.employee?.lastName || ''}`,
        dept: c.department || '', description: 'Clearance pending',
        date: new Date(c.createdAt).toLocaleDateString('en-IN'),
        avatar: `${(c.exitCase?.employee?.firstName?.[0] || '')}${(c.exitCase?.employee?.lastName?.[0] || '')}`,
      }));
      setApprovals(items);
      setSummary(d.summary || { leaves: 0, onboarding: 0, exit: 0, total: 0 });
    }).catch(() => {});
  }, []);

  const filtered = filter === 'all' ? approvals : approvals.filter(a => a.type === filter.toUpperCase());

  const handleApprove = async (item: any) => {
    if (item.type === 'LEAVE') {
      try {
        await fetch(`/api/leave/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'APPROVED' }) });
        setApprovals(prev => prev.filter(a => a.id !== item.id));
      } catch {}
    } else if (item.type === 'ONBOARDING') {
      try {
        await fetch(`/api/onboarding/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'COMPLETED' }) });
        setApprovals(prev => prev.filter(a => a.id !== item.id));
      } catch {}
    }
  };

  const handleReject = async (item: any) => {
    if (item.type === 'LEAVE') {
      try {
        await fetch(`/api/leave/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) });
        setApprovals(prev => prev.filter(a => a.id !== item.id));
      } catch {}
    }
  };

  const handleBulkApprove = async () => {
    for (const id of selected) {
      const item = approvals.find(a => a.id === id);
      if (item) await handleApprove(item);
    }
    setSelected(new Set());
  };

  const handleBulkReject = async () => {
    for (const id of selected) {
      const item = approvals.find(a => a.id === id);
      if (item) await handleReject(item);
    }
    setSelected(new Set());
  };

  const allSelected = selected.size === filtered.length && filtered.length > 0;
  const toggleAll = () => { if (allSelected) setSelected(new Set()); else setSelected(new Set(filtered.map(a => a.id))); };
  const toggleOne = (id: string) => { const next = new Set(selected); if (next.has(id)) next.delete(id); else next.add(id); setSelected(next); };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>✅ Approval Center</h1>
          <p className={styles.pageSubtitle}>All pending approvals across the platform — one unified inbox</p>
        </div>
        <span className={styles.totalBadge}>{approvals.length} pending</span>
      </div>

      <div className={styles.filterRow}>
        {[
          { key: 'all', label: 'All', count: approvals.length },
          { key: 'leave', label: 'Leave', count: summary.leaves, icon: '📅' },
          { key: 'onboarding', label: 'Onboarding', count: summary.onboarding, icon: '📋' },
          { key: 'exit', label: 'Exit', count: summary.exit, icon: '🚪' },
        ].map(f => (
          <button key={f.key} className={styles.filterPill} data-active={filter === f.key} onClick={() => { setFilter(f.key as ApprovalCategory); setSelected(new Set()); }}>
            {'icon' in f && f.icon && <span>{f.icon}</span>}
            {f.label}
            <span className={styles.pillCount}>{f.count}</span>
          </button>
        ))}
      </div>

      {selected.size > 0 && (
        <div className={styles.bulkBar}>
          <span>{selected.size} selected</span>
          <div className={styles.bulkActions}>
            <button className={styles.bulkApprove} onClick={handleBulkApprove}>✅ Approve All</button>
            <button className={styles.bulkReject} onClick={handleBulkReject}>❌ Reject All</button>
            <button className={styles.bulkClear} onClick={() => setSelected(new Set())}>Clear</button>
          </div>
        </div>
      )}

      <div className={styles.approvalList}>
        <div className={styles.selectAllRow}>
          <label className={styles.checkWrap}>
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span>Select all</span>
          </label>
        </div>
        {filtered.map((item, i) => {
          const tc = typeConfig[item.type] || { color: '#64748b', icon: '📋' };
          return (
            <div key={item.id} className={styles.approvalCard} style={{ animationDelay: `${i * 30}ms` }}>
              <label className={styles.checkWrap}>
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleOne(item.id)} />
              </label>
              <div className={styles.approvalAvatar} style={{ background: `linear-gradient(135deg, ${tc.color}, #8b5cf6)` }}>{item.avatar}</div>
              <div className={styles.approvalContent}>
                <div className={styles.approvalTop}><strong>{item.title}</strong></div>
                <span className={styles.approvalFrom}>{item.from} · {item.dept}</span>
                <span className={styles.approvalDesc}>{item.description}</span>
              </div>
              <div className={styles.approvalMeta}>
                <span className={styles.approvalType} style={{ color: tc.color, background: tc.color + '12' }}>{tc.icon} {item.type}</span>
                <span className={styles.approvalTime}>{item.date}</span>
              </div>
              <div className={styles.approvalActions}>
                <button className={styles.approveBtn} onClick={() => handleApprove(item)}>✅</button>
                <button className={styles.rejectBtn} onClick={() => handleReject(item)}>❌</button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>🎉 No pending approvals!</div>}
      </div>
    </div>
  );
}
