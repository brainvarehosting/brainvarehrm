'use client';

import { useState, useEffect } from 'react';
import styles from './policies.module.css';

const categoryColors: Record<string, string> = { HR: '#3b82f6', COMPLIANCE: '#ef4444', IT: '#8b5cf6', FINANCE: '#f59e0b', GENERAL: '#10b981' };

export default function PoliciesPage() {
  const [tab, setTab] = useState<'library' | 'acknowledgements' | 'create'>('library');
  const [search, setSearch] = useState('');
  const [policies, setPolicies] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newPolicy, setNewPolicy] = useState({ title: '', category: 'HR', content: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/policies').then(r => r.json()).then(d => {
      if (d.data?.length) setPolicies(d.data);
    }).catch(() => {});
  }, []);

  const filtered = policies.filter(p =>
    (p.title || p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newPolicy.title) return;
    try {
      const res = await fetch('/api/policies', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newPolicy.title, title: newPolicy.title, category: newPolicy.category, content: newPolicy.content }),
      });
      if (res.ok) {
        const created = await res.json();
        setPolicies(prev => [created, ...prev]);
        setShowCreate(false);
        setNewPolicy({ title: '', category: 'HR', content: '' });
      }
    } catch {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📜 Policy Management</h1>
          <p className={styles.pageSubtitle}>{policies.length} policies · Versioning & acknowledgements</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowCreate(true)}>+ Create Policy</button>
      </div>

      <div className={styles.tabs}>
        {[{ key: 'library', label: '📚 Policy Library' }, { key: 'acknowledgements', label: '✅ Acknowledgements' }, { key: 'create', label: '✏️ Template Editor' }].map(t => (
          <button key={t.key} className={styles.tab} data-active={tab === t.key} onClick={() => setTab(t.key as any)}>{t.label}</button>
        ))}
      </div>

      {tab === 'library' && (
        <>
          <input type="text" className={styles.searchInput} placeholder="Search policies..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className={styles.policyList}>
            {filtered.map((policy: any, i: number) => {
              const catColor = categoryColors[policy.category] || 'var(--text-secondary)';
              return (
                <div key={policy.id} className={styles.policyCard} style={{ animationDelay: `${i * 40}ms` }}>
                  <div className={styles.policyMain}>
                    <div className={styles.policyTop}>
                      <h3>{policy.title || policy.name}</h3>
                      <span className={styles.versionBadge}>v{policy.version || 1}</span>
                      {!policy.isActive && <span className={styles.draftBadge}>DRAFT</span>}
                    </div>
                    <div className={styles.policyMeta}>
                      <span className={styles.catBadge} style={{ color: catColor, background: catColor + '12' }}>{policy.category}</span>
                      <span>Updated: {policy.updatedAt ? new Date(policy.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
                    </div>
                  </div>
                  {expandedId === policy.id && policy.content && (
                    <div className={styles.policyContent} style={{ padding: '1rem', borderTop: '1px solid var(--border-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
                      {policy.content}
                    </div>
                  )}
                  <button className={styles.viewBtn} onClick={() => setExpandedId(expandedId === policy.id ? null : policy.id)}>
                    {expandedId === policy.id ? 'Collapse ↑' : 'View →'}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'acknowledgements' && (
        <div className={styles.ackSection}>
          <div className={styles.ackSummary}>
            <div className={styles.ackSummaryItem} data-status="complete"><span>✅</span><div><strong>{policies.filter(p => p.isActive).length}</strong><span>Active policies</span></div></div>
            <div className={styles.ackSummaryItem} data-status="pending"><span>⏳</span><div><strong>{policies.filter(p => !p.isActive).length}</strong><span>Draft</span></div></div>
          </div>
        </div>
      )}

      {tab === 'create' && (
        <div className={styles.editorPlaceholder}>
          <div className={styles.editorIcon}>✏️</div>
          <h3>Policy Template Editor</h3>
          <p>Create policies with rich text, merge fields, conditional sections, and version control.</p>
          <button className={styles.addBtn} onClick={() => setShowCreate(true)}>Start New Policy</button>
        </div>
      )}

      {showCreate && (
        <div className={styles.modalOverlay || 'modalOverlay'} onClick={() => setShowCreate(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', borderRadius: '1rem', padding: '2rem', width: '90%', maxWidth: 500 }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Create Policy</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input placeholder="Policy Title" value={newPolicy.title} onChange={e => setNewPolicy({ ...newPolicy, title: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <select value={newPolicy.category} onChange={e => setNewPolicy({ ...newPolicy, category: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <option value="HR">HR</option><option value="COMPLIANCE">Compliance</option><option value="IT">IT</option><option value="FINANCE">Finance</option><option value="GENERAL">General</option>
              </select>
              <textarea placeholder="Policy content..." rows={5} value={newPolicy.content} onChange={e => setNewPolicy({ ...newPolicy, content: e.target.value })} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical' }} />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCreate(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid var(--border-primary)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleCreate} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none', background: 'var(--color-primary-400)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Create Policy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
