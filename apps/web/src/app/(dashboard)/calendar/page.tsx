'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './calendar.module.css';

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

type CalEvent = { date: number; title: string; type: 'holiday' | 'birthday' | 'event' | 'leave'; color: string };

export default function CalendarPage() {
  const [tab, setTab] = useState<'calendar' | 'holidays' | 'birthdays'>('calendar');
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [allHolidays, setAllHolidays] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  const fetchCalendar = useCallback(async () => {
    try {
      const res = await fetch(`/api/calendar?year=${year}&month=${month + 1}`);
      const data = await res.json();
      const items: CalEvent[] = [];
      (data.holidays || []).forEach((h: any) => {
        const d = new Date(h.date).getDate();
        items.push({ date: d, title: `${h.name} (Holiday)`, type: 'holiday', color: '#ef4444' });
      });
      (data.leaves || []).forEach((l: any) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
          if (dt.getMonth() === month && dt.getFullYear() === year) {
            items.push({
              date: dt.getDate(),
              title: `${l.employee?.firstName || ''} ${l.employee?.lastName || ''} — ${l.leaveType?.code || 'Leave'}`,
              type: 'leave', color: '#f59e0b',
            });
          }
        }
      });
      setEvents(items);
    } catch {}
  }, [year, month]);

  useEffect(() => { fetchCalendar(); }, [fetchCalendar]);

  useEffect(() => {
    fetch('/api/holidays').then(r => r.json()).then(d => setAllHolidays(d.data || [])).catch(() => {});
    fetch('/api/employees?limit=100').then(r => r.json()).then(d => setEmployees(d.data || [])).catch(() => {});
  }, []);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();
  const isCurrentMonth = month === now.getMonth() && year === now.getFullYear();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Upcoming birthdays from employee DOBs
  const birthdays = employees.filter((e: any) => e.dateOfBirth).map((e: any) => {
    const dob = new Date(e.dateOfBirth);
    const nextBday = new Date(year, dob.getMonth(), dob.getDate());
    if (nextBday < now) nextBday.setFullYear(year + 1);
    return { name: `${e.firstName} ${e.lastName}`, date: nextBday, dept: e.department?.name || '—' };
  }).sort((a: any, b: any) => a.date.getTime() - b.date.getTime()).slice(0, 10);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📅 Company Calendar</h1>
          <p className={styles.pageSubtitle}>Holidays, events, birthdays, and leave consolidated view</p>
        </div>
      </div>

      <div className={styles.tabs}>
        {[{ key: 'calendar', label: '📅 Calendar' }, { key: 'holidays', label: '🏖️ Holiday List' }, { key: 'birthdays', label: '🎂 Birthdays' }].map(t => (
          <button key={t.key} className={styles.tab} data-active={tab === t.key} onClick={() => setTab(t.key as any)}>{t.label}</button>
        ))}
      </div>

      {tab === 'calendar' && (
        <div className={styles.calLayout}>
          <div className={styles.calCard}>
            <div className={styles.calMonthHeader}>
              <button className={styles.navBtn} onClick={prevMonth}>←</button>
              <h2>{monthNames[month]} {year}</h2>
              <button className={styles.navBtn} onClick={nextMonth}>→</button>
            </div>
            <div className={styles.calGrid}>
              {daysOfWeek.map(d => <div key={d} className={styles.calDayHead}>{d}</div>)}
              {cells.map((day, i) => {
                const evts = day ? events.filter(e => e.date === day) : [];
                return (
                  <div key={i} className={styles.calCell} data-today={isCurrentMonth && day === todayDate} data-empty={!day}>
                    {day && <span className={styles.calDate}>{day}</span>}
                    {evts.map((e, ei) => <span key={ei} className={styles.calDot} style={{ background: e.color }} title={e.title} />)}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.eventSidebar}>
            <h3>Events this month ({events.length})</h3>
            {events.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No events this month</p>}
            {events.sort((a, b) => a.date - b.date).map((e, i) => (
              <div key={i} className={styles.eventItem} style={{ borderLeftColor: e.color, animationDelay: `${i * 30}ms` }}>
                <span className={styles.eventDate}>{monthNames[month].substring(0, 3)} {e.date}</span>
                <span className={styles.eventTitle}>{e.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'holidays' && (
        <div className={styles.holidayList}>
          <h3 className={styles.sectionTitle}>All Holidays ({allHolidays.length})</h3>
          {allHolidays.map((h: any, i: number) => (
            <div key={h.id || i} className={styles.holidayCard} style={{ animationDelay: `${i * 40}ms` }}>
              <span className={styles.holidayDate}>{new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              <span className={styles.holidayName}>{h.name}</span>
              <span className={styles.holidayType} data-type={h.type || 'NATIONAL'}>{h.type || 'NATIONAL'}</span>
            </div>
          ))}
          {allHolidays.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No holidays configured</p>}
        </div>
      )}

      {tab === 'birthdays' && (
        <div className={styles.bdayList}>
          <h3 className={styles.sectionTitle}>🎂 Upcoming Birthdays</h3>
          {birthdays.map((b: any, i: number) => (
            <div key={i} className={styles.bdayCard} style={{ animationDelay: `${i * 50}ms` }}>
              <div className={styles.bdayAvatar}>{b.name.split(' ').map((n: string) => n[0]).join('')}</div>
              <div><strong>{b.name}</strong><span>{b.dept}</span></div>
              <span className={styles.bdayDate}>🎂 {b.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
            </div>
          ))}
          {birthdays.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No birthday data available</p>}
        </div>
      )}
    </div>
  );
}
