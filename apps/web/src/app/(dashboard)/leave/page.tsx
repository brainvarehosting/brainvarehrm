'use client';

import toast from '@/lib/toast';
import { useState, useEffect } from 'react';
import styles from './leave.module.css';

const leaveColors: Record<string, string> = { CL: '#3b82f6', SL: '#f59e0b', EL: '#10b981', ML: '#ec4899', PL: '#8b5cf6', LOP: '#ef4444' };

const myLeaves = [
  { id: '1', type: 'Casual Leave', code: 'CL', from: '2026-04-08', to: '2026-04-09', days: 2, status: 'APPROVED', reason: 'Family function', appliedOn: '2026-04-03' },
  { id: '2', type: 'Sick Leave', code: 'SL', from: '2026-03-15', to: '2026-03-16', days: 2, status: 'APPROVED', reason: 'Fever', appliedOn: '2026-03-14' },
  { id: '3', type: 'Casual Leave', code: 'CL', from: '2026-02-14', to: '2026-02-14', days: 1, status: 'APPROVED', reason: "Valentine's Day", appliedOn: '2026-02-10' },
  { id: '4', type: 'Earned Leave', code: 'EL', from: '2026-01-20', to: '2026-01-22', days: 3, status: 'APPROVED', reason: 'Travel', appliedOn: '2026-01-10' },
];

const pendingApprovals = [
  { id: 'p1', employee: 'Priya Patel', code: 'EMP-0002', type: 'Casual Leave', from: '2026-04-21', to: '2026-04-22', days: 2, reason: 'Personal work', appliedOn: '2026-04-17' },
  { id: 'p2', employee: 'Rohit Mehta', code: 'EMP-0007', type: 'Sick Leave', from: '2026-04-23', to: '2026-04-23', days: 1, reason: 'Doctor appointment', appliedOn: '2026-04-18' },
  { id: 'p3', employee: 'Arjun Desai', code: 'EMP-0009', type: 'Earned Leave', from: '2026-04-28', to: '2026-04-30', days: 3, reason: 'Family vacation', appliedOn: '2026-04-15' },
];

const teamCalendar = [
  { name: 'Sneha Reddy', dates: '8-9 Apr', type: 'CL', color: '#3b82f6' },
  { name: 'Priya Patel', dates: '21-22 Apr', type: 'CL', color: '#3b82f6' },
  { name: 'Arjun Desai', dates: '28-30 Apr', type: 'EL', color: '#10b981' },
];

const statusStyles: Record<string, { bg: string; color: string }> = {
  APPROVED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
  PENDING: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  REJECTED: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
  CANCELLED: { bg: 'rgba(100,116,139,0.12)', color: '#64748b' },
};

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState<'balances' | 'history' | 'approvals' | 'calendar'>('balances');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ leaveTypeId: '', startDate: '', endDate: '', reason: '', isHalfDay: false });
  const [leaveTypes, setLeaveTypes] = useState([
    { id: '1', name: 'Casual Leave', code: 'CL', total: 12, used: 4, available: 8, color: '#3b82f6' },
    { id: '2', name: 'Sick Leave', code: 'SL', total: 6, used: 2, available: 4, color: '#f59e0b' },
    { id: '3', name: 'Earned Leave', code: 'EL', total: 15, used: 3, available: 12, color: '#10b981' },
  ]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [showLeaveDetail, setShowLeaveDetail] = useState<any>(null);
  const [cancelConfirm, setCancelConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/leave')
      .then(r => r.json())
      .then(data => {
        if (data.data?.length) {
          setMyLeaves(data.data.map((t: any) => ({
            id: t.id,
            type: t.leaveType?.name || 'Leave',
            code: t.leaveType?.code || '—',
            from: t.startDate?.split('T')[0],
            to: t.endDate?.split('T')[0],
            days: t.days,
            status: t.status,
            reason: t.reason || '',
            appliedOn: t.appliedAt?.split('T')[0] || t.createdAt?.split('T')[0],
            employee: t.employee ? `${t.employee.firstName} ${t.employee.lastName}` : '',
            employeeCode: t.employee?.employeeCode || '',
          })));
          const pending = data.data.filter((t: any) => t.status === 'PENDING');
          setPendingApprovals(pending.map((t: any) => ({
            id: t.id,
            employee: `${t.employee?.firstName || ''} ${t.employee?.lastName || ''}`.trim(),
            code: t.employee?.employeeCode || '',
            type: t.leaveType?.name || 'Leave',
            from: t.startDate?.split('T')[0],
            to: t.endDate?.split('T')[0],
            days: t.days,
            reason: t.reason || '',
            appliedOn: t.appliedAt?.split('T')[0] || t.createdAt?.split('T')[0],
          })));
        }
      })
      .catch(() => {
        setMyLeaves([
          { id: '1', type: 'Casual Leave', code: 'CL', from: '2026-04-08', to: '2026-04-09', days: 2, status: 'APPROVED', reason: 'Family function', appliedOn: '2026-04-03' },
        ]);
      });
  }, []);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.leaveTypeId || !applyForm.startDate || !applyForm.endDate) return;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const start = new Date(applyForm.startDate);
    const end = new Date(applyForm.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: user.employeeId || user.employee?.id,
          leaveTypeId: applyForm.leaveTypeId,
          startDate: applyForm.startDate,
          endDate: applyForm.endDate,
          days: applyForm.isHalfDay ? 0.5 : days,
          reason: applyForm.reason,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setMyLeaves(prev => [{
          id: created.id,
          type: created.leaveType?.name || 'Leave',
          code: created.leaveType?.code || '—',
          from: applyForm.startDate,
          to: applyForm.endDate,
          days: applyForm.isHalfDay ? 0.5 : days,
          status: 'PENDING',
          reason: applyForm.reason,
          appliedOn: new Date().toISOString().split('T')[0],
        }, ...prev]);
        setShowApplyModal(false);
        setApplyForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '', isHalfDay: false });
      }
    } catch { /* fallback: just close modal */ setShowApplyModal(false); }
  };

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/leave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'APPROVED' }),
      });
      setPendingApprovals(prev => prev.filter(r => r.id !== id));
      setMyLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'APPROVED' } : l));
    } catch {}
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/leave/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', rejectionReason: 'Not approved by manager' }),
      });
      setPendingApprovals(prev => prev.filter(r => r.id !== id));
      setMyLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'REJECTED' } : l));
    } catch {}
  };

  const handleCancel = (id: string) => {
    setMyLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'CANCELLED' } : l));
    setShowLeaveDetail(null); setCancelConfirm(null);
    toast('Leave cancelled', 'success');
  };

  const tabs = [
    { key: 'balances', label: 'My Balances' },
    { key: 'history', label: 'Leave History' },
    { key: 'approvals', label: `Approvals (${pendingApprovals.length})` },
    { key: 'calendar', label: 'Team Calendar' },
  ] as const;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Leave Management</h1>
          <p className={styles.pageSubtitle}>Apply for leave, track balances, and manage approvals</p>
        </div>
        <button className={styles.applyBtn} onClick={() => setShowApplyModal(true)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Apply Leave
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button key={tab.key} className={styles.tab} data-active={activeTab === tab.key} onClick={() => setActiveTab(tab.key as any)}>{tab.label}</button>
        ))}
      </div>

      {/* Balances Tab */}
      {activeTab === 'balances' && (
        <div className={styles.balancesGrid}>
          {leaveTypes.map((lt) => (
            <div key={lt.id} className={styles.balanceCard}>
              <div className={styles.balanceHeader}>
                <div className={styles.balanceType} style={{ borderLeftColor: lt.color }}>
                  <h3>{lt.name}</h3>
                  <span className={styles.typeCode}>{lt.code}</span>
                </div>
              </div>
              <div className={styles.balanceVisual}>
                <div className={styles.balanceCircle}>
                  <svg viewBox="0 0 36 36" className={styles.circleChart}>
                    <path className={styles.circleTrack} d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" />
                    <path className={styles.circleFill} style={{ stroke: lt.color, strokeDasharray: `${(lt.used / lt.total) * 100}, 100` }}
                      d="M18 2.0845a15.9155 15.9155 0 0 1 0 31.831a15.9155 15.9155 0 0 1 0-31.831" />
                  </svg>
                  <div className={styles.circleText}>
                    <span className={styles.circleNum}>{lt.available}</span>
                    <span className={styles.circleLabel}>avail.</span>
                  </div>
                </div>
              </div>
              <div className={styles.balanceStats}>
                <div><label>Total</label><span>{lt.total}</span></div>
                <div><label>Used</label><span style={{ color: lt.color }}>{lt.used}</span></div>
                <div><label>Available</label><span>{lt.available}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Applied On</th>
              </tr>
            </thead>
            <tbody>
              {myLeaves.map((leave) => {
                const ss = statusStyles[leave.status] || statusStyles.PENDING;
                return (
                  <tr key={leave.id} style={{ cursor: 'pointer' }} onClick={() => setShowLeaveDetail(leave)}>
                    <td><span className={styles.leaveTypePill}>{leave.code}</span> {leave.type}</td>
                    <td>{new Date(leave.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td>{new Date(leave.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                    <td>{leave.days}</td>
                    <td className={styles.reasonCell}>{leave.reason}</td>
                    <td><span className={styles.statusBadge} style={{ background: ss.bg, color: ss.color }}>{leave.status}</span></td>
                    <td>{new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Approvals Tab */}
      {activeTab === 'approvals' && (
        <div className={styles.approvalsList}>
          {pendingApprovals.map((req) => (
            <div key={req.id} className={styles.approvalCard}>
              <div className={styles.approvalTop}>
                <div className={styles.approvalAvatar}>{req.employee.split(' ').map((n: string) => n[0]).join('')}</div>
                <div className={styles.approvalInfo}>
                  <span className={styles.approvalName}>{req.employee}</span>
                  <span className={styles.approvalMeta}>{req.code} · Applied {new Date(req.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                </div>
                <span className={styles.statusBadge} style={{ background: statusStyles.PENDING.bg, color: statusStyles.PENDING.color }}>PENDING</span>
              </div>
              <div className={styles.approvalDetails}>
                <div><label>Type</label><span>{req.type}</span></div>
                <div><label>From</label><span>{new Date(req.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                <div><label>To</label><span>{new Date(req.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                <div><label>Days</label><span>{req.days}</span></div>
              </div>
              <p className={styles.approvalReason}><strong>Reason:</strong> {req.reason}</p>
              <div className={styles.approvalActions}>
                <button className={styles.approveBtn} onClick={() => handleApprove(req.id)}>✓ Approve</button>
                <button className={styles.rejectBtn} onClick={() => handleReject(req.id)}>✕ Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Calendar Tab */}
      {activeTab === 'calendar' && (
        <div className={styles.calendarView}>
          <h3 className={styles.calTitle}>April 2026 — Team Leave Calendar</h3>
          <div className={styles.calTimeline}>
            {teamCalendar.map((item, i) => (
              <div key={i} className={styles.calRow}>
                <span className={styles.calName}>{item.name}</span>
                <div className={styles.calBarContainer}>
                  <div className={styles.calBar} style={{ background: item.color + '22', borderLeft: `3px solid ${item.color}` }}>
                    <span style={{ color: item.color }}>{item.type}: {item.dates}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Apply for Leave</h2>
              <button className={styles.modalClose} onClick={() => setShowApplyModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form className={styles.modalForm} onSubmit={handleApplyLeave}>
              <div className={styles.formField}>
                <label>Leave Type</label>
                <select value={applyForm.leaveTypeId} onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}>
                  <option value="">Select leave type</option>
                  {leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>{lt.name} ({lt.available} available)</option>
                  ))}
                </select>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>From Date</label>
                  <input type="date" value={applyForm.startDate} onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })} required />
                </div>
                <div className={styles.formField}>
                  <label>To Date</label>
                  <input type="date" value={applyForm.endDate} onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })} required />
                </div>
              </div>
              <div className={styles.formField}>
                <label className={styles.checkboxLabel}>
                  <input type="checkbox" checked={applyForm.isHalfDay} onChange={(e) => setApplyForm({ ...applyForm, isHalfDay: e.target.checked })} />
                  Half Day
                </label>
              </div>
              <div className={styles.formField}>
                <label>Reason</label>
                <textarea rows={3} placeholder="Enter reason for leave..." value={applyForm.reason} onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })} required />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowApplyModal(false)}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Cancel Confirm */}
      {cancelConfirm && (
        <div className="modal-overlay" onClick={() => setCancelConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
          <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Cancel this leave?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{cancelConfirm.type} · {cancelConfirm.days} day(s)</p></div>
          <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setCancelConfirm(null)}>No, Keep</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => handleCancel(cancelConfirm.id)}>Yes, Cancel Leave</button></div>
        </div></div>
      )}

      {/* Leave Detail */}
      {showLeaveDetail && (
        <div className="modal-overlay" onClick={() => setShowLeaveDetail(null)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div><h2>{showLeaveDetail.type}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showLeaveDetail.employee || 'You'} · {showLeaveDetail.code}</p></div>
            <div style={{ display: 'flex', gap: 8 }}>
              {showLeaveDetail.status === 'PENDING' && <button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setCancelConfirm(showLeaveDetail)}>Cancel Leave</button>}
              <button onClick={() => setShowLeaveDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
          </div>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'].map(s => {
                const sc = statusStyles[s] || { bg: 'rgba(100,116,139,0.12)', color: '#64748b' };
                return <div key={s} style={{ flex: 1, textAlign: 'center', padding: '6px', borderRadius: 'var(--radius-md)', fontSize: 10, fontWeight: 600, background: showLeaveDetail.status === s ? sc.bg : 'var(--bg-tertiary)', color: showLeaveDetail.status === s ? sc.color : 'var(--text-muted)' }}>{s}</div>;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              {[['From', new Date(showLeaveDetail.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })], ['To', new Date(showLeaveDetail.to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })], ['Days', showLeaveDetail.days], ['Applied On', new Date(showLeaveDetail.appliedOn || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })], ['Status', showLeaveDetail.status], ['Type Code', showLeaveDetail.code]].map(([l, v]) => (
                <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{v}</div></div>
              ))}
            </div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Reason</div><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showLeaveDetail.reason || 'No reason provided'}</p></div>
            {showLeaveDetail.status === 'PENDING' && <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', border: 'none' }} onClick={() => { handleApprove(showLeaveDetail.id); setShowLeaveDetail({ ...showLeaveDetail, status: 'APPROVED' }); }}>✓ Approve</button>
              <button className="btn btn-sm" style={{ flex: 1, background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger-400)', border: 'none' }} onClick={() => { handleReject(showLeaveDetail.id); setShowLeaveDetail({ ...showLeaveDetail, status: 'REJECTED' }); }}>✕ Reject</button>
            </div>}
          </div>
        </div></div>
      )}
    </div>
  );
}
