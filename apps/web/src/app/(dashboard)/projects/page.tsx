'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'projects' | 'utilization' | 'timesheets';
const statusColors: Record<string, { bg: string; color: string }> = { ACTIVE: { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }, ON_HOLD: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)' }, COMPLETED: { bg: 'rgba(100,116,139,0.12)', color: 'var(--text-tertiary)' }, PLANNING: { bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' } };

export default function ProjectsPage() {
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState([
    { id: '1', name: 'FreshMart Brand Redesign', code: 'FM-001', client: 'FreshMart India', type: 'PROJECT', status: 'ACTIVE', budget: 500000, spent: 320000, team: 4, startDate: '2026-03-01', endDate: '2026-06-30', progress: 65, manager: 'Sneha Reddy' },
    { id: '2', name: 'Social Media Retainer', code: 'SM-002', client: 'TechVista', type: 'RETAINER', status: 'ACTIVE', budget: 120000, spent: 80000, team: 3, startDate: '2026-01-01', endDate: '2026-12-31', progress: 33, manager: 'Amit Kumar' },
    { id: '3', name: 'BrainvareHRM Development', code: 'INT-001', client: '', type: 'INTERNAL', status: 'ACTIVE', budget: 0, spent: 0, team: 5, startDate: '2025-06-01', endDate: '', progress: 70, manager: 'Karan Malhotra' },
    { id: '4', name: 'CloudNine App UI/UX', code: 'CN-003', client: 'CloudNine Health', type: 'PROJECT', status: 'ON_HOLD', budget: 350000, spent: 100000, team: 2, startDate: '2026-02-15', endDate: '2026-05-15', progress: 30, manager: 'Meera Nair' },
    { id: '5', name: 'Annual Report Design', code: 'AR-004', client: 'Indo Steel Corp', type: 'PROJECT', status: 'COMPLETED', budget: 200000, spent: 185000, team: 3, startDate: '2026-01-10', endDate: '2026-03-20', progress: 100, manager: 'Sneha Reddy' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const utilization = [
    { name: 'Sneha Reddy', allocated: 120, available: 160, projects: ['FM-001', 'AR-004'] },
    { name: 'Karan Malhotra', allocated: 160, available: 160, projects: ['INT-001'] },
    { name: 'Priya Patel', allocated: 80, available: 160, projects: ['SM-002'] },
    { name: 'Amit Kumar', allocated: 100, available: 160, projects: ['SM-002'] },
    { name: 'Arjun Desai', allocated: 140, available: 160, projects: ['INT-001', 'CN-003'] },
    { name: 'Meera Nair', allocated: 60, available: 160, projects: ['CN-003'] },
  ];

  const fm = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;
  const handleCreate = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setProjects([{ id: Date.now().toString(), name: (f.elements.namedItem('name') as HTMLInputElement).value, code: (f.elements.namedItem('code') as HTMLInputElement).value, client: (f.elements.namedItem('client') as HTMLInputElement).value, type: (f.elements.namedItem('type') as HTMLSelectElement).value, status: 'PLANNING', budget: parseInt((f.elements.namedItem('budget') as HTMLInputElement).value) || 0, spent: 0, team: parseInt((f.elements.namedItem('team') as HTMLInputElement).value) || 1, startDate: (f.elements.namedItem('start') as HTMLInputElement).value, endDate: (f.elements.namedItem('end') as HTMLInputElement).value, progress: 0, manager: (f.elements.namedItem('manager') as HTMLInputElement).value }, ...projects]); setShowCreate(false); toast('Project created!', 'success'); };
  const saveEdits = () => { setProjects(projects.map(p => p.id === showDetail.id ? { ...p, ...editData, budget: parseInt(editData.budget) || 0, spent: parseInt(editData.spent) || 0, team: parseInt(editData.team) || 0, progress: parseInt(editData.progress) || 0 } : p)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const deleteProject = (id: string) => { setProjects(projects.filter(p => p.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Project deleted', 'success'); };
  const changeStatus = (id: string, status: string) => { setProjects(projects.map(p => p.id === id ? { ...p, status } : p)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status }); toast(`Status → ${status.replace('_', ' ')}`, 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Projects & Resources</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Track projects, team allocation, and utilization</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Active', v: projects.filter(p => p.status === 'ACTIVE').length, c: 'var(--color-accent-400)' }, { l: 'Total Budget', v: fm(projects.filter(p => p.budget).reduce((s, p) => s + p.budget, 0)), c: 'var(--color-primary-400)' }, { l: 'Avg Utilization', v: `${Math.round((utilization.reduce((s, u) => s + u.allocated, 0) / utilization.reduce((s, u) => s + u.available, 0)) * 100)}%`, c: '#a78bfa' }, { l: 'On Hold', v: projects.filter(p => p.status === 'ON_HOLD').length, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'projects' as Tab, l: 'Projects' }, { k: 'utilization' as Tab, l: 'Utilization' }, { k: 'timesheets' as Tab, l: 'Time Logs' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'projects' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
        {projects.map(p => { const sc = statusColors[p.status] || statusColors.ACTIVE; return (
          <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{p.code}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: sc.bg, color: sc.color }}>{p.status.replace('_', ' ')}</span>
            </div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{p.name}</h3>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{p.client || 'Internal'} · {p.type} · 👤 {p.manager}</div>
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', width: `${p.progress}%`, background: p.progress === 100 ? 'var(--color-accent-400)' : 'var(--color-primary-400)', borderRadius: 9999 }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
              <span>👥 {p.team} members</span><span>{p.progress}%</span>
            </div>
            {p.budget > 0 && <div style={{ marginTop: 'var(--space-2)', fontSize: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-muted)' }}>Budget</span><span style={{ fontWeight: 600 }}>{fm(p.spent)} / {fm(p.budget)}</span></div>
              <div style={{ height: 3, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', marginTop: 2 }}><div style={{ height: '100%', width: `${Math.min((p.spent / p.budget) * 100, 100)}%`, background: (p.spent / p.budget) > 0.9 ? 'var(--color-danger-400)' : 'var(--color-accent-400)', borderRadius: 9999 }} /></div>
            </div>}
          </div>
        ); })}
      </div>}

      {tab === 'utilization' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {utilization.map((u, i) => { const pct = Math.round((u.allocated / u.available) * 100); return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ width: 120 }}><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{u.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.projects.join(', ')}</div></div>
            <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? 'var(--color-danger-400)' : pct >= 80 ? 'var(--color-warning-400)' : 'var(--color-accent-400)', borderRadius: 9999 }} /></div>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, width: 40, textAlign: 'right', color: pct >= 100 ? 'var(--color-danger-400)' : 'var(--text-primary)' }}>{pct}%</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 80, textAlign: 'right' }}>{u.allocated}h / {u.available}h</span>
          </div>
        ); })}
      </div>}

      {tab === 'timesheets' && <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-2)' }}>⏱</div><h3 style={{ fontWeight: 600, marginBottom: 8 }}>Timesheet Submissions</h3><p style={{ fontSize: 'var(--text-sm)' }}>Team members can log hours against projects here.</p><button className="btn btn-primary" style={{ marginTop: 'var(--space-3)' }} onClick={() => toast('Redirecting to Timesheet module...', 'info')}>Log Hours →</button></div>}

      {/* Delete */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete "{deleteConfirm.name}"?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteProject(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Project</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Name *</label><input className="input-field" name="name" required placeholder="Project name" /></div>
            <div><label className="input-label">Code *</label><input className="input-field" name="code" required placeholder="PRJ-001" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Client</label><input className="input-field" name="client" placeholder="Client name" /></div>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="PROJECT">Project</option><option value="RETAINER">Retainer</option><option value="INTERNAL">Internal</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Budget (₹)</label><input className="input-field" name="budget" type="number" placeholder="0" /></div>
            <div><label className="input-label">Team Size</label><input className="input-field" name="team" type="number" defaultValue={1} /></div>
            <div><label className="input-label">Manager</label><input className="input-field" name="manager" placeholder="Name" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Start Date</label><input className="input-field" name="start" type="date" /></div>
            <div><label className="input-label">End Date</label><input className="input-field" name="end" type="date" /></div>
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showDetail.code}</span><h2 style={{ margin: 0 }}>{showDetail.name}</h2></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED'].map(s => { const sc = statusColors[s] || statusColors.ACTIVE; return <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 10, fontWeight: 600, background: showDetail.status === s ? sc.bg : 'var(--bg-tertiary)', color: showDetail.status === s ? sc.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s.replace('_', ' ')}</button>; })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Name', f: 'name' }, { l: 'Code', f: 'code' }, { l: 'Client', f: 'client' }, { l: 'Type', f: 'type' }, { l: 'Manager', f: 'manager' }, { l: 'Team', f: 'team', t: 'number' }, { l: 'Budget', f: 'budget', v: showDetail.budget > 0 ? fm(showDetail.budget) : '—', t: 'number' }, { l: 'Spent', f: 'spent', v: showDetail.spent > 0 ? fm(showDetail.spent) : '—', t: 'number' }, { l: 'Progress', f: 'progress', v: `${showDetail.progress}%`, t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] ?? ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v || showDetail[item.f] || '—'}</div>}</div>
            ))}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
