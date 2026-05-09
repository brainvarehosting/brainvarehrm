'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'tracker' | 'acts' | 'calendar';
const statusConfig: Record<string, { bg: string; color: string }> = { COMPLETED: { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }, PENDING: { bg: 'rgba(245,158,11,0.12)', color: 'var(--color-warning-400)' }, UPCOMING: { bg: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)' }, VALID: { bg: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }, OVERDUE: { bg: 'rgba(239,68,68,0.12)', color: 'var(--color-danger-400)' } };

export default function CompliancePage() {
  const [tab, setTab] = useState<Tab>('tracker');
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([
    { id: '1', name: 'PF Monthly Return', act: 'EPF Act, 1952', due: '2026-04-15', status: 'COMPLETED', responsible: 'Payroll Admin', frequency: 'Monthly', penalty: '₹5,000/day', notes: '' },
    { id: '2', name: 'ESI Contribution', act: 'ESI Act, 1948', due: '2026-04-15', status: 'COMPLETED', responsible: 'Payroll Admin', frequency: 'Monthly', penalty: '12% interest', notes: '' },
    { id: '3', name: 'Professional Tax', act: 'State PT Act', due: '2026-04-30', status: 'PENDING', responsible: 'Finance', frequency: 'Monthly', penalty: '₹5/day', notes: '' },
    { id: '4', name: 'TDS on Salary (24Q)', act: 'Income Tax Act', due: '2026-05-15', status: 'UPCOMING', responsible: 'Finance', frequency: 'Quarterly', penalty: '₹200/day', notes: '' },
    { id: '5', name: 'Shops & Establishment License', act: 'Shops Act', due: '2026-12-31', status: 'VALID', responsible: 'Admin', frequency: 'Annual', penalty: 'Prosecution', notes: '' },
    { id: '6', name: 'Labour Welfare Fund', act: 'LWF Act', due: '2026-06-30', status: 'UPCOMING', responsible: 'HR Admin', frequency: 'Half-Yearly', penalty: '₹500', notes: '' },
    { id: '7', name: 'Gratuity Insurance', act: 'Payment of Gratuity Act', due: '2026-03-31', status: 'COMPLETED', responsible: 'Finance', frequency: 'Annual', penalty: '₹10,000', notes: '' },
    { id: '8', name: 'POSH Annual Report', act: 'POSH Act, 2013', due: '2027-01-31', status: 'UPCOMING', responsible: 'ICC', frequency: 'Annual', penalty: '₹50,000', notes: '' },
    { id: '9', name: 'Minimum Wages Compliance', act: 'Minimum Wages Act', due: 'Ongoing', status: 'VALID', responsible: 'Payroll Admin', frequency: 'Ongoing', penalty: '6 months jail', notes: '' },
    { id: '10', name: 'Contract Labour Register', act: 'CLRA Act, 1970', due: 'Ongoing', status: 'VALID', responsible: 'HR Admin', frequency: 'Ongoing', penalty: '₹1,000', notes: '' },
  ]);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [showCreate, setShowCreate] = useState(false);

  const filtered = filter === 'all' ? items : items.filter(c => c.status === filter);
  const compScore = Math.round((items.filter(c => ['COMPLETED', 'VALID'].includes(c.status)).length / items.length) * 100);

  const changeStatus = (id: string, status: string) => { setItems(items.map(i => i.id === id ? { ...i, status } : i)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status }); toast(`Status → ${status}`, 'success'); };
  const saveEdits = () => { setItems(items.map(i => i.id === showDetail.id ? { ...i, ...editData } : i)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const handleCreate = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setItems([...items, { id: Date.now().toString(), name: (f.elements.namedItem('name') as HTMLInputElement).value, act: (f.elements.namedItem('act') as HTMLInputElement).value, due: (f.elements.namedItem('due') as HTMLInputElement).value, status: 'UPCOMING', responsible: (f.elements.namedItem('responsible') as HTMLInputElement).value, frequency: (f.elements.namedItem('frequency') as HTMLSelectElement).value, penalty: (f.elements.namedItem('penalty') as HTMLInputElement).value, notes: '' }]); setShowCreate(false); toast('Compliance item added!', 'success'); };

  const acts = [
    { act: 'EPF & MP Act, 1952', applies: 'Establishments with 20+ employees', key: 'PF contributions 12% each (employer + employee)' },
    { act: 'ESI Act, 1948', applies: 'Employees earning ≤ ₹21,000/month', key: 'Employer 3.25%, Employee 0.75%' },
    { act: 'Payment of Gratuity Act, 1972', applies: '5+ years of service', key: '15 days salary × years of service' },
    { act: 'Minimum Wages Act, 1948', applies: 'All employees', key: 'State-specific minimum wage rates' },
    { act: 'POSH Act, 2013', applies: '10+ employees', key: 'Internal Complaints Committee mandatory' },
    { act: 'Payment of Bonus Act, 1965', applies: 'Salary ≤ ₹21,000', key: 'Min 8.33%, Max 20% of salary' },
    { act: 'Maternity Benefit Act, 1961', applies: '10+ employees', key: '26 weeks paid leave' },
    { act: 'Equal Remuneration Act, 1976', applies: 'All employees', key: 'Equal pay for equal work' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Compliance Center</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Indian labor law compliance, statutory filings, and deadline tracker</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Item</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Completed', v: items.filter(c => c.status === 'COMPLETED').length, c: 'var(--color-accent-400)' }, { l: 'Pending', v: items.filter(c => c.status === 'PENDING').length, c: 'var(--color-warning-400)' }, { l: 'Upcoming', v: items.filter(c => c.status === 'UPCOMING').length, c: 'var(--color-primary-400)' }, { l: 'Score', v: `${compScore}%`, c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'tracker' as Tab, l: 'Tracker' }, { k: 'acts' as Tab, l: 'Labour Acts' }, { k: 'calendar' as Tab, l: 'Filing Calendar' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'tracker' && <>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['all', 'COMPLETED', 'PENDING', 'UPCOMING', 'VALID', 'OVERDUE'].map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', borderRadius: 9999, border: '1px solid', borderColor: filter === f ? 'var(--color-primary-500)' : 'var(--border-primary)', background: filter === f ? 'rgba(59,130,246,0.08)' : 'transparent', color: filter === f ? 'var(--color-primary-400)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}>{f === 'all' ? 'All' : f}</button>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map(c => { const sc = statusConfig[c.status]; return (
            <div key={c.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }} onClick={() => { setShowDetail(c); setEditData(c); setEditing(false); }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 2 }}>{c.name}</h3>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.act}</div>
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}><span>📅 Due: {c.due}</span><span>👤 {c.responsible}</span><span>🔁 {c.frequency}</span><span>⚠️ {c.penalty}</span></div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 10px', borderRadius: 9999, background: sc.bg, color: sc.color }}>{c.status}</span>
            </div>
          ); })}
        </div>
      </>}

      {tab === 'acts' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {acts.map((a, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>📜 {a.act}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <div><strong>Applies to:</strong> {a.applies}</div><div><strong>Key provision:</strong> {a.key}</div>
            </div>
          </div>
        ))}
      </div>}

      {tab === 'calendar' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ month: 'Apr', items: ['PF Return (15th)', 'ESI Return (15th)', 'PT (30th)'] }, { month: 'May', items: ['PF Return (15th)', 'ESI Return (15th)', 'TDS 24Q (15th)'] }, { month: 'Jun', items: ['PF Return (15th)', 'ESI Return (15th)', 'LWF (30th)'] }, { month: 'Jul', items: ['PF Return (15th)', 'ESI Return (15th)', 'TDS 24Q (15th)'] }].map((m, i) => (
          <div key={i} className="stat-card" style={{ padding: 'var(--space-4)' }}>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>{m.month} 2026</h3>
            {m.items.map((item, ii) => <div key={ii} style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border-secondary)' }}>📌 {item}</div>)}
          </div>
        ))}
      </div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Compliance Item</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Name *</label><input className="input-field" name="name" required placeholder="PF Monthly Return" /></div>
            <div><label className="input-label">Act</label><input className="input-field" name="act" placeholder="EPF Act, 1952" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Due Date</label><input className="input-field" name="due" placeholder="2026-04-15" /></div>
            <div><label className="input-label">Responsible</label><input className="input-field" name="responsible" placeholder="Payroll Admin" /></div>
            <div><label className="input-label">Frequency</label><select className="input-field" name="frequency"><option>Monthly</option><option>Quarterly</option><option>Half-Yearly</option><option>Annual</option><option>Ongoing</option></select></div>
          </div>
          <div><label className="input-label">Penalty</label><input className="input-field" name="penalty" placeholder="₹5,000/day" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.name}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['UPCOMING', 'PENDING', 'COMPLETED', 'VALID', 'OVERDUE'].map(s => { const sc = statusConfig[s]; return <button key={s} onClick={() => changeStatus(showDetail.id, s)} style={{ padding: '4px 10px', fontSize: 9, fontWeight: 600, borderRadius: 'var(--radius-md)', background: showDetail.status === s ? sc.bg : 'var(--bg-tertiary)', color: showDetail.status === s ? sc.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>; })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Name', f: 'name' }, { l: 'Act', f: 'act' }, { l: 'Due Date', f: 'due' }, { l: 'Responsible', f: 'responsible' }, { l: 'Frequency', f: 'frequency' }, { l: 'Penalty', f: 'penalty' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{showDetail[item.f]}</div>}</div>
            ))}
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4 }}>Notes</div>{editing ? <textarea className="input-field" rows={3} value={editData.notes || ''} onChange={e => setEditData({ ...editData, notes: e.target.value })} placeholder="Compliance notes..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.notes || 'No notes.'}</p>}</div>
        </div>
      </div></div>}
    </div>
  );
}
