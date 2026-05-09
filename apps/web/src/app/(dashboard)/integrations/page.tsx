'use client';
import toast from '@/lib/toast';
import { useState } from 'react';

type Tab = 'apps' | 'webhooks' | 'logs';

export default function IntegrationsPage() {
  const [tab, setTab] = useState<Tab>('apps');
  const [filter, setFilter] = useState<'all' | 'CONNECTED' | 'NOT_CONFIGURED'>('all');
  const [integrations, setIntegrations] = useState([
    { id: '1', name: 'Google Workspace', category: 'SSO', icon: '🔐', status: 'CONNECTED', description: 'Single sign-on with Google accounts', lastSync: '2 min ago', events: 1240 },
    { id: '2', name: 'Biometric Device (ZKTeco)', category: 'ATTENDANCE', icon: '📟', status: 'CONNECTED', description: 'Fingerprint attendance sync', lastSync: '5 min ago', events: 8900 },
    { id: '3', name: 'Razorpay', category: 'PAYMENT', icon: '💳', status: 'CONNECTED', description: 'Salary disbursement via banking APIs', lastSync: '1 day ago', events: 120 },
    { id: '4', name: 'Slack', category: 'COMMUNICATION', icon: '💬', status: 'NOT_CONFIGURED', description: 'Leave/approval notifications to Slack', lastSync: '—', events: 0 },
    { id: '5', name: 'WhatsApp Business', category: 'COMMUNICATION', icon: '📱', status: 'CONNECTED', description: 'OTP, payslips, and alerts via WhatsApp', lastSync: '30 min ago', events: 340 },
    { id: '6', name: 'Zoho Books', category: 'ACCOUNTING', icon: '📊', status: 'NOT_CONFIGURED', description: 'Sync payroll journal entries', lastSync: '—', events: 0 },
    { id: '7', name: 'Microsoft 365', category: 'SSO', icon: '🟦', status: 'NOT_CONFIGURED', description: 'SSO + calendar integration', lastSync: '—', events: 0 },
    { id: '8', name: 'Naukri / LinkedIn', category: 'RECRUITMENT', icon: '🔍', status: 'CONNECTED', description: 'Job board posting and candidate import', lastSync: '6 hours ago', events: 56 },
  ]);
  const [webhooks, setWebhooks] = useState([
    { id: '1', event: 'employee.created', url: 'https://hooks.example.com/new-employee', status: 'ACTIVE', calls: 12, lastTriggered: '3 days ago' },
    { id: '2', event: 'leave.approved', url: 'https://hooks.example.com/leave-notify', status: 'ACTIVE', calls: 45, lastTriggered: '2 hours ago' },
    { id: '3', event: 'payroll.processed', url: 'https://hooks.example.com/payroll-sync', status: 'ACTIVE', calls: 11, lastTriggered: '1 month ago' },
  ]);
  const [logs] = useState([
    { time: '22:04:30', app: 'Biometric', event: 'Attendance sync (3 records)', status: 'SUCCESS' },
    { time: '22:02:15', app: 'Google SSO', event: 'Token refresh', status: 'SUCCESS' },
    { time: '21:55:00', app: 'WhatsApp', event: 'Leave approval notification sent', status: 'SUCCESS' },
    { time: '21:30:00', app: 'Naukri', event: 'Job posting sync', status: 'SUCCESS' },
    { time: '20:15:00', app: 'BGV Provider', event: 'Verification status update', status: 'SUCCESS' },
    { time: '19:00:00', app: 'Razorpay', event: 'Salary transfer initiated', status: 'SUCCESS' },
  ]);
  const [showDetail, setShowDetail] = useState<any>(null);
  const [showCreateWebhook, setShowCreateWebhook] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);

  const filtered = filter === 'all' ? integrations : integrations.filter(i => i.status === filter);
  const toggleConnect = (id: string) => { setIntegrations(integrations.map(i => i.id === id ? { ...i, status: i.status === 'CONNECTED' ? 'NOT_CONFIGURED' : 'CONNECTED', lastSync: i.status === 'CONNECTED' ? '—' : 'Just now', events: i.status === 'CONNECTED' ? 0 : i.events } : i)); if (showDetail?.id === id) setShowDetail({ ...showDetail, status: showDetail.status === 'CONNECTED' ? 'NOT_CONFIGURED' : 'CONNECTED' }); toast(integrations.find(i => i.id === id)?.status === 'CONNECTED' ? 'Disconnected' : 'Connected! 🎉', 'success'); };
  const handleCreateWebhook = (e: any) => { e.preventDefault(); const f = e.target as HTMLFormElement; setWebhooks([...webhooks, { id: Date.now().toString(), event: (f.elements.namedItem('event') as HTMLInputElement).value, url: (f.elements.namedItem('url') as HTMLInputElement).value, status: 'ACTIVE', calls: 0, lastTriggered: 'Never' }]); setShowCreateWebhook(false); toast('Webhook created!', 'success'); };
  const deleteWebhook = (id: string) => { setWebhooks(webhooks.filter(w => w.id !== id)); setDeleteConfirm(null); toast('Webhook deleted', 'success'); };
  const toggleWebhook = (id: string) => { setWebhooks(webhooks.map(w => w.id === id ? { ...w, status: w.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' } : w)); toast('Webhook toggled', 'success'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', animation: 'fadeIn 0.3s ease' }}>
      <div><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>Integration Center</h1><p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Connected apps, webhooks, and API management</p></div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
        {[{ l: 'Connected', v: integrations.filter(i => i.status === 'CONNECTED').length, c: 'var(--color-accent-400)' }, { l: 'Not Configured', v: integrations.filter(i => i.status === 'NOT_CONFIGURED').length, c: 'var(--text-muted)' }, { l: 'Total Events', v: integrations.reduce((s, i) => s + i.events, 0).toLocaleString(), c: 'var(--color-primary-400)' }, { l: 'Webhooks', v: webhooks.length, c: '#a78bfa' }].map(s => (
          <div key={s.l} className="stat-card"><div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div><div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</div></div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-primary)' }}>
        {[{ k: 'apps' as Tab, l: 'Connected Apps' }, { k: 'webhooks' as Tab, l: `Webhooks (${webhooks.length})` }, { k: 'logs' as Tab, l: 'Sync Logs' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{ padding: '8px 16px', fontSize: 'var(--text-sm)', fontWeight: tab === t.k ? 600 : 400, color: tab === t.k ? 'var(--color-primary-400)' : 'var(--text-tertiary)', background: 'none', border: 'none', borderBottom: `2px solid ${tab === t.k ? 'var(--color-primary-500)' : 'transparent'}`, cursor: 'pointer' }}>{t.l}</button>
        ))}
      </div>

      {tab === 'apps' && <>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {(['all', 'CONNECTED', 'NOT_CONFIGURED'] as const).map(f => <button key={f} onClick={() => setFilter(f)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', borderRadius: 9999, border: '1px solid', borderColor: filter === f ? 'var(--color-primary-500)' : 'var(--border-primary)', background: filter === f ? 'rgba(59,130,246,0.08)' : 'transparent', color: filter === f ? 'var(--color-primary-400)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter === f ? 600 : 400 }}>{f === 'all' ? 'All' : f === 'CONNECTED' ? 'Connected' : 'Not Configured'}</button>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-3)' }}>
          {filtered.map(int => (
            <div key={int.id} style={{ background: 'var(--bg-card)', border: `1px solid ${int.status === 'CONNECTED' ? 'var(--color-accent-400)' : 'var(--border-primary)'}`, borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', cursor: 'pointer' }} onClick={() => setShowDetail(int)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: 24 }}>{int.icon}</span>
                <div style={{ flex: 1 }}><h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{int.name}</h3><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{int.category}</span></div>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>{int.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {int.status === 'CONNECTED' ? <><span style={{ fontSize: 10, color: 'var(--color-accent-400)', fontWeight: 600 }}>✅ Connected</span><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Synced: {int.lastSync}</span></> : <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); toggleConnect(int.id); }}>Connect →</button>}
              </div>
            </div>
          ))}
        </div>
      </>}

      {tab === 'webhooks' && <div>
        <button className="btn btn-primary" style={{ marginBottom: 'var(--space-3)' }} onClick={() => setShowCreateWebhook(true)}>+ Create Webhook</button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {webhooks.map(wh => (
            <div key={wh.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ flex: 1 }}><h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{wh.event}</h4><code style={{ fontSize: 10, color: 'var(--text-muted)' }}>{wh.url}</code></div>
              <span style={{ fontSize: 10, fontWeight: 600, color: wh.status === 'ACTIVE' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>🟢 {wh.status}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{wh.calls} calls</span>
              <button className="btn btn-Ghost btn-sm" onClick={() => toggleWebhook(wh.id)}>{wh.status === 'ACTIVE' ? '⏸' : '▶'}</button>
              <button className="btn btn-sm" style={{ color: 'var(--color-danger-400)' }} onClick={() => setDeleteConfirm(wh)}>🗑</button>
            </div>
          ))}
        </div>
      </div>}

      {tab === 'logs' && <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'monospace', width: 70 }}>{log.time}</span>
            <span style={{ fontSize: 11, fontWeight: 600, width: 100 }}>{log.app}</span>
            <span style={{ fontSize: 'var(--text-sm)', flex: 1, color: 'var(--text-secondary)' }}>{log.event}</span>
            <span style={{ fontSize: 12 }}>✅</span>
          </div>
        ))}
      </div>}

      {/* Delete Webhook */}
      {deleteConfirm && <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}><div className="modal-content" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-6)' }}><div style={{ fontSize: 40, marginBottom: 'var(--space-3)' }}>⚠️</div><p style={{ fontSize: 'var(--text-md)', fontWeight: 600 }}>Delete webhook?</p></div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancel</button><button className="btn" style={{ background: 'var(--color-danger-500)', color: 'white' }} onClick={() => deleteWebhook(deleteConfirm.id)}>Delete</button></div>
      </div></div>}

      {/* Create Webhook */}
      {showCreateWebhook && <div className="modal-overlay" onClick={() => setShowCreateWebhook(false)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h2>Create Webhook</h2><button onClick={() => setShowCreateWebhook(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={handleCreateWebhook}>
          <div><label className="input-label">Event *</label><input className="input-field" name="event" required placeholder="employee.created" /></div>
          <div><label className="input-label">Endpoint URL *</label><input className="input-field" name="url" required placeholder="https://hooks.example.com/..." /></div>
          <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowCreateWebhook(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create</button></div>
        </form>
      </div></div>}

      {/* Integration Detail */}
      {showDetail && <div className="modal-overlay" onClick={() => setShowDetail(null)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header"><div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><span style={{ fontSize: 24 }}>{showDetail.icon}</span><h2>{showDetail.name}</h2></div><button onClick={() => setShowDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{showDetail.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {[['Category', showDetail.category], ['Status', showDetail.status], ['Last Sync', showDetail.lastSync], ['Events', showDetail.events.toLocaleString()]].map(([l, v]) => (
              <div key={l as string}><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>{l}</div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2 }}>{v}</div></div>
            ))}
          </div>
          <button className={`btn ${showDetail.status === 'CONNECTED' ? '' : 'btn-primary'}`} onClick={() => toggleConnect(showDetail.id)}>{showDetail.status === 'CONNECTED' ? '❌ Disconnect' : '🔌 Connect'}</button>
        </div>
      </div></div>}
    </div>
  );
}
