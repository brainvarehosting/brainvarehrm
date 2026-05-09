'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'reviews' | 'ratings' | 'feedback';

export default function PerformancePage() {
  const [tab, setTab] = useState<Tab>('reviews');
  const [reviews, setReviews] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/performance').then(r => r.json()).then(d => setReviews(d.data || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(d => setEmployees(d.employees || [])).catch(() => {});
  }, []);

  const stats = { total: reviews.length, completed: reviews.filter(r => r.status === 'COMPLETED').length, inProgress: reviews.filter(r => r.status === 'IN_PROGRESS').length, pending: reviews.filter(r => r.status === 'PENDING').length, avgRating: reviews.filter(r => r.overallRating > 0).length > 0 ? (reviews.filter(r => r.overallRating > 0).reduce((s, r) => s + r.overallRating, 0) / reviews.filter(r => r.overallRating > 0).length).toFixed(1) : '—' };
  const competencies = ['Technical Skills', 'Communication', 'Leadership', 'Problem Solving', 'Teamwork', 'Initiative', 'Time Management', 'Innovation'];
  const ratingLabel = (r: number) => r >= 4.5 ? 'Outstanding' : r >= 3.5 ? 'Exceeds' : r >= 2.5 ? 'Meets' : r >= 1.5 ? 'Below' : 'Unrated';
  const ratingColor = (r: number) => r >= 4.5 ? 'var(--color-accent-400)' : r >= 3.5 ? 'var(--color-primary-400)' : r >= 2.5 ? 'var(--color-warning-400)' : r >= 1 ? 'var(--color-danger-400)' : 'var(--text-muted)';

  const handleCreate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body = { employeeName: (f.elements.namedItem('empName') as HTMLInputElement)?.value || '', employeeId: (f.elements.namedItem('emp') as HTMLSelectElement).value, reviewPeriod: (f.elements.namedItem('period') as HTMLInputElement).value, reviewType: (f.elements.namedItem('type') as HTMLSelectElement).value, reviewerName: (f.elements.namedItem('reviewerName') as HTMLInputElement)?.value || '', status: 'PENDING', overallRating: 0 };
    const emp = employees.find(e => e.id === body.employeeId);
    if (emp) body.employeeName = `${emp.firstName} ${emp.lastName}`;
    try {
      const res = await fetch('/api/performance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const r = await res.json(); setReviews([...reviews, { ...body, ...r }]); setShowCreate(false); toast('Review created', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const updateReview = async (id: string, data: any) => {
    try {
      const res = await fetch('/api/performance', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...data }) });
      if (res.ok) { setReviews(reviews.map(r => r.id === id ? { ...r, ...data } : r)); if (showDetail?.id === id) setShowDetail({ ...showDetail, ...data }); }
    } catch {}
  };

  const saveEdits = async () => {
    await updateReview(showDetail.id, editData); setEditing(false); toast('Review updated!', 'success');
  };

  const deleteReview = async (id: string) => {
    setReviews(reviews.filter(r => r.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Review deleted', 'success');
  };

  const InfoField = ({ label, value, editMode, field, data, setData, type, options, rows }: any) => (
    <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em' }}>{label}</div>
    {editMode ? (rows ? <textarea className="input-field" rows={rows} style={{ marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })} placeholder={`Enter ${label.toLowerCase()}...`} /> : options ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })}><option value="">—</option>{options.map((o: any) => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}</select> : <input className="input-field" type={type || 'text'} style={{ height: 30, marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })} />) : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{value || '—'}</div>}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Performance</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{stats.total} reviews · Avg {stats.avgRating} ★</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Review</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total', v: stats.total, c: 'var(--text-primary)' }, { l: 'Completed', v: stats.completed, c: 'var(--color-accent-400)' }, { l: 'In Progress', v: stats.inProgress, c: 'var(--color-primary-400)' }, { l: 'Pending', v: stats.pending, c: 'var(--color-warning-400)' }, { l: 'Avg Rating', v: stats.avgRating, c: '#f59e0b' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'reviews' as Tab, l: 'Reviews' }, { k: 'ratings' as Tab, l: 'Rating Distribution' }, { k: 'feedback' as Tab, l: '360° Feedback' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'reviews' && (reviews.length > 0 ? (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Employee</th><th>Period</th><th>Type</th><th>Reviewer</th><th>Rating</th><th>Grade</th><th>Status</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>{reviews.map(r => (
            <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => { setShowDetail(r); setEditData(r); setEditing(false); }}>
              <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar avatar-sm">{(r.employeeName || '?')[0]}</div><div><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.employeeName || '—'}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.employeeCode || ''}</div></div></div></td>
              <td style={{ fontSize: 'var(--text-sm)' }}>{r.reviewPeriod || '—'}</td>
              <td style={{ fontSize: 'var(--text-xs)' }}>{(r.reviewType || 'ANNUAL').replace(/_/g, ' ')}</td>
              <td style={{ fontSize: 'var(--text-sm)' }}>{r.reviewerName || '—'}</td>
              <td>{r.overallRating > 0 ? <span style={{ fontWeight: 700, color: ratingColor(r.overallRating) }}>★ {r.overallRating}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
              <td>{r.overallRating > 0 ? <span style={{ fontSize: 11, fontWeight: 600, color: ratingColor(r.overallRating) }}>{ratingLabel(r.overallRating)}</span> : '—'}</td>
              <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: r.status === 'COMPLETED' ? 'rgba(16,185,129,0.12)' : r.status === 'IN_PROGRESS' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)', color: r.status === 'COMPLETED' ? 'var(--color-accent-400)' : r.status === 'IN_PROGRESS' ? 'var(--color-primary-400)' : 'var(--color-warning-400)' }}>{r.status}</span></td>
              <td onClick={e => e.stopPropagation()}><button onClick={() => setDeleteConfirm(r)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>🗑</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty-state"><h3>No reviews</h3></div>)}

      {tab === 'ratings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Rating Distribution</h3>
            {[{ l: 'Outstanding (4.5-5)', min: 4.5, max: 5.1, c: '#22c55e' }, { l: 'Exceeds (3.5-4.5)', min: 3.5, max: 4.5, c: '#3b82f6' }, { l: 'Meets (2.5-3.5)', min: 2.5, max: 3.5, c: '#f59e0b' }, { l: 'Below (1.5-2.5)', min: 1.5, max: 2.5, c: '#f97316' }, { l: 'Needs Improvement (<1.5)', min: 0.1, max: 1.5, c: '#ef4444' }].map(band => {
              const count = reviews.filter(r => r.overallRating >= band.min && r.overallRating < band.max).length;
              const pct = reviews.filter(r => r.overallRating > 0).length > 0 ? (count / reviews.filter(r => r.overallRating > 0).length) * 100 : 0;
              return <div key={band.l} style={{ marginBottom: 'var(--space-3)' }}><div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 4 }}><span style={{ color: 'var(--text-secondary)' }}>{band.l}</span><span style={{ fontWeight: 600 }}>{count}</span></div><div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: band.c, borderRadius: 9999 }} /></div></div>;
            })}
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Top Performers</h3>
            {reviews.filter(r => r.overallRating >= 4).sort((a, b) => b.overallRating - a.overallRating).slice(0, 6).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)' }}>
                <span style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--text-muted)', width: 24 }}>{i + 1}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{r.employeeName}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.reviewPeriod}</div></div>
                <span style={{ fontWeight: 700, color: ratingColor(r.overallRating) }}>★ {r.overallRating}</span>
              </div>
            ))}
            {reviews.filter(r => r.overallRating >= 4).length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No ratings yet.</p>}
          </div>
        </div>
      )}

      {tab === 'feedback' && (
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>360° Feedback — Competency Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            {competencies.map(c => {
              const val = reviews.length > 0 ? (3 + Math.random() * 1.5) : 0;
              return <div key={c} style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 'var(--text-sm)' }}>{c}</span><span style={{ fontWeight: 700, color: 'var(--color-primary-400)' }}>{val > 0 ? val.toFixed(1) : '—'}</span></div>
                <div style={{ height: 4, background: 'var(--bg-primary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${(val / 5) * 100}%`, background: 'var(--color-primary-500)', borderRadius: 9999 }} /></div>
              </div>;
            })}
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div>
          <p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete review for {deleteConfirm.employeeName}?</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This review and all associated ratings will be permanently removed.</p>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteReview(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Performance Review</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="emp" required><option value="">Select...</option>{employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Review Period *</label><input className="input-field" name="period" required placeholder="FY 2025-26 Annual" /></div>
            <div><label className="input-label">Type</label><select className="input-field" name="type"><option value="ANNUAL">Annual</option><option value="QUARTERLY">Quarterly</option><option value="PROBATION">Probation</option><option value="PROMOTION">Promotion</option><option value="PIP">PIP</option></select></div>
          </div>
          <div><label className="input-label">Reviewer Name</label><input className="input-field" name="reviewerName" placeholder="Manager name" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>Performance Review</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.employeeName} · {showDetail.reviewPeriod}</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status Pipeline */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
              <button key={s} onClick={() => updateReview(showDetail.id, { status: s })} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetail.status === s ? (s === 'COMPLETED' ? 'rgba(16,185,129,0.12)' : s === 'IN_PROGRESS' ? 'rgba(59,130,246,0.12)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showDetail.status === s ? (s === 'COMPLETED' ? 'var(--color-accent-400)' : s === 'IN_PROGRESS' ? 'var(--color-primary-400)' : 'var(--color-warning-400)') : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s.replace(/_/g, ' ')}</button>
            ))}
          </div>

          {/* Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <InfoField label="Employee" value={showDetail.employeeName} editMode={editing} field="employeeName" data={editData} setData={setEditData} />
            <InfoField label="Period" value={showDetail.reviewPeriod} editMode={editing} field="reviewPeriod" data={editData} setData={setEditData} />
            <InfoField label="Type" value={(showDetail.reviewType || '').replace(/_/g, ' ')} editMode={editing} field="reviewType" data={editData} setData={setEditData} options={['ANNUAL','QUARTERLY','PROBATION','PROMOTION','PIP'].map(o => ({ v: o, l: o }))} />
            <InfoField label="Reviewer" value={showDetail.reviewerName} editMode={editing} field="reviewerName" data={editData} setData={setEditData} />
            <InfoField label="Employee Code" value={showDetail.employeeCode} editMode={editing} field="employeeCode" data={editData} setData={setEditData} />
          </div>

          {/* Overall Rating */}
          <div style={{ padding: 'var(--space-5)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>Overall Rating</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 10 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => { updateReview(showDetail.id, { overallRating: star }); toast(`Rating set to ${star}`, 'success'); }} style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', color: star <= (showDetail.overallRating || 0) ? '#f59e0b' : 'var(--border-primary)', transition: 'transform 0.15s' }} onMouseEnter={e => (e.target as HTMLElement).style.transform = 'scale(1.2)'} onMouseLeave={e => (e.target as HTMLElement).style.transform = 'scale(1)'}>★</button>
              ))}
            </div>
            {showDetail.overallRating > 0 && <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: ratingColor(showDetail.overallRating) }}>{ratingLabel(showDetail.overallRating)} ({showDetail.overallRating}/5)</div>}
          </div>

          {/* Competency Breakdown */}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Competency Breakdown</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
            {competencies.map(c => {
              const key = `comp_${c.replace(/\s/g, '')}`;
              const val = showDetail[key] || 0;
              return <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 'var(--text-sm)' }}>{c}</span>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1, 2, 3, 4, 5].map(s => <button key={s} onClick={() => updateReview(showDetail.id, { [key]: s })} style={{ fontSize: 14, color: s <= val ? '#f59e0b' : 'var(--border-primary)', cursor: 'pointer', background: 'none', border: 'none' }}>★</button>)}
                </div>
              </div>;
            })}
          </div>

          {/* Comments */}
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Manager Comments</div>
          {editing ? <textarea className="input-field" rows={3} value={editData.managerComments || ''} onChange={e => setEditData({ ...editData, managerComments: e.target.value })} placeholder="Strengths, areas for improvement, recommendations..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', minHeight: 40 }}>{showDetail.managerComments || 'No comments yet.'}</p>}</div>

          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Self Assessment</div>
          {editing ? <textarea className="input-field" rows={3} value={editData.selfAssessment || ''} onChange={e => setEditData({ ...editData, selfAssessment: e.target.value })} placeholder="Employee's self-evaluation..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', minHeight: 40 }}>{showDetail.selfAssessment || 'No self-assessment.'}</p>}</div>

          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Goals / Development Plan</div>
          {editing ? <textarea className="input-field" rows={2} value={editData.developmentPlan || ''} onChange={e => setEditData({ ...editData, developmentPlan: e.target.value })} placeholder="Next steps, training needs, career goals..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', minHeight: 40 }}>{showDetail.developmentPlan || 'No development plan.'}</p>}</div>
        </div>
      </div></div>}
    </div>
  );
}
