'use client';

import { useState, useEffect } from 'react';
import styles from './organization.module.css';

type TabKey = 'overview' | 'departments' | 'locations' | 'grades' | 'designations' | 'shifts' | 'holidays';

export default function OrganizationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [org, setOrg] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/organization').then(r => r.json()).then(d => {
      if (d.organization) setOrg(d.organization);
      if (d.departments) setDepartments(d.departments);
      if (d.locations) setLocations(d.locations);
      if (d.grades) setGrades(d.grades);
      if (d.designations) setDesignations(d.designations);
      if (d.shifts) setShifts(d.shifts);
      if (d.holidays) setHolidays(d.holidays);
    }).catch(() => {});
  }, []);

  const addMaster = async (type: string, data: any) => {
    try {
      const res = await fetch('/api/masters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...data }),
      });
      if (res.ok) {
        const created = await res.json();
        switch (type) {
          case 'department': setDepartments(prev => [...prev, created]); break;
          case 'location': setLocations(prev => [...prev, created]); break;
          case 'grade': setGrades(prev => [...prev, created]); break;
          case 'designation': setDesignations(prev => [...prev, created]); break;
        }
      }
    } catch {}
  };

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview', label: 'Overview' }, { key: 'departments', label: 'Departments' },
    { key: 'locations', label: 'Locations' }, { key: 'grades', label: 'Grades' },
    { key: 'designations', label: 'Designations' }, { key: 'shifts', label: 'Shifts' },
    { key: 'holidays', label: 'Holidays' },
  ];

  const orgData = org ? {
    name: org.name, legalName: org.legalName || org.name,
    domain: org.domain || '—', industry: 'Information Technology',
    timezone: 'Asia/Kolkata', currency: 'INR', financialYearStart: org.financialYearStart || 'April',
  } : {};

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Organization Setup</h1>
          <p className={styles.pageSubtitle}>Configure your company structure and policies</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <button key={tab.key} className={styles.tab} data-active={activeTab === tab.key} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className={styles.overviewGrid}>
          <div className={styles.card} data-span="full">
            <div className={styles.cardHeader}>
              <h3>Company Information</h3>
            </div>
            <div className={styles.infoGrid}>
              {Object.entries(orgData).map(([key, val]) => (
                <div key={key} className={styles.infoItem}>
                  <span className={styles.infoLabel}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase())}</span>
                  <span>{val as string}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.card}>
            <h3>Quick Stats</h3>
            <div className={styles.quickStats}>
              <div><span className={styles.qsNum}>{departments.length}</span><label>Departments</label></div>
              <div><span className={styles.qsNum}>{locations.length}</span><label>Locations</label></div>
              <div><span className={styles.qsNum}>{grades.length}</span><label>Grades</label></div>
              <div><span className={styles.qsNum}>{designations.length}</span><label>Designations</label></div>
              <div><span className={styles.qsNum}>{shifts.length}</span><label>Shifts</label></div>
              <div><span className={styles.qsNum}>{holidays.length}</span><label>Holidays</label></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Department Hierarchy</h3>
            <button className={styles.addBtn} onClick={() => { const name = prompt('Department name:'); if(name) addMaster('department', { name, code: name.substring(0,3).toUpperCase() }); }}>+ Add Department</button>
          </div>
          <div className={styles.treeList}>
            {departments.map((dept: any) => (
              <div key={dept.id} className={styles.treeItem}>
                <div className={styles.treeRow}>
                  <div className={styles.treeName}>
                    <strong>{dept.name}</strong>
                    <span className={styles.treeCode}>{dept.code || '—'}</span>
                  </div>
                  <span className={styles.headcount}>{dept._count?.employees || 0} employees</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'locations' && (
        <div className={styles.locationsGrid}>
          {locations.map((loc: any) => (
            <div key={loc.id} className={styles.locationCard}>
              <div className={styles.locHeader}>
                <h4>{loc.name}</h4>
              </div>
              <p className={styles.locCity}>{loc.city}, {loc.state || loc.country}</p>
              <div className={styles.locFooter}>
                <span>{loc._count?.employees || 0} employees</span>
              </div>
            </div>
          ))}
          <button className={styles.addLocationCard} onClick={() => { const name = prompt('Location name:'); const city = prompt('City:'); if(name && city) addMaster('location', { name, city }); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Location
          </button>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}><h3>Grade Structure</h3><button className={styles.addBtn} onClick={() => { const name = prompt('Grade name:'); if(name) addMaster('grade', { name, level: grades.length + 1 }); }}>+ Add Grade</button></div>
          <div className={styles.gradeList}>
            {grades.map((g: any) => (
              <div key={g.id} className={styles.gradeRow}>
                <div className={styles.gradeLevel}>L{g.level}</div>
                <div className={styles.gradeName}><strong>{g.name}</strong></div>
                <span className={styles.headcount}>{g._count?.employees || 0} employees</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'designations' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}><h3>Designations</h3><button className={styles.addBtn} onClick={() => { const title = prompt('Designation title:'); if(title) addMaster('designation', { title }); }}>+ Add Designation</button></div>
          <div className={styles.chipGrid}>
            {designations.map((d: any) => (
              <span key={d.id} className={styles.chip}>{d.title}</span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className={styles.shiftsGrid}>
          {shifts.map((s: any) => (
            <div key={s.id} className={styles.shiftCard}>
              <h4>{s.name}</h4>
              <span className={styles.shiftCode}>{s.code || '—'}</span>
              <div className={styles.shiftTime}>{s.startTime} — {s.endTime}</div>
              <span className={styles.shiftGrace}>Grace: {s.gracePeriod || 15} min</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'holidays' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}><h3>Holiday Calendar — {new Date().getFullYear()}</h3></div>
          <div className={styles.holidayList}>
            {holidays.map((h: any) => (
              <div key={h.id} className={styles.holidayRow}>
                <div className={styles.holidayDate}>{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</div>
                <strong>{h.name}</strong>
                <span className={styles.holidayType}>{h.type || 'Mandatory'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
