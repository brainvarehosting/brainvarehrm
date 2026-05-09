'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'Open' | 'Filled' | 'On Hold' | 'Closed' | 'All';

export default function PositionsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('All');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [md, setMd] = useState<any>({ departments: [], designations: [], locations: [], grades: [] });
  const [form, setForm] = useState({ title: '', departmentId: '', designationId: '', locationId: '', gradeId: '', status: 'OPEN', headcount: '1', filledCount: '0', budgetMin: '', budgetMax: '', currency: 'INR', jobType: 'FULL_TIME', workMode: 'OFFICE', description: '', requirements: '', hiringManagerId: '' });

  useEffect(() => {
    fetch('/api/positions').then(r => r.json()).then(d => setPositions(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const filtered = positions.filter(p => {
    const s = search.toLowerCase();
    const matchS = !s || `${p.title} ${p.department?.name || ''} ${p.location?.name || ''}`.toLowerCase().includes(s);
    const matchT = tab === 'All' || p.status === tab.toUpperCase().replace(' ', '_');
    return matchS && matchT;
  });

  const stats = { total: positions.length, open: positions.filter(p => p.status === 'OPEN').length, filled: positions.filter(p => p.status === 'FILLED').length, onHold: positions.filter(p => p.status === 'ON_HOLD').length };

  const handleCreate = async () => {
    try {
      const body: any = { ...form };
      if (body.headcount) body.headcount = parseInt(body.headcount);
      if (body.filledCount) body.filledCount = parseInt(body.filledCount);
      if (body.budgetMin) body.budgetMin = parseFloat(body.budgetMin);
      if (body.budgetMax) body.budgetMax = parseFloat(body.budgetMax);
      for (const k of Object.keys(body)) if (body[k] === '') delete body[k];
      const res = await fetch('/api/positions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const p = await res.json(); setPositions([...positions, p]); setShowCreate(false); toast('Position created', 'success'); setForm({ title: '', departmentId: '', designationId: '', locationId: '', gradeId: '', status: 'OPEN', headcount: '1', filledCount: '0', budgetMin: '', budgetMax: '', currency: 'INR', jobType: 'FULL_TIME', workMode: 'OFFICE', description: '', requirements: '', hiringManagerId: '' }); }
      else { const e = await res.json(); toast(e.error || 'Failed', 'error'); }
    } catch { toast('Network error', 'error'); }
  };

  const handleUpdate = async () => {
    try {
      const body: any = { ...editData };
      if (body.headcount) body.headcount = parseInt(body.headcount);
      if (body.budgetMin) body.budgetMin = parseFloat(body.budgetMin);
      if (body.budgetMax) body.budgetMax = parseFloat(body.budgetMax);
      const res = await fetch('/api/positions', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, ...body }) });
      if (res.ok) {
        const updated = await res.json();
        setPositions(positions.map(p => p.id === showDetail.id ? { ...p, ...updated } : p));
        setShowDetail({ ...showDetail, ...updated });
        setEditing(false);
        toast('Position updated', 'success');
      }
    } catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this position?')) return;
    try {
      await fetch('/api/positions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      setPositions(positions.filter(p => p.id !== id));
      setShowDetail(null);
      toast('Position deleted', 'success');
    } catch { toast('Failed', 'error'); }
  };

  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const statusClr = (s: string) => s === 'OPEN' ? 'var(--color-accent-400)' : s === 'FILLED' ? 'var(--color-primary-400)' : s === 'ON_HOLD' ? 'var(--color-warning-400)' : 'var(--text-muted)';
  const statusBg = (s: string) => s === 'OPEN' ? 'rgba(16,185,129,0.12)' : s === 'FILLED' ? 'rgba(59,130,246,0.12)' : s === 'ON_HOLD' ? 'rgba(245,158,11,0.12)' : 'var(--bg-tertiary)';

  const Field = ({ label, children }: any) => <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label className="input-label">{label}</label>{children}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Positions</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{stats.total} positions · {stats.open} open · {stats.filled} filled</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Position</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total', v: stats.total, c: 'var(--text-primary)' }, { l: 'Open', v: stats.open, c: 'var(--color-accent-400)' }, { l: 'Filled', v: stats.filled, c: 'var(--color-primary-400)' }, { l: 'On Hold', v: stats.onHold, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        <input className="input-field" style={{ flex: 1, minWidth: 240 }} placeholder="Search positions..." value={search} onChange={e => setSearch(e.target.value)} />
        <div style={{ display: 'flex', gap: 2 }}>
          {(['All', 'Open', 'Filled', 'On Hold', 'Closed'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', fontSize: 'var(--text-sm)', borderRadius: 'var(--radius-md)', background: tab === t ? 'var(--color-primary-500)' : 'transparent', color: tab === t ? 'white' : 'var(--text-secondary)', border: tab === t ? 'none' : '1px solid var(--border-primary)', cursor: 'pointer', fontWeight: tab === t ? 600 : 400, transition: 'all 0.2s' }}>{t}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Position</th><th>Department</th><th>Location</th><th>Grade</th><th>Type</th><th>Headcount</th><th>Budget</th><th>Status</th><th>Created</th><th></th></tr></thead>
          <tbody>{filtered.map(p => (
            <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => { setShowDetail(p); setEditData(p); setEditing(false); }}>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.title}</td>
              <td>{p.department?.name || p.departmentName || '—'}</td>
              <td>{p.location?.name || p.locationName || '—'}</td>
              <td>{p.grade?.name || '—'}</td>
              <td style={{ fontSize: 'var(--text-xs)' }}>{(p.jobType || 'FULL_TIME').replace(/_/g, ' ')}</td>
              <td><span style={{ fontWeight: 700 }}>{p.filledCount || 0}</span><span style={{ color: 'var(--text-muted)' }}>/{p.headcount || 1}</span></td>
              <td>{p.budgetMin || p.budgetMax ? `₹${((p.budgetMin || 0) / 100000).toFixed(0)}–${((p.budgetMax || 0) / 100000).toFixed(0)}L` : '—'}</td>
              <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: statusBg(p.status), color: statusClr(p.status) }}>{(p.status || 'OPEN').replace(/_/g, ' ')}</span></td>
              <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fd(p.createdAt)}</td>
              <td><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty-state"><h3>No positions found</h3><p>Create your first position or adjust filters.</p></div>}

      {/* ── Create Modal ── */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Position</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Role Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Position Title *"><input className="input-field" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Senior Software Engineer" /></Field>
            <Field label="Department"><select className="input-field" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })}><option value="">Select...</option>{md.departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Location"><select className="input-field" value={form.locationId} onChange={e => setForm({ ...form, locationId: e.target.value })}><option value="">Select...</option>{md.locations.map((l: any) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></Field>
            <Field label="Grade"><select className="input-field" value={form.gradeId} onChange={e => setForm({ ...form, gradeId: e.target.value })}><option value="">Select...</option>{md.grades.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Job Type"><select className="input-field" value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })}>{['FULL_TIME','PART_TIME','CONTRACT','INTERN'].map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}</select></Field>
            <Field label="Work Mode"><select className="input-field" value={form.workMode} onChange={e => setForm({ ...form, workMode: e.target.value })}>{['OFFICE','REMOTE','HYBRID'].map(o => <option key={o} value={o}>{o}</option>)}</select></Field>
            <Field label="Status"><select className="input-field" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{['OPEN','ON_HOLD','CLOSED'].map(o => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}</select></Field>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 8 }}>Headcount & Budget</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Headcount"><input className="input-field" type="number" value={form.headcount} onChange={e => setForm({ ...form, headcount: e.target.value })} /></Field>
            <Field label="Budget Min (₹)"><input className="input-field" type="number" value={form.budgetMin} onChange={e => setForm({ ...form, budgetMin: e.target.value })} placeholder="500000" /></Field>
            <Field label="Budget Max (₹)"><input className="input-field" type="number" value={form.budgetMax} onChange={e => setForm({ ...form, budgetMax: e.target.value })} placeholder="1500000" /></Field>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 8 }}>Description</div>
          <Field label="Job Description"><textarea className="input-field" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the role responsibilities..." /></Field>
          <Field label="Requirements"><textarea className="input-field" rows={3} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="Required skills, qualifications..." /></Field>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={!form.title}>Create Position</button></div>
      </div></div>}

      {/* ── Detail Slide-over ── */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{showDetail.title}</h2>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{showDetail.department?.name || '—'} · {showDetail.location?.name || '—'} · Created {fd(showDetail.createdAt)}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <>
              <button className="btn btn-ghost" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Save</button>
            </> : <>
              <button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(showDetail.id)}>Delete</button>
            </>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status bar */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            {['OPEN','ON_HOLD','FILLED','CLOSED'].map(s => (
              <button key={s} onClick={() => { if (!editing) return; setEditData({ ...editData, status: s }); }} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: (editing ? editData.status : showDetail.status) === s ? statusBg(s) : 'var(--bg-tertiary)', color: (editing ? editData.status : showDetail.status) === s ? statusClr(s) : 'var(--text-muted)', border: (editing ? editData.status : showDetail.status) === s ? `1px solid ${statusClr(s)}` : '1px solid transparent', cursor: editing ? 'pointer' : 'default', transition: 'all 0.2s' }}>{s.replace(/_/g, ' ')}</button>
            ))}
          </div>

          {/* Detail grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { l: 'Department', v: showDetail.department?.name, f: 'departmentId', opts: md.departments.map((d: any) => ({ v: d.id, l: d.name })) },
              { l: 'Location', v: showDetail.location?.name, f: 'locationId', opts: md.locations.map((l: any) => ({ v: l.id, l: l.name })) },
              { l: 'Grade', v: showDetail.grade?.name, f: 'gradeId', opts: md.grades.map((g: any) => ({ v: g.id, l: g.name })) },
              { l: 'Job Type', v: (showDetail.jobType || 'FULL_TIME').replace(/_/g, ' '), f: 'jobType', opts: ['FULL_TIME','PART_TIME','CONTRACT','INTERN'].map(o => ({ v: o, l: o.replace(/_/g, ' ') })) },
              { l: 'Work Mode', v: showDetail.workMode || 'OFFICE', f: 'workMode', opts: ['OFFICE','REMOTE','HYBRID'].map(o => ({ v: o, l: o })) },
              { l: 'Headcount', v: `${showDetail.filledCount || 0}/${showDetail.headcount || 1}`, f: 'headcount', isNum: true },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{item.l}</span>
                {editing && item.f ? (
                  item.opts ? <select className="input-field" style={{ height: 30, fontSize: 'var(--text-sm)' }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })}><option value="">—</option>{item.opts.map((o: any) => <option key={o.v} value={o.v}>{o.l}</option>)}</select>
                  : <input className="input-field" type={item.isNum ? 'number' : 'text'} style={{ height: 30, fontSize: 'var(--text-sm)' }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} />
                ) : <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>{item.v || '—'}</span>}
              </div>
            ))}
          </div>

          {/* Budget */}
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Salary Budget</div>
            {editing ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Min (₹)</label><input className="input-field" type="number" value={editData.budgetMin || ''} onChange={e => setEditData({ ...editData, budgetMin: e.target.value })} /></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label style={{ fontSize: 11, color: 'var(--text-muted)' }}>Max (₹)</label><input className="input-field" type="number" value={editData.budgetMax || ''} onChange={e => setEditData({ ...editData, budgetMax: e.target.value })} /></div>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {showDetail.budgetMin || showDetail.budgetMax ? `₹${((showDetail.budgetMin || 0) / 100000).toFixed(1)}L – ₹${((showDetail.budgetMax || 0) / 100000).toFixed(1)}L` : 'Not specified'}
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginLeft: 8 }}>per annum</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Job Description</div>
            {editing ? <textarea className="input-field" rows={4} value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
              : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{showDetail.description || 'No description provided.'}</p>}
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Requirements</div>
            {editing ? <textarea className="input-field" rows={4} value={editData.requirements || ''} onChange={e => setEditData({ ...editData, requirements: e.target.value })} />
              : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{showDetail.requirements || 'No requirements specified.'}</p>}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
