'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'ninebox' | 'plans' | 'pipeline';

export default function SuccessionPage() {
  const [tab, setTab] = useState<Tab>('plans');
  const [plans, setPlans] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [md, setMd] = useState<any>({ employees: [] });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [showAddSuccessor, setShowAddSuccessor] = useState(false);

  useEffect(() => {
    fetch('/api/succession').then(r => r.json()).then(d => setPlans(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const stats = { total: plans.length, active: plans.filter(p => p.status === 'ACTIVE').length, critical: plans.filter(p => p.criticality === 'HIGH').length };
  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const handleCreate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body = { positionTitle: (f.elements.namedItem('position') as HTMLInputElement).value, currentHolderId: (f.elements.namedItem('holder') as HTMLSelectElement).value, criticality: (f.elements.namedItem('criticality') as HTMLSelectElement).value, readiness: (f.elements.namedItem('readiness') as HTMLSelectElement).value, status: 'ACTIVE', successors: [] };
    try {
      const res = await fetch('/api/succession', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const p = await res.json(); setPlans([...plans, p]); setShowCreate(false); toast('Plan created!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const saveEdits = async () => { try { await fetch('/api/succession', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, ...editData }) }); setPlans(plans.map(p => p.id === showDetail.id ? { ...p, ...editData } : p)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); } catch { toast('Failed', 'error'); } };
  const deletePlan = (id: string) => { setPlans(plans.filter(p => p.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Plan deleted', 'success'); };
  const removeSuccessor = (idx: number) => { const suc = [...(showDetail.successors || [])]; suc.splice(idx, 1); const updated = { ...showDetail, successors: suc }; setShowDetail(updated); setPlans(plans.map(p => p.id === showDetail.id ? { ...p, successors: suc } : p)); toast('Successor removed', 'success'); };
  const addSuccessor = (name: string, readiness: string) => { const suc = [...(showDetail.successors || []), { name, readiness }]; setShowDetail({ ...showDetail, successors: suc }); setPlans(plans.map(p => p.id === showDetail.id ? { ...p, successors: suc } : p)); setShowAddSuccessor(false); toast('Successor added!', 'success'); };

  // 9-Box Grid data
  const boxLabels = [
    ['Enigma', 'Growth Emp.', 'Star'],
    ['Dilemma', 'Core Player', 'High Perf.'],
    ['Under Perf.', 'Effective', 'Trusted Prof.']
  ];
  const boxColors = [
    ['#f59e0b', '#3b82f6', '#22c55e'],
    ['#ef4444', '#64748b', '#3b82f6'],
    ['#ef4444', '#f59e0b', '#64748b']
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Succession Planning</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{stats.total} plans · {stats.critical} critical roles</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Plan</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Plans', v: stats.total, c: 'var(--text-primary)' }, { l: 'Active', v: stats.active, c: 'var(--color-accent-400)' }, { l: 'Critical', v: stats.critical, c: 'var(--color-danger-400)' }, { l: 'Ready Now', v: plans.filter(p => p.readiness === 'READY_NOW').length, c: 'var(--color-primary-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'plans' as Tab, l: 'Succession Plans' }, { k: 'ninebox' as Tab, l: '9-Box Grid' }, { k: 'pipeline' as Tab, l: 'Talent Pipeline' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'plans' && (
        plans.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {plans.map(p => (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
                <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: p.criticality === 'HIGH' ? 'rgba(239,68,68,0.1)' : p.criticality === 'MEDIUM' ? 'rgba(245,158,11,0.1)' : 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 'var(--text-lg)' }}>{p.criticality === 'HIGH' ? '🔴' : p.criticality === 'MEDIUM' ? '🟡' : '🟢'}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{p.positionTitle}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Current: {p.currentHolderName || '—'} · {(p.successors || []).length} successors identified</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: p.readiness === 'READY_NOW' ? 'var(--color-accent-400)' : p.readiness === 'READY_1_2' ? 'var(--color-primary-400)' : 'var(--color-warning-400)' }}>{(p.readiness || 'NOT_READY').replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.criticality}</span>
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state"><h3>No plans</h3><p>Create succession plans for critical roles.</p></div>
      )}

      {tab === 'ninebox' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 'var(--space-3)' }}>POTENTIAL →</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                {boxLabels.map((row, ri) => row.map((label, ci) => {
                  const emps = md.employees.filter((_: any, i: number) => (i % 9) === (ri * 3 + ci)).slice(0, 2);
                  return (
                    <div key={`${ri}-${ci}`} style={{ padding: 'var(--space-4)', background: `${boxColors[ri][ci]}10`, border: `1px solid ${boxColors[ri][ci]}30`, borderRadius: 'var(--radius-md)', minHeight: 90 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: boxColors[ri][ci], marginBottom: 8 }}>{label}</div>
                      {emps.map((e: any) => (
                        <div key={e.id} style={{ fontSize: 10, color: 'var(--text-secondary)', padding: '2px 0' }}>• {e.firstName} {e.lastName?.[0]}.</div>
                      ))}
                      {emps.length === 0 && <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>—</div>}
                    </div>
                  );
                }))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 'var(--space-3)' }}>PERFORMANCE →</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'pipeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)' }}>
          {[{ l: 'Ready Now', f: 'READY_NOW', c: 'var(--color-accent-400)' }, { l: 'Ready 1-2 Years', f: 'READY_1_2', c: 'var(--color-primary-400)' }, { l: 'Developing', f: 'NOT_READY', c: 'var(--color-warning-400)' }].map(col => (
            <div key={col.l} className="stat-card" style={{ padding: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: col.c, marginBottom: 'var(--space-3)' }}>{col.l} ({plans.filter(p => p.readiness === col.f).length})</h3>
              {plans.filter(p => p.readiness === col.f).map(p => (
                <div key={p.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)' }}>
                  <span style={{ fontWeight: 500 }}>{p.positionTitle}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{(p.successors || []).length} candidates</span>
                </div>
              ))}
              {plans.filter(p => p.readiness === col.f).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>None</p>}
            </div>
          ))}
        </div>
      )}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Succession Plan</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Position/Role *</label><input className="input-field" name="position" required placeholder="VP of Engineering" /></div>
          <div><label className="input-label">Current Holder</label><select className="input-field" name="holder"><option value="">Select...</option>{md.employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Criticality</label><select className="input-field" name="criticality"><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select></div>
            <div><label className="input-label">Readiness</label><select className="input-field" name="readiness"><option value="READY_NOW">Ready Now</option><option value="READY_1_2">1-2 Years</option><option value="NOT_READY">Developing</option></select></div>
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Plan</button></div>
        </form>
      </div></div>}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.positionTitle}"?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This succession plan will be permanently removed.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deletePlan(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.positionTitle}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></>
            : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Position</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.positionTitle || ''} onChange={e => setEditData({ ...editData, positionTitle: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{showDetail.positionTitle}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Holder</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.currentHolderName || ''} onChange={e => setEditData({ ...editData, currentHolderName: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.currentHolderName || '—'}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Criticality</div>{editing ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.criticality || ''} onChange={e => setEditData({ ...editData, criticality: e.target.value })}><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2, color: showDetail.criticality === 'HIGH' ? 'var(--color-danger-400)' : showDetail.criticality === 'MEDIUM' ? 'var(--color-warning-400)' : 'var(--color-accent-400)' }}>{showDetail.criticality}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Readiness</div>{editing ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.readiness || ''} onChange={e => setEditData({ ...editData, readiness: e.target.value })}><option value="READY_NOW">Ready Now</option><option value="READY_1_2">1-2 Years</option><option value="NOT_READY">Developing</option></select> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{(showDetail.readiness || '').replace(/_/g, ' ')}</div>}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Identified Successors</h4>
            <button className="btn btn-sm" style={{ height: 24, fontSize: 10 }} onClick={() => setShowAddSuccessor(true)}>+ Add</button>
          </div>
          {(showDetail.successors || []).length > 0 ? showDetail.successors.map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '6px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div className="avatar avatar-sm">{(s.name || '?')[0]}</div>
              <div style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{s.name}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-primary-400)' }}>{s.readiness || 'Developing'}</span>
              <button onClick={() => removeSuccessor(i)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No successors identified yet.</p>}
        </div>
      </div></div>}

      {/* Add Successor */}
      {showAddSuccessor && <div className="modal-overlay" onClick={() => setShowAddSuccessor(false)}><div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Successor</h2></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={e => { e.preventDefault(); const f = e.target as HTMLFormElement; addSuccessor((f.elements.namedItem('sname') as HTMLInputElement).value, (f.elements.namedItem('sreadiness') as HTMLSelectElement).value); }}>
          <div><label className="input-label">Name *</label><select className="input-field" name="sname" required><option value="">Select...</option>{md.employees.map((e: any) => <option key={e.id} value={`${e.firstName} ${e.lastName}`}>{e.firstName} {e.lastName}</option>)}</select></div>
          <div><label className="input-label">Readiness</label><select className="input-field" name="sreadiness"><option value="Ready Now">Ready Now</option><option value="Ready 1-2yr">Ready 1-2 Years</option><option value="Developing">Developing</option></select></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAddSuccessor(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
        </form>
      </div></div>}
    </div>
  );
}
