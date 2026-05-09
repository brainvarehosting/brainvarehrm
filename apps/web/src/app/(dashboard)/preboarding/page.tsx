'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

export default function PreboardingPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [md, setMd] = useState<any>({ departments: [], designations: [] });

  useEffect(() => {
    fetch('/api/onboarding').then(r => r.json()).then(d => {
      const tasks = d.data || d || [];
      // Group by employee, only those with PENDING preboarding tasks
      const empMap = new Map();
      tasks.forEach((t: any) => { if (t.employee) { if (!empMap.has(t.employeeId)) empMap.set(t.employeeId, { emp: t.employee, tasks: [] }); empMap.get(t.employeeId).tasks.push(t); } });
      setCandidates(Array.from(empMap.values()));
    }).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const checklist = [
    { key: 'offer', label: 'Offer Letter Sent', icon: '📧' },
    { key: 'docs', label: 'Documents Collected', icon: '📄' },
    { key: 'bg', label: 'Background Check', icon: '🔍' },
    { key: 'equipment', label: 'Equipment Ordered', icon: '💻' },
    { key: 'access', label: 'System Access Setup', icon: '🔐' },
    { key: 'welcome', label: 'Welcome Kit Prepared', icon: '🎁' },
    { key: 'buddy', label: 'Buddy Assigned', icon: '🤝' },
    { key: 'desk', label: 'Workspace Ready', icon: '🪑' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Preboarding</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Prepare new joiners before Day 1</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Candidate</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Candidates', v: candidates.length, c: 'var(--text-primary)' }, { l: 'Tasks Pending', v: candidates.reduce((s, c) => s + c.tasks.filter((t: any) => t.status !== 'COMPLETED').length, 0), c: 'var(--color-warning-400)' }, { l: 'Completed', v: candidates.reduce((s, c) => s + c.tasks.filter((t: any) => t.status === 'COMPLETED').length, 0), c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      {/* Candidates */}
      {candidates.length > 0 ? (
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          {candidates.map((c, ci) => {
            const done = c.tasks.filter((t: any) => t.status === 'COMPLETED').length;
            const total = c.tasks.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div key={ci} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setShowDetail(c)}>
                <div style={{ padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                  <div className="avatar avatar-lg">{c.emp?.firstName?.[0]}{c.emp?.lastName?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{c.emp?.firstName} {c.emp?.lastName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.emp?.email} · {c.emp?.employeeCode}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 800, color: pct === 100 ? 'var(--color-accent-400)' : pct > 50 ? 'var(--color-primary-400)' : 'var(--color-warning-400)' }}>{pct}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{done}/{total} tasks</div>
                  </div>
                </div>
                <div style={{ height: 4, background: 'var(--bg-tertiary)' }}><div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--color-accent-500)' : 'var(--color-primary-500)', transition: 'width 0.5s' }} /></div>
                {/* Quick Checklist */}
                <div style={{ padding: '8px var(--space-4)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {checklist.slice(0, 5).map(item => {
                    const taskMatch = c.tasks.find((t: any) => t.title?.toLowerCase().includes(item.label.toLowerCase().split(' ')[0]));
                    const isDone = taskMatch?.status === 'COMPLETED';
                    return <span key={item.key} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: isDone ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)', color: isDone ? 'var(--color-accent-400)' : 'var(--text-muted)' }}>{item.icon} {item.label}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : <div className="empty-state"><h3>No preboarding candidates</h3><p>Add new joiners to begin their preboarding journey.</p></div>}

      {/* Detail Modal */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div><h2>{showDetail.emp?.firstName} {showDetail.emp?.lastName}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showDetail.emp?.email}</p></div><button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Preboarding Checklist</div>
          {checklist.map(item => {
            const taskMatch = showDetail.tasks.find((t: any) => t.title?.toLowerCase().includes(item.label.toLowerCase().split(' ')[0]));
            const isDone = taskMatch?.status === 'COMPLETED';
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: isDone ? 'rgba(16,185,129,0.06)' : 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 500, textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1 }}>{item.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: isDone ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{isDone ? '✓ Done' : 'Pending'}</span>
              </div>
            );
          })}
        </div>
      </div></div>}

      {/* Add Candidate */}
      {showAdd && <div className="modal-overlay" onClick={() => setShowAdd(false)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Preboarding Candidate</h2><button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={async e => {
          e.preventDefault(); const f = e.target as HTMLFormElement;
          const empId = (f.elements.namedItem('emp') as HTMLSelectElement).value;
          try {
            for (const item of checklist) {
              await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: empId, title: item.label, category: 'HR', description: `Preboarding: ${item.label}` }) });
            }
            toast('Preboarding tasks created!', 'success'); setShowAdd(false); window.location.reload();
          } catch { toast('Failed', 'error'); }
        }}>
          <div><label className="input-label">Select Employee *</label><select className="input-field" name="emp" required><option value="">Select new joiner...</option>{md.employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>The following {checklist.length} preboarding tasks will be auto-created:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {checklist.map(c => <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}><span>{c.icon}</span>{c.label}</div>)}
          </div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Preboarding</button></div>
        </form>
      </div></div>}
    </div>
  );
}
