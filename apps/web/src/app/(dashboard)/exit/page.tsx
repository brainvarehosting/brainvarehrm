'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

export default function ExitPage() {
  const [cases, setCases] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [md, setMd] = useState<any>({ employees: [] });
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    fetch('/api/exit').then(r => r.json()).then(d => setCases(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const filtered = cases.filter(c => tab === 'ALL' || c.status === tab);
  const stats = { total: cases.length, initiated: cases.filter(c => c.status === 'INITIATED').length, notice: cases.filter(c => c.status === 'NOTICE_PERIOD').length, clearance: cases.filter(c => c.status === 'CLEARANCE').length, completed: cases.filter(c => c.status === 'COMPLETED').length };

  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const statusClr = (s: string) => s === 'COMPLETED' ? 'var(--color-accent-400)' : s === 'CLEARANCE' ? 'var(--color-primary-400)' : s === 'NOTICE_PERIOD' ? 'var(--color-warning-400)' : 'var(--text-secondary)';

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    try {
      const res = await fetch('/api/exit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: (f.elements.namedItem('emp') as HTMLSelectElement).value, exitType: (f.elements.namedItem('type') as HTMLSelectElement).value, exitReason: (f.elements.namedItem('reason') as HTMLInputElement).value, resignationDate: (f.elements.namedItem('date') as HTMLInputElement).value, lastWorkingDate: (f.elements.namedItem('lwd') as HTMLInputElement).value || undefined }) });
      if (res.ok) { const c = await res.json(); setCases([...cases, c]); setShowCreate(false); toast('Exit initiated', 'success'); }
      else { const err = await res.json(); toast(err.error || 'Failed', 'error'); }
    } catch { toast('Failed', 'error'); }
  };

  const updateCase = async (id: string, data: any) => {
    try {
      const res = await fetch('/api/exit', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
      if (res.ok) { const u = await res.json(); setCases(cases.map(c => c.id === id ? { ...c, ...u } : c)); if (showDetail?.id === id) setShowDetail({ ...showDetail, ...u }); toast('Updated', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const toggleClearance = async (caseId: string, taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'CLEARED' ? 'PENDING' : 'CLEARED';
    try {
      await fetch('/api/exit', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clearanceTaskId: taskId, status: newStatus, clearedAt: newStatus === 'CLEARED' ? new Date().toISOString() : null }) });
      setCases(cases.map(c => c.id === caseId ? { ...c, clearanceTasks: (c.clearanceTasks || []).map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t) } : c));
      if (showDetail?.id === caseId) setShowDetail({ ...showDetail, clearanceTasks: showDetail.clearanceTasks.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t) });
      toast(newStatus === 'CLEARED' ? 'Cleared!' : 'Reopened', 'success');
    } catch { toast('Failed', 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Exit Management</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{stats.total} cases · {stats.completed} completed</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Initiate Exit</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total', v: stats.total, c: 'var(--text-primary)' }, { l: 'Initiated', v: stats.initiated, c: 'var(--text-secondary)' }, { l: 'Notice', v: stats.notice, c: 'var(--color-warning-400)' }, { l: 'Clearance', v: stats.clearance, c: 'var(--color-primary-400)' }, { l: 'Completed', v: stats.completed, c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2 }}>
        {['ALL', 'INITIATED', 'NOTICE_PERIOD', 'CLEARANCE', 'COMPLETED'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)', background: tab === t ? 'var(--color-primary-500)' : 'transparent', color: tab === t ? 'white' : 'var(--text-secondary)', border: tab === t ? 'none' : '1px solid var(--border-primary)', cursor: 'pointer', fontWeight: tab === t ? 600 : 400 }}>{t.replace(/_/g, ' ')}</button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Employee</th><th>Type</th><th>Reason</th><th>Resignation</th><th>Last Working</th><th>Interview</th><th>Clearance</th><th>Status</th><th></th></tr></thead>
          <tbody>{filtered.map(c => {
            const clearTotal = (c.clearanceTasks || []).length;
            const clearDone = (c.clearanceTasks || []).filter((t: any) => t.status === 'CLEARED').length;
            return (
              <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setShowDetail(c); setEditData(c); setEditing(false); }}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar avatar-sm">{c.employee?.firstName?.[0]}{c.employee?.lastName?.[0]}</div><div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{c.employee?.firstName} {c.employee?.lastName}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.employee?.employeeCode}</div></div></div></td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{c.exitType}</td>
                <td style={{ fontSize: 'var(--text-sm)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.exitReason || '—'}</td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{fd(c.resignationDate)}</td>
                <td style={{ fontSize: 'var(--text-xs)' }}>{fd(c.lastWorkingDate)}</td>
                <td>{c.exitInterviewDone ? <span style={{ color: 'var(--color-accent-400)', fontSize: 11 }}>✓ Done</span> : <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Pending</span>}</td>
                <td>{clearTotal > 0 ? <span style={{ fontSize: 11 }}>{clearDone}/{clearTotal}</span> : '—'}</td>
                <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, color: statusClr(c.status) }}>{c.status?.replace(/_/g, ' ')}</span></td>
                <td><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      ) : <div className="empty-state"><h3>No exit cases</h3><p>Initiate employee exit processes here.</p></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Initiate Exit</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="emp" required><option value="">Select...</option>{md.employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Exit Type *</label><select className="input-field" name="type" required><option value="RESIGNATION">Resignation</option><option value="TERMINATION">Termination</option><option value="RETIREMENT">Retirement</option></select></div>
            <div><label className="input-label">Resignation Date *</label><input className="input-field" name="date" type="date" required /></div>
          </div>
          <div><label className="input-label">Last Working Date</label><input className="input-field" name="lwd" type="date" /></div>
          <div><label className="input-label">Reason</label><textarea className="input-field" name="reason" rows={3} placeholder="Reason for exit..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Initiate Exit</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div><h2>{showDetail.employee?.firstName} {showDetail.employee?.lastName} — Exit</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.employee?.employeeCode} · {showDetail.exitType}</p></div><button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status Pipeline */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['INITIATED','NOTICE_PERIOD','CLEARANCE','COMPLETED'].map(s => (
              <button key={s} onClick={() => updateCase(showDetail.id, { status: s })} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'COMPLETED' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? statusClr(s) : 'var(--text-muted)', border: showDetail.status === s ? `1px solid ${statusClr(s)}` : '1px solid transparent', cursor: 'pointer' }}>{s.replace(/_/g, ' ')}</button>
            ))}
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[['Reason', showDetail.exitReason], ['Resignation', fd(showDetail.resignationDate)], ['Last Working', fd(showDetail.lastWorkingDate)], ['Rehire Eligible', showDetail.rehireEligible ? 'Yes' : 'No']].map(([l, v]) => (
              <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2 }}>{v || '—'}</div></div>
            ))}
          </div>

          {/* Exit Interview */}
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Exit Interview</span>
              <button className="btn btn-sm" style={{ height: 28, fontSize: 11, background: showDetail.exitInterviewDone ? 'var(--color-accent-500)' : 'var(--bg-input)', color: showDetail.exitInterviewDone ? 'white' : 'var(--text-secondary)', border: showDetail.exitInterviewDone ? 'none' : '1px solid var(--border-primary)' }} onClick={() => updateCase(showDetail.id, { exitInterviewDone: !showDetail.exitInterviewDone })}>{showDetail.exitInterviewDone ? '✓ Completed' : 'Mark Done'}</button>
            </div>
            <textarea className="input-field" rows={3} placeholder="Interview notes..." value={showDetail.exitInterviewNotes || ''} onChange={e => setShowDetail({ ...showDetail, exitInterviewNotes: e.target.value })} onBlur={() => updateCase(showDetail.id, { exitInterviewNotes: showDetail.exitInterviewNotes })} />
          </div>

          {/* Clearance Tasks */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Clearance Checklist ({(showDetail.clearanceTasks || []).filter((t: any) => t.status === 'CLEARED').length}/{(showDetail.clearanceTasks || []).length})</div>
            {(showDetail.clearanceTasks || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {showDetail.clearanceTasks.map((task: any) => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '8px', background: task.status === 'CLEARED' ? 'rgba(16,185,129,0.06)' : 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <button onClick={() => toggleClearance(showDetail.id, task.id, task.status)} style={{ width: 20, height: 20, borderRadius: 4, border: task.status === 'CLEARED' ? 'none' : '2px solid var(--border-primary)', background: task.status === 'CLEARED' ? 'var(--color-accent-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>{task.status === 'CLEARED' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}</button>
                    <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: task.status === 'CLEARED' ? 'line-through' : 'none', opacity: task.status === 'CLEARED' ? 0.6 : 1 }}>{task.title}</div></div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: task.department === 'HR' ? '#3b82f6' : task.department === 'IT' ? '#06b6d4' : task.department === 'FINANCE' ? '#f59e0b' : '#a78bfa' }}>{task.department}</span>
                    {task.clearedAt && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fd(task.clearedAt)}</span>}
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No clearance tasks. They will be auto-created when status moves to CLEARANCE.</p>}
          </div>

          {/* Rehire Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>Rehire Eligible</span>
            <button onClick={() => updateCase(showDetail.id, { rehireEligible: !showDetail.rehireEligible })} style={{ padding: '4px 12px', fontSize: 11, borderRadius: 9999, background: showDetail.rehireEligible ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: showDetail.rehireEligible ? 'var(--color-accent-400)' : 'var(--color-danger-400)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>{showDetail.rehireEligible ? '✓ Yes' : '✕ No'}</button>
          </div>
        </div>
      </div></div>}
    </div>
  );
}
