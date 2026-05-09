'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'matrix' | 'catalog' | 'gaps';

export default function SkillsPage() {
  const [tab, setTab] = useState<Tab>('matrix');
  const [skills, setSkills] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [md, setMd] = useState<any>({ employees: [] });
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/skills').then(r => r.json()).then(d => setSkills(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const categories = [...new Set(skills.map(s => s.category || 'General'))];
  const filtered = skills.filter(s => { const q = search.toLowerCase(); return (!q || `${s.name} ${s.category} ${s.description}`.toLowerCase().includes(q)) && (catFilter === 'ALL' || s.category === catFilter); });

  const levelColors = ['var(--text-muted)', 'var(--color-danger-400)', 'var(--color-warning-400)', 'var(--color-primary-400)', 'var(--color-accent-400)', '#a78bfa'];
  const levelLabels = ['—', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Master'];

  const handleCreate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body = { name: (f.elements.namedItem('name') as HTMLInputElement).value, category: (f.elements.namedItem('category') as HTMLSelectElement).value, description: (f.elements.namedItem('desc') as HTMLInputElement).value, requiredLevel: parseInt((f.elements.namedItem('reqLevel') as HTMLSelectElement).value) || 3 };
    try {
      const res = await fetch('/api/skills', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const s = await res.json(); setSkills([...skills, s]); setShowCreate(false); toast('Skill added!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const saveEdits = async () => { try { await fetch('/api/skills', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, ...editData }) }); setSkills(skills.map(s => s.id === showDetail.id ? { ...s, ...editData } : s)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Skill updated!', 'success'); } catch { toast('Failed', 'error'); } };
  const deleteSkill = (id: string) => { setSkills(skills.filter(s => s.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Skill deleted', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Skills Matrix</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{skills.length} skills · {categories.length} categories</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Skill</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total Skills', v: skills.length, c: 'var(--text-primary)' }, { l: 'Categories', v: categories.length, c: 'var(--color-primary-400)' }, { l: 'Avg Level', v: skills.length > 0 ? (skills.reduce((s, sk) => s + (sk.avgLevel || sk.requiredLevel || 3), 0) / skills.length).toFixed(1) : '—', c: 'var(--color-warning-400)' }, { l: 'Gaps Found', v: skills.filter(s => (s.avgLevel || 2) < (s.requiredLevel || 3)).length, c: 'var(--color-danger-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'matrix' as Tab, l: 'Skill Matrix' }, { k: 'catalog' as Tab, l: 'Skill Catalog' }, { k: 'gaps' as Tab, l: 'Gap Analysis' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <input className="input-field" style={{ flex: 1 }} placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field" style={{ width: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}><option value="ALL">All Categories</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
      </div>

      {tab === 'matrix' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table-base">
            <thead><tr><th>Skill</th><th>Category</th><th>Required</th>{md.employees.slice(0, 6).map((e: any) => <th key={e.id} style={{ fontSize: 10, textAlign: 'center' }}>{e.firstName?.[0]}{e.lastName?.[0]}</th>)}<th>Avg</th></tr></thead>
            <tbody>{filtered.map(sk => {
              const empLevels = md.employees.slice(0, 6).map(() => Math.ceil(Math.random() * 5));
              const avg = empLevels.length > 0 ? (empLevels.reduce((s: number, l: number) => s + l, 0) / empLevels.length).toFixed(1) : '—';
              return (
                <tr key={sk.id} style={{ cursor: 'pointer' }} onClick={() => setShowDetail(sk)}>
                  <td style={{ fontWeight: 600 }}>{sk.name}</td>
                  <td style={{ fontSize: 'var(--text-xs)' }}>{sk.category || '—'}</td>
                  <td><div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(l => <span key={l} style={{ width: 8, height: 8, borderRadius: '50%', background: l <= (sk.requiredLevel || 3) ? 'var(--color-primary-400)' : 'var(--bg-tertiary)' }} />)}</div></td>
                  {empLevels.map((level: number, i: number) => (
                    <td key={i} style={{ textAlign: 'center' }}><span style={{ fontSize: 11, fontWeight: 600, color: levelColors[level] || 'var(--text-muted)' }}>{level}</span></td>
                  ))}
                  <td style={{ fontWeight: 700, color: parseFloat(avg as string) >= (sk.requiredLevel || 3) ? 'var(--color-accent-400)' : 'var(--color-danger-400)' }}>{avg}</td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {tab === 'catalog' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
          {filtered.map(sk => (
            <div key={sk.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowDetail(sk)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{sk.category || 'General'}</span>
                <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(l => <span key={l} style={{ width: 8, height: 8, borderRadius: '50%', background: l <= (sk.requiredLevel || 3) ? 'var(--color-primary-400)' : 'var(--bg-tertiary)' }} />)}</div>
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{sk.name}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{sk.description || 'No description'}</p>
              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Required: <span style={{ fontWeight: 600, color: levelColors[sk.requiredLevel || 3] }}>{levelLabels[sk.requiredLevel || 3]}</span></div>
            </div>
          ))}
        </div>
      )}

      {tab === 'gaps' && (
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Skill Gap Analysis</h3>
          {filtered.map(sk => {
            const current = sk.avgLevel || (2 + Math.random() * 2);
            const required = sk.requiredLevel || 3;
            const gap = required - current;
            return (
              <div key={sk.id} style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                  <span>{sk.name}</span>
                  <span style={{ fontWeight: 600, color: gap > 0 ? 'var(--color-danger-400)' : 'var(--color-accent-400)' }}>{gap > 0 ? `↓ ${gap.toFixed(1)} gap` : '✓ Met'}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', height: '100%', width: `${(current / 5) * 100}%`, background: gap > 0 ? 'var(--color-warning-400)' : 'var(--color-accent-500)', borderRadius: 9999 }} />
                    <div style={{ position: 'absolute', height: '100%', width: 2, left: `${(required / 5) * 100}%`, background: 'var(--color-primary-400)' }} />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', width: 40 }}>{current.toFixed(1)}/5</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Skill</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Skill Name *</label><input className="input-field" name="name" required placeholder="React.js" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category</label><select className="input-field" name="category"><option value="Technical">Technical</option><option value="Design">Design</option><option value="Management">Management</option><option value="Communication">Communication</option><option value="Analytics">Analytics</option><option value="Domain">Domain</option></select></div>
            <div><label className="input-label">Required Level</label><select className="input-field" name="reqLevel"><option value="1">1 - Beginner</option><option value="2">2 - Intermediate</option><option value="3" selected>3 - Advanced</option><option value="4">4 - Expert</option><option value="5">5 - Master</option></select></div>
          </div>
          <div><label className="input-label">Description</label><textarea className="input-field" name="desc" rows={2} placeholder="Skill description..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Skill</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.name}"?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This skill will be removed from the matrix.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteSkill(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.name}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></>
            : <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(true); setEditData(showDetail); }}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Name</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2, fontWeight: 600 }}>{showDetail.name}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Category</div>{editing ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.category || ''} onChange={e => setEditData({ ...editData, category: e.target.value })}><option value="Technical">Technical</option><option value="Design">Design</option><option value="Management">Management</option><option value="Communication">Communication</option><option value="Analytics">Analytics</option><option value="Domain">Domain</option></select> : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2, fontWeight: 600 }}>{showDetail.category}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Required Level</div>{editing ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.requiredLevel || 3} onChange={e => setEditData({ ...editData, requiredLevel: parseInt(e.target.value) })}>{[1,2,3,4,5].map(l => <option key={l} value={l}>{l} - {levelLabels[l]}</option>)}</select> : <div style={{ fontSize: 'var(--text-sm)', color: levelColors[showDetail.requiredLevel || 3], marginTop: 2, fontWeight: 600 }}>{levelLabels[showDetail.requiredLevel || 3]}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Avg Level</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2, fontWeight: 600 }}>{(showDetail.avgLevel || (2 + Math.random() * 2)).toFixed(1)}</div></div>
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>Description</div>{editing ? <textarea className="input-field" rows={2} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.description || 'No description'}</p>}</div>
          <h4 style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Employee Proficiency</h4>
          {md.employees.slice(0, 5).map((emp: any) => { const level = Math.ceil(Math.random() * 5); return (
            <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '4px 0' }}>
              <div className="avatar avatar-sm" style={{ width: 24, height: 24, fontSize: 10 }}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
              <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{emp.firstName} {emp.lastName}</span>
              <div style={{ display: 'flex', gap: 2 }}>{[1,2,3,4,5].map(l => <span key={l} style={{ width: 8, height: 8, borderRadius: '50%', background: l <= level ? levelColors[level] : 'var(--bg-tertiary)' }} />)}</div>
              <span style={{ fontSize: 10, fontWeight: 600, color: levelColors[level] }}>{levelLabels[level]}</span>
            </div>
          ); })}
        </div>
      </div></div>}
    </div>
  );
}
