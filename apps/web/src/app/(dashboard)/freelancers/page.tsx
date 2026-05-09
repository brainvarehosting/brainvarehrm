'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

export default function FreelancersPage() {
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    fetch('/api/freelancers').then(r => r.json()).then(d => setFreelancers(d.data || d || [])).catch(() => {});
  }, []);

  const filtered = freelancers.filter(f => {
    const s = search.toLowerCase();
    const matchS = !s || `${f.name} ${f.email} ${f.skill} ${f.company}`.toLowerCase().includes(s);
    return matchS && (statusFilter === 'ALL' || f.status === statusFilter);
  });

  const stats = { total: freelancers.length, active: freelancers.filter(f => f.status === 'ACTIVE').length, completed: freelancers.filter(f => f.status === 'COMPLETED').length };
  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fm = (n: number) => n ? `₹${n.toLocaleString('en-IN')}` : '—';

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    const body: any = {};
    ['name', 'email', 'phone', 'skill', 'company', 'projectName', 'contractStart', 'contractEnd', 'rate', 'rateType', 'currency', 'status', 'notes'].forEach(k => {
      const el = f.elements.namedItem(k) as HTMLInputElement;
      if (el?.value) body[k] = el.value;
    });
    if (body.rate) body.rate = parseFloat(body.rate);
    try {
      const res = await fetch('/api/freelancers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const created = await res.json(); setFreelancers([...freelancers, created]); setShowCreate(false); toast('Freelancer added', 'success'); }
      else { const err = await res.json(); toast(err.error || 'Failed', 'error'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleUpdate = async () => {
    try {
      const body = { ...editData };
      if (body.rate) body.rate = parseFloat(body.rate);
      const res = await fetch('/api/freelancers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showDetail.id, ...body }) });
      if (res.ok) { const u = await res.json(); setFreelancers(freelancers.map(f => f.id === showDetail.id ? { ...f, ...u } : f)); setShowDetail({ ...showDetail, ...u }); setEditing(false); toast('Updated', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this freelancer?')) return;
    try { await fetch('/api/freelancers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); setFreelancers(freelancers.filter(f => f.id !== id)); setShowDetail(null); toast('Removed', 'success'); } catch { toast('Failed', 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Freelancers & Contractors</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{stats.total} total · {stats.active} active engagements</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Freelancer</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total', v: stats.total, c: 'var(--text-primary)' }, { l: 'Active', v: stats.active, c: 'var(--color-accent-400)' }, { l: 'Completed', v: stats.completed, c: 'var(--color-primary-400)' }, { l: 'Budget', v: `₹${(freelancers.reduce((s, f) => s + (f.rate || 0), 0) / 1000).toFixed(0)}K`, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <input className="input-field" style={{ flex: 1 }} placeholder="Search name, email, skill..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input-field" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="ON_HOLD">On Hold</option><option value="COMPLETED">Completed</option><option value="TERMINATED">Terminated</option></select>
      </div>

      {filtered.length > 0 ? (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Name</th><th>Skill</th><th>Project</th><th>Contract</th><th>Rate</th><th>Status</th><th>Company</th><th></th></tr></thead>
          <tbody>{filtered.map(f => (
            <tr key={f.id} style={{ cursor: 'pointer' }} onClick={() => { setShowDetail(f); setEditData(f); setEditing(false); }}>
              <td><div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{f.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{f.email}</div></div></td>
              <td style={{ fontSize: 'var(--text-sm)' }}>{f.skill || '—'}</td>
              <td style={{ fontSize: 'var(--text-sm)' }}>{f.projectName || '—'}</td>
              <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fd(f.contractStart)} → {fd(f.contractEnd)}</td>
              <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{fm(f.rate)}<span style={{ fontSize: 10, color: 'var(--text-muted)' }}>/{f.rateType || 'mo'}</span></td>
              <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, color: f.status === 'ACTIVE' ? 'var(--color-accent-400)' : f.status === 'COMPLETED' ? 'var(--color-primary-400)' : 'var(--text-muted)', background: f.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : f.status === 'COMPLETED' ? 'rgba(59,130,246,0.12)' : 'var(--bg-tertiary)' }}>{f.status}</span></td>
              <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{f.company || '—'}</td>
              <td><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty-state"><h3>No freelancers found</h3><p>Add freelancers and contractors here.</p></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Freelancer</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Contact</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Name *</label><input className="input-field" name="name" required placeholder="Priya Sharma" /></div>
            <div><label className="input-label">Email *</label><input className="input-field" name="email" type="email" required placeholder="priya@freelance.com" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Phone</label><input className="input-field" name="phone" placeholder="+91 99999 99999" /></div>
            <div><label className="input-label">Company</label><input className="input-field" name="company" placeholder="Self / Agency name" /></div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 8 }}>Engagement</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Skill / Expertise</label><input className="input-field" name="skill" placeholder="UI/UX Design" /></div>
            <div><label className="input-label">Project Name</label><input className="input-field" name="projectName" placeholder="HRM Redesign" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Contract Start</label><input className="input-field" name="contractStart" type="date" /></div>
            <div><label className="input-label">Contract End</label><input className="input-field" name="contractEnd" type="date" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Rate (₹)</label><input className="input-field" name="rate" type="number" placeholder="50000" /></div>
            <div><label className="input-label">Rate Type</label><select className="input-field" name="rateType"><option value="MONTHLY">Monthly</option><option value="HOURLY">Hourly</option><option value="FIXED">Fixed</option></select></div>
            <div><label className="input-label">Status</label><select className="input-field" name="status"><option value="ACTIVE">Active</option><option value="ON_HOLD">On Hold</option><option value="COMPLETED">Completed</option></select></div>
          </div>
          <div><label className="input-label">Notes</label><textarea className="input-field" name="notes" rows={3} placeholder="Any additional notes..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Freelancer</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 650 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div><h2>{showDetail.name}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.email} · {showDetail.skill}</p></div><div style={{ display: 'flex', gap: 8 }}>
          {editing ? <><button className="btn btn-ghost" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Save</button></> : <><button className="btn btn-ghost" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-danger btn-sm" onClick={() => handleDelete(showDetail.id)}>Delete</button></>}
          <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['ACTIVE','ON_HOLD','COMPLETED','TERMINATED'].map(s => (
              <button key={s} onClick={() => editing && setEditData({ ...editData, status: s })} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: (editing ? editData.status : showDetail.status) === s ? (s === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : s === 'COMPLETED' ? 'rgba(59,130,246,0.12)' : s === 'TERMINATED' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: (editing ? editData.status : showDetail.status) === s ? (s === 'ACTIVE' ? 'var(--color-accent-400)' : s === 'COMPLETED' ? 'var(--color-primary-400)' : s === 'TERMINATED' ? 'var(--color-danger-400)' : 'var(--color-warning-400)') : 'var(--text-muted)', cursor: editing ? 'pointer' : 'default', border: 'none' }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[
              { l: 'Name', f: 'name', v: showDetail.name },
              { l: 'Email', f: 'email', v: showDetail.email },
              { l: 'Phone', f: 'phone', v: showDetail.phone },
              { l: 'Company', f: 'company', v: showDetail.company },
              { l: 'Skill', f: 'skill', v: showDetail.skill },
              { l: 'Project', f: 'projectName', v: showDetail.projectName },
              { l: 'Contract Start', f: 'contractStart', v: fd(showDetail.contractStart), isDate: true },
              { l: 'Contract End', f: 'contractEnd', v: fd(showDetail.contractEnd), isDate: true },
              { l: 'Rate', f: 'rate', v: fm(showDetail.rate) },
              { l: 'Rate Type', f: 'rateType', v: showDetail.rateType || 'MONTHLY' },
            ].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>
              {editing ? <input className="input-field" type={(item as any).isDate ? 'date' : item.f === 'rate' ? 'number' : 'text'} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} style={{ height: 30, fontSize: 'var(--text-sm)', marginTop: 2 }} /> : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2 }}>{item.v || '—'}</div>}</div>
            ))}
          </div>
          {showDetail.notes && <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, marginBottom: 4 }}>Notes</div><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{showDetail.notes}</p></div>}
        </div>
      </div></div>}
    </div>
  );
}
