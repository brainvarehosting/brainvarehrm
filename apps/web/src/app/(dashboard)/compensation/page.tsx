'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'overview' | 'ranges' | 'revisions' | 'benchmarks';

export default function CompensationPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [data, setData] = useState<any[]>([]);
  const [showRevision, setShowRevision] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [md, setMd] = useState<any>({ employees: [], departments: [], grades: [] });
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  useEffect(() => {
    fetch('/api/compensation').then(r => r.json()).then(d => setData(d.data || d || [])).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const totalCost = data.reduce((s, d) => s + (d.ctc || d.annualCTC || 0), 0);
  const avgCTC = data.length > 0 ? Math.round(totalCost / data.length) : 0;
  const fm = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

  const handleRevision = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body = { employeeId: (f.elements.namedItem('emp') as HTMLSelectElement).value, newCTC: parseFloat((f.elements.namedItem('ctc') as HTMLInputElement).value), effectiveDate: (f.elements.namedItem('date') as HTMLInputElement).value, reason: (f.elements.namedItem('reason') as HTMLSelectElement).value, notes: (f.elements.namedItem('notes') as HTMLInputElement).value };
    try {
      const res = await fetch('/api/compensation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { toast('Revision submitted!', 'success'); setShowRevision(false); }
    } catch { toast('Failed', 'error'); }
  };

  const saveEdits = async () => { setData(data.map(d => d.id === showDetail.id ? { ...d, ...editData } : d)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const deleteRecord = (id: string) => { setData(data.filter(d => d.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Record removed', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Compensation</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{data.length} employees · {fm(totalCost)} total cost</p></div>
        <button className="btn btn-primary" onClick={() => setShowRevision(true)}>+ Salary Revision</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total Payroll', v: fm(totalCost), c: 'var(--text-primary)' }, { l: 'Avg CTC', v: fm(avgCTC), c: 'var(--color-primary-400)' }, { l: 'Employees', v: data.length, c: 'var(--color-accent-400)' }, { l: 'Revisions', v: data.filter(d => d.lastRevision).length, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'overview' as Tab, l: 'Overview' }, { k: 'ranges' as Tab, l: 'Pay Ranges' }, { k: 'revisions' as Tab, l: 'Revision History' }, { k: 'benchmarks' as Tab, l: 'Benchmarks' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        data.length > 0 ? (
          <div className="table-wrapper"><table className="table-base">
            <thead><tr><th>Employee</th><th>Department</th><th>Grade</th><th>Basic</th><th>HRA</th><th>Allowances</th><th>CTC</th><th>Last Revision</th><th></th></tr></thead>
            <tbody>{data.map(d => (
              <tr key={d.id} style={{ cursor: 'pointer' }} onClick={() => { setShowDetail(d); setEditData(d); setEditing(false); }}>
                <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="avatar avatar-sm">{(d.employeeName || d.name || '?')[0]}</div><div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{d.employeeName || d.name || '—'}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.employeeCode || ''}</div></div></div></td>
                <td style={{ fontSize: 'var(--text-sm)' }}>{d.department || '—'}</td>
                <td style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{d.grade || '—'}</td>
                <td style={{ fontSize: 'var(--text-sm)' }}>{fm(d.basic || (d.ctc || 0) * 0.4)}</td>
                <td style={{ fontSize: 'var(--text-sm)' }}>{fm(d.hra || (d.ctc || 0) * 0.2)}</td>
                <td style={{ fontSize: 'var(--text-sm)' }}>{fm(d.allowances || (d.ctc || 0) * 0.15)}</td>
                <td style={{ fontWeight: 700, color: 'var(--color-accent-400)' }}>{fm(d.ctc || d.annualCTC || 0)}</td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{d.lastRevision || '—'}</td>
                <td><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></td>
              </tr>
            ))}</tbody>
          </table></div>
        ) : <div className="empty-state"><h3>No data</h3><p>Compensation data will appear when employees are configured.</p></div>
      )}

      {tab === 'ranges' && (
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Pay Ranges by Grade</h3>
          {[{ g: 'L1', min: 300000, max: 600000, c: '#94a3b8' }, { g: 'L2', min: 500000, max: 1000000, c: '#3b82f6' }, { g: 'L3', min: 800000, max: 1600000, c: '#8b5cf6' }, { g: 'L4', min: 1200000, max: 2400000, c: '#f59e0b' }, { g: 'L5', min: 2000000, max: 4000000, c: '#10b981' }].map(r => {
            const empsInGrade = data.filter(d => d.grade === r.g).length;
            return (
              <div key={r.g} style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{r.g}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fm(r.min)} — {fm(r.max)} · {empsInGrade} employees</span>
                </div>
                <div style={{ position: 'relative', height: 12, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: '10%', right: '10%', height: '100%', background: `${r.c}30`, borderRadius: 9999 }} />
                  <div style={{ position: 'absolute', left: '35%', top: 0, height: '100%', width: 3, background: r.c, borderRadius: 9999 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}><span>{fm(r.min)}</span><span>Median: {fm(Math.round((r.min + r.max) / 2))}</span><span>{fm(r.max)}</span></div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'revisions' && (
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Recent Revisions</h3>
          {data.filter(d => d.lastRevision || d.revisionDate).length > 0 ? data.filter(d => d.lastRevision || d.revisionDate).map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border-secondary)' }}>
              <div className="avatar avatar-sm">{(d.employeeName || d.name || '?')[0]}</div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{d.employeeName || d.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.reason || 'Annual Revision'} · {d.lastRevision || d.revisionDate || '—'}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-accent-400)' }}>{fm(d.ctc || 0)}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.hike || '10'}% hike</div></div>
            </div>
          )) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No revisions yet.</p>}
        </div>
      )}

      {tab === 'benchmarks' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Market Comparison</h3>
            {['Engineering', 'Design', 'HR', 'Marketing', 'Finance'].map(dept => {
              const market = 1000000 + Math.random() * 800000;
              const internal = market * (0.85 + Math.random() * 0.3);
              const ratio = Math.round((internal / market) * 100);
              return (
                <div key={dept} style={{ marginBottom: 'var(--space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 4 }}>
                    <span>{dept}</span>
                    <span style={{ fontWeight: 600, color: ratio >= 100 ? 'var(--color-accent-400)' : ratio >= 90 ? 'var(--color-primary-400)' : 'var(--color-danger-400)' }}>{ratio}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.min(ratio, 120)}%`, background: ratio >= 100 ? 'var(--color-accent-500)' : ratio >= 90 ? 'var(--color-primary-500)' : 'var(--color-danger-500)', borderRadius: 9999 }} /></div>
                </div>
              );
            })}
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Cost Distribution</h3>
            {[{ l: 'Basic Salary', p: 40, c: '#3b82f6' }, { l: 'HRA', p: 20, c: '#8b5cf6' }, { l: 'Special Allowance', p: 15, c: '#10b981' }, { l: 'PF (Employer)', p: 12, c: '#f59e0b' }, { l: 'Insurance', p: 8, c: '#ec4899' }, { l: 'Other', p: 5, c: '#64748b' }].map(item => (
              <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '4px 0' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.c, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{item.l}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{item.p}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevision && <div className="modal-overlay" onClick={() => setShowRevision(false)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Salary Revision</h2><button onClick={() => setShowRevision(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleRevision}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="emp" required><option value="">Select...</option>{md.employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">New Annual CTC (₹) *</label><input className="input-field" name="ctc" type="number" required placeholder="1200000" /></div>
            <div><label className="input-label">Effective Date *</label><input className="input-field" name="date" type="date" required /></div>
          </div>
          <div><label className="input-label">Reason</label><select className="input-field" name="reason"><option value="ANNUAL">Annual Revision</option><option value="PROMOTION">Promotion</option><option value="MARKET_CORRECTION">Market Correction</option><option value="PERFORMANCE">Performance-based</option><option value="ROLE_CHANGE">Role Change</option></select></div>
          <div><label className="input-label">Notes</label><textarea className="input-field" name="notes" rows={2} placeholder="Justification..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowRevision(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Revision</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Remove compensation for {deleteConfirm.employeeName}?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteRecord(deleteConfirm.id)}>Remove</button></div>
      </div></div>}

      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.employeeName || showDetail.name}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Editable info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Department</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.department || ''} onChange={e => setEditData({ ...editData, department: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.department || '—'}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Grade</div>{editing ? <select className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.grade || ''} onChange={e => setEditData({ ...editData, grade: e.target.value })}><option value="L1">L1</option><option value="L2">L2</option><option value="L3">L3</option><option value="L4">L4</option><option value="L5">L5</option></select> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{showDetail.grade || '—'}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Hike</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.hike || ''} onChange={e => setEditData({ ...editData, hike: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.hike || '10'}%</div>}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Annual CTC</div>
            {editing ? <input className="input-field" type="number" style={{ textAlign: 'center', fontSize: 'var(--text-2xl)', fontWeight: 800, width: '100%' }} value={editData.ctc || ''} onChange={e => setEditData({ ...editData, ctc: parseInt(e.target.value) || 0 })} /> : <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-accent-400)' }}>{fm(showDetail.ctc || showDetail.annualCTC || 0)}</div>}
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Monthly: {fm(Math.round(((editing ? editData.ctc : showDetail.ctc) || 0) / 12))}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[{ l: 'Basic Salary', v: fm((showDetail.ctc || 0) * 0.4) }, { l: 'HRA', v: fm((showDetail.ctc || 0) * 0.2) }, { l: 'Special Allowance', v: fm((showDetail.ctc || 0) * 0.15) }, { l: 'PF (Employer)', v: fm((showDetail.ctc || 0) * 0.12) }, { l: 'Insurance', v: fm((showDetail.ctc || 0) * 0.08) }].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--border-secondary)' }}><span style={{ color: 'var(--text-secondary)' }}>{item.l}</span><span style={{ fontWeight: 500 }}>{item.v}</span></div>
            ))}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
