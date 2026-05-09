'use client';
import toast from '@/lib/toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './employees.module.css';

const statusColors: Record<string, string> = { ACTIVE: 'accent', PROBATION: 'warning', NOTICE_PERIOD: 'danger', SUSPENDED: 'danger', ABSCONDING: 'danger', RESIGNED: 'danger' };
const STEPS = ['Identity', 'Employment', 'Personal & Statutory', 'Bank & Finance', 'Address & Contacts', 'Review & Submit'];

const emptyForm = {
  firstName: '', lastName: '', email: '', personalEmail: '', phone: '',
  dateOfJoining: new Date().toISOString().split('T')[0], employmentType: 'FULL_TIME', workMode: 'OFFICE',
  departmentId: '', designationId: '', locationId: '', gradeId: '', reportingManagerId: '', noticePeriodDays: '30',
  dateOfBirth: '', gender: 'MALE', maritalStatus: '', bloodGroup: '', nationality: 'Indian',
  panNumber: '', aadharNumber: '', uanNumber: '', passportNumber: '', pfNumber: '', esiNumber: '',
  bankName: '', bankAccountNo: '', bankIfsc: '', bankBranch: '',
  currentAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
  permanentAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
  sameAsCurrentAddress: false,
  emergencyContacts: [{ name: '', relationship: '', phone: '', isPrimary: true }],
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showWizard, setShowWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [md, setMd] = useState<any>({ departments: [], designations: [], locations: [], grades: [], employees: [] });
  const [form, setForm] = useState<any>({ ...emptyForm });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/employees').then(r => r.json()).then(data => {
      setEmployees((data.data || []).map((e: any) => ({
        ...e, department: e.department?.name || 'Unassigned', designation: e.designation?.title || 'N/A',
        location: e.location?.name || 'N/A', status: e.employmentStatus || 'ACTIVE',
      })));
    }).catch(() => {});
  }, []);

  const openWizard = () => {
    fetch('/api/master-data').then(r => r.json()).then(setMd).catch(() => {});
    setShowWizard(true); setStep(0); setForm({ ...emptyForm, emergencyContacts: [{ name: '', relationship: '', phone: '', isPrimary: true }] });
  };

  const filtered = employees.filter(emp => {
    const s = search.toLowerCase();
    const matchS = !s || `${emp.firstName} ${emp.lastName} ${emp.employeeCode} ${emp.email} ${emp.department}`.toLowerCase().includes(s);
    return matchS && (statusFilter === 'ALL' || emp.status === statusFilter) && (deptFilter === 'ALL' || emp.department === deptFilter);
  });

  const depts = [...new Set(employees.map(e => e.department))].filter(Boolean).sort();

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body: any = {};
      for (const [k, v] of Object.entries(form)) {
        if (k === 'currentAddress' || k === 'permanentAddress' || k === 'sameAsCurrentAddress' || k === 'emergencyContacts') continue;
        if (v !== '' && v !== undefined) body[k] = v;
      }
      if (body.noticePeriodDays) body.noticePeriodDays = parseInt(body.noticePeriodDays);

      const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      const created = await res.json();

      // Create addresses
      const addrs = [{ ...form.currentAddress, type: 'CURRENT' }];
      if (!form.sameAsCurrentAddress && form.permanentAddress.line1) addrs.push({ ...form.permanentAddress, type: 'PERMANENT' });
      else if (form.sameAsCurrentAddress && form.currentAddress.line1) addrs.push({ ...form.currentAddress, type: 'PERMANENT' });
      for (const addr of addrs) {
        if (addr.line1) {
          await fetch('/api/addresses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...addr, addressLine1: addr.line1, addressLine2: addr.line2, employeeId: created.id }) }).catch(() => {});
        }
      }

      // Create emergency contacts
      for (const ec of form.emergencyContacts) {
        if (ec.name && ec.phone) {
          await fetch('/api/emergency-contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...ec, employeeId: created.id }) }).catch(() => {});
        }
      }

      setEmployees(prev => [...prev, { ...created, department: created.department?.name || 'Unassigned', designation: created.designation?.title || 'N/A', location: created.location?.name || 'N/A', status: created.employmentStatus || 'ACTIVE' }]);
      toast(`${form.firstName} ${form.lastName} added!`, 'success');
      setShowWizard(false);
    } catch (err: any) { toast(err.message || 'Failed', 'error'); }
    setSubmitting(false);
  };

  const canNext = () => { if (step === 0) return form.firstName && form.lastName && form.email; if (step === 1) return form.dateOfJoining; return true; };

  const F = ({ label, field, type = 'text', ph = '', req = false, half = false }: any) => (
    <div className={styles.formField} style={half ? { gridColumn: 'span 1' } : undefined}>
      <label>{label}{req && ' *'}</label>
      <input type={type} value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={ph} required={req} />
    </div>
  );
  const Sel = ({ label, field, opts, req = false }: any) => (
    <div className={styles.formField}>
      <label>{label}{req && ' *'}</label>
      <select value={form[field] || ''} onChange={e => setForm({ ...form, [field]: e.target.value })} required={req}>
        <option value="">Select...</option>
        {opts.map((o: any) => typeof o === 'string' ? <option key={o} value={o}>{o.replace(/_/g, ' ')}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  const SectionLabel = ({ children }: any) => <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: 4 }}>{children}</div>;

  const AddrFields = ({ addr, setAddr, label }: any) => (
    <>
      <SectionLabel>{label}</SectionLabel>
      <div className={styles.formRow}><div className={styles.formField}><label>Address Line 1 *</label><input value={addr.line1} onChange={e => setAddr({ ...addr, line1: e.target.value })} placeholder="123 MG Road" /></div><div className={styles.formField}><label>Address Line 2</label><input value={addr.line2} onChange={e => setAddr({ ...addr, line2: e.target.value })} placeholder="Near Trinity Mall" /></div></div>
      <div className={styles.formRow}><div className={styles.formField}><label>City *</label><input value={addr.city} onChange={e => setAddr({ ...addr, city: e.target.value })} placeholder="Bangalore" /></div><div className={styles.formField}><label>State *</label><input value={addr.state} onChange={e => setAddr({ ...addr, state: e.target.value })} placeholder="Karnataka" /></div></div>
      <div className={styles.formRow}><div className={styles.formField}><label>Pincode *</label><input value={addr.pincode} onChange={e => setAddr({ ...addr, pincode: e.target.value })} placeholder="560001" /></div><div className={styles.formField}><label>Country</label><input value={addr.country} onChange={e => setAddr({ ...addr, country: e.target.value })} /></div></div>
    </>
  );

  const ReviewSection = ({ title, items }: { title: string; items: [string, string][] }) => (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{ fontSize: 11, color: 'var(--color-primary-400)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 6, borderBottom: '1px solid var(--border-secondary)', paddingBottom: 4 }}>{title}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
        {items.map(([l, v], i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', padding: '2px 0' }}><span style={{ color: 'var(--text-muted)' }}>{l}</span><span style={{ color: v === '—' ? 'var(--text-muted)' : 'var(--text-primary)', fontWeight: 500, textAlign: 'right', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v}</span></div>)}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div><h1 className={styles.pageTitle}>Employee Directory</h1><p className={styles.pageSubtitle}>{employees.length} employees · {employees.filter(e => e.status === 'ACTIVE').length} active</p></div>
        <button className={styles.addBtn} onClick={openWizard}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>Add Employee</button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBox}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="Search name, ID, email, department..." value={search} onChange={e => setSearch(e.target.value)} /></div>
        <div className={styles.filterGroup}>
          <select className={styles.select} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="ALL">All Status</option><option value="ACTIVE">Active</option><option value="PROBATION">Probation</option><option value="NOTICE_PERIOD">Notice Period</option></select>
          <select className={styles.select} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}><option value="ALL">All Depts</option>{depts.map(d => <option key={d} value={d}>{d}</option>)}</select>
          <div className={styles.viewToggle}>
            <button className={styles.viewBtn} data-active={viewMode === 'table'} onClick={() => setViewMode('table')} aria-label="Table"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
            <button className={styles.viewBtn} data-active={viewMode === 'grid'} onClick={() => setViewMode('grid')} aria-label="Grid"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></button>
          </div>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className={styles.tableWrapper}><table className={styles.table}>
          <thead><tr><th>Employee</th><th>ID</th><th>Department</th><th>Designation</th><th>Location</th><th>Status</th><th>Joined</th><th></th></tr></thead>
          <tbody>{filtered.map((emp, i) => (
            <tr key={emp.id} className={styles.tableRow} style={{ animationDelay: `${i * 25}ms`, cursor: 'pointer' }} onClick={() => router.push(`/employees/${emp.id}`)}>
              <td><div className={styles.employeeCell}><div className={styles.avatar}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div><div><span className={styles.empName}>{emp.firstName} {emp.lastName}</span><span className={styles.empEmail}>{emp.email}</span></div></div></td>
              <td><span className={styles.empCode}>{emp.employeeCode}</span></td>
              <td>{emp.department}</td><td>{emp.designation}</td><td>{emp.location}</td>
              <td><span className={styles.badge} data-color={statusColors[emp.status] || 'neutral'}>{emp.status?.replace(/_/g, ' ')}</span></td>
              <td>{new Date(emp.dateOfJoining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
              <td><button className={styles.actionBtn} aria-label="View"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : (
        <div className={styles.grid}>{filtered.map((emp, i) => (
          <div key={emp.id} className={styles.gridCard} style={{ animationDelay: `${i * 35}ms` }} onClick={() => router.push(`/employees/${emp.id}`)}>
            <div className={styles.gridCardHeader}><div className={styles.gridAvatar}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div><span className={styles.badge} data-color={statusColors[emp.status] || 'neutral'}>{emp.status?.replace(/_/g, ' ')}</span></div>
            <h3 className={styles.gridName}>{emp.firstName} {emp.lastName}</h3><p className={styles.gridDesignation}>{emp.designation}</p>
            <div className={styles.gridMeta}><span>{emp.department}</span><span>{emp.location}</span></div>
            <div className={styles.gridFooter}><span className={styles.empCode}>{emp.employeeCode}</span><button className={styles.gridViewBtn} onClick={e => { e.stopPropagation(); router.push(`/employees/${emp.id}`); }}>View →</button></div>
          </div>
        ))}</div>
      )}

      {filtered.length === 0 && <div className={styles.emptyState}><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><h3>No employees found</h3><p>Try adjusting your search or filters.</p></div>}

      {/* ═══════ 6-STEP WIZARD ═══════ */}
      {showWizard && (
        <div className={styles.modalOverlay} onClick={() => setShowWizard(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 740 }}>
            <div className={styles.modalHeader}>
              <div><h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>New Employee</h2><p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</p></div>
              <button className={styles.modalClose} onClick={() => setShowWizard(false)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', padding: '16px 20px 8px', gap: 2 }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: '100%', height: 3, borderRadius: 3, background: i <= step ? 'var(--color-primary-500)' : 'var(--bg-tertiary)', transition: 'background 0.3s' }} />
                  <span style={{ fontSize: 9, color: i === step ? 'var(--color-primary-400)' : 'var(--text-muted)', fontWeight: i === step ? 700 : 400, whiteSpace: 'nowrap' }}>{s}</span>
                </div>
              ))}
            </div>

            <div className={styles.modalForm}>

              {/* 0: IDENTITY */}
              {step === 0 && <>
                <SectionLabel>Full Name & Contact</SectionLabel>
                <div className={styles.formRow}><F label="First Name" field="firstName" ph="Arjun" req /><F label="Last Name" field="lastName" ph="Nair" req /></div>
                <div className={styles.formRow}><F label="Work Email" field="email" type="email" ph="arjun@brainvare.com" req /><F label="Personal Email" field="personalEmail" type="email" ph="arjun.nair@gmail.com" /></div>
                <div className={styles.formRow}><F label="Phone" field="phone" ph="+91 98765 43210" /><Sel label="Gender" field="gender" opts={['MALE','FEMALE','OTHER']} req /></div>
                <div className={styles.formRow}><F label="Nationality" field="nationality" ph="Indian" /><div className={styles.formField} /></div>
              </>}

              {/* 1: EMPLOYMENT */}
              {step === 1 && <>
                <SectionLabel>Joining & Role</SectionLabel>
                <div className={styles.formRow}><F label="Date of Joining" field="dateOfJoining" type="date" req /><Sel label="Employment Type" field="employmentType" opts={['FULL_TIME','PART_TIME','CONTRACT','INTERN','CONSULTANT']} req /></div>
                <div className={styles.formRow}><Sel label="Department" field="departmentId" opts={md.departments.map((d: any) => ({ value: d.id, label: d.name }))} /><Sel label="Designation" field="designationId" opts={md.designations.map((d: any) => ({ value: d.id, label: d.title }))} /></div>
                <div className={styles.formRow}><Sel label="Location" field="locationId" opts={md.locations.map((l: any) => ({ value: l.id, label: `${l.name}${l.city ? ` (${l.city})` : ''}` }))} /><Sel label="Grade" field="gradeId" opts={md.grades.map((g: any) => ({ value: g.id, label: g.name }))} /></div>
                <div className={styles.formRow}><Sel label="Work Mode" field="workMode" opts={['OFFICE','REMOTE','HYBRID']} /><Sel label="Reporting Manager" field="reportingManagerId" opts={md.employees.map((e: any) => ({ value: e.id, label: `${e.firstName} ${e.lastName} (${e.employeeCode})` }))} /></div>
                <div className={styles.formRow}><F label="Notice Period (days)" field="noticePeriodDays" type="number" ph="30" /><div className={styles.formField} /></div>
              </>}

              {/* 2: PERSONAL & STATUTORY */}
              {step === 2 && <>
                <SectionLabel>Personal</SectionLabel>
                <div className={styles.formRow}><F label="Date of Birth" field="dateOfBirth" type="date" /><Sel label="Marital Status" field="maritalStatus" opts={['SINGLE','MARRIED','DIVORCED','WIDOWED']} /></div>
                <div className={styles.formRow}><Sel label="Blood Group" field="bloodGroup" opts={['A+','A-','B+','B-','AB+','AB-','O+','O-']} /><div className={styles.formField} /></div>
                <SectionLabel>Statutory IDs (India)</SectionLabel>
                <div className={styles.formRow}><F label="PAN Number" field="panNumber" ph="ABCDE1234F" /><F label="Aadhaar" field="aadharNumber" ph="1234 5678 9012" /></div>
                <div className={styles.formRow}><F label="UAN (PF)" field="uanNumber" ph="100123456789" /><F label="PF Number" field="pfNumber" ph="KN/BLR/0012345/000/0001234" /></div>
                <div className={styles.formRow}><F label="ESI Number" field="esiNumber" ph="31-00-123456-000-0001" /><F label="Passport" field="passportNumber" ph="J1234567" /></div>
              </>}

              {/* 3: BANK */}
              {step === 3 && <>
                <SectionLabel>Bank Account for Salary Credit</SectionLabel>
                <div className={styles.formRow}><F label="Bank Name" field="bankName" ph="HDFC Bank" /><F label="Branch" field="bankBranch" ph="Koramangala, Bangalore" /></div>
                <div className={styles.formRow}><F label="Account Number" field="bankAccountNo" ph="50100123456789" /><F label="IFSC Code" field="bankIfsc" ph="HDFC0001234" /></div>
                <div style={{ padding: 'var(--space-4)', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 8 }}>
                  <span style={{ fontSize: 16 }}>ℹ️</span>
                  <span>Bank details will be used for payroll processing. Ensure the account holder name matches the employee&apos;s legal name. A cancelled cheque should be uploaded in the Documents section after creation.</span>
                </div>
              </>}

              {/* 4: ADDRESS & EMERGENCY */}
              {step === 4 && <>
                <AddrFields addr={form.currentAddress} setAddr={(a: any) => setForm({ ...form, currentAddress: a })} label="Current Address" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <input type="checkbox" checked={form.sameAsCurrentAddress} onChange={e => setForm({ ...form, sameAsCurrentAddress: e.target.checked })} style={{ accentColor: 'var(--color-primary-500)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Permanent address same as current</span>
                </div>
                {!form.sameAsCurrentAddress && <AddrFields addr={form.permanentAddress} setAddr={(a: any) => setForm({ ...form, permanentAddress: a })} label="Permanent Address" />}

                <SectionLabel>Emergency Contacts</SectionLabel>
                {form.emergencyContacts.map((ec: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-end' }}>
                    <div className={styles.formField} style={{ flex: 2 }}><label>Name{i === 0 && ' *'}</label><input value={ec.name} onChange={e => { const c = [...form.emergencyContacts]; c[i] = { ...c[i], name: e.target.value }; setForm({ ...form, emergencyContacts: c }); }} placeholder="Father / Spouse name" /></div>
                    <div className={styles.formField} style={{ flex: 1 }}><label>Relation</label><select value={ec.relationship} onChange={e => { const c = [...form.emergencyContacts]; c[i] = { ...c[i], relationship: e.target.value }; setForm({ ...form, emergencyContacts: c }); }}><option value="">Select</option>{['Father','Mother','Spouse','Sibling','Friend','Other'].map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                    <div className={styles.formField} style={{ flex: 1.5 }}><label>Phone{i === 0 && ' *'}</label><input value={ec.phone} onChange={e => { const c = [...form.emergencyContacts]; c[i] = { ...c[i], phone: e.target.value }; setForm({ ...form, emergencyContacts: c }); }} placeholder="+91 99999 99999" /></div>
                    {i > 0 && <button style={{ height: 42, padding: '0 12px', color: 'var(--color-danger-400)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', fontSize: 14, cursor: 'pointer', background: 'transparent' }} onClick={() => { const c = form.emergencyContacts.filter((_: any, j: number) => j !== i); setForm({ ...form, emergencyContacts: c }); }}>✕</button>}
                  </div>
                ))}
                <button style={{ alignSelf: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--color-primary-400)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600, padding: '4px 0' }} onClick={() => setForm({ ...form, emergencyContacts: [...form.emergencyContacts, { name: '', relationship: '', phone: '', isPrimary: false }] })}>+ Add Another Contact</button>
              </>}

              {/* 5: REVIEW */}
              {step === 5 && <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))', color: 'white', fontSize: 'var(--text-lg)', fontWeight: 700 }}>{form.firstName?.[0]}{form.lastName?.[0]}</div>
                  <div><div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>{form.firstName} {form.lastName}</div><div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{form.email}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{form.phone || 'No phone'} · {form.gender}</div></div>
                </div>

                <ReviewSection title="Employment" items={[
                  ['Joining', form.dateOfJoining ? new Date(form.dateOfJoining).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
                  ['Type', form.employmentType.replace(/_/g, ' ')], ['Mode', form.workMode],
                  ['Dept', md.departments.find((d: any) => d.id === form.departmentId)?.name || '—'],
                  ['Title', md.designations.find((d: any) => d.id === form.designationId)?.title || '—'],
                  ['Location', md.locations.find((l: any) => l.id === form.locationId)?.name || '—'],
                  ['Grade', md.grades.find((g: any) => g.id === form.gradeId)?.name || '—'],
                  ['Manager', md.employees.find((e: any) => e.id === form.reportingManagerId) ? `${md.employees.find((e: any) => e.id === form.reportingManagerId).firstName} ${md.employees.find((e: any) => e.id === form.reportingManagerId).lastName}` : '—'],
                  ['Notice', `${form.noticePeriodDays} days`],
                ]} />
                <ReviewSection title="Personal" items={[['DOB', form.dateOfBirth || '—'], ['Marital', form.maritalStatus || '—'], ['Blood', form.bloodGroup || '—'], ['Nationality', form.nationality || '—']]} />
                <ReviewSection title="Statutory" items={[['PAN', form.panNumber || '—'], ['Aadhaar', form.aadharNumber || '—'], ['UAN', form.uanNumber || '—'], ['PF', form.pfNumber || '—'], ['ESI', form.esiNumber || '—'], ['Passport', form.passportNumber || '—']]} />
                <ReviewSection title="Bank" items={[['Bank', form.bankName || '—'], ['Branch', form.bankBranch || '—'], ['Account', form.bankAccountNo || '—'], ['IFSC', form.bankIfsc || '—']]} />

                {form.currentAddress.line1 && <ReviewSection title="Address" items={[['Current', `${form.currentAddress.line1}, ${form.currentAddress.city}, ${form.currentAddress.state} ${form.currentAddress.pincode}`], ['Permanent', form.sameAsCurrentAddress ? 'Same as current' : form.permanentAddress.line1 ? `${form.permanentAddress.line1}, ${form.permanentAddress.city}` : '—']]} />}
                {form.emergencyContacts.filter((c: any) => c.name).length > 0 && <ReviewSection title="Emergency Contacts" items={form.emergencyContacts.filter((c: any) => c.name).map((c: any) => [c.name, `${c.relationship || '—'} · ${c.phone || '—'}`])} />}

                <div style={{ padding: 'var(--space-3)', background: 'rgba(16,185,129,0.06)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-accent-400)', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span>An employee code will be auto-generated. A welcome email will be prepared. You can upload documents after creation.</span>
                </div>
              </>}

              {/* Navigation */}
              <div className={styles.modalActions}>
                {step > 0 && <button className={styles.cancelBtn} onClick={() => setStep(step - 1)}>← Back</button>}
                <button className={styles.cancelBtn} onClick={() => setShowWizard(false)} style={{ marginRight: 'auto' }}>Cancel</button>
                {step < STEPS.length - 1 ? (
                  <button className={styles.submitBtn} onClick={() => setStep(step + 1)} disabled={!canNext()}>Next: {STEPS[step + 1]} →</button>
                ) : (
                  <button className={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>{submitting ? 'Creating...' : '✓ Create Employee'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
