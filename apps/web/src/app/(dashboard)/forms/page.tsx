'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'list' | 'builder' | 'fields';

const fieldTypes = [
  { type: 'text', icon: '📝', label: 'Text Input', desc: 'Single line text' },
  { type: 'textarea', icon: '📃', label: 'Long Text', desc: 'Multi-line textarea' },
  { type: 'number', icon: '🔢', label: 'Number', desc: 'Numeric value' },
  { type: 'date', icon: '📅', label: 'Date Picker', desc: 'Date selection' },
  { type: 'select', icon: '📋', label: 'Dropdown', desc: 'Select from options' },
  { type: 'radio', icon: '🔘', label: 'Radio Group', desc: 'Single choice' },
  { type: 'checkbox', icon: '☑️', label: 'Checkboxes', desc: 'Multiple selection' },
  { type: 'file', icon: '📎', label: 'File Upload', desc: 'Attachments' },
  { type: 'rating', icon: '⭐', label: 'Rating Scale', desc: '1-5 star rating' },
  { type: 'section', icon: '📑', label: 'Section Break', desc: 'Group fields' },
  { type: 'employee', icon: '👤', label: 'Employee Lookup', desc: 'Auto-complete employee' },
  { type: 'signature', icon: '✍️', label: 'Signature', desc: 'Digital signature' },
];

export default function FormsPage() {
  const [tab, setTab] = useState<Tab>('list');
  const [forms, setForms] = useState([
    { id: '1', name: 'Employee Onboarding Form', fields: [{ type: 'text', label: 'Full Name', required: true }, { type: 'select', label: 'Department', required: true }, { type: 'date', label: 'Joining Date', required: true }, { type: 'textarea', label: 'Additional Notes', required: false }, { type: 'file', label: 'Upload Documents', required: true }], responses: 8, status: 'ACTIVE', category: 'ONBOARDING', lastModified: '2026-04-15' },
    { id: '2', name: 'Exit Interview Form', fields: [{ type: 'rating', label: 'Overall Experience', required: true }, { type: 'textarea', label: 'Reason for Leaving', required: true }, { type: 'radio', label: 'Would you recommend?', required: true }], responses: 4, status: 'ACTIVE', category: 'EXIT', lastModified: '2026-04-10' },
    { id: '3', name: 'Probation Review Form', fields: [{ type: 'rating', label: 'Performance Rating', required: true }, { type: 'textarea', label: 'Manager Comments', required: true }], responses: 6, status: 'ACTIVE', category: 'PERFORMANCE', lastModified: '2026-03-20' },
    { id: '4', name: 'Training Feedback Survey', fields: [{ type: 'rating', label: 'Content Quality', required: true }, { type: 'rating', label: 'Trainer Rating', required: true }, { type: 'textarea', label: 'Suggestions', required: false }], responses: 24, status: 'ACTIVE', category: 'TRAINING', lastModified: '2026-04-12' },
    { id: '5', name: 'Employee Referral Form', fields: [{ type: 'text', label: 'Candidate Name', required: true }, { type: 'text', label: 'Candidate Email', required: true }, { type: 'file', label: 'Resume', required: true }], responses: 3, status: 'DRAFT', category: 'RECRUITMENT', lastModified: '2026-04-18' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [builderForm, setBuilderForm] = useState<any>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  const handleCreate = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setForms([{ id: Date.now().toString(), name: (f.elements.namedItem('name') as HTMLInputElement).value, fields: [], responses: 0, status: 'DRAFT', category: (f.elements.namedItem('category') as HTMLSelectElement).value, lastModified: new Date().toISOString().split('T')[0] }, ...forms]); setShowCreate(false); toast('Form created!', 'success'); };
  const saveEdits = () => { setForms(forms.map(fm => fm.id === showDetail.id ? { ...fm, ...editData } : fm)); setShowDetail({ ...showDetail, ...editData }); setEditing(false); toast('Updated!', 'success'); };
  const deleteForm = (id: string) => { setForms(forms.filter(fm => fm.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Form deleted', 'success'); };
  const toggleStatus = (id: string) => { setForms(forms.map(fm => fm.id === id ? { ...fm, status: fm.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' } : fm)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status: showDetail.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE' }); toast('Status toggled', 'success'); };
  const addField = () => { if (!newFieldLabel.trim() || !builderForm) return; const updated = { ...builderForm, fields: [...builderForm.fields, { type: newFieldType, label: newFieldLabel, required: false }] }; setForms(forms.map(f => f.id === builderForm.id ? updated : f)); setBuilderForm(updated); setNewFieldLabel(''); setShowAddField(false); toast('Field added!', 'success'); };
  const removeField = (idx: number) => { if (!builderForm) return; const updated = { ...builderForm, fields: builderForm.fields.filter((_: any, i: number) => i !== idx) }; setForms(forms.map(f => f.id === builderForm.id ? updated : f)); setBuilderForm(updated); };
  const toggleRequired = (idx: number) => { if (!builderForm) return; const fields = [...builderForm.fields]; fields[idx] = { ...fields[idx], required: !fields[idx].required }; const updated = { ...builderForm, fields }; setForms(forms.map(f => f.id === builderForm.id ? updated : f)); setBuilderForm(updated); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Forms Builder</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Create custom forms with dynamic fields and approval links</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Create Form</button>
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'list' as Tab, l: 'All Forms' }, { k: 'builder' as Tab, l: 'Builder' }, { k: 'fields' as Tab, l: 'Field Types' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'list' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
        {forms.map(fm => (
          <div key={fm.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => { setShowDetail(fm); setEditData(fm); setEditing(false); }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-primary-400)' }}>{fm.category}</span>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: fm.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: fm.status === 'ACTIVE' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{fm.status}</span>
            </div>
            <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>{fm.name}</h3>
            <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 10, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}><span><strong>{fm.fields.length}</strong> Fields</span><span><strong>{fm.responses}</strong> Responses</span></div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Modified: {new Date(fm.lastModified).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
          </div>
        ))}
      </div>}

      {tab === 'builder' && <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 'var(--space-4)' }}>
        <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
          {!builderForm ? <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-muted)' }}><div style={{ fontSize: 40 }}>🎨</div><p>Select a form to edit:</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center', marginTop: 'var(--space-3)' }}>{forms.map(fm => <button key={fm.id} className="btn btn-ghost btn-sm" onClick={() => setBuilderForm(fm)}>{fm.name}</button>)}</div></div> : <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}><h3 style={{ fontWeight: 600 }}>{builderForm.name}</h3><button className="btn btn-ghost btn-sm" onClick={() => setBuilderForm(null)}>← Back</button></div>
            {builderForm.fields.map((field: any, i: number) => { const ft = fieldTypes.find(f => f.type === field.type); return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }}>
                <span>⋮⋮</span><span>{ft?.icon || '📝'}</span>
                <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{field.label}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{field.type}{field.required ? ' · Required' : ' · Optional'}</div></div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11 }} onClick={() => toggleRequired(i)}>{field.required ? '🔒' : '🔓'}</button>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-danger-400)', fontSize: 12 }} onClick={() => removeField(i)}>✕</button>
              </div>
            ); })}
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 'var(--space-2)' }} onClick={() => setShowAddField(true)}>+ Add Field</button>
          </>}
        </div>
        <div className="stat-card" style={{ padding: 'var(--space-4)' }}>
          <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>Field types:</h4>
          {fieldTypes.slice(0, 8).map(ft => (
            <div key={ft.type} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px', marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{ft.icon}</span><div style={{ fontSize: 10 }}><strong>{ft.label}</strong><div style={{ color: 'var(--text-muted)' }}>{ft.desc}</div></div>
            </div>
          ))}
        </div>
      </div>}

      {tab === 'fields' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 'var(--space-3)' }}>
        {fieldTypes.map(ft => (
          <div key={ft.type} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 'var(--space-2)' }}>{ft.icon}</div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 4 }}>{ft.label}</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{ft.desc}</p>
          </div>
        ))}
      </div>}

      {/* Delete */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}><div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete "{deleteConfirm.name}"?</p></div><div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteForm(deleteConfirm.id)}>Delete</button></div></div></div>}

      {/* Create */}
      {showCreate && <div className="modal-overlay" onClick={() => setShowCreate(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Form</h2><button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreate}>
          <div><label className="input-label">Form Name *</label><input className="input-field" name="name" required placeholder="Employee Onboarding Form" /></div>
          <div><label className="input-label">Category</label><select className="input-field" name="category"><option>ONBOARDING</option><option>EXIT</option><option>PERFORMANCE</option><option>TRAINING</option><option>RECRUITMENT</option><option>IT</option><option>HR</option></select></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Add Field */}
      {showAddField && <div className="modal-overlay" onClick={() => setShowAddField(false)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Field</h2><button onClick={() => setShowAddField(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div><label className="input-label">Label *</label><input className="input-field" value={newFieldLabel} onChange={e => setNewFieldLabel(e.target.value)} placeholder="Field label" /></div>
          <div><label className="input-label">Type</label><select className="input-field" value={newFieldType} onChange={e => setNewFieldType(e.target.value)}>{fieldTypes.map(ft => <option key={ft.type} value={ft.type}>{ft.icon} {ft.label}</option>)}</select></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setShowAddField(false)}>Cancel</button><button className="btn btn-primary" onClick={addField} disabled={!newFieldLabel.trim()}>Add</button></div>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{showDetail.name}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {editing ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setEditData(showDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={saveEdits}>Save</button></> : <><button className="btn btn-ghost btn-sm" onClick={() => { setBuilderForm(showDetail); setTab('builder'); setShowDetail(null); }}>🎨</button><button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>✏️</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button></>}
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <button className={`btn btn-sm ${showDetail.status === 'ACTIVE' ? '' : 'btn-primary'}`} onClick={() => toggleStatus(showDetail.id)}>{showDetail.status === 'ACTIVE' ? '⏸ Set to Draft' : '▶ Publish'}</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            {[{ l: 'Name', f: 'name' }, { l: 'Category', f: 'category' }, { l: 'Status', f: 'status' }, { l: 'Fields', v: `${showDetail.fields.length}` }, { l: 'Responses', v: `${showDetail.responses}` }, { l: 'Modified', f: 'lastModified', v: new Date(showDetail.lastModified).toLocaleDateString('en-IN') }].map(item => (
              <div key={item.l}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{item.l}</div>{editing && item.f ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={editData[item.f] || ''} onChange={e => setEditData({ ...editData, [item.f]: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{item.v || (item.f ? showDetail[item.f] : '')}</div>}</div>
            ))}
          </div>
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Fields ({showDetail.fields.length})</div>
            {showDetail.fields.map((f: any, i: number) => { const ft = fieldTypes.find(t => t.type === f.type); return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: '6px var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{ft?.icon || '📝'}</span><span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{f.label}</span><span style={{ fontSize: 9, color: f.required ? 'var(--color-danger-400)' : 'var(--text-muted)' }}>{f.required ? 'REQUIRED' : 'OPTIONAL'}</span>
              </div>
            ); })}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
