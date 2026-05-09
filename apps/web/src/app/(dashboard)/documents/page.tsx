'use client';
import toast from '@/lib/toast';

import { useState, useEffect } from 'react';
import styles from './documents.module.css';

// Document categories for filtering

const categories = ['All', 'IDENTITY', 'EDUCATION', 'EMPLOYMENT', 'STATUTORY', 'MEDICAL', 'OTHER'];

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<'repository' | 'employee'>('repository');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [documents, setDocuments] = useState<any[]>([]);
  const [employeeDocs, setEmployeeDocs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/documents')
      .then(r => r.json())
      .then(data => {
        if (data.data?.length) {
          setDocuments(data.data.map((d: any) => ({
            id: d.id,
            name: d.name,
            category: d.category,
            uploadedBy: d.employee ? `${d.employee.firstName} ${d.employee.lastName}` : 'System',
            employeeCode: d.employee?.employeeCode || '',
            size: '-',
            uploadedAt: d.createdAt?.split('T')[0] || '',
            type: d.fileType || 'pdf',
            isVerified: d.isVerified,
          })));
          // Group by employee for Employee tab
          const byEmp: Record<string, any> = {};
          for (const doc of data.data) {
            if (!doc.employee) continue;
            const key = doc.employee.employeeCode;
            if (!byEmp[key]) byEmp[key] = {
              employee: `${doc.employee.firstName} ${doc.employee.lastName}`,
              code: key,
              uploaded: 0, verified: 0, pending: 0,
            };
            byEmp[key].uploaded++;
            if (doc.isVerified) byEmp[key].verified++;
            else byEmp[key].pending++;
          }
          setEmployeeDocs(Object.values(byEmp));
        }
      })
      .catch(() => {
        setDocuments([
          { id: '1', name: 'Aadhaar Card', category: 'IDENTITY', uploadedBy: 'System', size: '-', uploadedAt: '2026-04-01', type: 'pdf', isVerified: true },
        ]);
      });
  }, []);

  const filtered = categoryFilter === 'All' ? documents : documents.filter(d => d.category === categoryFilter);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Document Management</h1>
          <p className={styles.pageSubtitle}>Organization repository and employee document vault</p>
        </div>
        <button className={styles.uploadBtn} onClick={() => {
          const name = prompt('Document name:'); if (!name) return;
          const cat = prompt('Category (IDENTITY/EDUCATION/EMPLOYMENT/STATUTORY/MEDICAL/OTHER):') || 'OTHER';
          fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, category: cat }) })
            .then(r => r.json()).then(d => { if (d.id) { setDocuments(prev => [{ ...d, uploadedBy: 'Admin', size: '-', uploadedAt: new Date().toISOString().split('T')[0], type: 'pdf' }, ...prev]); toast('Document record created', 'success'); } });
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Upload Document
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={styles.tab} data-active={activeTab === 'repository'} onClick={() => setActiveTab('repository')}>Organization Repository</button>
        <button className={styles.tab} data-active={activeTab === 'employee'} onClick={() => setActiveTab('employee')}>Employee Documents</button>
      </div>

      {activeTab === 'repository' && (
        <>
          <div className={styles.categoryFilter}>
            {categories.map((cat) => (
              <button key={cat} className={styles.filterChip} data-active={categoryFilter === cat} onClick={() => setCategoryFilter(cat)}>{cat === 'All' ? 'All' : cat.replace('_', ' ')}</button>
            ))}
          </div>
          <div className={styles.docGrid}>
            {filtered.map((doc) => (
              <div key={doc.id} className={styles.docCard}>
                <div className={styles.docIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h4>{doc.name}</h4>
                <div className={styles.docMeta}>
                  <span className={styles.docCategory}>{doc.category.replace('_', ' ')}</span>
                  <span>{doc.size}</span>
                </div>
                <div className={styles.docFooter}>
                  <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  <button className={styles.downloadSmall} onClick={() => toast(`Download: ${doc.name}\nFile URL: ${doc.fileUrl || 'No file attached yet'}`)}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'employee' && (
        <div className={styles.empDocTable}>
          <table>
            <thead>
              <tr><th>Employee</th><th>Uploaded</th><th>Verified</th><th>Pending</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {employeeDocs.map((ed) => (
                <tr key={ed.code}>
                  <td><div><strong>{ed.employee}</strong><span className={styles.empCode}>{ed.code}</span></div></td>
                  <td>{ed.uploaded}</td>
                  <td><span style={{ color: 'var(--color-accent-400)' }}>{ed.verified}</span></td>
                  <td><span style={{ color: ed.pending > 0 ? 'var(--color-warning-400)' : 'var(--text-muted)' }}>{ed.pending}</span></td>
                  <td>{ed.pending === 0 ? <span className={styles.completeBadge}>Complete</span> : <span className={styles.pendingBadge}>Pending</span>}</td>
                  <td><button className={styles.viewBtn} onClick={() => window.location.href = `/employees`}>View →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
