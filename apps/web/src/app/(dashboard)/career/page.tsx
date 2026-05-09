'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'paths' | 'framework' | 'employee';

export default function CareerPage() {
  const [tab, setTab] = useState<Tab>('paths');
  const [paths, setPaths] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [md, setMd] = useState<any>({ employees: [], departments: [] });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/career').then(r => r.json()).then(d => setPaths(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const stats = { total: paths.length, departments: new Set(paths.map(p => p.department)).size };

  const handleCreate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body = { title: (f.elements.namedItem('title') as HTMLInputElement).value, department: (f.elements.namedItem('dept') as HTMLSelectElement).value, description: (f.elements.namedItem('desc') as HTMLInputElement).value, levels: [
      { title: (f.elements.namedItem('l1') as HTMLInputElement).value || 'Junior', grade: 'L1', yearsExp: '0-2', skills: '' },
      { title: (f.elements.namedItem('l2') as HTMLInputElement).value || 'Mid-Level', grade: 'L2', yearsExp: '2-4', skills: '' },
      { title: (f.elements.namedItem('l3') as HTMLInputElement).value || 'Senior', grade: 'L3', yearsExp: '4-7', skills: '' },
      { title: (f.elements.namedItem('l4') as HTMLInputElement).value || 'Lead', grade: 'L4', yearsExp: '7+', skills: '' },
    ] };
    try {
      const res = await fetch('/api/career', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const p = await res.json(); setPaths([...paths, p]); setShowCreate(false); toast('Career path created!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const saveEdits = async () => { try { await fetch('/api/career', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, ...editData }) }); setPaths(paths.map(p => p.id === showDetail.id ? { ...p, ...editData } : p)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); } catch { toast('Failed', 'error'); } };
  const deletePath = (id: string) => { setPaths(paths.filter(p => p.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Path deleted', 'success'); };

  const gradeColors = ['#94a3b8', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Career Paths</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{stats.total} paths across {stats.departments} departments</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Path</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Career Paths', v: stats.total, c: 'var(--text-primary)' }, { l: 'Departments', v: stats.departments, c: 'var(--color-primary-400)' }, { l: 'Levels', v: paths.reduce((s, p) => s + ((p.levels || []).length || 4), 0), c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'paths' as Tab, l: 'All Paths' }, { k: 'framework' as Tab, l: 'Level Framework' }, { k: 'employee' as Tab, l: 'Employee Mapping' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'paths' && (
        paths.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
            {paths.map((p, pi) => (
              <div key={p.id || pi} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' }}>{p.department || '—'}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{(p.levels || []).length || 4} levels</span>
                </div>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>{p.title}</h3>
                {p.description && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>{p.description}</p>}
                {/* Level dots */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {(p.levels || [{ title: 'Jr' }, { title: 'Mid' }, { title: 'Sr' }, { title: 'Lead' }]).map((l: any, i: number, arr: any[]) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: `${gradeColors[i % gradeColors.length]}20`, border: `2px solid ${gradeColors[i % gradeColors.length]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: gradeColors[i % gradeColors.length] }}>{i + 1}</span>
                      </div>
                      {i < arr.length - 1 && <div style={{ width: 16, height: 2, background: 'var(--border-primary)' }} />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : <div className="empty-state"><h3>No career paths</h3><p>Define growth trajectories for your team.</p></div>
      )}

      {tab === 'framework' && (
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Level Framework</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[{ g: 'L1', t: 'Junior / Associate', y: '0-2 years', s: 'Basic skills, mentored', c: '#94a3b8' }, { g: 'L2', t: 'Mid-Level', y: '2-4 years', s: 'Independent contributor', c: '#3b82f6' }, { g: 'L3', t: 'Senior', y: '4-7 years', s: 'Expert, mentors others', c: '#8b5cf6' }, { g: 'L4', t: 'Lead / Principal', y: '7-10 years', s: 'Technical leadership', c: '#f59e0b' }, { g: 'L5', t: 'Director / VP', y: '10+ years', s: 'Strategic leadership', c: '#10b981' }, { g: 'L6', t: 'C-Suite', y: '15+ years', s: 'Organization leadership', c: '#ec4899' }].map(level => (
              <div key={level.g} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-3)', background: `${level.c}08`, border: `1px solid ${level.c}25`, borderRadius: 'var(--radius-md)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${level.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: level.c }}>{level.g}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{level.t}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{level.s}</div>
                </div>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{level.y}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{md.employees.filter((_: any, i: number) => i % 6 === parseInt(level.g[1]) - 1).length}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'employee' && (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Employee</th><th>Current Level</th><th>Career Path</th><th>Next Level</th><th>Readiness</th></tr></thead>
          <tbody>{md.employees.slice(0, 10).map((emp: any, i: number) => {
            const currentLevel = ['L1', 'L2', 'L3', 'L4', 'L2', 'L3', 'L1', 'L4', 'L2', 'L3'][i % 10];
            const path = paths[i % Math.max(paths.length, 1)]?.title || 'Engineering';
            const nextLevel = `L${Math.min(parseInt(currentLevel[1]) + 1, 6)}`;
            const readiness = ['On Track', 'Ready', 'Developing', 'On Track'][i % 4];
            return (
              <tr key={emp.id}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar avatar-sm">{emp.firstName?.[0]}{emp.lastName?.[0]}</div><div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{emp.firstName} {emp.lastName}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{emp.employeeCode}</div></div></div></td>
                <td><span style={{ fontSize: 12, fontWeight: 700, color: gradeColors[parseInt(currentLevel[1]) - 1] }}>{currentLevel}</span></td>
                <td style={{ fontSize: 'var(--text-sm)' }}>{path}</td>
                <td style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-primary-400)' }}>{nextLevel} →</td>
                <td><span style={{ fontSize: 11, fontWeight: 600, color: readiness === 'Ready' ? 'var(--color-accent-400)' : readiness === 'On Track' ? 'var(--color-primary-400)' : 'var(--color-warning-400)' }}>{readiness}</span></td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Career Path</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Path Name *</label><input className="input-field" name="title" required placeholder="Software Engineering Track" /></div>
          <div><label className="input-label">Department</label><select className="input-field" name="dept"><option value="">Select...</option>{md.departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
          <div><label className="input-label">Description</label><textarea className="input-field" name="desc" rows={2} placeholder="Growth trajectory..." /></div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Define Levels</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Level 1</label><input className="input-field" name="l1" placeholder="Junior Engineer" /></div>
            <div><label className="input-label">Level 2</label><input className="input-field" name="l2" placeholder="Engineer" /></div>
            <div><label className="input-label">Level 3</label><input className="input-field" name="l3" placeholder="Senior Engineer" /></div>
            <div><label className="input-label">Level 4</label><input className="input-field" name="l4" placeholder="Staff Engineer" /></div>
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Path</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.title}"?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This career path will be permanently removed.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deletePath(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.title}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{showDetail.title}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Department</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.department || ''} onChange={e => setEditData({ ...editData, department: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.department || '—'}</div>}</div>
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Description</div>{editing ? <textarea className="input-field" rows={2} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.description || 'No description'}</p>}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Career Ladder</div>
          {(showDetail.levels || []).map((l: any, i: number) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${gradeColors[i % gradeColors.length]}` }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${gradeColors[i % gradeColors.length]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: gradeColors[i % gradeColors.length] }}>{l.grade || `L${i + 1}`}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{l.title}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.yearsExp || `${i * 2}-${(i + 1) * 2} years`}</div>
              </div>
            </div>
          ))}
        </div>
      </div></div>}
    </div>
  );
}
