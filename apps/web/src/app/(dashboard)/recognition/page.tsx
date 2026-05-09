'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'feed' | 'give' | 'milestones' | 'wall';
const companyValues = ['Creativity', 'Excellence', 'Teamwork', 'Innovation', 'Ownership', 'Culture', 'Empathy', 'Impact', 'Knowledge Sharing', 'Integrity'];

export default function RecognitionPage() {
  const [tab, setTab] = useState<Tab>('feed');
  const [recognitions, setRecognitions] = useState([
    { id: '1', giver: 'Sneha Reddy', giverAvatar: 'SR', receiver: 'Karan Malhotra', receiverAvatar: 'KM', message: 'Amazing work on the client presentation! Your design skills really shone through. 🎨', values: ['Creativity', 'Excellence'], likes: 8, comments: [] as string[], time: '2 hours ago' },
    { id: '2', giver: 'Amit Kumar', giverAvatar: 'AK', receiver: 'Priya Patel', receiverAvatar: 'PP', message: 'Thank you for stepping up and handling the payroll queries so efficiently during audit week!', values: ['Teamwork', 'Ownership'], likes: 12, comments: ['Well deserved!'], time: '5 hours ago' },
    { id: '3', giver: 'Karan Malhotra', giverAvatar: 'KM', receiver: 'Rahul Sharma', receiverAvatar: 'RS', message: 'Great pair programming session today. Learned a lot about performance optimization from you! 🚀', values: ['Knowledge Sharing'], likes: 5, comments: [], time: '1 day ago' },
    { id: '4', giver: 'Priya Patel', giverAvatar: 'PP', receiver: 'Sneha Reddy', receiverAvatar: 'SR', message: 'You made the new employee feel so welcome on their first day. True culture champion! 🌟', values: ['Culture', 'Empathy'], likes: 15, comments: ['So true!', 'Love this team'], time: '1 day ago' },
    { id: '5', giver: 'Arjun Desai', giverAvatar: 'AD', receiver: 'Amit Kumar', receiverAvatar: 'AK', message: 'The marketing campaign strategy was brilliant. Numbers are already up 40%! 📈', values: ['Innovation', 'Impact'], likes: 20, comments: [], time: '2 days ago' },
  ]);
  const [milestones, setMilestones] = useState([
    { type: 'birthday', emoji: '🎂', name: 'Sneha Reddy', detail: 'Birthday on Apr 22', dept: 'Engineering', wished: false },
    { type: 'anniversary', emoji: '🎉', name: 'Amit Kumar', detail: '3 years at Brainvare', dept: 'Marketing', wished: false },
    { type: 'anniversary', emoji: '🎉', name: 'Priya Patel', detail: '1 year at Brainvare', dept: 'HR', wished: false },
  ]);
  const [message, setMessage] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [receiver, setReceiver] = useState('');
  const [showDetail, setShowDetail] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [commentText, setCommentText] = useState('');

  const employees = ['Karan Malhotra', 'Sneha Reddy', 'Priya Patel', 'Amit Kumar', 'Rahul Sharma', 'Arjun Desai', 'Meera Nair'];

  const handleGive = () => {
    if (!receiver || !message.trim()) return;
    const initials = receiver.split(' ').map((n: string) => n[0]).join('');
    const r = { id: Date.now().toString(), giver: 'You', giverAvatar: 'AU', receiver, receiverAvatar: initials, message, values: selectedValues, likes: 0, comments: [] as string[], time: 'Just now' };
    setRecognitions([r, ...recognitions]); setMessage(''); setReceiver(''); setSelectedValues([]); setTab('feed'); toast('Recognition sent! +3 XP 🎉', 'success');
  };

  const handleLike = (id: string) => { setRecognitions(recognitions.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r)); if (showDetail?.id === id) setShowDetail({ ...showDetail, likes: showDetail.likes + 1 }); };
  const handleComment = (id: string) => { if (!commentText.trim()) return; setRecognitions(recognitions.map(r => r.id === id ? { ...r, comments: [...r.comments, commentText] } : r)); if (showDetail?.id === id) setShowDetail({ ...showDetail, comments: [...showDetail.comments, commentText] }); setCommentText(''); toast('Comment added!', 'success'); };
  const deleteRecognition = (id: string) => { setRecognitions(recognitions.filter(r => r.id !== id)); setShowDetail(null); setDeleteConfirm(null); toast('Recognition removed', 'success'); };
  const handleWish = (idx: number) => { setMilestones(milestones.map((m, i) => i === idx ? { ...m, wished: true } : m)); toast('🎉 Wish sent +2 XP!', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Recognition & Rewards</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Celebrate your teammates and build a culture of appreciation</p></div>
        <button className="btn btn-primary" onClick={() => setTab('give')}>✨ Give Recognition</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'This Week', v: recognitions.length, c: 'var(--text-primary)' }, { l: 'This Month', v: 47, c: '#f472b6' }, { l: 'Spot Awards', v: 3, c: 'var(--color-warning-400)' }, { l: 'Milestones', v: milestones.length, c: 'var(--color-accent-400)' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'feed' as Tab, l: '📣 Feed' }, { k: 'give' as Tab, l: '✨ Give' }, { k: 'milestones' as Tab, l: '🎉 Milestones' }, { k: 'wall' as Tab, l: '🏆 Wall of Fame' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'feed' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {recognitions.map(r => (
          <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowDetail(r)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
              <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary-500), #8b5cf6)' }}>{r.giverAvatar}</div>
              <span style={{ fontSize: 14 }}>→</span>
              <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{r.receiverAvatar}</div>
              <div style={{ flex: 1 }}><span style={{ fontSize: 'var(--text-sm)' }}><strong>{r.giver}</strong> recognized <strong>{r.receiver}</strong></span><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.time}</div></div>
            </div>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', margin: '4px 0', lineHeight: 1.5 }}>{r.message}</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
              {r.values.map(v => <span key={v} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: 'rgba(59,130,246,0.08)', color: 'var(--color-primary-400)' }}>{v}</span>)}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }} onClick={e => e.stopPropagation()}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => handleLike(r.id)}>❤️ {r.likes}</button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowDetail(r)}>💬 {r.comments.length}</button>
            </div>
          </div>
        ))}
      </div>}

      {tab === 'give' && <div className="stat-card" style={{ padding: 'var(--space-5)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>Send a Recognition</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label className="input-label">Who do you want to recognize?</label><select className="input-field" value={receiver} onChange={e => setReceiver(e.target.value)}><option value="">Select an employee...</option>{employees.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
          <div><label className="input-label">Your message</label><textarea className="input-field" value={message} onChange={e => setMessage(e.target.value)} placeholder="Write something nice about your teammate..." rows={4} /></div>
          <div><label className="input-label">Tag company values</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {companyValues.map(v => <button key={v} onClick={() => setSelectedValues(prev => prev.includes(v) ? prev.filter(x => x !== v) : [...prev, v])} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', borderRadius: 9999, border: '1px solid', borderColor: selectedValues.includes(v) ? 'var(--color-primary-500)' : 'var(--border-primary)', background: selectedValues.includes(v) ? 'rgba(59,130,246,0.12)' : 'transparent', cursor: 'pointer', color: selectedValues.includes(v) ? 'var(--color-primary-400)' : 'var(--text-muted)', fontWeight: selectedValues.includes(v) ? 600 : 400 }}>{v}</button>)}
          </div></div>
          <button className="btn btn-primary" disabled={!receiver || !message.trim()} onClick={handleGive}>🌟 Send Recognition (+3 XP)</button>
        </div>
      </div>}

      {tab === 'milestones' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {milestones.map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)' }}>
            <span style={{ fontSize: 28 }}>{m.emoji}</span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{m.name}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{m.detail} · {m.dept}</div></div>
            <button className={`btn btn-sm ${m.wished ? '' : 'btn-primary'}`} disabled={m.wished} onClick={() => handleWish(i)}>{m.wished ? '✅ Wished' : '🎉 Send Wish'}</button>
          </div>
        ))}
      </div>}

      {tab === 'wall' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
        {[...recognitions].sort((a, b) => b.likes - a.likes).map((r, i) => (
          <div key={r.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', textAlign: 'center', cursor: 'pointer' }} onClick={() => setShowDetail(r)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-lg)' }}>{i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span style={{ fontSize: 12, color: 'var(--color-danger-400)' }}>❤️ {r.likes}</span>
            </div>
            <div className="avatar avatar-sm" style={{ margin: '0 auto var(--space-2)', background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{r.receiverAvatar}</div>
            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 4 }}>{r.receiver}</div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4 }}>"{r.message.slice(0, 80)}..."</p>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>— {r.giver}</div>
          </div>
        ))}
      </div>}

      {/* Delete Confirm */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete this recognition?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteRecognition(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 550 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Recognition</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(showDetail)}>🗑</button>
            <button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
          </div>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, var(--color-primary-500), #8b5cf6)' }}>{showDetail.giverAvatar}</div>
            <span>→</span>
            <div className="avatar avatar-sm" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>{showDetail.receiverAvatar}</div>
            <div><strong>{showDetail.giver}</strong> → <strong>{showDetail.receiver}</strong><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{showDetail.time}</div></div>
          </div>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, padding: 'var(--space-3)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>{showDetail.message}</p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {showDetail.values.map((v: string) => <span key={v} style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 9999, background: 'rgba(59,130,246,0.08)', color: 'var(--color-primary-400)' }}>{v}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}><button className="btn btn-sm" onClick={() => handleLike(showDetail.id)}>❤️ {showDetail.likes}</button></div>
          {/* Comments */}
          <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Comments ({showDetail.comments.length})</div>
            {showDetail.comments.map((c: string, i: number) => <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid var(--border-secondary)', fontSize: 'var(--text-sm)' }}>{c}</div>)}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <input className="input-field" placeholder="Write a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary btn-sm" onClick={() => handleComment(showDetail.id)}>Post</button>
            </div>
          </div>
        </div>
      </div></div>}
    </div>
  );
}
