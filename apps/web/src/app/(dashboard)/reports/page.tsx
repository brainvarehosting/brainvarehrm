'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

const reportCategories = [
  { name: 'Headcount Report', description: 'Employee count by department, location, grade', icon: '👥', category: 'People' },
  { name: 'Attendance Summary', description: 'Monthly attendance with late, absent stats', icon: '🕐', category: 'Time' },
  { name: 'Leave Utilization', description: 'Leave balance usage across the org', icon: '📅', category: 'Time' },
  { name: 'Payroll Summary', description: 'Monthly gross, deductions, net pay', icon: '💰', category: 'Finance' },
  { name: 'PF/ESIC Report', description: 'Statutory compliance report', icon: '📋', category: 'Compliance' },
  { name: 'New Joiners', description: 'Employees joined in date range', icon: '🎉', category: 'People' },
  { name: 'Attrition Report', description: 'Exit trends and reasons', icon: '📉', category: 'People' },
  { name: 'Probation Due', description: 'Employees due for confirmation', icon: '⏳', category: 'People' },
  { name: 'Birthday Report', description: 'Upcoming employee birthdays', icon: '🎂', category: 'People' },
];

export default function ReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [reportData, setReportData] = useState<any>(null);
  const cats = ['All', 'People', 'Time', 'Finance', 'Compliance'];
  const filtered = categoryFilter === 'All' ? reportCategories : reportCategories.filter(r => r.category === categoryFilter);

  const generateReport = async (name: string) => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReportData(data);
      let msg = `📊 ${name}\n\n`;
      if (name.includes('Headcount')) {
        msg += `Total: ${data.headcount?.total || 0} employees\n`;
        (data.headcount?.byDepartment || []).forEach((d: any) => { msg += `  ${d.name}: ${d.count}\n`; });
      } else if (name.includes('Payroll')) {
        (data.payroll || []).forEach((p: any) => { msg += `${p.month}/${p.year}: Gross ₹${(p.totalGross||0).toLocaleString()} | Net ₹${(p.totalNet||0).toLocaleString()} | ${p.totalEmployees} emp\n`; });
      } else if (name.includes('Leave')) {
        (data.leave?.byStatus || []).forEach((s: any) => { msg += `${s.status}: ${s._count}\n`; });
      } else {
        msg += JSON.stringify(data.headcount, null, 2);
      }
      toast(msg, 'success');
    } catch { toast('Failed to generate report', 'error'); }
  };

  const exportCSV = (name: string) => {
    if (!reportData) { toast('Generate the report first, then export', 'warning'); return; }
    let rows: string[][] = [];
    if (name.includes('Headcount')) {
      rows = [['Department', 'Count'], ...(reportData.headcount?.byDepartment || []).map((d: any) => [d.name, String(d.count)])];
    } else if (name.includes('Payroll')) {
      rows = [['Month', 'Year', 'Gross', 'Net', 'Employees'], ...(reportData.payroll || []).map((p: any) => [String(p.month), String(p.year), String(p.totalGross), String(p.totalNet), String(p.totalEmployees)])];
    }
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${name.toLowerCase().replace(/\s+/g, '-')}.csv`; a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Reports & Analytics</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>Generate, export, and schedule organizational reports</p>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' as const }}>
        {cats.map((cat) => (
          <button key={cat} onClick={() => setCategoryFilter(cat)} style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 500, borderRadius: 9999, border: '1px solid var(--border-primary)', color: categoryFilter === cat ? 'white' : 'var(--text-tertiary)', background: categoryFilter === cat ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer', transition: 'all 0.15s' }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {filtered.map((report) => (
          <div key={report.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer', transition: 'all 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 28 }}>{report.icon}</span>
              <div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{report.name}</h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 4 }}>{report.description}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)' }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{report.category}</span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button style={{ height: 28, padding: '0 var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 600, border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }} onClick={() => generateReport(report.name)}>Generate</button>
                <button style={{ height: 28, padding: '0 var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 600, background: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }} onClick={() => exportCSV(report.name)}>Export</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
