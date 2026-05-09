'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'objectives' | 'keyresults' | 'team';

export default function GoalsPage() {
  const [tab, setTab] = useState<Tab>('objectives');
  const [goals, setGoals] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showAddKR, setShowAddKR] = useState(false);
  const [md, setMd] = useState<any>({ employees: [] });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/goals').then(r => r.json()).then(d => setGoals(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const allKRs = goals.flatMap(g => (g.keyResults || []).map((kr: any) => ({ ...kr, objective: g.title })));
  const overallProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + (g.progress || 0), 0) / goals.length) : 0;
  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

  const handleCreate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body: any = { title: (f.elements.namedItem('title') as HTMLInputElement).value, description: (f.elements.namedItem('desc') as HTMLInputElement).value, category: (f.elements.namedItem('category') as HTMLSelectElement).value, priority: (f.elements.namedItem('priority') as HTMLSelectElement).value, ownerId: (f.elements.namedItem('owner') as HTMLSelectElement).value, startDate: (f.elements.namedItem('start') as HTMLInputElement).value, endDate: (f.elements.namedItem('end') as HTMLInputElement).value, status: 'ACTIVE', progress: 0, keyResults: [] };
    try {
      const res = await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const g = await res.json(); setGoals([...goals, g]); setShowCreate(false); toast('Objective created!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const updateGoal = async (id: string, data: any) => {
    try {
      const res = await fetch('/api/goals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
      if (res.ok) { const u = await res.json(); setGoals(goals.map(g => g.id === id ? { ...g, ...u, ...data } : g)); if (showDetail?.id === id) setShowDetail({ ...showDetail, ...u, ...data }); toast('Updated', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const addKeyResult = async (goalId: string, kr: any) => {
    const goal = goals.find(g => g.id === goalId);
    const krs = [...(goal?.keyResults || []), { ...kr, id: Date.now().toString(), progress: 0 }];
    await updateGoal(goalId, { keyResults: krs });
    setShowAddKR(false);
  };

  const updateKRProgress = (goalId: string, krId: string, progress: number) => {
    const goal = goals.find(g => g.id === goalId);
    const krs = (goal?.keyResults || []).map((kr: any) => kr.id === krId ? { ...kr, progress } : kr);
    const avgProgress = krs.length > 0 ? Math.round(krs.reduce((s: number, k: any) => s + k.progress, 0) / krs.length) : 0;
    updateGoal(goalId, { keyResults: krs, progress: avgProgress });
  };

  const deleteGoal = (id: string) => { setGoals(goals.filter(g => g.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Objective deleted', 'success'); };
  const deleteKR = (goalId: string, krId: string) => { const goal = goals.find(g => g.id === goalId); const krs = (goal?.keyResults || []).filter((kr: any) => kr.id !== krId); updateGoal(goalId, { keyResults: krs, progress: krs.length > 0 ? Math.round(krs.reduce((s: number, k: any) => s + k.progress, 0) / krs.length) : 0 }); toast('Key result removed', 'success'); };
  const saveEdits = async () => { await updateGoal(showDetail.id, editData); setEditing(false); toast('Objective updated!', 'success'); };
  const priorityClr = (p: string) => p === 'HIGH' ? 'var(--color-danger-400)' : p === 'MEDIUM' ? 'var(--color-warning-400)' : 'var(--color-accent-400)';
  const progressClr = (p: number) => p >= 75 ? 'var(--color-accent-500)' : p >= 40 ? 'var(--color-primary-500)' : p >= 10 ? 'var(--color-warning-500)' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Goals & OKR</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{goals.length} objectives · {allKRs.length} key results · {overallProgress}% progress</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Objective</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Objectives', v: goals.length, c: 'var(--text-primary)' }, { l: 'Key Results', v: allKRs.length, c: 'var(--color-primary-400)' }, { l: 'On Track', v: goals.filter(g => (g.progress || 0) >= 50).length, c: 'var(--color-accent-400)' }, { l: 'At Risk', v: goals.filter(g => (g.progress || 0) < 30 && g.status === 'ACTIVE').length, c: 'var(--color-danger-400)' }, { l: 'Progress', v: `${overallProgress}%`, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Overall OKR Progress</span><span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: progressClr(overallProgress) }}>{overallProgress}%</span></div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${overallProgress}%`, background: progressClr(overallProgress), borderRadius: 9999, transition: 'width 0.5s' }} /></div>
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'objectives' as Tab, l: 'Objectives' }, { k: 'keyresults' as Tab, l: 'Key Results' }, { k: 'team' as Tab, l: 'Team View' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'objectives' && (
        goals.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {goals.map(g => (
              <div key={g.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }} onClick={() => { setShowDetail(g); setEditData(g); setEditing(false); }}>
                <div style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: `${progressClr(g.progress || 0)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: progressClr(g.progress || 0) }}>{g.progress || 0}%</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{g.title}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, color: priorityClr(g.priority || 'MEDIUM'), padding: '1px 6px', borderRadius: 9999, background: `${priorityClr(g.priority || 'MEDIUM')}15` }}>{g.priority || 'MEDIUM'}</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{g.category || '—'} · {fd(g.startDate)} → {fd(g.endDate)} · {(g.keyResults || []).length} key results</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: g.status === 'COMPLETED' ? 'var(--color-accent-400)' : g.status === 'ACTIVE' ? 'var(--color-primary-400)' : 'var(--text-muted)' }}>{g.status}</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-tertiary)' }}><div style={{ height: '100%', width: `${g.progress || 0}%`, background: progressClr(g.progress || 0), transition: 'width 0.5s' }} /></div>
                {(g.keyResults || []).length > 0 && <div style={{ padding: '8px var(--space-4)' }}>
                  {g.keyResults.slice(0, 3).map((kr: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: '2px 0' }}>
                      <span style={{ color: kr.progress >= 70 ? 'var(--color-accent-400)' : kr.progress >= 30 ? 'var(--color-warning-400)' : 'var(--text-muted)' }}>●</span>
                      <span style={{ flex: 1 }}>{kr.title}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{kr.progress}%</span>
                    </div>
                  ))}
                </div>}
              </div>
            ))}
          </div>
        ) : <div className="empty-state"><h3>No objectives</h3><p>Create objectives and key results.</p></div>
      )}

      {tab === 'keyresults' && (
        allKRs.length > 0 ? (
          <div className="table-wrapper"><table className="table-base">
            <thead><tr><th>Key Result</th><th>Objective</th><th>Target</th><th>Progress</th><th>Status</th></tr></thead>
            <tbody>{allKRs.map((kr, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{kr.title}</td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{kr.objective}</td>
                <td style={{ fontSize: 'var(--text-sm)' }}>{kr.target || '—'}</td>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 60, height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${kr.progress}%`, background: progressClr(kr.progress), borderRadius: 9999 }} /></div><span style={{ fontSize: 11, fontWeight: 600 }}>{kr.progress}%</span></div></td>
                <td><span style={{ fontSize: 10, fontWeight: 600, color: kr.progress >= 100 ? 'var(--color-accent-400)' : 'var(--color-primary-400)' }}>{kr.progress >= 100 ? 'DONE' : 'ACTIVE'}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <div className="empty-state"><h3>No key results</h3></div>
      )}

      {tab === 'team' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
          {md.employees.slice(0, 8).map((emp: any) => {
            const empGoals = goals.filter(g => g.ownerId === emp.id || g.ownerName === `${emp.firstName} ${emp.lastName}`);
            const empProgress = empGoals.length > 0 ? Math.round(empGoals.reduce((s: number, g: any) => s + (g.progress || 0), 0) / empGoals.length) : 0;
            return (
              <div key={emp.id} className="stat-card" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div className="avatar avatar-sm">{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                  <div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{empGoals.length} objectives</div></div>
                </div>
                <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', marginBottom: 4 }}><div style={{ height: '100%', width: `${empProgress}%`, background: progressClr(empProgress), borderRadius: 9999 }} /></div>
                <div style={{ fontSize: 11, textAlign: 'right', color: progressClr(empProgress), fontWeight: 600 }}>{empProgress}%</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Objective */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Objective</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Objective Title *</label><input className="input-field" name="title" required placeholder="Increase customer retention by 20%" /></div>
          <div><label className="input-label">Description</label><textarea className="input-field" name="desc" rows={2} placeholder="What does success look like?" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category</label><select className="input-field" name="category"><option value="COMPANY">Company</option><option value="TEAM">Team</option><option value="INDIVIDUAL">Individual</option></select></div>
            <div><label className="input-label">Priority</label><select className="input-field" name="priority"><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="LOW">Low</option></select></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Start</label><input className="input-field" name="start" type="date" /></div>
            <div><label className="input-label">End</label><input className="input-field" name="end" type="date" /></div>
          </div>
          <div><label className="input-label">Owner</label><select className="input-field" name="owner"><option value="">Select...</option>{md.employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}</select></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div><h2>{editing ? <input className="input-field" style={{ height: 30, fontWeight: 700, fontSize: 'var(--text-lg)' }} value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} /> : showDetail.title}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.category} · {showDetail.priority}</p></div><div style={{ display: 'flex', gap: 8 }}>{editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}<button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['ACTIVE', 'COMPLETED', 'PAUSED'].map(s => (
              <button key={s} onClick={() => updateGoal(showDetail.id, { status: s })} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'COMPLETED' ? 'rgba(16,185,129,0.12)' : 'rgba(59,130,246,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? (s === 'COMPLETED' ? 'var(--color-accent-400)' : 'var(--color-primary-400)') : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>

          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: progressClr(showDetail.progress || 0) }}>{showDetail.progress || 0}%</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Overall Progress</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Key Results ({(showDetail.keyResults || []).length})</div>
            <button className="btn btn-sm" style={{ height: 28, fontSize: 11 }} onClick={() => setShowAddKR(true)}>+ Add KR</button>
          </div>

          {(showDetail.keyResults || []).map((kr: any, i: number) => (
            <div key={i} style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{kr.title}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: progressClr(kr.progress || 0) }}>{kr.progress || 0}%</span><button onClick={() => deleteKR(showDetail.id, kr.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }} title="Remove KR">✕</button></div>
              </div>
              <input type="range" min="0" max="100" value={kr.progress || 0} onChange={e => updateKRProgress(showDetail.id, kr.id, parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-primary-500)' }} />
              {kr.target && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Target: {kr.target}</div>}
            </div>
          ))}
          {(showDetail.keyResults || []).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No key results yet. Add some!</p>}
        </div>
      </div></div>}

      {/* Add Key Result */}
      {showAddKR && showDetail && <div className="modal-overlay" onClick={() => setShowAddKR(false)}><div className="modal-content" style={{ maxWidth: 450 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Key Result</h2><button onClick={() => setShowAddKR(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={e => { e.preventDefault(); const f = e.target as HTMLFormElement; addKeyResult(showDetail.id, { title: (f.elements.namedItem('title') as HTMLInputElement).value, target: (f.elements.namedItem('target') as HTMLInputElement).value }); }}>
          <div><label className="input-label">Key Result *</label><input className="input-field" name="title" required placeholder="Ship v2.0 to production" /></div>
          <div><label className="input-label">Target / Metric</label><input className="input-field" name="target" placeholder="100 users, ₹50L revenue" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAddKR(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
        </form>
      </div></div>}
      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.title}"?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This objective and all key results will be permanently removed.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteGoal(deleteConfirm.id)}>Delete</button></div>
      </div></div>}
    </div>
  );
}
