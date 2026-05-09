'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'programs' | 'calendar' | 'reports';

export default function TrainingPage() {
  const [tab, setTab] = useState<Tab>('programs');
  const [programs, setPrograms] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => { fetch('/api/training').then(r => r.json()).then(d => setPrograms(d.data || [])).catch(() => {}); }, []);

  const stats = { total: programs.length, active: programs.filter(p => ['ACTIVE', 'IN_PROGRESS'].includes(p.status)).length, completed: programs.filter(p => p.status === 'COMPLETED').length, totalHours: programs.reduce((s, p) => s + (p.duration || 0), 0), totalParticipants: programs.reduce((s, p) => s + (p.participants || 0), 0) };
  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const statusClr = (s: string) => ['ACTIVE', 'IN_PROGRESS'].includes(s) ? 'var(--color-accent-400)' : s === 'COMPLETED' ? 'var(--color-primary-400)' : s === 'UPCOMING' ? 'var(--color-warning-400)' : 'var(--text-muted)';

  const handleCreate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement; const body: any = {};
    ['title', 'category', 'trainer', 'location', 'description', 'mode', 'startDate', 'endDate', 'prerequisites', 'objectives'].forEach(k => { const el = f.elements.namedItem(k) as HTMLInputElement; if (el?.value) body[k] = el.value; });
    body.duration = parseInt((f.elements.namedItem('duration') as HTMLInputElement)?.value) || 0;
    body.maxParticipants = parseInt((f.elements.namedItem('max') as HTMLInputElement)?.value) || 30;
    body.cost = (f.elements.namedItem('cost') as HTMLInputElement)?.value || '';
    body.status = 'UPCOMING'; body.participants = 0;
    try { const res = await fetch('/api/training', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (res.ok) { const t = await res.json(); setPrograms([...programs, { ...body, ...t }]); setShowCreate(false); toast('Program created!', 'success'); } } catch { toast('Failed', 'error'); }
  };

  const saveEdits = async () => {
    try { await fetch('/api/training', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, ...editData }) }); setPrograms(programs.map(p => p.id === showDetail.id ? { ...p, ...editData } : p)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); } catch { toast('Failed', 'error'); }
  };

  const deleteProgram = (id: string) => { setPrograms(programs.filter(p => p.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Program deleted', 'success'); };

  const InfoField = ({ label, value, editMode, field, data, setData, type, options, rows }: any) => (
    <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em' }}>{label}</div>
    {editMode ? (rows ? <textarea className="input-field" rows={rows} style={{ marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })} /> : options ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })}>{options.map((o: any) => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}</select> : <input className="input-field" type={type || 'text'} style={{ height: 30, marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })} />) : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{value || '—'}</div>}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Training & Development</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{stats.total} programs · {stats.totalHours}h · {stats.totalParticipants} participants</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Program</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Programs', v: stats.total, c: 'var(--text-primary)' }, { l: 'Active', v: stats.active, c: 'var(--color-accent-400)' }, { l: 'Completed', v: stats.completed, c: 'var(--color-primary-400)' }, { l: 'Hours', v: stats.totalHours, c: 'var(--color-warning-400)' }, { l: 'Participants', v: stats.totalParticipants, c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'programs' as Tab, l: 'All Programs' }, { k: 'calendar' as Tab, l: 'Calendar' }, { k: 'reports' as Tab, l: 'Reports' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'programs' && (programs.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {programs.map(p => (
            <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer', transition: 'border-color 0.2s' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, color: statusClr(p.status), background: p.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : p.status === 'COMPLETED' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)' }}>{p.status}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.category || 'General'}</span>
              </div>
              <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{p.title}</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>{(p.description || 'No description').substring(0, 80)}{(p.description || '').length > 80 ? '...' : ''}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                <span>🕐 {p.duration || 0}h</span><span>👥 {p.participants || 0}/{p.maxParticipants || 30}</span><span>📍 {p.mode || 'ONLINE'}</span><span>📅 {fd(p.startDate)}</span>
              </div>
              {p.trainer && <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-secondary)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Trainer: <strong>{p.trainer}</strong></div>}
              {(p.participants || 0) > 0 && <div style={{ marginTop: 8, height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${((p.participants || 0) / (p.maxParticipants || 30)) * 100}%`, background: 'var(--color-accent-500)', borderRadius: 9999 }} /></div>}
            </div>
          ))}
        </div>
      ) : <div className="empty-state"><h3>No programs</h3></div>)}

      {tab === 'calendar' && (
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Training Schedule</h3>
          {programs.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime()).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-secondary)', cursor: 'pointer' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
              <div style={{ width: 48, height: 48, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary-400)' }}>{p.startDate ? new Date(p.startDate).getDate() : '—'}</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{p.startDate ? new Date(p.startDate).toLocaleDateString('en-IN', { month: 'short' }) : ''}</span>
              </div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{p.title}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.duration}h · {p.trainer || 'TBD'} · {p.mode}</div></div>
              <span style={{ fontSize: 10, fontWeight: 600, color: statusClr(p.status) }}>{p.status}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>By Category</h3>
            {['Technical', 'Soft Skills', 'Compliance', 'Leadership', 'Safety', 'Product'].map(c => { const cnt = programs.filter(p => (p.category || '').toLowerCase() === c.toLowerCase()).length; return <div key={c} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--border-secondary)' }}><span>{c}</span><span style={{ fontWeight: 600 }}>{cnt}</span></div>; })}
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Completion Rate</h3>
            <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-accent-400)' }}>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{stats.completed} of {stats.total} completed</div></div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.title}"?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This training program will be permanently removed.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteProgram(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Training Program</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Program Info</div>
          <div><label className="input-label">Title *</label><input className="input-field" name="title" required placeholder="React Advanced Patterns" /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category</label><select className="input-field" name="category"><option value="Technical">Technical</option><option value="Soft Skills">Soft Skills</option><option value="Compliance">Compliance</option><option value="Leadership">Leadership</option><option value="Safety">Safety</option><option value="Product">Product</option></select></div>
            <div><label className="input-label">Mode</label><select className="input-field" name="mode"><option value="ONLINE">Online</option><option value="CLASSROOM">Classroom</option><option value="HYBRID">Hybrid</option><option value="SELF_PACED">Self-paced</option></select></div>
            <div><label className="input-label">Cost</label><input className="input-field" name="cost" placeholder="₹15,000 / Free" /></div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Schedule</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Duration (hrs)</label><input className="input-field" name="duration" type="number" placeholder="8" /></div>
            <div><label className="input-label">Start Date</label><input className="input-field" name="startDate" type="date" /></div>
            <div><label className="input-label">End Date</label><input className="input-field" name="endDate" type="date" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Max Participants</label><input className="input-field" name="max" type="number" placeholder="30" /></div>
            <div><label className="input-label">Trainer</label><input className="input-field" name="trainer" placeholder="External - Dr. Sharma" /></div>
          </div>
          <div><label className="input-label">Description</label><textarea className="input-field" name="description" rows={3} placeholder="Detailed program description..." /></div>
          <div><label className="input-label">Prerequisites</label><input className="input-field" name="prerequisites" placeholder="Basic React knowledge, 2+ years experience" /></div>
          <div><label className="input-label">Learning Objectives</label><textarea className="input-field" name="objectives" rows={2} placeholder="By the end, participants will be able to..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Program</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>{showDetail.title}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.category} · {showDetail.mode}</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['UPCOMING', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(s => (
              <button key={s} onClick={() => { const d = { ...editData, status: s }; setEditData(d); if (!editing) { fetch('/api/training', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, status: s }) }); setPrograms(programs.map(p => p.id === showDetail.id ? { ...p, status: s } : p)); setShowDetail({ ...showDetail, status: s }); toast('Status updated', 'success'); } }} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : s === 'COMPLETED' ? 'rgba(59,130,246,0.12)' : s === 'CANCELLED' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? statusClr(s) : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <InfoField label="Title" value={showDetail.title} editMode={editing} field="title" data={editData} setData={setEditData} />
            <InfoField label="Category" value={showDetail.category} editMode={editing} field="category" data={editData} setData={setEditData} options={['Technical','Soft Skills','Compliance','Leadership','Safety','Product']} />
            <InfoField label="Mode" value={showDetail.mode} editMode={editing} field="mode" data={editData} setData={setEditData} options={['ONLINE','CLASSROOM','HYBRID','SELF_PACED'].map(o => ({ v: o, l: o.replace(/_/g, ' ') }))} />
            <InfoField label="Duration" value={`${showDetail.duration || 0} hours`} editMode={editing} field="duration" data={editData} setData={setEditData} type="number" />
            <InfoField label="Trainer" value={showDetail.trainer} editMode={editing} field="trainer" data={editData} setData={setEditData} />
            <InfoField label="Cost" value={showDetail.cost} editMode={editing} field="cost" data={editData} setData={setEditData} />
            <InfoField label="Start Date" value={fd(showDetail.startDate)} editMode={editing} field="startDate" data={editData} setData={setEditData} type="date" />
            <InfoField label="End Date" value={fd(showDetail.endDate)} editMode={editing} field="endDate" data={editData} setData={setEditData} type="date" />
            <InfoField label="Participants" value={`${showDetail.participants || 0}/${showDetail.maxParticipants || 30}`} editMode={editing} field="maxParticipants" data={editData} setData={setEditData} type="number" />
          </div>

          {/* Progress */}
          <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 'var(--text-xs)' }}><span style={{ color: 'var(--text-muted)' }}>Enrollment Progress</span><span style={{ fontWeight: 600 }}>{showDetail.participants || 0}/{showDetail.maxParticipants || 30}</span></div>
            <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${((showDetail.participants || 0) / (showDetail.maxParticipants || 30)) * 100}%`, background: 'var(--color-accent-500)', borderRadius: 9999, transition: 'width 0.5s' }} /></div>
          </div>

          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Description</div>{editing ? <textarea className="input-field" rows={3} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.description || 'No description.'}</p>}</div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Prerequisites</div>{editing ? <input className="input-field" value={editData.prerequisites || ''} onChange={e => setEditData({ ...editData, prerequisites: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{showDetail.prerequisites || 'None'}</p>}</div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Learning Objectives</div>{editing ? <textarea className="input-field" rows={2} value={editData.objectives || ''} onChange={e => setEditData({ ...editData, objectives: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{showDetail.objectives || 'Not specified.'}</p>}</div>
        </div>
      </div></div>}
    </div>
  );
}
