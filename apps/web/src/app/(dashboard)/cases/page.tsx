'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'all' | 'grievances' | 'disciplinary' | 'stages';
const statusConfig: Record<string, { bg: string; color: string }> = { OPEN: { bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' }, INVESTIGATING: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)' }, WARNING_ISSUED: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-400)' }, SHOW_CAUSE: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-400)' }, RESOLVED: { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }, CLOSED: { bg: 'rgba(100,116,139,0.12)', color: 'var(--text-tertiary)' } };
const severityConfig: Record<string, { bg: string; color: string }> = { HIGH: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-400)' }, MEDIUM: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)' }, LOW: { bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' } };

export default function CasesPage() {
  const [tab, setTab] = useState<Tab>('all');
  const [cases, setCases] = useState([
    { id: 'GRV-001', type: 'GRIEVANCE', title: 'Workplace harassment complaint', employee: 'Confidential', dept: '—', severity: 'HIGH', status: 'INVESTIGATING', assignedTo: 'Priya Patel (HRBP)', created: '2026-04-10', daysOpen: 10, notes: '' },
    { id: 'DIS-001', type: 'DISCIPLINARY', title: 'Repeated unauthorized absences', employee: 'Vikram Singh', dept: 'Operations', severity: 'MEDIUM', status: 'WARNING_ISSUED', assignedTo: 'HR Admin', created: '2026-04-05', daysOpen: 15, notes: '' },
    { id: 'GRV-002', type: 'GRIEVANCE', title: 'Pay discrepancy concern', employee: 'Rahul Sharma', dept: 'Engineering', severity: 'MEDIUM', status: 'RESOLVED', assignedTo: 'Payroll Admin', created: '2026-03-20', daysOpen: 0, notes: 'Resolved after payroll correction' },
    { id: 'DIS-002', type: 'DISCIPLINARY', title: 'Violation of IT security policy', employee: 'Arjun Desai', dept: 'Engineering', severity: 'HIGH', status: 'SHOW_CAUSE', assignedTo: 'IT Admin + HR', created: '2026-04-12', daysOpen: 8, notes: '' },
    { id: 'GRV-003', type: 'GRIEVANCE', title: 'Team conflict resolution request', employee: 'Ananya Iyer', dept: 'Design', severity: 'LOW', status: 'OPEN', assignedTo: 'Manager', created: '2026-04-18', daysOpen: 2, notes: '' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const filtered = tab === 'all' || tab === 'stages' ? cases : cases.filter(c => c.type === tab.toUpperCase());
  const warningStages = [{ stage: 'Verbal Warning', icon: '💬', desc: 'Documented verbal counseling' }, { stage: 'Written Warning', icon: '📝', desc: 'Formal written notice' }, { stage: 'Final Warning', icon: '⚠️', desc: 'Last chance before termination' }, { stage: 'Suspension', icon: '🚫', desc: 'Temporary suspension' }, { stage: 'Termination', icon: '🔴', desc: 'Employment terminated' }];

  const handleCreate = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; const c = { id: `${(f.elements.namedItem('type') as HTMLSelectElement).value === 'GRIEVANCE' ? 'GRV' : 'DIS'}-${String(cases.length + 1).padStart(3, '0')}`, type: (f.elements.namedItem('type') as HTMLSelectElement).value, title: (f.elements.namedItem('title') as HTMLInputElement).value, employee: (f.elements.namedItem('employee') as HTMLInputElement).value, dept: (f.elements.namedItem('dept') as HTMLInputElement).value, severity: (f.elements.namedItem('severity') as HTMLSelectElement).value, status: 'OPEN', assignedTo: (f.elements.namedItem('assignedTo') as HTMLInputElement).value, created: new Date().toISOString().split('T')[0], daysOpen: 0, notes: '' }; setCases([c, ...cases]); setShowCreate(false); toast('Case created!', 'success'); };
  const saveEdits = () => { setCases(cases.map(c => c.id === showDetail.id ? { ...c, ...editData } : c)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const deleteCase = (id: string) => { setCases(cases.filter(c => c.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Case removed', 'success'); };
  const changeStatus = (id: string, status: string) => { setCases(cases.map(c => c.id === id ? { ...c, status } : c)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status }); toast(`Status → ${status.replace('_', ' ')}`, 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Cases & Grievances</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Complaints, investigations, and disciplinary actions</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Case</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Open Cases', v: cases.filter(c => !['RESOLVED', 'CLOSED'].includes(c.status)).length, c: 'var(--color-warning-400)' }, { l: 'Grievances', v: cases.filter(c => c.type === 'GRIEVANCE').length, c: 'var(--color-primary-400)' }, { l: 'Disciplinary', v: cases.filter(c => c.type === 'DISCIPLINARY').length, c: 'var(--color-danger-400)' }, { l: 'Resolved', v: cases.filter(c => c.status === 'RESOLVED').length, c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'all' as Tab, l: 'All Cases' }, { k: 'grievances' as Tab, l: 'Grievances' }, { k: 'disciplinary' as Tab, l: 'Disciplinary' }, { k: 'stages' as Tab, l: 'Warning Stages' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab !== 'stages' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filtered.map(c => { const sc = statusConfig[c.status] || statusConfig.OPEN; const sv = severityConfig[c.severity]; return (
          <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer', borderLeft: `4px solid ${sv.color}` }} onClick={() => { setShowDetail(c); setEditData(c); setEditing(false); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>{c.id}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, color: c.type === 'GRIEVANCE' ? 'var(--color-primary-400)' : 'var(--color-danger-400)', background: c.type === 'GRIEVANCE' ? 'rgba(59,130,246,0.08)' : 'rgba(239,68,68,0.08)' }}>{c.type === 'GRIEVANCE' ? '🗣️' : '⚠️'} {c.type}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: sv.bg, color: sv.color }}>{c.severity}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: sc.bg, color: sc.color }}>{c.status.replace('_', ' ')}</span>
              </div>
            </div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{c.title}</h3>
            <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>👤 {c.employee}</span>{c.dept !== '—' && <span>🏢 {c.dept}</span>}<span>📅 {new Date(c.created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span><span>👉 {c.assignedTo}</span>
              {c.daysOpen > 0 && <span style={{ color: 'var(--color-warning-400)', fontWeight: 600 }}>{c.daysOpen}d open</span>}
            </div>
          </div>
        ); })}
      </div>}

      {tab === 'stages' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>Progressive Discipline Stages</h3>
        {warningStages.map((ws, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-muted)', width: 24 }}>{i + 1}</span>
            <span style={{ fontSize: 20 }}>{ws.icon}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{ws.stage}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{ws.desc}</div></div>
            {i < warningStages.length - 1 && <span style={{ color: 'var(--text-muted)' }}>→</span>}
          </div>
        ))}
      </div>}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete case {deleteConfirm.id}?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteCase(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create Case */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Case</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Title *</label><input className="input-field" name="title" required placeholder="Case description" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="GRIEVANCE">Grievance</option><option value="DISCIPLINARY">Disciplinary</option></select></div>
            <div><label className="input-label">Severity</label><select className="input-field" name="severity"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Employee</label><input className="input-field" name="employee" placeholder="Name or Confidential" /></div>
            <div><label className="input-label">Department</label><input className="input-field" name="dept" placeholder="Engineering" /></div>
          </div>
          <div><label className="input-label">Assigned To</label><input className="input-field" name="assignedTo" placeholder="HR Admin" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Case</button></div>
        </form>
      </div></div>}

      {/* Case Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>{showDetail.id}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.title}</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['OPEN', 'INVESTIGATING', 'WARNING_ISSUED', 'SHOW_CAUSE', 'RESOLVED', 'CLOSED'].map(s => { const sc = statusConfig[s] || statusConfig.OPEN; return <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ padding: '4px 8px', fontSize: 9, fontWeight: 600, borderRadius: 'var(--radius-md)', background: showDetail.status === s ? sc.bg : 'var(--bg-tertiary)', color: showDetail.status === s ? sc.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s.replace('_', ' ')}</button>; })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Title', f: 'title' }, { l: 'Employee', f: 'employee' }, { l: 'Department', f: 'dept' }, { l: 'Severity', f: 'severity' }, { l: 'Assigned To', f: 'assignedTo' }, { l: 'Created', f: 'created', v: new Date(showDetail.created).toLocaleDateString('en-IN'), t: 'date' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v || showDetail[item.f]}</div>}</div>
            ))}
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Notes</div>{editing ? <textarea className="input-field" rows={3} value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} placeholder="Investigation notes..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.notes || 'No notes yet.'}</p>}</div>
        </div>
      </div></div>}
    </div>
  );
}
