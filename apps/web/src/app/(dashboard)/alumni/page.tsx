'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';

export default function AlumniPage() {
  const [alumni, setAlumni] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showConnect, setShowConnect] = useState(false);

  useEffect(() => {
    fetch('/api/alumni').then(r => r.json()).then(d => setAlumni(d.data || d || [])).catch(() => {});
  }, []);

  const filtered = alumni.filter(a => { const s = search.toLowerCase(); return !s || `${a.firstName} ${a.lastName} ${a.email} ${a.department?.name || ''} ${a.designation?.title || ''}`.toLowerCase().includes(s); });
  const rehirable = alumni.filter(a => a.exitCase?.rehireEligible).length;

  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '-0.02em' }}>Alumni Network</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{alumni.length} alumni · {rehirable} rehire eligible</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Total Alumni', v: alumni.length, c: 'var(--text-primary)' }, { l: 'Rehire Ok', v: rehirable, c: 'var(--color-accent-400)' }, { l: 'Resigned', v: alumni.filter(a => a.exitCase?.exitType === 'RESIGNATION').length, c: 'var(--color-primary-400)' }, { l: 'Retired', v: alumni.filter(a => a.exitCase?.exitType === 'RETIREMENT').length, c: 'var(--color-warning-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <input className="input-field" placeholder="Search alumni by name, email, department..." value={search} onChange={e => setSearch(e.target.value)} />

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          {filtered.map(a => {
            const tenure = a.dateOfJoining && a.dateOfExit ? ((new Date(a.dateOfExit).getTime() - new Date(a.dateOfJoining).getTime()) / (365.25 * 86400000)).toFixed(1) : '—';
            return (
              <div key={a.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setShowDetail(a)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div className="avatar avatar-lg">{a.firstName?.[0]}{a.lastName?.[0]}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>{a.firstName} {a.lastName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.designation?.title || '—'} · {a.department?.name || '—'}</div>
                  </div>
                  {a.exitCase?.rehireEligible && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: 'rgba(16,185,129,0.12)', color: 'var(--color-accent-400)' }}>REHIRE ✓</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <span>Joined: {fd(a.dateOfJoining)}</span><span>Left: {fd(a.dateOfExit)}</span>
                  <span>Tenure: {tenure} yrs</span><span>Type: {a.exitCase?.exitType || '—'}</span>
                </div>
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.email}</span>
                  <button style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary-400)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); setShowConnect(true); setShowDetail(a); }}>Connect →</button>
                </div>
              </div>
            );
          })}
        </div>
      ) : <div className="empty-state"><h3>No alumni found</h3><p>Alumni appear when employees complete exit.</p></div>}

      {/* Detail Modal */}
      {showDetail && !showConnect && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>{showDetail.firstName} {showDetail.lastName}</h2><button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[['Email', showDetail.email], ['Phone', showDetail.phone], ['Department', showDetail.department?.name], ['Designation', showDetail.designation?.title], ['Employee Code', showDetail.employeeCode], ['Grade', showDetail.grade?.name], ['Joined', fd(showDetail.dateOfJoining)], ['Exited', fd(showDetail.dateOfExit)]].map(([l, v]) => (
              <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2 }}>{v || '—'}</div></div>
            ))}
          </div>
          {showDetail.exitCase && <>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Exit Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              {[['Type', showDetail.exitCase.exitType], ['Reason', showDetail.exitCase.exitReason], ['Rehire', showDetail.exitCase.rehireEligible ? 'Yes' : 'No'], ['Interview', showDetail.exitCase.exitInterviewDone ? 'Done' : 'Not done']].map(([l, v]) => (
                <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginTop: 2 }}>{v || '—'}</div></div>
              ))}
            </div>
            {showDetail.exitCase.exitInterviewNotes && <div style={{ padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>"{showDetail.exitCase.exitInterviewNotes}"</div>}
          </>}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { setShowConnect(true); }}>📧 Reach Out</button>
            {showDetail.exitCase?.rehireEligible && <button className="btn btn-accent" style={{ flex: 1, background: 'var(--color-accent-500)', color: 'white' }} onClick={() => { toast('Rehire process initiated — check Recruitment module', 'success'); setShowDetail(null); }}>🔄 Initiate Rehire</button>}
          </div>
        </div>
      </div></div>}

      {/* Connect Modal */}
      {showConnect && <div className="modal-overlay" onClick={() => { setShowConnect(false); setShowDetail(null); }}><div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Connect with {showDetail?.firstName}</h2><button onClick={() => { setShowConnect(false); setShowDetail(null); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={e => { e.preventDefault(); toast('Message sent to alumni!', 'success'); setShowConnect(false); setShowDetail(null); }}>
          <div><label className="input-label">Subject *</label><input className="input-field" required defaultValue={`Reconnecting — ${showDetail?.firstName}`} /></div>
          <div><label className="input-label">Message</label><textarea className="input-field" rows={5} defaultValue={`Hi ${showDetail?.firstName},\n\nWe hope you're doing well. We'd love to stay connected and explore potential opportunities.\n\nBest regards,\nBrainvare HR`} /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => { setShowConnect(false); setShowDetail(null); }}>Cancel</button><button type="submit" className="btn btn-primary">Send Message</button></div>
        </form>
      </div></div>}
    </div>
  );
}
