'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'current' | 'history' | 'summary';
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TimesheetPage() {
  const [tab, setTab] = useState<Tab>('current');
  const [projects] = useState([
    { name: 'BrainvareHRM', color: '#3b82f6' },
    { name: 'Client Portal', color: '#8b5cf6' },
    { name: 'Internal Ops', color: '#10b981' },
    { name: 'Meetings', color: '#f59e0b' },
    { name: 'Training', color: '#ec4899' },
  ]);
  const [timesheet, setTimesheet] = useState([
    { project: 'BrainvareHRM', hours: [8, 7, 8, 6, 8, 0, 0] },
    { project: 'Client Portal', hours: [0, 1, 0, 2, 0, 0, 0] },
    { project: 'Internal Ops', hours: [0, 0, 0.5, 0, 0.5, 0, 0] },
    { project: 'Meetings', hours: [1, 1, 1.5, 1, 1, 0, 0] },
    { project: 'Training', hours: [0, 0, 0, 1, 0, 0, 0] },
  ]);
  const [history, setHistory] = useState([
    { id: '1', week: 'Apr 7-13', total: 42, status: 'APPROVED', submitted: '2026-04-13', notes: '' },
    { id: '2', week: 'Apr 14-20', total: 40.5, status: 'PENDING', submitted: '2026-04-20', notes: '' },
    { id: '3', week: 'Mar 31 - Apr 6', total: 38, status: 'APPROVED', submitted: '2026-04-06', notes: '' },
    { id: '4', week: 'Mar 24-30', total: 41, status: 'APPROVED', submitted: '2026-03-30', notes: '' },
  ]);
  const [showDetailWeek, setShowDetailWeek] = useState<any>(null);
  const [showAddProject, setShowAddProject] = useState(false);

  const dailyTotals = weekDays.map((_, di) => timesheet.reduce((s, p) => s + p.hours[di], 0));
  const weekTotal = dailyTotals.reduce((s, h) => s + h, 0);

  const updateHours = (pi: number, di: number, val: number) => {
    const updated = [...timesheet];
    updated[pi] = { ...updated[pi], hours: [...updated[pi].hours] };
    updated[pi].hours[di] = val;
    setTimesheet(updated);
  };

  const handleSave = () => { toast('Timesheet saved as draft!', 'success'); };
  const handleSubmit = () => {
    const w = { id: Date.now().toString(), week: 'Apr 14-20', total: weekTotal, status: 'PENDING', submitted: new Date().toISOString().split('T')[0], notes: '' };
    setHistory([w, ...history.filter(h => h.week !== 'Apr 14-20')]);
    toast('Timesheet submitted for approval!', 'success');
  };
  const handleApprove = (id: string) => { setHistory(history.map(h => h.id === id ? { ...h, status: 'APPROVED' } : h)); if (showDetailWeek?.id === id) setShowDetailWeek({ ...showDetailWeek, status: 'APPROVED' }); toast('Approved!', 'success'); };
  const handleReject = (id: string) => { setHistory(history.map(h => h.id === id ? { ...h, status: 'REJECTED' } : h)); if (showDetailWeek?.id === id) setShowDetailWeek({ ...showDetailWeek, status: 'REJECTED' }); toast('Rejected', 'success'); };
  const handleAddProject = (e: any) => { e.preventDefault(); const name = ((e.target as HTMLFormElement).elements.namedItem('pname') as HTMLInputElement).value; setTimesheet([...timesheet, { project: name, hours: [0, 0, 0, 0, 0, 0, 0] }]); setShowAddProject(false); toast('Project row added!', 'success'); };
  const removeProjectRow = (idx: number) => { setTimesheet(timesheet.filter((_, i) => i !== idx)); toast('Row removed', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Timesheet</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Weekly time logging with project allocation</p></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-sm">← Prev</button>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>📅 Apr 14 - 20, 2026</span>
          <button className="btn btn-ghost btn-sm">Next →</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Week Total', v: `${weekTotal}h`, c: 'var(--text-primary)' }, { l: 'Projects', v: timesheet.length, c: 'var(--color-primary-400)' }, { l: 'Avg/Day', v: `${(weekTotal / 5).toFixed(1)}h`, c: 'var(--color-accent-400)' }, { l: 'Status', v: history[0]?.status || 'DRAFT', c: history[0]?.status === 'APPROVED' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'current' as Tab, l: 'Current Week' }, { k: 'history' as Tab, l: 'History' }, { k: 'summary' as Tab, l: 'Summary' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'current' && (
        <div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table-base">
              <thead><tr><th style={{ minWidth: 140 }}>Project</th>{weekDays.map(d => <th key={d} style={{ textAlign: 'center', width: 60 }}>{d}</th>)}<th style={{ textAlign: 'center', width: 60 }}>Total</th><th style={{ width: 30 }}></th></tr></thead>
              <tbody>
                {timesheet.map((row, ri) => {
                  const proj = projects.find(p => p.name === row.project);
                  const rowTotal = row.hours.reduce((s, h) => s + h, 0);
                  return (
                    <tr key={ri}>
                      <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: proj?.color || '#94a3b8', flexShrink: 0 }} />{row.project}</div></td>
                      {row.hours.map((h, hi) => (
                        <td key={hi} style={{ textAlign: 'center', padding: 2 }}>
                          <input type="number" value={h || ''} step={0.5} min={0} max={24} onChange={e => updateHours(ri, hi, parseFloat(e.target.value) || 0)} style={{ width: 44, height: 30, textAlign: 'center', background: h > 0 ? 'var(--bg-tertiary)' : 'transparent', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)', fontWeight: h > 0 ? 600 : 400 }} />
                        </td>
                      ))}
                      <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-primary-400)' }}>{rowTotal}h</td>
                      <td><button onClick={() => removeProjectRow(ri)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>✕</button></td>
                    </tr>
                  );
                })}
                <tr style={{ background: 'var(--bg-tertiary)' }}>
                  <td style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Daily Total</td>
                  {dailyTotals.map((t, i) => <td key={i} style={{ textAlign: 'center', fontWeight: 700, fontSize: 'var(--text-sm)', color: t > 8 ? 'var(--color-danger-400)' : t > 0 ? 'var(--color-accent-400)' : 'var(--text-muted)' }}>{t}h</td>)}
                  <td style={{ textAlign: 'center', fontWeight: 800, fontSize: 'var(--text-md)', color: 'var(--color-primary-400)' }}>{weekTotal}h</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddProject(true)}>+ Add Project Row</button>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="btn btn-ghost" onClick={handleSave}>💾 Save Draft</button>
              <button className="btn btn-primary" onClick={handleSubmit}>✅ Submit for Approval</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {history.map(w => (
            <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowDetailWeek(w)}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>📅 {w.week}</h3>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Submitted: {new Date(w.submitted).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
              </div>
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 700 }}>{w.total}h</span>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: w.status === 'APPROVED' ? 'rgba(16,185,129,0.12)' : w.status === 'REJECTED' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.12)', color: w.status === 'APPROVED' ? 'var(--color-accent-400)' : w.status === 'REJECTED' ? 'var(--color-danger-400)' : 'var(--color-warning-400)' }}>{w.status}</span>
              {w.status === 'PENDING' && <div style={{ display: 'flex', gap: 'var(--space-2)' }} onClick={e => e.stopPropagation()}>
                <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', border: 'none' }} onClick={() => handleApprove(w.id)}>✓</button>
                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger-400)', border: 'none' }} onClick={() => handleReject(w.id)}>✕</button>
              </div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'summary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>📊 This Month</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{Math.round(history.reduce((s, h) => s + h.total, 0))}h</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Total Hours</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>20</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Working Days</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{(history.reduce((s, h) => s + h.total, 0) / 20).toFixed(1)}h</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Avg/Day</div></div>
            </div>
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Project Allocation</h3>
            {timesheet.map((row, i) => {
              const proj = projects.find(p => p.name === row.project);
              const total = row.hours.reduce((s, h) => s + h, 0);
              const pct = weekTotal > 0 ? Math.round((total / weekTotal) * 100) : 0;
              return (
                <div key={i} style={{ marginBottom: 'var(--space-2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: proj?.color || '#94a3b8' }} />{row.project}</div>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${pct}%`, background: proj?.color || '#94a3b8', borderRadius: 9999 }} /></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Project Row */}
      {showAddProject && <div className="modal-overlay" onClick={() => setShowAddProject(false)}><div className="modal-content" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Project Row</h2></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }} onSubmit={handleAddProject}>
          <div><label className="input-label">Project Name *</label><input className="input-field" name="pname" required placeholder="New Project" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAddProject(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
        </form>
      </div></div>}

      {/* Week Detail */}
      {showDetailWeek && <div className="modal-overlay" onClick={() => setShowDetailWeek(null)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📅 {showDetailWeek.week}</h2>
          <button onClick={() => setShowDetailWeek(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-primary-400)' }}>{showDetailWeek.total}h</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Total hours logged</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Submitted</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{new Date(showDetailWeek.submitted).toLocaleDateString('en-IN')}</div></div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Daily Avg</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{(showDetailWeek.total / 5).toFixed(1)}h</div></div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => { setHistory(history.map(h => h.id === showDetailWeek.id ? { ...h, status: s } : h)); setShowDetailWeek({ ...showDetailWeek, status: s }); toast(`Status → ${s}`, 'success'); }} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: showDetailWeek.status === s ? (s === 'APPROVED' ? 'rgba(16,185,129,0.12)' : s === 'REJECTED' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: showDetailWeek.status === s ? (s === 'APPROVED' ? 'var(--color-accent-400)' : s === 'REJECTED' ? 'var(--color-danger-400)' : 'var(--color-warning-400)') : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
