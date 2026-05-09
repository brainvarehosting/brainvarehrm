'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './profile.module.css';

const tabs = ['Overview', 'Employment', 'Compensation', 'Leave', 'Attendance', 'Documents', 'Activity'] as const;
const actIcons: Record<string, string> = { attendance: '🕐', leave: '📅', document: '📄', letter: '✉️', milestone: '🏆' };
const actColors: Record<string, string> = { attendance: 'var(--color-warning-400)', leave: 'var(--color-primary-400)', document: '#06b6d4', letter: '#a78bfa', milestone: 'var(--color-accent-400)' };

export default function EmployeeProfilePage() {
  const [tab, setTab] = useState<typeof tabs[number]>('Overview');
  const [emp, setEmp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null); // which card is being edited
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDocUpload, setShowDocUpload] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const router = useRouter();
  const params = useParams();

  const reload = () => {
    const id = params?.id;
    if (!id) return;
    fetch(`/api/employees/${id}`).then(r => r.json()).then(data => { if (!data.error) { setEmp(data); setEditData(data); } setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(reload, [params?.id]);

  const saveField = async (fields: Record<string, any>) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${emp.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fields) });
      if (res.ok) { const u = await res.json(); setEmp({ ...emp, ...u }); setEditing(null); toast('Updated', 'success'); }
      else toast('Failed', 'error');
    } catch { toast('Network error', 'error'); }
    setSaving(false);
  };

  const changeStatus = async (s: string) => { await saveField({ employmentStatus: s }); setShowActions(false); };

  if (loading) return <div className={styles.page}><div style={{ padding: '4rem', textAlign: 'center' }}><div style={{ width: 40, height: 40, border: '3px solid var(--border-primary)', borderTopColor: 'var(--color-primary-500)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} /><p style={{ color: 'var(--text-muted)', marginTop: 16 }}>Loading...</p></div></div>;
  if (!emp) return <div className={styles.page}><div style={{ padding: '4rem', textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div><h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Not found</h2><button className="btn btn-primary" onClick={() => router.push('/employees')}>← Back</button></div></div>;

  const sal = emp.salaryStructure || {};
  const lbs = (emp.leaveBalances || []).map((lb: any) => ({ type: lb.leaveType?.name || 'Leave', code: lb.leaveType?.code || '—', total: lb.accrued, used: lb.taken, avail: lb.closing, color: lb.leaveType?.code === 'CL' ? '#3b82f6' : lb.leaveType?.code === 'SL' ? '#f59e0b' : '#10b981' }));
  const att = emp.attendanceSummary || {};
  const recentAtt = emp.recentAttendance || []; const recentLeaves = emp.recentLeaves || []; const paySlips = emp.payrollSlips || [];
  const docs = emp.documents || []; const activities = emp.activities || [];
  const addrs = emp.addresses || []; const contacts = emp.emergencyContacts || [];
  const drs = emp.directReports || []; const letters = emp.letters || [];
  const status = emp.employmentStatus || 'ACTIVE';

  const joinDate = emp.dateOfJoining ? new Date(emp.dateOfJoining) : null;
  const tenure = joinDate ? ((Date.now() - joinDate.getTime()) / (365.25 * 86400000)) : 0;
  const tenureStr = tenure >= 1 ? `${tenure.toFixed(1)} yrs` : `${Math.round(tenure * 12)} mo`;
  const fd = (d: any) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  const fm = (n: number) => n > 0 ? `₹${n.toLocaleString('en-IN')}` : '—';
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Editable card
  const EditCard = ({ id, title, children, onSave }: any) => {
    const isEditing = editing === id;
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{title}</h3>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={styles.outlineBtn} onClick={() => { setEditing(null); setEditData(emp); }} style={{ height: 28, fontSize: 11, padding: '0 10px' }}>Cancel</button>
              <button className="btn btn-primary" style={{ height: 28, fontSize: 11, padding: '0 10px' }} onClick={onSave} disabled={saving}>{saving ? '...' : 'Save'}</button>
            </div>
          ) : (
            <button className={styles.outlineBtn} onClick={() => { setEditing(id); setEditData({ ...emp }); }} style={{ height: 28, fontSize: 11, padding: '0 10px' }}>✏️ Edit</button>
          )}
        </div>
        {children}
      </div>
    );
  };

  const InfoRow = ({ label, value, field, type = 'text', options }: any) => (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      {editing && field ? (
        options ? (
          <select className="input-field" value={editData[field] || ''} onChange={e => setEditData({ ...editData, [field]: e.target.value })} style={{ padding: '4px 8px', height: 28, fontSize: 'var(--text-sm)' }}>
            <option value="">—</option>{options.map((o: string) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
          </select>
        ) : (
          <input className="input-field" type={type} value={editData[field] || ''} onChange={e => setEditData({ ...editData, [field]: e.target.value })} style={{ padding: '4px 8px', height: 28, fontSize: 'var(--text-sm)' }} />
        )
      ) : (
        <span style={{ fontFamily: field?.includes('Number') || field?.includes('Ifsc') || field?.includes('Account') ? 'var(--font-mono)' : undefined }}>{value || '—'}</span>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      {/* ─── Header ─── */}
      <div className={styles.profileHeader}>
        <button className={styles.backBtn} onClick={() => router.push('/employees')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg> Back
        </button>
        <div className={styles.profileTop}>
          <div className={styles.avatarLarge}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h1>{emp.firstName} {emp.lastName}</h1>
              <span className={styles.statusBadge} data-status={status === 'ACTIVE' ? 'active' : 'inactive'}>{status.replace(/_/g, ' ')}</span>
            </div>
            <p className={styles.role}>{emp.designation?.title || '—'} · {emp.department?.name || '—'} · {tenureStr} tenure</p>
            <div className={styles.metaRow}>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> {emp.email || '—'}</span>
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg> {emp.phone || '—'}</span>
              {emp.personalEmail && <span>📧 {emp.personalEmail}</span>}
              <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> {emp.location?.name || '—'}</span>
              <span className={styles.codeBadge}>{emp.employeeCode}</span>
            </div>
          </div>
          <div className={styles.profileActions}>
            <div style={{ position: 'relative' }}>
              <button className={styles.outlineBtn} onClick={() => setShowActions(!showActions)}>Actions ▾</button>
              {showActions && <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 50, minWidth: 200, padding: 4, animation: 'scaleIn 0.15s ease' }}>
                {[{ l: '📅 Apply Leave', a: () => { setShowLeaveModal(true); setShowActions(false); } }, { l: '📄 Upload Document', a: () => { setShowDocUpload(true); setShowActions(false); } }, { l: '✉️ Generate Letter', a: () => { toast('Letter generation available from Letters module', 'info'); setShowActions(false); } }].map(x => <button key={x.l} onClick={x.a} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)', background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer' }}>{x.l}</button>)}
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-primary)', margin: '4px 0' }} />
                {[{ l: 'Confirm', s: 'ACTIVE', c: 'var(--color-accent-400)' }, { l: 'Probation', s: 'PROBATION', c: 'var(--text-secondary)' }, { l: 'Notice Period', s: 'NOTICE_PERIOD', c: 'var(--color-warning-400)' }, { l: 'Suspend', s: 'SUSPENDED', c: 'var(--color-danger-400)' }].map(x => <button key={x.s} onClick={() => changeStatus(x.s)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: x.c, background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer' }}>→ {x.l}</button>)}
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-primary)', margin: '4px 0' }} />
                <button onClick={() => { router.push('/exit'); setShowActions(false); }} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--color-danger-400)', background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer' }}>🚪 Initiate Exit</button>
              </div>}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {[{ l: 'Present', v: att.present || 0, c: 'var(--color-accent-400)' }, { l: 'Leave Bal', v: lbs.reduce((s: number, l: any) => s + (l.avail || 0), 0), c: 'var(--color-primary-400)' }, { l: 'Docs', v: docs.length, c: '#06b6d4' }, { l: 'Payslips', v: paySlips.length, c: 'var(--color-warning-400)' }, { l: 'Letters', v: letters.length, c: '#a78bfa' }, { l: 'Contacts', v: contacts.length, c: 'var(--text-secondary)' }].map((s, i) => (
          <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ─── Tabs ─── */}
      <div className={styles.tabs}>{tabs.map(t => <button key={t} className={styles.tab} data-active={tab === t} onClick={() => setTab(t)}>{t}</button>)}</div>

      <div className={styles.tabContent}>

        {/* OVERVIEW */}
        {tab === 'Overview' && <div className={styles.overviewGrid}>
          <EditCard id="personal" title="Personal Information" onSave={() => saveField({ dateOfBirth: editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString() : undefined, gender: editData.gender, maritalStatus: editData.maritalStatus, bloodGroup: editData.bloodGroup, panNumber: editData.panNumber, aadhaarNumber: editData.aadharNumber })}>
            <div className={styles.infoGrid}>
              <InfoRow label="Date of Birth" value={fd(emp.dateOfBirth)} field={editing === 'personal' ? 'dateOfBirth' : null} type="date" />
              <InfoRow label="Gender" value={emp.gender} field={editing === 'personal' ? 'gender' : null} options={['MALE','FEMALE','OTHER']} />
              <InfoRow label="Marital Status" value={emp.maritalStatus} field={editing === 'personal' ? 'maritalStatus' : null} options={['SINGLE','MARRIED','DIVORCED','WIDOWED']} />
              <InfoRow label="Blood Group" value={emp.bloodGroup} field={editing === 'personal' ? 'bloodGroup' : null} options={['A+','A-','B+','B-','AB+','AB-','O+','O-']} />
              <InfoRow label="PAN" value={emp.panNumber} field={editing === 'personal' ? 'panNumber' : null} />
              <InfoRow label="Aadhaar" value={emp.aadhaarNumber || emp.aadharNumber} field={editing === 'personal' ? 'aadharNumber' : null} />
              <InfoRow label="UAN" value={emp.uanNumber} />
            </div>
          </EditCard>

          <EditCard id="employment" title="Employment" onSave={() => saveField({ employmentType: editData.employmentType, workMode: editData.workMode, noticePeriodDays: parseInt(editData.noticePeriodDays) || 30 })}>
            <div className={styles.infoGrid}>
              <InfoRow label="Joined" value={fd(emp.dateOfJoining)} />
              <InfoRow label="Confirmed" value={fd(emp.dateOfConfirmation)} />
              <InfoRow label="Type" value={emp.employmentType?.replace(/_/g, ' ')} field={editing === 'employment' ? 'employmentType' : null} options={['FULL_TIME','PART_TIME','CONTRACT','INTERN']} />
              <InfoRow label="Mode" value={emp.workMode} field={editing === 'employment' ? 'workMode' : null} options={['OFFICE','REMOTE','HYBRID']} />
              <InfoRow label="Notice" value={`${emp.noticePeriodDays || 30} days`} field={editing === 'employment' ? 'noticePeriodDays' : null} type="number" />
              <InfoRow label="Manager" value={emp.reportingManager ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName}` : '—'} />
              <InfoRow label="Tenure" value={tenureStr} />
              <InfoRow label="Grade" value={emp.grade?.name} />
            </div>
          </EditCard>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Leave Balances</h3>
            {lbs.length > 0 ? <div className={styles.leaveBalances}>{lbs.map((lb: any) => <div key={lb.code} className={styles.leaveBar}><div className={styles.leaveBarHeader}><span>{lb.type} ({lb.code})</span><span>{lb.avail}/{lb.total}</span></div><div className={styles.progressTrack}><div className={styles.progressFill} style={{ width: lb.total > 0 ? `${(lb.used / lb.total) * 100}%` : '0%', background: lb.color }} /></div></div>)}</div> : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No leave data.</p>}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Attendance ({new Date().toLocaleDateString('en-IN', { month: 'short' })})</h3>
            <div className={styles.attendanceGrid}>
              {[{ l: 'Present', v: att.present, t: 'present' },{ l: 'Absent', v: att.absent, t: 'absent' },{ l: 'Late', v: att.late, t: 'leave' },{ l: 'WFH', v: att.wfh, t: 'half' }].map(s => <div key={s.l} className={styles.attendanceStat} data-type={s.t}><span>{s.v || 0}</span><label>{s.l}</label></div>)}
            </div>
          </div>

          <div className={styles.card} data-span="full">
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Emergency Contacts ({contacts.length})</h3>
              <button className={styles.outlineBtn} style={{ height: 28, fontSize: 11, padding: '0 10px' }} onClick={() => setShowAddContact(true)}>+ Add</button>
            </div>
            {contacts.length > 0 ? contacts.map((c: any, i: number) => <div key={i} className={styles.contactRow}><div><strong>{c.name}</strong> <span className={styles.subtle}>({c.relationship})</span></div><span>{c.phone}</span>{c.isPrimary && <span className={styles.primaryBadge}>Primary</span>}</div>) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No contacts added.</p>}
          </div>

          <div className={styles.card} data-span="full">
            <h3 className={styles.cardTitle}>Recent Activity</h3>
            {activities.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{activities.slice(0, 8).map((a: any, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '6px 0', borderBottom: i < 7 ? '1px solid var(--border-secondary)' : 'none' }}><span style={{ fontSize: 14 }}>{actIcons[a.type] || '📌'}</span><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{a.title}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.detail}</div></div><span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fd(a.date)}</span></div>)}</div> : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No activity yet.</p>}
          </div>
        </div>}

        {/* EMPLOYMENT */}
        {tab === 'Employment' && <div className={styles.singleCol}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Position</h3>
            <div className={styles.infoGrid}>
              {[['Department', emp.department?.name],['Designation', emp.designation?.title],['Grade', emp.grade?.name],['Location', emp.location?.name ? `${emp.location.name}${emp.location.city ? `, ${emp.location.city}` : ''}` : '—'],['Manager', emp.reportingManager ? `${emp.reportingManager.firstName} ${emp.reportingManager.lastName} (${emp.reportingManager.employeeCode})` : '—'],['Tenure', tenureStr],['Status', status.replace(/_/g, ' ')]].map(([l, v]) => <InfoRow key={l} label={l} value={v} />)}
            </div>
          </div>

          <EditCard id="bank" title="Bank Details" onSave={() => saveField({ bankName: editData.bankName, bankAccountNo: editData.bankAccountNo, bankIfsc: editData.bankIfsc })}>
            <div className={styles.infoGrid}>
              <InfoRow label="Bank" value={emp.bankName} field={editing === 'bank' ? 'bankName' : null} />
              <InfoRow label="Account" value={emp.bankAccountNo} field={editing === 'bank' ? 'bankAccountNo' : null} />
              <InfoRow label="IFSC" value={emp.bankIfsc} field={editing === 'bank' ? 'bankIfsc' : null} />
            </div>
          </EditCard>

          <div className={styles.card}>
            <div className={styles.cardHeader}><h3 className={styles.cardTitle}>Addresses ({addrs.length})</h3><button className={styles.outlineBtn} style={{ height: 28, fontSize: 11, padding: '0 10px' }} onClick={() => setShowAddAddress(true)}>+ Add</button></div>
            {addrs.length > 0 ? <div className={styles.addressGrid}>{addrs.map((a: any, i: number) => <div key={i} className={styles.addressCard}><span className={styles.addressType}>{(a.type || 'ADDRESS').replace(/_/g, ' ')}</span><p>{[a.addressLine1 || a.line1, a.addressLine2 || a.line2].filter(Boolean).join(', ')}</p><p>{[a.city, a.state, a.pincode].filter(Boolean).join(', ')}</p></div>)}</div> : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No addresses.</p>}
          </div>

          {drs.length > 0 && <div className={styles.card}><h3 className={styles.cardTitle}>Direct Reports ({drs.length})</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{drs.map((dr: any) => <div key={dr.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '4px 0', cursor: 'pointer' }} onClick={() => router.push(`/employees/${dr.id}`)}><div className="avatar avatar-sm">{dr.firstName?.[0]}{dr.lastName?.[0]}</div><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>{dr.firstName} {dr.lastName}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{dr.designation?.title} · {dr.employeeCode}</div></div><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>)}</div></div>}

          {letters.length > 0 && <div className={styles.card}><h3 className={styles.cardTitle}>Issued Letters ({letters.length})</h3>{letters.map((l: any, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '6px 0', borderBottom: i < letters.length - 1 ? '1px solid var(--border-secondary)' : 'none' }}><span>✉️</span><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{l.template?.name || 'Letter'}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{l.template?.category || '—'} · {fd(l.issuedAt || l.createdAt)}</div></div><span className={styles.statusBadge} data-status="active" style={{ fontSize: 10 }}>{l.status || 'ISSUED'}</span></div>)}</div>}
        </div>}

        {/* COMPENSATION */}
        {tab === 'Compensation' && <div className={styles.singleCol}>
          <div className={styles.compensationHeader}>
            <div className={styles.ctcCard}><span className={styles.ctcLabel}>Annual CTC</span><span className={styles.ctcValue}>{sal.ctc > 0 ? `₹${(sal.ctc / 100000).toFixed(1)}L` : '—'}</span><span className={styles.ctcSub}>{sal.grossMonthly > 0 ? `${fm(sal.grossMonthly)}/mo` : 'Not set'}</span></div>
            <div className={styles.ctcCard} data-accent><span className={styles.ctcLabel}>Take Home</span><span className={styles.ctcValue}>{sal.netMonthly > 0 ? fm(sal.netMonthly) : '—'}</span><span className={styles.ctcSub}>{sal.netMonthly > 0 ? 'Monthly net' : 'Not set'}</span></div>
          </div>
          {sal.ctc > 0 && <div className={styles.card}><h3 className={styles.cardTitle}>Monthly Breakup</h3><div className={styles.salaryTable}><div className={styles.salarySection}><h4>Earnings</h4></div>{[['Basic', sal.basic],['HRA', sal.hra],['Special', sal.special],['Conveyance', sal.conveyance],['Medical', sal.medical]].filter(([,v]) => v > 0).map(([l,v]) => <div key={l as string} className={styles.salaryRow}><span>{l}</span><span>{fm(v as number)}</span></div>)}<div className={styles.salaryRow} data-total><span>Gross</span><span>{fm(sal.grossMonthly)}</span></div><div className={styles.salarySection}><h4>Deductions</h4></div>{[['PF', sal.pfEmployee],['PT', sal.pt],['TDS', sal.tds]].filter(([,v]) => v > 0).map(([l,v]) => <div key={l as string} className={styles.salaryRow}><span>{l}</span><span>{fm(v as number)}</span></div>)}<div className={styles.salaryRow} data-total><span>Net</span><span>{fm(sal.netMonthly)}</span></div></div></div>}
          <div className={styles.card}><h3 className={styles.cardTitle}>Payroll History ({paySlips.length})</h3>{paySlips.length > 0 ? paySlips.map((p: any, i: number) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < paySlips.length - 1 ? '1px solid var(--border-secondary)' : 'none' }}><div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{months[(p.payrollRun?.month || 1) - 1]} {p.payrollRun?.year}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{p.payrollRun?.status}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-accent-400)' }}>{fm(p.netPay)}</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Gross: {fm(p.grossPay)}</div></div></div>) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No payroll records.</p>}</div>
        </div>}

        {/* LEAVE */}
        {tab === 'Leave' && <div className={styles.singleCol}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-3)' }}><button className="btn btn-primary" style={{ height: 36 }} onClick={() => setShowLeaveModal(true)}>+ Apply Leave</button></div>
          {lbs.length > 0 && <div className={styles.leaveCards}>{lbs.map((lb: any) => <div key={lb.code} className={styles.leaveCard}><div className={styles.leaveCardHeader} style={{ borderLeftColor: lb.color }}><h4>{lb.type}</h4><span className={styles.leaveCode}>{lb.code}</span></div><div className={styles.leaveStats}><div><span className={styles.leaveNum}>{lb.total}</span><label>Total</label></div><div><span className={styles.leaveNum} style={{ color: lb.color }}>{lb.used}</span><label>Used</label></div><div><span className={styles.leaveNum}>{lb.avail}</span><label>Available</label></div></div></div>)}</div>}
          <div className={styles.card} style={{ marginTop: 'var(--space-4)' }}><h3 className={styles.cardTitle}>Leave History ({recentLeaves.length})</h3>{recentLeaves.length > 0 ? recentLeaves.map((l: any, i: number) => <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: '8px 0', borderBottom: i < recentLeaves.length - 1 ? '1px solid var(--border-secondary)' : 'none' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: l.status === 'APPROVED' ? 'var(--color-accent-400)' : l.status === 'REJECTED' ? 'var(--color-danger-400)' : 'var(--color-warning-400)', flexShrink: 0 }} /><div style={{ flex: 1 }}><div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{l.leaveType?.name} — {l.days || 1} day(s)</div><div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{fd(l.startDate)} → {fd(l.endDate)} · {l.reason || '—'}</div></div><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 9999, background: l.status === 'APPROVED' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: l.status === 'APPROVED' ? 'var(--color-accent-400)' : 'var(--color-warning-400)' }}>{l.status}</span></div>) : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No history.</p>}</div>
        </div>}

        {/* ATTENDANCE */}
        {tab === 'Attendance' && <div className={styles.singleCol}>
          <div className={styles.card}><h3 className={styles.cardTitle}>{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h3><div className={styles.attendanceGridLarge}>{[{ l: 'Present', v: att.present, t: 'present' },{ l: 'Absent', v: att.absent, t: 'absent' },{ l: 'Late', v: att.late, t: 'leave' },{ l: 'WFH', v: att.wfh, t: 'half' },{ l: 'Half', v: att.halfDay, t: 'holiday' },{ l: 'Total', v: att.total, t: 'weekend' }].map(s => <div key={s.l} className={styles.attendanceStat} data-type={s.t}><span>{s.v || 0}</span><label>{s.l}</label></div>)}</div></div>
          <div className={styles.card}><h3 className={styles.cardTitle}>Daily Log ({recentAtt.length})</h3>{recentAtt.length > 0 ? <div className="table-wrapper"><table className="table-base"><thead><tr><th>Date</th><th>Status</th><th>In</th><th>Out</th><th>Hours</th><th>Source</th></tr></thead><tbody>{recentAtt.map((r: any, i: number) => <tr key={i}><td>{fd(r.date)}</td><td><span style={{ fontSize: 11, fontWeight: 600, color: r.status === 'PRESENT' ? 'var(--color-accent-400)' : r.status === 'ABSENT' ? 'var(--color-danger-400)' : 'var(--color-warning-400)' }}>{r.status}</span></td><td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td><td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</td><td>{r.workHours ? `${Number(r.workHours).toFixed(1)}h` : '—'}</td><td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.source}</td></tr>)}</tbody></table></div> : <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>No records.</p>}</div>
        </div>}

        {/* DOCUMENTS */}
        {tab === 'Documents' && <div className={styles.singleCol}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><h3 className={styles.cardTitle}>Documents ({docs.length})</h3><button className={styles.outlineBtn} onClick={() => setShowDocUpload(true)}>+ Upload</button></div>
            {docs.length > 0 ? <div className={styles.docList}>{docs.map((d: any, i: number) => <div key={i} className={styles.docRow}><div className={styles.docIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div className={styles.docInfo}><span className={styles.docName}>{d.name}</span><span className={styles.docMeta}>{(d.category || '').replace(/_/g, ' ')} · {fd(d.createdAt)}</span></div><span className={styles.docStatus} data-status={d.isVerified ? 'verified' : 'pending'}>{d.isVerified ? 'VERIFIED' : 'PENDING'}</span></div>)}</div> : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', fontSize: 'var(--text-sm)' }}>No documents.</p>}
          </div>
        </div>}

        {/* ACTIVITY */}
        {tab === 'Activity' && <div className={styles.singleCol}><div className={styles.timeline}>{activities.length > 0 ? activities.map((a: any, i: number) => <div key={i} className={styles.timelineItem}><div className={styles.timelineDot} style={{ background: actColors[a.type] || 'var(--text-muted)' }} /><div className={styles.timelineContent}><div className={styles.timelineHeader}><strong><span style={{ marginRight: 6 }}>{actIcons[a.type] || '📌'}</span>{a.title}</strong><span className={styles.timelineDate}>{fd(a.date)}</span></div><p>{a.detail}</p></div></div>) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No activities.</p>}</div></div>}
      </div>

      {/* ── Document Upload Modal ── */}
      {showDocUpload && <div className="modal-overlay" onClick={() => setShowDocUpload(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="modal-header"><h2>Upload Document</h2><button onClick={() => setShowDocUpload(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div><form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={async e => { e.preventDefault(); const f = e.target as HTMLFormElement; try { const res = await fetch('/api/documents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: (f.elements.namedItem('dn') as HTMLInputElement).value, category: (f.elements.namedItem('dc') as HTMLSelectElement).value, employeeId: emp.id, fileUrl: '/placeholder' }) }); if (res.ok) { reload(); setShowDocUpload(false); toast('Document added', 'success'); } } catch { toast('Failed', 'error'); } }}><div><label className="input-label">Name *</label><input className="input-field" name="dn" required placeholder="Offer Letter" /></div><div><label className="input-label">Category</label><select className="input-field" name="dc"><option value="IDENTITY">Identity</option><option value="EDUCATION">Education</option><option value="EMPLOYMENT">Employment</option><option value="STATUTORY">Statutory</option><option value="MEDICAL">Medical</option><option value="OTHER">Other</option></select></div><div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowDocUpload(false)}>Cancel</button><button type="submit" className="btn btn-primary">Upload</button></div></form></div></div>}

      {/* ── Leave Apply Modal ── */}
      {showLeaveModal && <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="modal-header"><h2>Apply Leave</h2><button onClick={() => setShowLeaveModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div><form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={async e => { e.preventDefault(); const f = e.target as HTMLFormElement; try { const res = await fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: emp.id, leaveTypeId: (f.elements.namedItem('lt') as HTMLSelectElement).value, startDate: (f.elements.namedItem('sd') as HTMLInputElement).value, endDate: (f.elements.namedItem('ed') as HTMLInputElement).value, reason: (f.elements.namedItem('rs') as HTMLInputElement).value, days: 1 }) }); if (res.ok) { reload(); setShowLeaveModal(false); toast('Leave applied', 'success'); } else { const err = await res.json(); toast(err.error || 'Failed', 'error'); } } catch { toast('Failed', 'error'); } }}>
        {lbs.length > 0 && <div><label className="input-label">Leave Type *</label><select className="input-field" name="lt" required>{(emp.leaveBalances || []).map((lb: any) => <option key={lb.leaveTypeId || lb.id} value={lb.leaveTypeId || lb.id}>{lb.leaveType?.name} ({lb.closing} available)</option>)}</select></div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}><div><label className="input-label">From *</label><input className="input-field" name="sd" type="date" required /></div><div><label className="input-label">To *</label><input className="input-field" name="ed" type="date" required /></div></div>
        <div><label className="input-label">Reason</label><input className="input-field" name="rs" placeholder="Personal / Medical / Family" /></div>
        <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowLeaveModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Submit Leave</button></div>
      </form></div></div>}

      {/* ── Add Contact Modal ── */}
      {showAddContact && <div className="modal-overlay" onClick={() => setShowAddContact(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="modal-header"><h2>Add Emergency Contact</h2><button onClick={() => setShowAddContact(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div><form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={async e => { e.preventDefault(); const f = e.target as HTMLFormElement; try { await fetch('/api/emergency-contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: emp.id, name: (f.elements.namedItem('cn') as HTMLInputElement).value, relationship: (f.elements.namedItem('cr') as HTMLSelectElement).value, phone: (f.elements.namedItem('cp') as HTMLInputElement).value, isPrimary: contacts.length === 0 }) }); reload(); setShowAddContact(false); toast('Contact added', 'success'); } catch { toast('Failed', 'error'); } }}>
        <div><label className="input-label">Name *</label><input className="input-field" name="cn" required placeholder="Contact name" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}><div><label className="input-label">Relationship</label><select className="input-field" name="cr"><option value="Father">Father</option><option value="Mother">Mother</option><option value="Spouse">Spouse</option><option value="Sibling">Sibling</option><option value="Other">Other</option></select></div><div><label className="input-label">Phone *</label><input className="input-field" name="cp" required placeholder="+91 99999 99999" /></div></div>
        <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAddContact(false)}>Cancel</button><button type="submit" className="btn btn-primary">Add Contact</button></div>
      </form></div></div>}

      {/* ── Add Address Modal ── */}
      {showAddAddress && <div className="modal-overlay" onClick={() => setShowAddAddress(false)}><div className="modal-content" onClick={e => e.stopPropagation()}><div className="modal-header"><h2>Add Address</h2><button onClick={() => setShowAddAddress(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button></div><form className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} onSubmit={async e => { e.preventDefault(); const f = e.target as HTMLFormElement; try { await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: emp.id, type: (f.elements.namedItem('at') as HTMLSelectElement).value, addressLine1: (f.elements.namedItem('a1') as HTMLInputElement).value, addressLine2: (f.elements.namedItem('a2') as HTMLInputElement).value, city: (f.elements.namedItem('ac') as HTMLInputElement).value, state: (f.elements.namedItem('as') as HTMLInputElement).value, pincode: (f.elements.namedItem('ap') as HTMLInputElement).value }) }); reload(); setShowAddAddress(false); toast('Address added', 'success'); } catch { toast('Failed', 'error'); } }}>
        <div><label className="input-label">Type</label><select className="input-field" name="at"><option value="CURRENT">Current</option><option value="PERMANENT">Permanent</option></select></div>
        <div><label className="input-label">Address Line 1 *</label><input className="input-field" name="a1" required placeholder="123 MG Road" /></div>
        <div><label className="input-label">Address Line 2</label><input className="input-field" name="a2" placeholder="Near Mall" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}><div><label className="input-label">City *</label><input className="input-field" name="ac" required placeholder="Bangalore" /></div><div><label className="input-label">State *</label><input className="input-field" name="as" required placeholder="Karnataka" /></div></div>
        <div><label className="input-label">Pincode *</label><input className="input-field" name="ap" required placeholder="560001" /></div>
        <div className="modal-footer" style={{ padding: 0, border: 'none' }}><button type="button" className="btn btn-ghost" onClick={() => setShowAddAddress(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Address</button></div>
      </form></div></div>}
    </div>
  );
}
