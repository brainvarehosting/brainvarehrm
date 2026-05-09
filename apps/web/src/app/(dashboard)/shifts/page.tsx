'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'roster' | 'shifts' | 'swaps';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ShiftsPage() {
  const [tab, setTab] = useState<Tab>('roster');
  const [shifts, setShifts] = useState([
    { id: '1', name: 'General', code: 'GEN', start: '09:00', end: '18:00', break: 60, color: '#3b82f6' },
    { id: '2', name: 'Morning', code: 'MOR', start: '06:00', end: '14:00', break: 30, color: '#f59e0b' },
    { id: '3', name: 'Night', code: 'NGT', start: '22:00', end: '06:00', break: 30, color: '#8b5cf6' },
    { id: '4', name: 'Flexible', code: 'FLX', start: '10:00', end: '19:00', break: 60, color: '#10b981' },
  ]);
  const [roster, setRoster] = useState<Record<string, Record<string, string>>>({
    'Sneha Reddy': { Mon: 'GEN', Tue: 'GEN', Wed: 'GEN', Thu: 'GEN', Fri: 'GEN', Sat: 'OFF', Sun: 'OFF' },
    'Karan Malhotra': { Mon: 'FLX', Tue: 'FLX', Wed: 'FLX', Thu: 'FLX', Fri: 'FLX', Sat: 'OFF', Sun: 'OFF' },
    'Priya Patel': { Mon: 'GEN', Tue: 'GEN', Wed: 'GEN', Thu: 'GEN', Fri: 'GEN', Sat: 'OFF', Sun: 'OFF' },
    'Rahul Sharma': { Mon: 'MOR', Tue: 'MOR', Wed: 'MOR', Thu: 'MOR', Fri: 'MOR', Sat: 'MOR', Sun: 'OFF' },
    'Arjun Desai': { Mon: 'NGT', Tue: 'NGT', Wed: 'OFF', Thu: 'NGT', Fri: 'NGT', Sat: 'NGT', Sun: 'OFF' },
    'Meera Nair': { Mon: 'GEN', Tue: 'GEN', Wed: 'GEN', Thu: 'GEN', Fri: 'GEN', Sat: 'OFF', Sun: 'OFF' },
  });
  const [swaps, setSwaps] = useState([
    { id: '1', from: 'Arjun Desai', to: 'Rahul Sharma', date: '2026-04-25', fromShift: 'Night', toShift: 'Morning', status: 'PENDING', reason: 'Personal appointment' },
    { id: '2', from: 'Rahul Sharma', to: 'Karan Malhotra', date: '2026-04-22', fromShift: 'Morning', toShift: 'Flexible', status: 'APPROVED', reason: 'Doctor visit' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [showSwapModal, setShowSwapModal] = useState(false);

  const handleCreateShift = (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const s = { id: Date.now().toString(), name: (f.elements.namedItem('name') as HTMLInputElement).value, code: (f.elements.namedItem('code') as HTMLInputElement).value.toUpperCase(), start: (f.elements.namedItem('start') as HTMLInputElement).value, end: (f.elements.namedItem('end') as HTMLInputElement).value, break: parseInt((f.elements.namedItem('brk') as HTMLInputElement).value) || 60, color: (f.elements.namedItem('color') as HTMLInputElement).value || '#3b82f6' };
    setShifts([...shifts, s]); setShowCreate(false); toast('Shift created!', 'success');
  };

  const saveEdits = () => { setShifts(shifts.map(s => s.id === showDetail.id ? { ...s, ...editData } : s)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Shift updated!', 'success'); };
  const deleteShift = (id: string) => { setShifts(shifts.filter(s => s.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Shift deleted', 'success'); };
  const handleSwap = (id: string, status: string) => { setSwaps(swaps.map(s => s.id === id ? { ...s, status } : s)); toast(`Swap ${status.toLowerCase()}`, 'success'); };
  const handleCreateSwap = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setSwaps([...swaps, { id: Date.now().toString(), from: (f.elements.namedItem('from') as HTMLInputElement).value, to: (f.elements.namedItem('to') as HTMLInputElement).value, date: (f.elements.namedItem('date') as HTMLInputElement).value, fromShift: (f.elements.namedItem('fs') as HTMLSelectElement).value, toShift: (f.elements.namedItem('ts') as HTMLSelectElement).value, status: 'PENDING', reason: (f.elements.namedItem('reason') as HTMLInputElement).value }]); setShowSwapModal(false); toast('Swap request submitted!', 'success'); };

  const toggleRosterCell = (empName: string, day: string) => { 
    const codes = [...shifts.map(s => s.code), 'OFF']; 
    const current = roster[empName]?.[day] || 'OFF'; 
    const idx = codes.indexOf(current); 
    const next = codes[(idx + 1) % codes.length]; 
    setRoster({ ...roster, [empName]: { ...roster[empName], [day]: next } }); 
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Shift Roster</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{shifts.length} shifts · {Object.keys(roster).length} employees rostered</p></div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost" onClick={() => setShowSwapModal(true)}>🔄 Request Swap</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Shift</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Shifts', v: shifts.length, c: 'var(--text-primary)' }, { l: 'Employees', v: Object.keys(roster).length, c: 'var(--color-primary-400)' }, { l: 'Swaps Pending', v: swaps.filter(s => s.status === 'PENDING').length, c: 'var(--color-warning-400)' }, { l: 'Week Hours', v: `${8 * 5}h`, c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'roster' as Tab, l: 'Weekly Roster' }, { k: 'shifts' as Tab, l: 'Shift Masters' }, { k: 'swaps' as Tab, l: `Swap Requests (${swaps.filter(s => s.status === 'PENDING').length})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'roster' && (
        <div style={{ overflowX: 'auto' }}>
          <table className="table-base">
            <thead><tr><th>Employee</th>{days.map(d => <th key={d} style={{ textAlign: 'center', width: 60 }}>{d}</th>)}</tr></thead>
            <tbody>{Object.entries(roster).map(([name, schedule]) => (
              <tr key={name}>
                <td style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{name}</td>
                {days.map(day => { const code = schedule[day]; const shift = shifts.find(s => s.code === code); return (
                  <td key={day} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRosterCell(name, day)}>
                    {code === 'OFF' ? <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: 4 }}>OFF</span>
                    : shift ? <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: shift.color + '18', color: shift.color, border: `1px solid ${shift.color}30` }}>{shift.code}</span>
                    : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                ); })}
              </tr>
            ))}</tbody>
          </table>
          <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            <span>💡 Click any cell to cycle shift assignments</span>
            <span style={{ borderLeft: '1px solid var(--border-primary)', paddingLeft: 'var(--space-3)' }}>Legend:</span>
            {shifts.map(s => <span key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />{s.code} — {s.name}</span>)}
          </div>
        </div>
      )}

      {tab === 'shifts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
          {shifts.map(s => (
            <div key={s.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer', borderLeft: `4px solid ${s.color}` }} onClick={() => { setShowDetail(s); setEditData(s); setEditing(false); }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{s.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: s.color + '18', color: s.color }}>{s.code}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Start</span><div style={{ fontWeight: 600 }}>{s.start}</div></div>
                <div><span style={{ color: 'var(--text-muted)' }}>End</span><div style={{ fontWeight: 600 }}>{s.end}</div></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Break</span><div style={{ fontWeight: 600 }}>{s.break}m</div></div>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 'var(--space-3)' }}>{Object.values(roster).filter(r => Object.values(r).includes(s.code)).length} employees assigned</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'swaps' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {swaps.map(req => (
            <div key={req.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{req.from}</span>
                  <span style={{ fontSize: 14 }}>⇄</span>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{req.to}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: req.status === 'APPROVED' ? 'rgba(16,185,129,0.12)' : req.status === 'PENDING' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.08)', color: req.status === 'APPROVED' ? 'var(--color-accent-400)' : req.status === 'PENDING' ? 'var(--color-warning-400)' : 'var(--color-danger-400)' }}>{req.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                <span>📅 {new Date(req.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span>
                <span>⏰ {req.fromShift} ⇄ {req.toShift}</span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>💬 {req.reason}</p>
              {req.status === 'PENDING' && <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)', border: 'none' }} onClick={() => handleSwap(req.id, 'APPROVED')}>✓ Approve</button>
                <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger-400)', border: 'none' }} onClick={() => handleSwap(req.id, 'REJECTED')}>✕ Reject</button>
              </div>}
            </div>
          ))}
          {swaps.length === 0 && <div className="empty-state"><h3>No swap requests</h3></div>}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.name}"?</p><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This shift will be permanently removed from all rosters.</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteShift(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create Shift */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>New Shift</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreateShift}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Shift Name *</label><input className="input-field" name="name" required placeholder="Evening Shift" /></div>
            <div><label className="input-label">Code *</label><input className="input-field" name="code" required placeholder="EVE" maxLength={4} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Start Time</label><input className="input-field" name="start" type="time" defaultValue="09:00" /></div>
            <div><label className="input-label">End Time</label><input className="input-field" name="end" type="time" defaultValue="18:00" /></div>
            <div><label className="input-label">Break (min)</label><input className="input-field" name="brk" type="number" defaultValue={60} /></div>
          </div>
          <div><label className="input-label">Color</label><input type="color" name="color" defaultValue="#3b82f6" style={{ width: 50, height: 30, border: 'none', cursor: 'pointer' }} /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Shift</button></div>
        </form>
      </div></div>}

      {/* Swap Request Modal */}
      {showSwapModal && <div className="modal-overlay" onClick={() => setShowSwapModal(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Request Shift Swap</h2><button onClick={() => setShowSwapModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreateSwap}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">From Employee *</label><select className="input-field" name="from" required><option value="">Select...</option>{Object.keys(roster).map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div><label className="input-label">To Employee *</label><select className="input-field" name="to" required><option value="">Select...</option>{Object.keys(roster).map(n => <option key={n} value={n}>{n}</option>)}</select></div>
          </div>
          <div><label className="input-label">Date *</label><input className="input-field" name="date" type="date" required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">From Shift</label><select className="input-field" name="fs">{shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
            <div><label className="input-label">To Shift</label><select className="input-field" name="ts">{shifts.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}</select></div>
          </div>
          <div><label className="input-label">Reason</label><input className="input-field" name="reason" placeholder="Reason for swap..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowSwapModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Request</button></div>
        </form>
      </div></div>}

      {/* Shift Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.name}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑 Delete</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Name</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{showDetail.name}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Code</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData.code || ''} onChange={e => setEditData({ ...editData, code: e.target.value.toUpperCase() })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginTop: 2, color: showDetail.color }}>{showDetail.code}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Start Time</div>{editing ? <input className="input-field" type="time" style={{ height: 30, marginTop: 2 }} value={editData.start || ''} onChange={e => setEditData({ ...editData, start: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.start}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>End Time</div>{editing ? <input className="input-field" type="time" style={{ height: 30, marginTop: 2 }} value={editData.end || ''} onChange={e => setEditData({ ...editData, end: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.end}</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Break</div>{editing ? <input className="input-field" type="number" style={{ height: 30, marginTop: 2 }} value={editData.break || ''} onChange={e => setEditData({ ...editData, break: parseInt(e.target.value) })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>{showDetail.break} min</div>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Color</div>{editing ? <input type="color" value={editData.color || '#3b82f6'} onChange={e => setEditData({ ...editData, color: e.target.value })} style={{ width: 50, height: 30, border: 'none', cursor: 'pointer', marginTop: 2 }} /> : <div style={{ width: 24, height: 24, borderRadius: '50%', background: showDetail.color, marginTop: 2 }} />}</div>
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Assigned Employees</div>
            {Object.entries(roster).filter(([_, r]) => Object.values(r).includes(showDetail.code)).map(([name]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '4px 0', fontSize: 'var(--text-sm)' }}><div className="avatar avatar-sm" style={{ width: 24, height: 24, fontSize: 10 }}>{name.split(' ').map(n => n[0]).join('')}</div>{name}</div>
            ))}
            {Object.entries(roster).filter(([_, r]) => Object.values(r).includes(showDetail.code)).length === 0 && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>No employees assigned.</p>}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
