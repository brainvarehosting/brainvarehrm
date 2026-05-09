'use client';
import toast from '@/lib/toast';

import { useState } from 'react';
import styles from './announcements.module.css';

const mockAnnouncements = [
  { id: '1', title: 'Q1 Results — Record Growth! 🎉', body: 'We achieved 32% revenue growth in Q1 2026. Thank you to every team member who made this possible. Special shout-out to the Engineering and Sales teams!', author: 'CEO', category: 'COMPANY', priority: 'HIGH', date: '2026-04-18', comments: 12, likes: 28, pinned: true },
  { id: '2', title: 'New WFH Policy Update', body: 'Starting May 1st, all employees can work from home up to 3 days per week. Please update your preferred WFH days in Settings.', author: 'HR', category: 'POLICY', priority: 'NORMAL', date: '2026-04-15', comments: 8, likes: 45, pinned: true },
  { id: '3', title: 'Office Renovation — 2nd Floor', body: 'The 2nd floor will be under renovation from April 25-30. Please use the 3rd floor meeting rooms during this period.', author: 'Admin', category: 'FACILITIES', priority: 'NORMAL', date: '2026-04-14', comments: 3, likes: 5, pinned: false },
  { id: '4', title: 'Town Hall — April 20th, 3 PM', body: 'Monthly town hall meeting. Agenda: Q1 review, new product roadmap, team introductions. Attendance is mandatory for all.', author: 'CEO', category: 'EVENT', priority: 'HIGH', date: '2026-04-12', comments: 6, likes: 18, pinned: false },
  { id: '5', title: 'Health Insurance Renewal', body: 'Annual health insurance renewal is due by April 30. Please review and update your dependents in the Benefits module.', author: 'HR', category: 'BENEFITS', priority: 'NORMAL', date: '2026-04-10', comments: 2, likes: 8, pinned: false },
  { id: '6', title: 'Welcome Ravi Kumar! 🎊', body: 'Please welcome Ravi Kumar who joins us as Frontend Developer in the Engineering team starting April 28th.', author: 'HR', category: 'PEOPLE', priority: 'NORMAL', date: '2026-04-08', comments: 15, likes: 32, pinned: false },
];

const catColors: Record<string, string> = { COMPANY: '#3b82f6', POLICY: '#8b5cf6', FACILITIES: '#f59e0b', EVENT: '#10b981', BENEFITS: '#ec4899', PEOPLE: '#06b6d4' };

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockAnnouncements : mockAnnouncements.filter(a => a.category === filter);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📢 Announcements</h1>
          <p className={styles.pageSubtitle}>Company-wide communications, updates, and news</p>
        </div>
        <button className={styles.addBtn} onClick={() => toast("Action completed", "success")}>+ New Announcement</button>
      </div>

      <div className={styles.filterRow}>
        {['all', 'COMPANY', 'POLICY', 'EVENT', 'PEOPLE', 'BENEFITS', 'FACILITIES'].map(f => (
          <button key={f} className={styles.filterPill} data-active={filter === f} onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      <div className={styles.announcementList}>
        {filtered.map((a, i) => {
          const catColor = catColors[a.category] || 'var(--text-secondary)';
          return (
            <article key={a.id} className={styles.annCard} data-pinned={a.pinned} style={{ animationDelay: `${i * 50}ms` }}>
              {a.pinned && <span className={styles.pinnedTag}>📌 Pinned</span>}
              <div className={styles.annMeta}>
                <span className={styles.annCat} style={{ color: catColor, background: catColor + '12' }}>{a.category}</span>
                {a.priority === 'HIGH' && <span className={styles.highTag}>⚡ Important</span>}
                <span className={styles.annDate}>{new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <h2 className={styles.annTitle}>{a.title}</h2>
              <p className={styles.annBody}>{a.body}</p>
              <div className={styles.annFooter}>
                <span className={styles.annAuthor}>By {a.author}</span>
                <div className={styles.annActions}>
                  <button className={styles.likeBtn} onClick={() => toast("Action completed", "success")}>❤️ {a.likes}</button>
                  <button className={styles.commentBtn} onClick={() => toast("Action completed", "success")}>💬 {a.comments}</button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
