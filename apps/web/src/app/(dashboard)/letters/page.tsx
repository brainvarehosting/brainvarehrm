'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

const categoryColors: Record<string, string> = {
  APPOINTMENT: '#3b82f6', EXPERIENCE: '#10b981', INCREMENT: '#f59e0b', WARNING: '#ef4444',
  PROMOTION: '#8b5cf6', OFFER: '#3b82f6', CONFIRMATION: '#06b6d4', RELIEVING: '#f97316',
};

export default function LettersPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'issued'>('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [issued, setIssued] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTpl, setNewTpl] = useState({ name: '', category: 'APPOINTMENT', body: '' });

  useEffect(() => {
    fetch('/api/letters').then(r => r.json()).then(d => {
      if (d.templates) setTemplates(d.templates);
      if (d.issued) setIssued(d.issued);
    }).catch(() => {});
  }, []);

  const createTemplate = async () => {
    if (!newTpl.name) return;
    try {
      const res = await fetch('/api/letters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newTpl) });
      if (res.ok) { const t = await res.json(); setTemplates(prev => [...prev, t]); setShowCreate(false); setNewTpl({ name: '', category: 'APPOINTMENT', body: '' }); }
    } catch {}
  };

  const issueToEmployee = async (templateId: string) => {
    const empId = prompt('Enter Employee ID to issue this letter to:');
    if (!empId) return;
    try {
      const res = await fetch('/api/letters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'issue', templateId, employeeId: empId }) });
      if (res.ok) { const i = await res.json(); setIssued(prev => [i, ...prev]); toast('Letter issued successfully!', 'success'); }
      else toast('Failed to issue letter', 'error');
    } catch {}
  };

  const tabStyle = (t: string) => ({
    padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 500 as const,
    color: activeTab === t ? 'var(--color-primary-400)' : 'var(--text-tertiary)',
    borderBottom: activeTab === t ? '2px solid var(--color-primary-500)' : '2px solid transparent',
    background: 'none', border: 'none', borderBottomStyle: 'solid' as const, cursor: 'pointer' as const,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Letters & Templates</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{templates.length} templates · {issued.length} issued</p></div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', height: 40, padding: '0 var(--space-5)', background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-500))', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, borderRadius: 'var(--radius-md)', border: 'none', cursor: 'pointer' }}>+ New Template</button>
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        <button onClick={() => setActiveTab('templates')} style={tabStyle('templates')}>Templates ({templates.length})</button>
        <button onClick={() => setActiveTab('issued')} style={tabStyle('issued')}>Issued Letters ({issued.length})</button>
      </div>

      {activeTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {templates.map((t: any) => (
            <div key={t.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', borderLeft: `4px solid ${categoryColors[t.category] || '#64748b'}`, transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{t.name}</h3>
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${categoryColors[t.category] || '#64748b'}22`, color: categoryColors[t.category] || '#64748b' }}>{t.category}</span>
              </div>
              {t.body && <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', maxHeight: 60, overflow: 'hidden' }}>{t.body.substring(0, 120)}...</p>}
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                <button onClick={() => toast(t.body ? 'Template preview loaded' : 'No template body', 'info')} style={{ flex: 1, height: 32, fontSize: 'var(--text-xs)', fontWeight: 600, border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', background: 'transparent', cursor: 'pointer' }}>Preview</button>
                <button onClick={() => issueToEmployee(t.id)} style={{ flex: 1, height: 32, fontSize: 'var(--text-xs)', fontWeight: 600, background: 'rgba(59,130,246,0.12)', color: 'var(--color-primary-400)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Issue Letter</button>
              </div>
            </div>
          ))}
          {templates.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>No templates yet — create one to get started.</p>}
        </div>
      )}

      {activeTab === 'issued' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Employee', 'Template', 'Issued On', 'Status', ''].map((h) => <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' as const, borderBottom: '1px solid var(--border-primary)' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {issued.map((l: any) => (
                <tr key={l.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)' }}><strong style={{ color: 'var(--text-primary)' }}>{l.employee?.firstName} {l.employee?.lastName}</strong></td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{l.template?.name || '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{l.issuedAt ? new Date(l.issuedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: '9999px', background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>{l.status || 'ISSUED'}</span></td>
                  <td style={{ padding: 'var(--space-3) var(--space-4)' }}><button onClick={() => { navigator.clipboard.writeText(l.content || ''); toast('Letter content copied to clipboard', 'success'); }} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-primary-400)', background: 'none', border: 'none', cursor: 'pointer' }}>Copy Content</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {issued.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No letters issued yet.</p>}
        </div>
      )}

      {showCreate && (
        <div onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: 500 }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Create Letter Template</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Template Name" value={newTpl.name} onChange={e => setNewTpl({ ...newTpl, name: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <select value={newTpl.category} onChange={e => setNewTpl({ ...newTpl, category: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                {Object.keys(categoryColors).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <textarea placeholder="Letter body... Use {{name}}, {{designation}}, {{date}} for merge fields" rows={6} value={newTpl.body} onChange={e => setNewTpl({ ...newTpl, body: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={createTemplate} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: 'var(--color-primary-400)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Create Template</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
