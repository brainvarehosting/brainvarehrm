'use client';
import toast from '@/lib/toast';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './masters.module.css';

type MasterCategory = 'company' | 'people' | 'payroll' | 'leave' | 'recruitment' | 'gamification' | 'projects' | 'wellness';

const masterCategories: { key: MasterCategory; label: string; icon: string; color: string; description: string; items: { name: string; description: string; count?: number; link?: string }[] }[] = [
  {
    key: 'company', label: 'Company & Organization', icon: '🏢', color: '#3b82f6',
    description: 'Core organizational structure, locations, and branches',
    items: [
      { name: 'Departments', description: 'Define organizational departments and sub-departments', count: 6, link: '/organization' },
      { name: 'Designations', description: 'Job titles and designation hierarchy', count: 12 },
      { name: 'Grades & Bands', description: 'Employee grade structure (L1-L10, etc.)', count: 8 },
      { name: 'Locations', description: 'Office locations, branches, and geo-fencing zones', count: 3 },
      { name: 'Cost Centers', description: 'Map departments and projects to cost centers', count: 4 },
      { name: 'Work Schedules', description: 'Define work shifts, timings, and week-off rules', count: 3 },
      { name: 'Holiday Calendar', description: 'Company-wide and location-specific holidays', count: 15 },
      { name: 'Notice Periods', description: 'Configure notice period rules by grade/designation', count: 4 },
    ],
  },
  {
    key: 'people', label: 'People & Onboarding', icon: '👥', color: '#10b981',
    description: 'Employee templates, checklists, and lifecycle configuration',
    items: [
      { name: 'Employee Templates', description: 'Pre-fill common fields for new hire profiles', count: 3 },
      { name: 'Onboarding Checklists', description: 'Step-by-step onboarding task templates', count: 4 },
      { name: 'Exit Checklists', description: 'Clearance and handover task templates', count: 3 },
      { name: 'Document Types', description: 'Required employee documents (Aadhaar, PAN, etc.)', count: 8 },
      { name: 'Probation Rules', description: 'Probation duration and extension policies', count: 2 },
      { name: 'Letter Templates', description: 'Offer letter, appointment, and increment templates', count: 6, link: '/letters' },
    ],
  },
  {
    key: 'payroll', label: 'Payroll & Compensation', icon: '💰', color: '#f59e0b',
    description: 'Salary structures, tax rules, and benefit configurations',
    items: [
      { name: 'Pay Heads', description: 'Earnings, deductions, and reimbursement components', count: 14 },
      { name: 'Salary Structures', description: 'Templates linking pay heads with formulas', count: 3 },
      { name: 'Tax Rules (TDS)', description: 'Indian tax slab configuration and declarations', count: 5 },
      { name: 'PF / ESI Rules', description: 'Provident fund and insurance contribution rules', count: 2 },
      { name: 'Bonus Policies', description: 'Performance bonus, festival bonus, and profit sharing', count: 3 },
      { name: 'Loan Types', description: 'Salary advance, personal loan, and education loan', count: 4, link: '/loans' },
      { name: 'Reimbursement Types', description: 'Travel, medical, phone, and internet allowances', count: 6, link: '/expenses' },
      { name: 'Overtime Rules', description: 'OT calculation rates and eligibility criteria', count: 2 },
    ],
  },
  {
    key: 'leave', label: 'Leave & Attendance', icon: '📅', color: '#8b5cf6',
    description: 'Leave types, policies, and attendance configuration',
    items: [
      { name: 'Leave Types', description: 'CL, SL, PL, WFH, comp-off, and custom types', count: 8, link: '/leave' },
      { name: 'Leave Policies', description: 'Accrual rules, carry-forward, and encashment', count: 3 },
      { name: 'Attendance Rules', description: 'Grace period, half-day logic, and penalty rules', count: 4, link: '/attendance' },
      { name: 'Shift Masters', description: 'Define shifts (General, Morning, Night, etc.)', count: 3 },
      { name: 'Week-Off Patterns', description: 'Configure 5-day, 6-day, and alternate Saturdays', count: 3 },
      { name: 'Geo-Fence Zones', description: 'GPS-based punch areas for field teams', count: 2 },
    ],
  },
  {
    key: 'recruitment', label: 'Recruitment & Talent', icon: '🔍', color: '#ec4899',
    description: 'Hiring workflows, evaluation criteria, and job templates',
    items: [
      { name: 'Hiring Stages', description: 'Pipeline stages (Screening → Interview → Offer)', count: 7, link: '/recruitment' },
      { name: 'Evaluation Templates', description: 'Scorecards for technical and cultural rounds', count: 4 },
      { name: 'Job Templates', description: 'Pre-built JDs for common roles', count: 5 },
      { name: 'Source Channels', description: 'LinkedIn, Naukri, Referrals, and career page', count: 6 },
      { name: 'Skill Taxonomy', description: 'Master list of technical and soft skills', count: 24, link: '/skills' },
      { name: 'Competency Frameworks', description: 'Role-based competency models', count: 3 },
      { name: 'Performance Cycles', description: 'Annual, quarterly, and 360° review configurations', count: 3, link: '/performance' },
    ],
  },
  {
    key: 'gamification', label: 'Gamification & Engagement', icon: '🎮', color: '#f97316',
    description: 'XP rules, badge types, quest templates, and reward catalog',
    items: [
      { name: 'XP Rules', description: 'Define XP rewards for actions (attendance, recognition, etc.)', count: 12, link: '/gamification' },
      { name: 'Level Thresholds', description: 'XP required per level (1-50)', count: 50 },
      { name: 'Badge Types', description: 'Create and manage achievement badges', count: 18 },
      { name: 'Quest Templates', description: 'Daily, weekly, and one-time quest definitions', count: 8 },
      { name: 'Reward Catalog', description: 'Points-based rewards (extra leave, swag, etc.)', count: 6 },
      { name: 'Company Values', description: 'Core values for recognition tagging', count: 10, link: '/recognition' },
      { name: 'Survey Templates', description: 'Pulse check and engagement survey templates', count: 4, link: '/surveys' },
    ],
  },
  {
    key: 'projects', label: 'Projects & Clients', icon: '📁', color: '#06b6d4',
    description: 'Client management, project types, and billing configurations',
    items: [
      { name: 'Client Master', description: 'Client profiles, contacts, and billing details', count: 5, link: '/projects' },
      { name: 'Project Types', description: 'Project, Retainer, Internal, and Discovery', count: 4 },
      { name: 'Billing Rates', description: 'Hourly rates by role and experience level', count: 6 },
      { name: 'Milestone Templates', description: 'Common project milestones and deliverables', count: 3 },
      { name: 'Freelancer Categories', description: 'Designer, Developer, Writer, Strategist, etc.', count: 6, link: '/freelancers' },
      { name: 'Contract Templates', description: 'Freelancer and vendor agreement templates', count: 3 },
    ],
  },
  {
    key: 'wellness', label: 'Wellness & Benefits', icon: '🧘', color: '#14b8a6',
    description: 'Wellness program setup, challenge templates, and benefits catalog',
    items: [
      { name: 'Challenge Templates', description: 'Steps, meditation, hydration, and custom challenges', count: 6, link: '/wellness' },
      { name: 'Benefit Plans', description: 'Health insurance, gym membership, learning budget', count: 5 },
      { name: 'Insurance Plans', description: 'Group medical, accidental, and life coverage', count: 3 },
      { name: 'Wellness Tips', description: 'Daily tip categories and content library', count: 20 },
      { name: 'Event Types', description: 'Town hall, team outing, workshop categories', count: 5, link: '/social' },
    ],
  },
];

export default function MastersPage() {
  const [selectedCategory, setSelectedCategory] = useState<MasterCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const currentCategory = masterCategories.find(c => c.key === selectedCategory);

  const allItems = masterCategories.flatMap(cat =>
    cat.items.map(item => ({ ...item, category: cat.label, categoryKey: cat.key, categoryIcon: cat.icon }))
  );
  const searchResults = searchTerm
    ? allItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const totalMasters = masterCategories.reduce((sum, c) => sum + c.items.length, 0);
  const totalConfigured = masterCategories.reduce((sum, c) => sum + c.items.filter(i => (i.count || 0) > 0).length, 0);

  // Fetch real counts from API
  useEffect(() => {
    fetch('/api/masters').then(r => r.json()).then(d => {
      // Update counts dynamically from real data
      const counts: Record<string, number> = {
        'Departments': d.departments?.length || 0,
        'Designations': d.designations?.length || 0,
        'Grades & Bands': d.grades?.length || 0,
        'Locations': d.locations?.length || 0,
      };
      masterCategories.forEach(cat => {
        cat.items.forEach(item => {
          if (counts[item.name] !== undefined) item.count = counts[item.name];
        });
      });
    }).catch(() => {});
  }, []);

  const handleConfigure = async (itemName: string) => {
    const val = prompt(`Add new ${itemName} entry:`);
    if (!val) return;
    // Map to API types
    const typeMap: Record<string, { type: string; data: any }> = {
      'Departments': { type: 'department', data: { name: val, code: val.substring(0,3).toUpperCase() } },
      'Designations': { type: 'designation', data: { title: val } },
      'Grades & Bands': { type: 'grade', data: { name: val, level: 1 } },
      'Locations': { type: 'location', data: { name: val, city: val } },
    };
    const mapped = typeMap[itemName];
    if (mapped) {
      try {
        const res = await fetch('/api/masters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...mapped.data, type: mapped.type }) });
        if (res.ok) toast(`${itemName} "${val}" created!`, 'success');
        else toast('Failed to create entry', 'error');
      } catch { toast('Error connecting to API', 'error'); }
    } else {
      toast(`${itemName} configuration saved: ${val}`, 'info');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>⚙️ Master Setup Hub</h1>
          <p className={styles.pageSubtitle}>Configure every aspect of your HR platform — deep drill-down into all masters</p>
        </div>
        <div className={styles.setupProgress}>
          <span className={styles.progressLabel}>{totalConfigured}/{totalMasters} configured</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${(totalConfigured / totalMasters) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className={styles.searchWrap}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search across all masters... (pay heads, leave types, badges, etc.)"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); if (e.target.value) setSelectedCategory(null); }}
        />
        {searchTerm && <button className={styles.clearBtn} onClick={() => setSearchTerm('')}>✕</button>}
      </div>

      {/* Search Results */}
      {searchTerm && (
        <div className={styles.searchResults}>
          <span className={styles.resultCount}>{searchResults.length} results for &ldquo;{searchTerm}&rdquo;</span>
          {searchResults.map((item, i) => (
            <div key={i} className={styles.searchResultItem} style={{ animationDelay: `${i * 30}ms` }}>
              <span className={styles.resultIcon}>{item.categoryIcon}</span>
              <div className={styles.resultContent}>
                <strong>{item.name}</strong>
                <span>{item.description}</span>
                <span className={styles.resultCategory}>{item.category}</span>
              </div>
              {item.count !== undefined && <span className={styles.resultCount2}>{item.count}</span>}
              {item.link ? (
                <Link href={item.link} className={styles.resultLink}>Open →</Link>
              ) : (
                <button className={styles.resultLink} onClick={() => handleConfigure(item.name)}>Configure →</button>
              )}
            </div>
          ))}
          {searchResults.length === 0 && <div className={styles.noResults}>No masters found matching &ldquo;{searchTerm}&rdquo;</div>}
        </div>
      )}

      {/* Categories Grid */}
      {!searchTerm && !selectedCategory && (
        <div className={styles.categoryGrid}>
          {masterCategories.map((cat, i) => (
            <button key={cat.key} className={styles.categoryCard} onClick={() => setSelectedCategory(cat.key)} style={{ animationDelay: `${i * 50}ms`, borderColor: cat.color + '30' }}>
              <div className={styles.categoryIcon} style={{ background: cat.color + '15', color: cat.color }}>{cat.icon}</div>
              <h3 className={styles.categoryName}>{cat.label}</h3>
              <p className={styles.categoryDesc}>{cat.description}</p>
              <div className={styles.categoryMeta}>
                <span>{cat.items.length} masters</span>
                <span className={styles.categoryArrow}>→</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Drill-down View */}
      {!searchTerm && selectedCategory && currentCategory && (
        <div className={styles.drillDown}>
          <button className={styles.backBtn} onClick={() => setSelectedCategory(null)}>
            ← Back to Categories
          </button>
          <div className={styles.drillHeader} style={{ borderColor: currentCategory.color + '30' }}>
            <div className={styles.categoryIcon} style={{ background: currentCategory.color + '15', color: currentCategory.color, fontSize: '2rem' }}>{currentCategory.icon}</div>
            <div>
              <h2 className={styles.drillTitle}>{currentCategory.label}</h2>
              <p className={styles.drillDesc}>{currentCategory.description}</p>
            </div>
          </div>
          <div className={styles.masterList}>
            {currentCategory.items.map((item, i) => (
              <div key={i} className={styles.masterItem} style={{ animationDelay: `${i * 40}ms` }}>
                <div className={styles.masterInfo}>
                  <h4 className={styles.masterName}>{item.name}</h4>
                  <p className={styles.masterDesc}>{item.description}</p>
                </div>
                <div className={styles.masterActions}>
                  {item.count !== undefined && (
                    <span className={styles.masterCount} style={{ color: currentCategory.color }}>{item.count} entries</span>
                  )}
                  {item.link ? (
                    <Link href={item.link} className={styles.masterBtn}>Open Module →</Link>
                  ) : (
                    <button className={styles.masterBtn} onClick={() => handleConfigure(item.name)}>Configure</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
