'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

type Tab = 'runs' | 'payslips' | 'salary';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT: { bg: 'rgba(100,116,139,0.12)', color: '#94a3b8', label: 'Draft' },
  PROCESSING: { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', label: 'Processing' },
  REVIEW: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Review' },
  APPROVED: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Approved' },
  LOCKED: { bg: 'rgba(139,92,246,0.12)', color: '#8b5cf6', label: 'Locked' },
  PAID: { bg: 'rgba(16,185,129,0.12)', color: '#10b981', label: 'Paid' },
};
const fm = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString('en-IN')}`;

export default function PayrollPage() {
  const [tab, setTab] = useState<Tab>('runs');
  const [payrollRuns, setPayrollRuns] = useState([
    { id: '1', month: 'April 2026', status: 'DRAFT', employees: 10, totalGross: 0, totalNet: 0, processedAt: '' },
    { id: '2', month: 'March 2026', status: 'PAID', employees: 10, totalGross: 4850000, totalNet: 3620000, processedAt: '2026-03-28' },
  ]);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showPayslip, setShowPayslip] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [summaryData, setSummaryData] = useState({ gross: '₹0', deductions: '₹0', net: '₹0', employees: 0 });

  const payslipBreakup = {
    employee: { name: 'Priya Patel', code: 'EMP-0002', department: 'Frontend', designation: 'Senior Software Engineer' },
    month: 'March 2026',
    earnings: [{ component: 'Basic', amount: 40000 }, { component: 'HRA', amount: 20000 }, { component: 'Special Allowance', amount: 20000 }, { component: 'Conveyance', amount: 1600 }, { component: 'Medical', amount: 1250 }, { component: 'LTA', amount: 5000 }],
    deductions: [{ component: 'PF (Employee)', amount: 4800 }, { component: 'Professional Tax', amount: 200 }, { component: 'TDS', amount: 7000 }],
    grossPay: 87850, totalDeductions: 12000, netPay: 75850, workingDays: 22, paidDays: 22, lopDays: 0,
  };

  useEffect(() => {
    fetch('/api/payroll').then(r => r.json()).then(data => {
      if (data.data?.length) {
        const mapped = data.data.map((r: any) => ({ id: r.id, month: `${MONTHS[r.month - 1]} ${r.year}`, status: r.status, employees: r.totalEmployees || r.entries?.length || 0, totalGross: r.totalGross || 0, totalNet: r.totalNet || 0, processedAt: r.processedAt || '' }));
        setPayrollRuns(mapped);
        const latest = data.data.find((r: any) => ['PAID', 'LOCKED', 'APPROVED'].includes(r.status));
        if (latest) { const g = latest.totalGross || 0; const n = latest.totalNet || 0; setSummaryData({ gross: fm(g), deductions: fm(g - n), net: fm(n), employees: latest.totalEmployees || 0 }); }
      }
    }).catch(() => {});
  }, []);

  const handleNewRun = async () => {
    try {
      const res = await fetch('/api/payroll', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (res.ok) { const run = await res.json(); setPayrollRuns([{ id: run.id, month: `${MONTHS[(run.month || 1) - 1]} ${run.year || 2026}`, status: run.status || 'DRAFT', employees: run.totalEmployees || 0, totalGross: run.totalGross || 0, totalNet: run.totalNet || 0, processedAt: '' }, ...payrollRuns]); toast('Payroll run created!', 'success'); }
    } catch { toast('Failed to create run', 'error'); }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try { await fetch(`/api/payroll/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) }); } catch {}
    setPayrollRuns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, processedAt: new Date().toISOString() } : r));
    if (showDetail?.id === id) setShowDetail({ ...showDetail, status: newStatus });
    toast(`Status → ${newStatus}`, 'success');
  };

  const saveEdits = () => { setPayrollRuns(payrollRuns.map(r => r.id === showDetail.id ? { ...r, ...editData } : r)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const deleteRun = (id: string) => { setPayrollRuns(payrollRuns.filter(r => r.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Payroll run deleted', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Payroll</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Process salaries, manage compliance, and generate payslips</p></div>
        <button className="btn btn-primary" onClick={handleNewRun}>+ New Payroll Run</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total Gross', v: summaryData.gross, c: 'var(--text-primary)' }, { l: 'Deductions', v: summaryData.deductions, c: 'var(--color-danger-400)' }, { l: 'Net Payable', v: summaryData.net, c: 'var(--color-accent-400)' }, { l: 'Payroll Runs', v: payrollRuns.length, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'runs' as Tab, l: 'Payroll Runs' }, { k: 'payslips' as Tab, l: 'My Payslips' }, { k: 'salary' as Tab, l: 'Salary Structure' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'runs' && (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Month</th><th>Status</th><th>Employees</th><th>Total Gross</th><th>Net Payable</th><th>Processed</th><th></th></tr></thead>
          <tbody>{payrollRuns.map(run => {
            const ss = statusStyles[run.status] || statusStyles.DRAFT;
            return (
              <tr key={run.id} style={{ cursor: 'pointer' }} onClick={() => { setShowDetail(run); setEditData(run); setEditing(false); }}>
                <td style={{ fontWeight: 600 }}>{run.month}</td>
                <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: ss.bg, color: ss.color }}>{ss.label}</span></td>
                <td>{run.employees}</td>
                <td>{run.totalGross ? fm(run.totalGross) : '—'}</td>
                <td style={{ fontWeight: 600, color: 'var(--color-accent-400)' }}>{run.totalNet ? fm(run.totalNet) : '—'}</td>
                <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{run.processedAt ? new Date(run.processedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {run.status === 'DRAFT' && <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => handleStatusChange(run.id, 'REVIEW')}>Process</button>}
                    {run.status === 'REVIEW' && <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => handleStatusChange(run.id, 'LOCKED')}>Lock</button>}
                    {run.status === 'LOCKED' && <button className="btn btn-primary btn-sm" style={{ fontSize: 10 }} onClick={() => handleStatusChange(run.id, 'PAID')}>Pay</button>}
                  </div>
                </td>
              </tr>
            );
          })}</tbody>
        </table></div>
      )}

      {tab === 'payslips' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-3)' }}>
          {['March 2026', 'February 2026', 'January 2026'].map(month => (
            <div key={month} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowPayslip(true)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><span style={{ fontSize: 18 }}>📄</span><span style={{ fontWeight: 600 }}>{month}</span></div>
                <button className="btn btn-sm btn-ghost" style={{ fontSize: 10 }} onClick={e => { e.stopPropagation(); toast('PDF downloading...', 'info'); }}>📥 PDF</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Gross</span><div style={{ fontWeight: 600 }}>₹87,850</div></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Deductions</span><div style={{ fontWeight: 600, color: 'var(--color-danger-400)' }}>₹12,000</div></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Net Pay</span><div style={{ fontWeight: 800, color: 'var(--color-accent-400)' }}>₹75,850</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'salary' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>💰 Earnings</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Monthly</span>
            </div>
            {payslipBreakup.earnings.map(e => (
              <div key={e.component} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{e.component}</span><span style={{ fontWeight: 600 }}>₹{e.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, color: 'var(--color-primary-400)' }}><span>Gross Pay</span><span>₹{payslipBreakup.grossPay.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>📉 Deductions</h3>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Monthly</span>
            </div>
            {payslipBreakup.deductions.map(d => (
              <div key={d.component} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--text-sm)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{d.component}</span><span style={{ fontWeight: 600, color: 'var(--color-danger-400)' }}>₹{d.amount.toLocaleString('en-IN')}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 700, color: 'var(--color-danger-400)' }}><span>Total Deductions</span><span>₹{payslipBreakup.totalDeductions.toLocaleString('en-IN')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-2)', fontWeight: 800, fontSize: 'var(--text-md)' }}><span>Net Pay</span><span style={{ color: 'var(--color-accent-400)' }}>₹{payslipBreakup.netPay.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete {deleteConfirm.month} payroll run?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteRun(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Payslip View */}
      {showPayslip && <div className="modal-overlay" onClick={() => setShowPayslip(false)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Payslip — {payslipBreakup.month}</h2><button onClick={() => setShowPayslip(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <div><div style={{ fontWeight: 600 }}>{payslipBreakup.employee.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{payslipBreakup.employee.code} · {payslipBreakup.employee.department}</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Working: {payslipBreakup.workingDays}d | Paid: {payslipBreakup.paidDays}d | LOP: {payslipBreakup.lopDays}d</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Earnings</div>{payslipBreakup.earnings.map(e => <div key={e.component} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', padding: '3px 0' }}><span>{e.component}</span><span style={{ fontWeight: 500 }}>₹{e.amount.toLocaleString()}</span></div>)}<div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-primary)', paddingTop: 4, marginTop: 4, fontSize: 'var(--text-sm)' }}><span>Gross</span><span>₹{payslipBreakup.grossPay.toLocaleString()}</span></div></div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Deductions</div>{payslipBreakup.deductions.map(d => <div key={d.component} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', padding: '3px 0' }}><span>{d.component}</span><span style={{ fontWeight: 500, color: 'var(--color-danger-400)' }}>₹{d.amount.toLocaleString()}</span></div>)}<div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid var(--border-primary)', paddingTop: 4, marginTop: 4, fontSize: 'var(--text-sm)', color: 'var(--color-danger-400)' }}><span>Total</span><span>₹{payslipBreakup.totalDeductions.toLocaleString()}</span></div></div>
          </div>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Net Pay</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--color-accent-400)' }}>₹{payslipBreakup.netPay.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div></div>}

      {/* Run Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>{showDetail.month}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Payroll Run</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Status pipeline */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['DRAFT', 'REVIEW', 'LOCKED', 'PAID'].map(s => (
              <button key={s} onClick={() => handleStatusChange(showDetail.id, s)} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 10, fontWeight: 600, background: showDetail.status === s ? (statusStyles[s]?.bg || 'var(--bg-tertiary)') : 'var(--bg-tertiary)', color: showDetail.status === s ? (statusStyles[s]?.color || 'var(--text-muted)') : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Month', f: 'month', v: showDetail.month }, { l: 'Employees', f: 'employees', v: showDetail.employees, t: 'number' }, { l: 'Total Gross', f: 'totalGross', v: showDetail.totalGross ? fm(showDetail.totalGross) : '—', t: 'number' }, { l: 'Net Payable', f: 'totalNet', v: showDetail.totalNet ? fm(showDetail.totalNet) : '—', t: 'number' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" type={item.t || 'text'} style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: item.t === 'number' ? parseInt(e.target.value) || 0 : e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v}</div>}</div>
            ))}
          </div>
          {showDetail.totalGross > 0 && <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 6 }}><span>Deductions</span><span style={{ fontWeight: 600, color: 'var(--color-danger-400)' }}>{fm(showDetail.totalGross - showDetail.totalNet)}</span></div>
            <div style={{ height: 6, background: 'var(--bg-primary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${showDetail.totalNet > 0 ? (showDetail.totalNet / showDetail.totalGross * 100) : 0}%`, background: 'var(--color-accent-500)', borderRadius: 9999 }} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}><span>Deductions: {Math.round((1 - showDetail.totalNet / showDetail.totalGross) * 100)}%</span><span>Net: {Math.round(showDetail.totalNet / showDetail.totalGross * 100)}%</span></div>
          </div>}
        </div>
      </div></div>}
    </div>
  );
}
