'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

const CATS = ['ALL', 'HR', 'IT', 'ADMIN', 'MANAGER', 'TRAINING'];
const catColors: Record<string, string> = { HR: '#3b82f6', IT: '#06b6d4', ADMIN: '#a78bfa', MANAGER: '#f59e0b', TRAINING: '#10b981' };

export default function OnboardingPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string>('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [editData, setEditData] = useState<any>({});
  const [md, setMd] = useState<any>({ employees: [] });

  useEffect(() => {
    fetch('/api/onboarding').then(r => r.json()).then(d => {
      const all = d.data || d || [];
      setTasks(all);
      const empMap = new Map();
      all.forEach((t: any) => { if (t.employee) empMap.set(t.employeeId, t.employee); });
      setEmployees(Array.from(empMap.values()));
    }).catch(() => {});
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
  }, []);

  const filtered = tasks.filter(t => (selectedEmp === 'ALL' || t.employeeId === selectedEmp) && (catFilter === 'ALL' || t.category === catFilter));
  const grouped = filtered.reduce((acc: any, t: any) => { const key = t.employeeId; if (!acc[key]) acc[key] = { emp: t.employee, tasks: [] }; acc[key].tasks.push(t); return acc; }, {});

  const total = filtered.length;
  const done = filtered.filter(t => t.status === 'COMPLETED').length;
  const pending = filtered.filter(t => t.status === 'PENDING').length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const toggleStatus = async (task: any) => {
    const newStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const res = await fetch(`/api/onboarding/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null }) });
      if (res.ok) { setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus, completedAt: newStatus === 'COMPLETED' ? new Date() : null } : t)); toast(newStatus === 'COMPLETED' ? 'Task completed!' : 'Task reopened', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const f = e.target as HTMLFormElement;
    try {
      const body = { employeeId: (f.elements.namedItem('emp') as HTMLSelectElement).value, title: (f.elements.namedItem('title') as HTMLInputElement).value, description: (f.elements.namedItem('desc') as HTMLInputElement).value, category: (f.elements.namedItem('cat') as HTMLSelectElement).value, assignedTo: (f.elements.namedItem('assigned') as HTMLInputElement).value, dueDate: (f.elements.namedItem('due') as HTMLInputElement).value || undefined };
      const res = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) { const t = await res.json(); setTasks([...tasks, t]); setShowCreate(false); toast('Task created', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleUpdate = async () => {
    try {
      const res = await fetch(`/api/onboarding/${showEdit.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editData.title, description: editData.description, category: editData.category, assignedTo: editData.assignedTo, status: editData.status, dueDate: editData.dueDate || undefined }) });
      if (res.ok) { setTasks(tasks.map(t => t.id === showEdit.id ? { ...t, ...editData } : t)); setShowEdit(null); toast('Updated', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/onboarding/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
      setShowEdit(null);
      toast('Deleted', 'success');
    } catch { toast('Failed', 'error'); }
  };

  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Onboarding</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{employees.length} employees · {total} tasks · {progress}% complete</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Add Task</button>
      </div>

      {/* Progress */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total Tasks', v: total, c: 'var(--text-primary)' }, { l: 'Completed', v: done, c: 'var(--color-accent-400)' }, { l: 'Pending', v: pending, c: 'var(--color-warning-400)' }, { l: 'Overdue', v: filtered.filter(t => t.status === 'OVERDUE').length, c: 'var(--color-danger-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Overall Progress</span><span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-accent-400)' }}>{progress}%</span></div>
        <div style={{ height: 8, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${progress}%`, background: 'var(--color-accent-500)', borderRadius: 9999, transition: 'width 0.5s ease' }} /></div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        <select className="input-field" style={{ width: 200 }} value={selectedEmp} onChange={e => setSelectedEmp(e.target.value)}>
          <option value="ALL">All Employees</option>
          {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 2 }}>
          {CATS.map(c => <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '6px 12px', fontSize: 11, borderRadius: 'var(--radius-md)', background: catFilter === c ? (catColors[c] || 'var(--color-primary-500)') : 'transparent', color: catFilter === c ? 'white' : 'var(--text-secondary)', border: catFilter === c ? 'none' : '1px solid var(--border-primary)', cursor: 'pointer', fontWeight: catFilter === c ? 600 : 400 }}>{c}</button>)}
        </div>
      </div>

      {/* Task Groups by Employee */}
      {Object.entries(grouped).map(([empId, group]: any) => (
        <div key={empId} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="avatar avatar-md">{group.emp?.firstName?.[0]}{group.emp?.lastName?.[0]}</div>
              <div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{group.emp?.firstName} {group.emp?.lastName}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{group.emp?.employeeCode} · {group.tasks.filter((t: any) => t.status === 'COMPLETED').length}/{group.tasks.length} done</div></div>
            </div>
            <div style={{ width: 100, height: 6, background: 'var(--bg-tertiary)', borderRadius: 9999, overflow: 'hidden' }}><div style={{ height: '100%', width: `${(group.tasks.filter((t: any) => t.status === 'COMPLETED').length / group.tasks.length) * 100}%`, background: 'var(--color-accent-500)', borderRadius: 9999 }} /></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {group.tasks.map((task: any, i: number) => (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', borderBottom: i < group.tasks.length - 1 ? '1px solid var(--border-secondary)' : 'none', cursor: 'pointer' }} onClick={() => { setShowEdit(task); setEditData(task); }}>
                <button onClick={e => { e.stopPropagation(); toggleStatus(task); }} style={{ width: 20, height: 20, borderRadius: 4, border: task.status === 'COMPLETED' ? 'none' : '2px solid var(--border-primary)', background: task.status === 'COMPLETED' ? 'var(--color-accent-500)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>{task.status === 'COMPLETED' && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}</button>
                <div style={{ flex: 1, textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none', opacity: task.status === 'COMPLETED' ? 0.6 : 1 }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                  {task.description && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>{task.description}</div>}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: `${catColors[task.category] || '#666'}20`, color: catColors[task.category] || 'var(--text-muted)' }}>{task.category}</span>
                {task.dueDate && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Due: {fd(task.dueDate)}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && <div className="empty-state"><h3>No tasks</h3><p>Create onboarding tasks for new joiners.</p></div>}

      {/* Create Task Modal */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Onboarding Task</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Employee *</label><select className="input-field" name="emp" required><option value="">Select employee...</option>{md.employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeCode})</option>)}</select></div>
          <div><label className="input-label">Task Title *</label><input className="input-field" name="title" required placeholder="e.g. Complete ID verification" /></div>
          <div><label className="input-label">Description</label><input className="input-field" name="desc" placeholder="Additional details..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category *</label><select className="input-field" name="cat" required>{['HR','IT','ADMIN','MANAGER','TRAINING'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="input-label">Due Date</label><input className="input-field" name="due" type="date" /></div>
          </div>
          <div><label className="input-label">Assigned To</label><input className="input-field" name="assigned" placeholder="HR Manager / IT Admin" /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Task</button></div>
        </form>
      </div></div>}

      {/* Edit Task Modal */}
      {showEdit && <div className="modal-overlay" onClick={() => setShowEdit(null)}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Edit Task</h2><div style={{ display: 'flex', gap: 8 }}><button className="btn btn-danger btn-sm" onClick={() => handleDelete(showEdit.id)}>Delete</button><button onClick={() => setShowEdit(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label className="input-label">Title</label><input className="input-field" value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} /></div>
          <div><label className="input-label">Description</label><input className="input-field" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label className="input-label">Category</label><select className="input-field" value={editData.category || 'HR'} onChange={e => setEditData({ ...editData, category: e.target.value })}>{['HR','IT','ADMIN','MANAGER','TRAINING'].map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="input-label">Status</label><select className="input-field" value={editData.status || 'PENDING'} onChange={e => setEditData({ ...editData, status: e.target.value })}>{['PENDING','IN_PROGRESS','COMPLETED','OVERDUE'].map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div><label className="input-label">Assigned To</label><input className="input-field" value={editData.assignedTo || ''} onChange={e => setEditData({ ...editData, assignedTo: e.target.value })} /></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowEdit(null)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button></div>
      </div></div>}
    </div>
  );
}
