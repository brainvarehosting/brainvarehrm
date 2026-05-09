'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

const stages = ['Applied', 'Screening', 'Interview', 'Technical', 'HR Round', 'Offer', 'Hired', 'Rejected'];
const stageColors: Record<string, string> = { Applied: '#94a3b8', Screening: '#3b82f6', Interview: '#8b5cf6', Technical: '#06b6d4', 'HR Round': '#f59e0b', Offer: '#10b981', Hired: '#22c55e', Rejected: '#ef4444' };
const priorityClr: Record<string, string> = { URGENT: 'var(--color-danger-400)', HIGH: 'var(--color-warning-400)', NORMAL: 'var(--color-primary-400)', LOW: 'var(--text-muted)' };

type Tab = 'jobs' | 'pipeline' | 'candidates';
type ModalTab = 'details' | 'candidates' | 'activity';

export default function RecruitmentPage() {
  const [tab, setTab] = useState<Tab>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [showJobDetail, setShowJobDetail] = useState<any>(null);
  const [showCandidateDetail, setShowCandidateDetail] = useState<any>(null);
  const [editingJob, setEditingJob] = useState(false);
  const [editJobData, setEditJobData] = useState<any>({});
  const [editingCandidate, setEditingCandidate] = useState(false);
  const [editCandidateData, setEditCandidateData] = useState<any>({});
  const [jobDetailTab, setJobDetailTab] = useState<ModalTab>('details');
  const [deleteConfirm, setDeleteConfirm] = useState<{type: string, id: string, name: string} | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showFeedback, setShowFeedback] = useState<any>(null);

  useEffect(() => {
    fetch('/api/recruitment').then(r => r.json()).then(d => { setJobs(d.jobs || d.data || []); setCandidates(d.candidates || []); }).catch(() => {});
  }, []);

  const stats = { openJobs: jobs.filter(j => j.status === 'OPEN').length, totalCandidates: candidates.length, inPipeline: candidates.filter(c => !['Hired', 'Rejected'].includes(c.stage)).length, hired: candidates.filter(c => c.stage === 'Hired').length, rejected: candidates.filter(c => c.stage === 'Rejected').length, avgDays: candidates.length > 0 ? Math.round(candidates.reduce((s, c) => s + (c.days || 0), 0) / candidates.length) : 0 };
  const filteredJobs = jobs.filter(j => { const s = search.toLowerCase(); return (!s || `${j.title} ${j.department} ${j.location}`.toLowerCase().includes(s)) && (statusFilter === 'ALL' || j.status === statusFilter); });
  const filteredCandidates = candidates.filter(c => { const s = search.toLowerCase(); return !s || `${c.name} ${c.role} ${c.source} ${c.email}`.toLowerCase().includes(s); });
  const pipelineData = stages.filter(s => s !== 'Rejected').map(stage => ({ stage, candidates: candidates.filter(c => c.stage === stage) }));
  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  // ── CRUD Handlers ──
  const handleCreateJob = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body: any = {};
    ['title', 'department', 'location', 'type', 'priority', 'description', 'requirements', 'salary', 'hiringManager', 'skills'].forEach(k => { const el = f.elements.namedItem(k) as HTMLInputElement; if (el?.value) body[k] = el.value; });
    body.openings = parseInt((f.elements.namedItem('openings') as HTMLInputElement)?.value) || 1;
    body.status = 'OPEN';
    try {
      const res = await fetch('/api/recruitment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'job', ...body }) });
      if (res.ok) { const j = await res.json(); setJobs([...jobs, j]); setShowCreateJob(false); toast('Job posted!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleUpdateJob = async () => {
    try {
      const res = await fetch('/api/recruitment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showJobDetail.id, ...editJobData }) });
      if (res.ok) { const u = await res.json(); setJobs(jobs.map(j => j.id === showJobDetail.id ? { ...j, ...u } : j)); setShowJobDetail({ ...showJobDetail, ...editJobData }); setEditingJob(false); toast('Job updated!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleDeleteJob = async (id: string) => {
    try {
      await fetch('/api/recruitment', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, type: 'job' }) });
      setJobs(jobs.filter(j => j.id !== id)); setShowJobDetail(null); setDeleteConfirm(null); toast('Job deleted', 'success');
    } catch { toast('Failed', 'error'); }
  };

  const handleAddCandidate = async (e: any) => {
    e.preventDefault(); const f = e.target as HTMLFormElement;
    const body: any = {};
    ['name', 'email', 'phone', 'role', 'source', 'experience', 'currentCompany', 'currentCTC', 'expectedCTC', 'noticePeriod', 'notes', 'linkedIn'].forEach(k => { const el = f.elements.namedItem(k) as HTMLInputElement; if (el?.value) body[k] = el.value; });
    body.stage = 'Applied'; body.rating = 0; body.days = 0;
    try {
      const res = await fetch('/api/recruitment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'candidate', ...body }) });
      if (res.ok) { const c = await res.json(); setCandidates([...candidates, c]); setShowAddCandidate(false); toast('Candidate added!', 'success'); }
    } catch { toast('Failed', 'error'); }
  };

  const handleUpdateCandidate = async () => {
    try {
      await fetch('/api/recruitment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: showCandidateDetail.id, type: 'candidate', ...editCandidateData }) });
      setCandidates(candidates.map(c => c.id === showCandidateDetail.id ? { ...c, ...editCandidateData } : c));
      setShowCandidateDetail({ ...showCandidateDetail, ...editCandidateData }); setEditingCandidate(false); toast('Updated!', 'success');
    } catch { toast('Failed', 'error'); }
  };

  const handleDeleteCandidate = async (id: string) => {
    try {
      await fetch('/api/recruitment', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, type: 'candidate' }) });
      setCandidates(candidates.filter(c => c.id !== id)); setShowCandidateDetail(null); setDeleteConfirm(null); toast('Candidate removed', 'success');
    } catch { toast('Failed', 'error'); }
  };

  const moveCandidate = async (candidateId: string, newStage: string) => {
    try {
      await fetch('/api/recruitment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'candidate', id: candidateId, stage: newStage, days: (candidates.find(c => c.id === candidateId)?.days || 0) + 1 }) });
      setCandidates(candidates.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
      if (showCandidateDetail?.id === candidateId) setShowCandidateDetail({ ...showCandidateDetail, stage: newStage });
      toast(`Moved to ${newStage}`, 'success');
    } catch { toast('Failed', 'error'); }
  };

  const setRating = async (candidateId: string, rating: number) => {
    try {
      await fetch('/api/recruitment', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'candidate', id: candidateId, rating }) });
      setCandidates(candidates.map(c => c.id === candidateId ? { ...c, rating } : c));
      if (showCandidateDetail?.id === candidateId) setShowCandidateDetail({ ...showCandidateDetail, rating });
    } catch {}
  };

  const Field = ({ label, children }: any) => <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><label className="input-label">{label}</label>{children}</div>;
  const InfoField = ({ label, value, editMode, field, data, setData, type, options }: any) => (
    <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500, letterSpacing: '0.05em' }}>{label}</div>
    {editMode ? (options ? <select className="input-field" style={{ height: 30, fontSize: 'var(--text-sm)', marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })}><option value="">—</option>{options.map((o: any) => <option key={o.v || o} value={o.v || o}>{o.l || o}</option>)}</select> : <input className="input-field" type={type || 'text'} style={{ height: 30, fontSize: 'var(--text-sm)', marginTop: 2 }} value={data[field] || ''} onChange={e => setData({ ...data, [field]: e.target.value })} />) : <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2, fontWeight: 500 }}>{value || '—'}</div>}</div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Recruitment</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{stats.openJobs} open · {stats.totalCandidates} candidates · {stats.hired} hired · {stats.rejected} rejected</p></div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}><button className="btn btn-ghost" onClick={() => setShowAddCandidate(true)}>+ Candidate</button><button className="btn btn-primary" onClick={() => setShowCreateJob(true)}>+ Post Job</button></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Open', v: stats.openJobs, c: 'var(--color-primary-400)' }, { l: 'Candidates', v: stats.totalCandidates, c: 'var(--text-primary)' }, { l: 'Pipeline', v: stats.inPipeline, c: 'var(--color-warning-400)' }, { l: 'Hired', v: stats.hired, c: 'var(--color-accent-400)' }, { l: 'Rejected', v: stats.rejected, c: 'var(--color-danger-400)' }, { l: 'Avg Days', v: stats.avgDays, c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)', marginBottom: -8 }}>
        {[{ k: 'jobs' as Tab, l: `Jobs (${jobs.length})` }, { k: 'pipeline' as Tab, l: 'Pipeline' }, { k: 'candidates' as Tab, l: `Candidates (${candidates.length})` }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: tab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <input className="input-field" style={{ flex: 1 }} placeholder={tab === 'jobs' ? 'Search jobs...' : 'Search candidates...'} value={search} onChange={e => setSearch(e.target.value)} />
        {tab === 'jobs' && <div style={{ display: 'flex', gap: 2 }}>{['ALL', 'OPEN', 'CLOSED', 'ON_HOLD'].map(s => <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '4px 12px', fontSize: 12, borderRadius: 'var(--radius-md)', background: statusFilter === s ? 'var(--color-primary-500)' : 'transparent', color: statusFilter === s ? 'white' : 'var(--text-secondary)', border: statusFilter === s ? 'none' : '1px solid var(--border-primary)', cursor: 'pointer' }}>{s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}</button>)}</div>}
      </div>

      {/* ── JOBS TAB ── */}
      {tab === 'jobs' && (filteredJobs.length > 0 ? (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Position</th><th>Department</th><th>Location</th><th>Type</th><th>Openings</th><th>Candidates</th><th>Priority</th><th>Status</th><th>Posted</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>{filteredJobs.map(j => (
            <tr key={j.id} style={{ cursor: 'pointer' }} onClick={() => { setShowJobDetail(j); setEditJobData(j); setEditingJob(false); setJobDetailTab('details'); }}>
              <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{j.title}</td><td>{j.department || '—'}</td><td>{j.location || '—'}</td>
              <td style={{ fontSize: 'var(--text-xs)' }}>{(j.type || 'FT').replace(/_/g, ' ')}</td>
              <td><span style={{ fontWeight: 700 }}>{j.filled || 0}</span>/<span style={{ color: 'var(--text-muted)' }}>{j.openings || 1}</span></td>
              <td style={{ fontWeight: 600, color: 'var(--color-primary-400)' }}>{candidates.filter(c => c.role === j.title).length}</td>
              <td><span style={{ fontSize: 11, fontWeight: 600, color: priorityClr[j.priority] || 'var(--text-muted)' }}>{j.priority || '—'}</span></td>
              <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: j.status === 'OPEN' ? 'rgba(16,185,129,0.12)' : j.status === 'CLOSED' ? 'var(--bg-tertiary)' : 'rgba(245,158,11,0.12)', color: j.status === 'OPEN' ? 'var(--color-accent-400)' : j.status === 'CLOSED' ? 'var(--text-muted)' : 'var(--color-warning-400)' }}>{j.status}</span></td>
              <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{fd(j.publishedAt)}</td>
              <td onClick={e => e.stopPropagation()}><button onClick={() => setDeleteConfirm({ type: 'job', id: j.id, name: j.title })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }} title="Delete">🗑</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty-state"><h3>No jobs</h3><p>Post your first job opening.</p></div>)}

      {/* ── PIPELINE TAB ── */}
      {tab === 'pipeline' && (
        <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-4)' }}>
          {pipelineData.map(col => (
            <div key={col.stage} style={{ minWidth: 200, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', padding: '0 4px' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: stageColors[col.stage] }}>{col.stage}</span>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 9999, background: `${stageColors[col.stage]}15`, color: stageColors[col.stage] }}>{col.candidates.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {col.candidates.map(c => (
                  <div key={c.id} onClick={() => { setShowCandidateDetail(c); setEditCandidateData(c); setEditingCandidate(false); }} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', cursor: 'pointer', borderLeft: `3px solid ${stageColors[col.stage]}`, transition: 'all 0.2s' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 2 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>{c.role}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.source} · {c.days}d</span>
                      {c.rating > 0 && <span style={{ fontSize: 10, color: '#f59e0b' }}>★ {c.rating}</span>}
                    </div>
                  </div>
                ))}
                {col.candidates.length === 0 && <div style={{ padding: 'var(--space-4)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', borderStyle: 'dashed', border: '1px dashed var(--border-primary)' }}>No candidates</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CANDIDATES TAB ── */}
      {tab === 'candidates' && (filteredCandidates.length > 0 ? (
        <div className="table-wrapper"><table className="table-base">
          <thead><tr><th>Name</th><th>Role</th><th>Email</th><th>Source</th><th>Stage</th><th>Rating</th><th>Days</th><th>Experience</th><th style={{ width: 60 }}></th></tr></thead>
          <tbody>{filteredCandidates.map(c => (
            <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => { setShowCandidateDetail(c); setEditCandidateData(c); setEditingCandidate(false); }}>
              <td style={{ fontWeight: 600 }}>{c.name}</td><td>{c.role}</td>
              <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{c.email}</td>
              <td style={{ fontSize: 'var(--text-xs)' }}>{c.source}</td>
              <td><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: `${stageColors[c.stage] || '#666'}15`, color: stageColors[c.stage] }}>{c.stage}</span></td>
              <td>{c.rating > 0 ? <span style={{ color: '#f59e0b' }}>★ {c.rating}</span> : '—'}</td>
              <td style={{ fontSize: 'var(--text-xs)' }}>{c.days}d</td><td style={{ fontSize: 'var(--text-xs)' }}>{c.experience || '—'}</td>
              <td onClick={e => e.stopPropagation()}><button onClick={() => setDeleteConfirm({ type: 'candidate', id: c.id, name: c.name })} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }} title="Delete">🗑</button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <div className="empty-state"><h3>No candidates</h3></div>)}

      {/* ══ DELETE CONFIRM ══ */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Confirm Delete</h2></div>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
          <div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div>
          <p style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 8 }}>Delete "{deleteConfirm.name}"?</p>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>This action cannot be undone. All associated data will be permanently removed.</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button>
          <button className="btn btn-danger" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteConfirm.type === 'job' ? handleDeleteJob(deleteConfirm.id) : handleDeleteCandidate(deleteConfirm.id)}>Delete Permanently</button>
        </div>
      </div></div>}

      {/* ══ CREATE JOB ══ */}
      {showCreateJob && <div className="modal-overlay" onClick={() => setShowCreateJob(false)}><div className="modal-content" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Post New Job</h2><button onClick={() => setShowCreateJob(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreateJob}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Basic Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Job Title *"><input className="input-field" name="title" required placeholder="Senior React Developer" /></Field>
            <Field label="Department"><input className="input-field" name="department" placeholder="Engineering" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Location"><input className="input-field" name="location" placeholder="Bangalore / Remote" /></Field>
            <Field label="Type"><select className="input-field" name="type"><option value="FULL_TIME">Full Time</option><option value="PART_TIME">Part Time</option><option value="CONTRACT">Contract</option><option value="INTERN">Intern</option><option value="FREELANCE">Freelance</option></select></Field>
            <Field label="Priority"><select className="input-field" name="priority"><option value="NORMAL">Normal</option><option value="HIGH">High</option><option value="URGENT">Urgent</option><option value="LOW">Low</option></select></Field>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Compensation & Requirements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Openings"><input className="input-field" name="openings" type="number" defaultValue="1" /></Field>
            <Field label="Salary Range"><input className="input-field" name="salary" placeholder="₹12-20L per annum" /></Field>
            <Field label="Hiring Manager"><input className="input-field" name="hiringManager" placeholder="Rajesh Kumar" /></Field>
          </div>
          <Field label="Required Skills"><input className="input-field" name="skills" placeholder="React, TypeScript, Node.js, System Design" /></Field>
          <Field label="Job Description"><textarea className="input-field" name="description" rows={4} placeholder="Detailed role description, responsibilities, and expectations..." /></Field>
          <Field label="Requirements & Qualifications"><textarea className="input-field" name="requirements" rows={3} placeholder="Required experience, education, certifications..." /></Field>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreateJob(false)}>Cancel</button><button type="submit" className="btn btn-primary">Post Job</button></div>
        </form>
      </div></div>}

      {/* ══ ADD CANDIDATE ══ */}
      {showAddCandidate && <div className="modal-overlay" onClick={() => setShowAddCandidate(false)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Add Candidate</h2><button onClick={() => setShowAddCandidate(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleAddCandidate}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Personal Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Name *"><input className="input-field" name="name" required placeholder="Arjun Nair" /></Field>
            <Field label="Email *"><input className="input-field" name="email" type="email" required placeholder="arjun@email.com" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Phone"><input className="input-field" name="phone" placeholder="+91 99999 99999" /></Field>
            <Field label="LinkedIn"><input className="input-field" name="linkedIn" placeholder="linkedin.com/in/arjun" /></Field>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginTop: 4 }}>Professional</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Applied For *"><select className="input-field" name="role" required><option value="">Select job...</option>{jobs.filter(j => j.status === 'OPEN').map(j => <option key={j.id} value={j.title}>{j.title}</option>)}</select></Field>
            <Field label="Source"><select className="input-field" name="source"><option value="LinkedIn">LinkedIn</option><option value="Referral">Referral</option><option value="Website">Website</option><option value="Naukri">Naukri</option><option value="Indeed">Indeed</option><option value="Behance">Behance</option><option value="Other">Other</option></select></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Experience"><input className="input-field" name="experience" placeholder="5 years" /></Field>
            <Field label="Current Company"><input className="input-field" name="currentCompany" placeholder="Flipkart" /></Field>
            <Field label="Notice Period"><input className="input-field" name="noticePeriod" placeholder="30 days" /></Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <Field label="Current CTC"><input className="input-field" name="currentCTC" placeholder="₹15L" /></Field>
            <Field label="Expected CTC"><input className="input-field" name="expectedCTC" placeholder="₹20L" /></Field>
          </div>
          <Field label="Notes"><textarea className="input-field" name="notes" rows={2} placeholder="Recruiter notes..." /></Field>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAddCandidate(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Candidate</button></div>
        </form>
      </div></div>}

      {/* ══ JOB DETAIL ══ */}
      {showJobDetail && <div className="modal-overlay" onClick={() => setShowJobDetail(null)}><div className="modal-content" style={{ maxWidth: 750 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>{showJobDetail.title}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showJobDetail.department} · {showJobDetail.location} · Posted {fd(showJobDetail.publishedAt)}</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editingJob ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditingJob(false); setEditJobData(showJobDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleUpdateJob}>Save</button></>
            : <><button className="btn btn-ghost btn-sm" onClick={() => setEditingJob(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm({ type: 'job', id: showJobDetail.id, name: showJobDetail.title })}>🗑 Delete</button></>}
            <button onClick={() => setShowJobDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, padding: '0 var(--space-5)', borderBottom: '1px solid var(--border-secondary)' }}>
          {[{ k: 'details' as ModalTab, l: 'Details' }, { k: 'candidates' as ModalTab, l: `Candidates (${candidates.filter(c => c.role === showJobDetail.title).length})` }, { k: 'activity' as ModalTab, l: 'Activity' }].map(t => (
            <button key={t.k} onClick={() => setJobDetailTab(t.k)} style={{ padding: '8px 14px', fontSize: 12, fontWeight: jobDetailTab === t.k ? 600 : 400, color: jobDetailTab === t.k ? 'var(--color-primary-400)' : 'var(--text-muted)', borderBottom: `2px solid ${jobDetailTab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: jobDetailTab === t.k ? 'var(--color-primary-500)' : 'transparent', cursor: 'pointer' }}>{t.l}</button>
          ))}
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {jobDetailTab === 'details' && <>
            {/* Status bar */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['OPEN', 'ON_HOLD', 'CLOSED'].map(s => (
                <button key={s} onClick={() => { if (editingJob) setEditJobData({ ...editJobData, status: s }); }} style={{ flex: 1, padding: '8px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 11, fontWeight: 600, background: (editingJob ? editJobData.status : showJobDetail.status) === s ? (s === 'OPEN' ? 'rgba(16,185,129,0.12)' : s === 'CLOSED' ? 'var(--bg-tertiary)' : 'rgba(245,158,11,0.12)') : 'var(--bg-tertiary)', color: (editingJob ? editJobData.status : showJobDetail.status) === s ? (s === 'OPEN' ? 'var(--color-accent-400)' : s === 'CLOSED' ? 'var(--text-secondary)' : 'var(--color-warning-400)') : 'var(--text-muted)', cursor: editingJob ? 'pointer' : 'default', border: 'none' }}>{s.replace(/_/g, ' ')}</button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
              <InfoField label="Title" value={showJobDetail.title} editMode={editingJob} field="title" data={editJobData} setData={setEditJobData} />
              <InfoField label="Department" value={showJobDetail.department} editMode={editingJob} field="department" data={editJobData} setData={setEditJobData} />
              <InfoField label="Location" value={showJobDetail.location} editMode={editingJob} field="location" data={editJobData} setData={setEditJobData} />
              <InfoField label="Type" value={(showJobDetail.type || '').replace(/_/g, ' ')} editMode={editingJob} field="type" data={editJobData} setData={setEditJobData} options={['FULL_TIME','PART_TIME','CONTRACT','INTERN','FREELANCE'].map(o => ({ v: o, l: o.replace(/_/g, ' ') }))} />
              <InfoField label="Priority" value={showJobDetail.priority} editMode={editingJob} field="priority" data={editJobData} setData={setEditJobData} options={['LOW','NORMAL','HIGH','URGENT']} />
              <InfoField label="Openings" value={`${showJobDetail.filled || 0}/${showJobDetail.openings}`} editMode={editingJob} field="openings" data={editJobData} setData={setEditJobData} type="number" />
              <InfoField label="Salary" value={showJobDetail.salary} editMode={editingJob} field="salary" data={editJobData} setData={setEditJobData} />
              <InfoField label="Hiring Manager" value={showJobDetail.hiringManager} editMode={editingJob} field="hiringManager" data={editJobData} setData={setEditJobData} />
              <InfoField label="Skills" value={showJobDetail.skills} editMode={editingJob} field="skills" data={editJobData} setData={setEditJobData} />
            </div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Description</div>{editingJob ? <textarea className="input-field" rows={4} value={editJobData.description || ''} onChange={e => setEditJobData({ ...editJobData, description: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{showJobDetail.description || 'No description.'}</p>}</div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Requirements</div>{editingJob ? <textarea className="input-field" rows={3} value={editJobData.requirements || ''} onChange={e => setEditJobData({ ...editJobData, requirements: e.target.value })} /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{showJobDetail.requirements || 'No requirements.'}</p>}</div>
          </>}
          {jobDetailTab === 'candidates' && <>
            {candidates.filter(c => c.role === showJobDetail.title).length > 0 ? candidates.filter(c => c.role === showJobDetail.title).map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} onClick={() => { setShowJobDetail(null); setTimeout(() => { setShowCandidateDetail(c); setEditCandidateData(c); }, 100); }}>
                <div className="avatar avatar-sm">{c.name[0]}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{c.name}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.email} · {c.source} · {c.experience}</div></div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, color: stageColors[c.stage], background: `${stageColors[c.stage]}15` }}>{c.stage}</span>
                {c.rating > 0 && <span style={{ fontSize: 11, color: '#f59e0b' }}>★ {c.rating}</span>}
              </div>
            )) : <div className="empty-state"><p>No candidates for this role yet.</p></div>}
            <button className="btn btn-ghost" onClick={() => { setShowJobDetail(null); setShowAddCandidate(true); }}>+ Add Candidate for this Role</button>
          </>}
          {jobDetailTab === 'activity' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[{ t: 'Job posted', d: showJobDetail.publishedAt, i: '📋' }, { t: `${candidates.filter(c => c.role === showJobDetail.title && c.stage === 'Applied').length} new applications received`, d: '', i: '📥' }, { t: `${candidates.filter(c => c.role === showJobDetail.title && !['Applied', 'Rejected'].includes(c.stage)).length} candidates in pipeline`, d: '', i: '🔄' }].map((a, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: 16 }}>{a.i}</span><div style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{a.t}</div>{a.d && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fd(a.d)}</span>}
              </div>
            ))}
          </div>}
        </div>
      </div></div>}

      {/* ══ CANDIDATE DETAIL ══ */}
      {showCandidateDetail && <div className="modal-overlay" onClick={() => setShowCandidateDetail(null)}><div className="modal-content" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div><h2>{showCandidateDetail.name}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{showCandidateDetail.role} · via {showCandidateDetail.source} · {showCandidateDetail.days}d in pipeline</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editingCandidate ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditingCandidate(false); setEditCandidateData(showCandidateDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={handleUpdateCandidate}>Save</button></>
            : <><button className="btn btn-ghost btn-sm" onClick={() => setEditingCandidate(true)}>✏️ Edit</button><button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm({ type: 'candidate', id: showCandidateDetail.id, name: showCandidateDetail.name })}>🗑 Delete</button></>}
            <button onClick={() => setShowCandidateDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Stage Pipeline */}
          <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {stages.map(s => (
              <button key={s} onClick={() => moveCandidate(showCandidateDetail.id, s)} style={{ flex: 1, minWidth: 60, padding: '6px 2px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 9, fontWeight: 600, background: showCandidateDetail.stage === s ? `${stageColors[s]}20` : 'var(--bg-tertiary)', color: showCandidateDetail.stage === s ? stageColors[s] : 'var(--text-muted)', border: showCandidateDetail.stage === s ? `1px solid ${stageColors[s]}` : '1px solid transparent', cursor: 'pointer' }}>{s}</button>
            ))}
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Rating:</span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button key={star} onClick={() => setRating(showCandidateDetail.id, star)} style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', color: star <= (showCandidateDetail.rating || 0) ? '#f59e0b' : 'var(--border-primary)' }}>★</button>
              ))}
            </div>
            {showCandidateDetail.rating > 0 && <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#f59e0b' }}>{showCandidateDetail.rating}/5</span>}
          </div>

          {/* Info Grid */}
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Contact</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <InfoField label="Name" value={showCandidateDetail.name} editMode={editingCandidate} field="name" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Email" value={showCandidateDetail.email} editMode={editingCandidate} field="email" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Phone" value={showCandidateDetail.phone} editMode={editingCandidate} field="phone" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="LinkedIn" value={showCandidateDetail.linkedIn} editMode={editingCandidate} field="linkedIn" data={editCandidateData} setData={setEditCandidateData} />
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Professional</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <InfoField label="Experience" value={showCandidateDetail.experience} editMode={editingCandidate} field="experience" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Current Company" value={showCandidateDetail.currentCompany} editMode={editingCandidate} field="currentCompany" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Notice Period" value={showCandidateDetail.noticePeriod} editMode={editingCandidate} field="noticePeriod" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Current CTC" value={showCandidateDetail.currentCTC} editMode={editingCandidate} field="currentCTC" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Expected CTC" value={showCandidateDetail.expectedCTC} editMode={editingCandidate} field="expectedCTC" data={editCandidateData} setData={setEditCandidateData} />
            <InfoField label="Source" value={showCandidateDetail.source} editMode={editingCandidate} field="source" data={editCandidateData} setData={setEditCandidateData} options={['LinkedIn','Referral','Website','Naukri','Indeed','Behance','Other']} />
          </div>

          {/* Notes */}
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Notes / Recruiter Comments</div>
          {editingCandidate ? <textarea className="input-field" rows={3} value={editCandidateData.notes || ''} onChange={e => setEditCandidateData({ ...editCandidateData, notes: e.target.value })} placeholder="Add recruiter notes..." /> : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', lineHeight: 1.6 }}>{showCandidateDetail.notes || 'No notes yet.'}</p>}</div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {showCandidateDetail.stage !== 'Hired' && showCandidateDetail.stage !== 'Rejected' && <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => moveCandidate(showCandidateDetail.id, stages[Math.min(stages.indexOf(showCandidateDetail.stage) + 1, 6)])}>→ Advance to {stages[Math.min(stages.indexOf(showCandidateDetail.stage) + 1, 6)]}</button>}
            {showCandidateDetail.stage !== 'Rejected' && <button className="btn" style={{ flex: 1, background: 'rgba(239,68,68,0.08)', color: 'var(--color-danger-400)', border: '1px solid rgba(239,68,68,0.2)' }} onClick={() => moveCandidate(showCandidateDetail.id, 'Rejected')}>✕ Reject</button>}
            {showCandidateDetail.stage === 'Rejected' && <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => moveCandidate(showCandidateDetail.id, 'Applied')}>↩ Re-open Candidacy</button>}
          </div>
        </div>
      </div></div>}
    </div>
  );
}
