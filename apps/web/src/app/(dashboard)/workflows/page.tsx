'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'list' | 'builder' | 'blocks';

const stepTypes = [
  { type: 'trigger', label: 'Trigger', icon: '⚡', color: '#3b82f6', desc: 'Event that starts the workflow' },
  { type: 'condition', label: 'Condition', icon: '🔀', color: '#8b5cf6', desc: 'Branch based on criteria' },
  { type: 'approval', label: 'Approval', icon: '✅', color: '#10b981', desc: 'Request approval from user/role' },
  { type: 'action', label: 'Action', icon: '⚙️', color: '#f59e0b', desc: 'Auto-execute system action' },
  { type: 'notification', label: 'Notify', icon: '🔔', color: '#ec4899', desc: 'Send email/SMS/in-app alert' },
  { type: 'delay', label: 'Wait / Delay', icon: '⏳', color: '#06b6d4', desc: 'Pause for duration or event' },
  { type: 'document', label: 'Generate Doc', icon: '📝', color: '#14b8a6', desc: 'Auto-generate letter or PDF' },
  { type: 'webhook', label: 'Webhook', icon: '🌐', color: '#6366f1', desc: 'Call external API endpoint' },
];

export default function WorkflowsPage() {
  const [tab, setTab] = useState<Tab>('list');
  const [workflows, setWorkflows] = useState([
    { id: '1', name: 'Leave Approval Flow', trigger: 'Employee submits leave', status: 'ACTIVE', steps: [{ type: 'trigger', label: 'Employee submits leave request' }, { type: 'condition', label: 'If leave > 3 days → Manager + HR' }, { type: 'approval', label: 'Manager approves leave' }, { type: 'notification', label: 'Notify employee of decision' }], executions: 156, lastRun: '2 hours ago', category: 'TIME', icon: '📅' },
    { id: '2', name: 'Onboarding Journey', trigger: 'New employee created', status: 'ACTIVE', steps: [{ type: 'trigger', label: 'New employee record created' }, { type: 'action', label: 'Create accounts & access' }, { type: 'notification', label: 'Welcome email' }, { type: 'action', label: 'Assign training' }, { type: 'delay', label: 'Wait 7 days' }, { type: 'notification', label: 'Check-in survey' }, { type: 'approval', label: 'Manager buddy review' }, { type: 'document', label: 'Generate confirmation letter' }], executions: 12, lastRun: '3 days ago', category: 'PEOPLE', icon: '🎉' },
    { id: '3', name: 'Exit Clearance', trigger: 'Resignation accepted', status: 'ACTIVE', steps: [{ type: 'trigger', label: 'Resignation accepted' }, { type: 'action', label: 'Initiate clearance checklist' }, { type: 'approval', label: 'IT clearance' }, { type: 'approval', label: 'Finance clearance' }, { type: 'approval', label: 'HR clearance' }, { type: 'document', label: 'Generate experience letter' }], executions: 4, lastRun: '1 week ago', category: 'EXIT', icon: '🚪' },
    { id: '4', name: 'Expense Approval', trigger: 'Expense claim submitted', status: 'ACTIVE', steps: [{ type: 'trigger', label: 'Expense claim submitted' }, { type: 'approval', label: 'Manager review' }, { type: 'action', label: 'Process reimbursement' }], executions: 42, lastRun: '1 day ago', category: 'FINANCE', icon: '💳' },
    { id: '5', name: 'Probation Review Reminder', trigger: 'Probation end date - 15 days', status: 'ACTIVE', steps: [{ type: 'trigger', label: 'Probation end approaching' }, { type: 'notification', label: 'Notify manager' }, { type: 'action', label: 'Create review task' }], executions: 6, lastRun: '2 weeks ago', category: 'PEOPLE', icon: '⏰' },
    { id: '6', name: 'Training Auto-Assignment', trigger: 'Employee joins department', status: 'DRAFT', steps: [{ type: 'trigger', label: 'Employee joins department' }, { type: 'action', label: 'Assign department training' }], executions: 0, lastRun: 'Never', category: 'TRAINING', icon: '📚' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [builderWf, setBuilderWf] = useState<any>(null);

  const toggleStatus = (id: string) => { setWorkflows(workflows.map(w => w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' } : w)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status: showDetail.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' }); toast('Status toggled', 'success'); };
  const deleteWorkflow = (id: string) => { setWorkflows(workflows.filter(w => w.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Workflow deleted', 'success'); };
  const saveEdits = () => { setWorkflows(workflows.map(w => w.id === showDetail.id ? { ...w, ...editData } : w)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const handleCreate = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setWorkflows([{ id: Date.now().toString(), name: (f.elements.namedItem('name') as HTMLInputElement).value, trigger: (f.elements.namedItem('trigger') as HTMLInputElement).value, status: 'DRAFT', steps: [{ type: 'trigger', label: (f.elements.namedItem('trigger') as HTMLInputElement).value }], executions: 0, lastRun: 'Never', category: (f.elements.namedItem('category') as HTMLSelectElement).value, icon: '⚙️' }, ...workflows]); setShowCreate(false); toast('Workflow created!', 'success'); };
  const addStep = (wfId: string, stepType: string) => { const st = stepTypes.find(s => s.type === stepType); if (!st) return; setWorkflows(workflows.map(w => w.id === wfId ? { ...w, steps: [...w.steps, { type: stepType, label: st.label }] } : w)); if (builderWf?.id === wfId) setBuilderWf({ ...builderWf, steps: [...builderWf.steps, { type: stepType, label: st.label }] }); toast(`Added ${st.label} step`, 'success'); };
  const removeStep = (wfId: string, idx: number) => { setWorkflows(workflows.map(w => w.id === wfId ? { ...w, steps: w.steps.filter((_: any, i: number) => i !== idx) } : w)); if (builderWf?.id === wfId) setBuilderWf({ ...builderWf, steps: builderWf.steps.filter((_: any, i: number) => i !== idx) }); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Workflow Studio</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Visual workflow builder — automate approvals, notifications, and actions</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Workflow</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Active', v: workflows.filter(w => w.status === 'ACTIVE').length, c: 'var(--color-accent-400)' }, { l: 'Draft', v: workflows.filter(w => w.status === 'DRAFT').length, c: 'var(--color-warning-400)' }, { l: 'Total Runs', v: workflows.reduce((s, w) => s + w.executions, 0), c: 'var(--color-primary-400)' }, { l: 'Block Types', v: stepTypes.length, c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'list' as Tab, l: 'All Workflows' }, { k: 'builder' as Tab, l: 'Builder' }, { k: 'blocks' as Tab, l: 'Block Library' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'list' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
        {workflows.map(wf => (
          <div key={wf.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => { setShowDetail(wf); setEditData(wf); setEditing(false); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 20 }}>{wf.icon}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: wf.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: wf.status === 'ACTIVE' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{wf.status}</span>
            </div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{wf.name}</h3>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>⚡ {wf.trigger}</div>
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 10, color: 'var(--text-muted)' }}>
              <span><strong>{wf.steps.length}</strong> Steps</span><span><strong>{wf.executions}</strong> Runs</span><span>{wf.lastRun}</span>
            </div>
          </div>
        ))}
      </div>}

      {tab === 'builder' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 250px', gap: 'var(--space-4)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          {!builderWf ? <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-2)' }}>🎨</div><p>Select a workflow to edit:</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-3)' }}>{workflows.map(wf => <button key={wf.id} className="btn btn-ghost btn-sm" onClick={() => setBuilderWf(wf)}>{wf.icon} {wf.name}</button>)}</div></div> : <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}><h3 style={{ fontWeight: 600 }}>{builderWf.icon} {builderWf.name}</h3><button className="btn btn-ghost btn-sm" onClick={() => setBuilderWf(null)}>← Back</button></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {builderWf.steps.map((step: any, i: number) => { const st = stepTypes.find(s => s.type === step.type); return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: 16 }}>{st?.icon || '⚙️'}</span>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{step.label}</div><div style={{ fontSize: 10, color: st?.color || 'var(--text-muted)' }}>{st?.label}</div></div>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-400)', fontSize: 12 }} onClick={() => removeStep(builderWf.id, i)}>✕</button>
                </div>
              ); })}
            </div>
          </>}
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-4)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Add blocks:</h4>
          {stepTypes.map(s => (
            <button key={s.type} onClick={() => builderWf && addStep(builderWf.id, s.type)} disabled={!builderWf} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-secondary)', borderRadius: 'var(--radius-md)', cursor: builderWf ? 'pointer' : 'not-allowed', opacity: builderWf ? 1 : 0.5 }}>
              <span style={{ fontSize: 14, width: 26, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.color + '15', color: s.color }}>{s.icon}</span>
              <div style={{ textAlign: 'left' }}><div style={{ fontSize: 11, fontWeight: 600 }}>{s.label}</div><div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.desc}</div></div>
            </button>
          ))}
        </div>
      </div>}

      {tab === 'blocks' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
        {stepTypes.map(s => (
          <div key={s.type} style={{ background: 'var(--bg-card)', border: `1px solid ${s.color}30`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: s.color + '15', color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto var(--space-3)' }}>{s.icon}</div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 4 }}>{s.label}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{s.desc}</p>
            <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.type}</span>
          </div>
        ))}
      </div>}

      {/* Delete */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete "{deleteConfirm.name}"?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteWorkflow(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Workflow</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Name *</label><input className="input-field" name="name" required placeholder="Leave Approval Flow" /></div>
          <div><label className="input-label">Trigger *</label><input className="input-field" name="trigger" required placeholder="Employee submits leave" /></div>
          <div><label className="input-label">Category</label><select className="input-field" name="category"><option>TIME</option><option>PEOPLE</option><option>FINANCE</option><option>EXIT</option><option>TRAINING</option><option>DOCUMENTS</option><option>PAYROLL</option></select></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><span style={{ fontSize: 20 }}>{showDetail.icon}</span><h2>{showDetail.name}</h2></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button onClick={() => toggleStatus(showDetail.id)} className={`btn btn-sm ${showDetail.status === 'ACTIVE' ? '' : 'btn-primary'}`} style={{ flex: 1 }}>{showDetail.status === 'ACTIVE' ? '⏸ Deactivate' : '▶ Activate'}</button>
            <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setBuilderWf(showDetail); setTab('builder'); setShowDetail(null); }}>🎨 Open in Builder</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Name', f: 'name' }, { l: 'Trigger', f: 'trigger' }, { l: 'Category', f: 'category' }, { l: 'Status', f: 'status', v: showDetail.status }, { l: 'Executions', f: 'executions', v: showDetail.executions }, { l: 'Last Run', f: 'lastRun' }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v ?? showDetail[item.f]}</div>}</div>
            ))}
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Steps ({showDetail.steps.length})</div>
            {showDetail.steps.map((step: any, i: number) => { const st = stepTypes.find(s => s.type === step.type); return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: st?.color }}>{st?.icon || '⚙️'}</span>
                <span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{step.label}</span>
                <span style={{ fontSize: 9, color: st?.color, fontWeight: 600 }}>{st?.label}</span>
              </div>
            ); })}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
