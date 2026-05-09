'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DonutChart, Sparkline, BarChart } from '@/components/ui/Charts';
import styles from './dashboard.module.css';

interface StatCard {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

const iconSvgs: Record<string, React.ReactNode> = {
  users: <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  'user-plus': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>,
  'user-minus': <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><line x1="23" y1="11" x2="17" y2="11" /></>,
  'alert-triangle': <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
  check: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  wallet: <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4M20 12a2 2 0 0 1 0 4H4V6M20 12H4" />,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [stats, setStats] = useState<StatCard[]>([
    { label: 'Total Employees', value: '...', change: 'Loading', trend: 'neutral', icon: 'users', color: 'primary' },
    { label: 'New Joiners', value: '...', change: 'This month', trend: 'up', icon: 'user-plus', color: 'accent' },
    { label: 'On Leave Today', value: '...', change: 'Loading', trend: 'neutral', icon: 'calendar', color: 'warning' },
    { label: 'Pending Approvals', value: '...', change: 'Loading', trend: 'neutral', icon: 'clock', color: 'danger' },
    { label: 'Attendance %', value: '...', change: 'Today', trend: 'neutral', icon: 'check', color: 'accent' },
    { label: 'Payroll Status', value: '...', change: 'Loading', trend: 'neutral', icon: 'wallet', color: 'info' },
  ]);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(data => {
        setStats([
          { label: 'Total Employees', value: data.totalEmployees || 10, change: `${data.activeEmployees || 10} active`, trend: 'up', icon: 'users', color: 'primary' },
          { label: 'New Joiners', value: data.newJoinersThisMonth || 0, change: 'This month', trend: 'up', icon: 'user-plus', color: 'accent' },
          { label: 'On Leave', value: data.absentToday || 0, change: `${data.presentToday || 0} present today`, trend: 'neutral', icon: 'calendar', color: 'warning' },
          { label: 'Pending Leaves', value: data.pendingLeaves || 0, change: `${data.recentLeaveRequests?.length || 0} recent`, trend: data.pendingLeaves > 0 ? 'down' : 'neutral', icon: 'clock', color: 'danger' },
          { label: 'Attendance %', value: `${data.attendanceRate || 0}%`, change: 'Today', trend: data.attendanceRate >= 90 ? 'up' : 'down', icon: 'check', color: 'accent' },
          { label: 'Payroll', value: data.latestPayroll?.status || 'N/A', change: data.latestPayroll ? `₹${(data.latestPayroll.totalNet / 100000).toFixed(1)}L net` : '', trend: 'neutral', icon: 'wallet', color: 'info' },
        ]);
      })
      .catch(() => {
        setStats([
          { label: 'Total Employees', value: 10, change: '+2 this month', trend: 'up', icon: 'users', color: 'primary' },
          { label: 'New Joiners', value: 2, change: 'This month', trend: 'up', icon: 'user-plus', color: 'accent' },
          { label: 'On Leave Today', value: 1, change: '10% of total', trend: 'neutral', icon: 'calendar', color: 'warning' },
          { label: 'Pending Approvals', value: 3, change: '1 urgent', trend: 'down', icon: 'clock', color: 'danger' },
          { label: 'Attendance %', value: '92%', change: 'Today', trend: 'up', icon: 'check', color: 'accent' },
          { label: 'Payroll Status', value: 'Draft', change: 'April 2026', trend: 'neutral', icon: 'wallet', color: 'info' },
        ]);
      });
  }, []);

  const recentActivities = [
    { action: 'Leave approved', description: 'Priya Patel — Casual Leave (Apr 21-22)', time: '2 hours ago', type: 'leave' },
    { action: 'New joiner', description: 'Karan Malhotra — Software Engineer', time: '5 hours ago', type: 'joining' },
    { action: 'Attendance anomaly', description: 'Rohit Mehta — Missed clock-out', time: '1 day ago', type: 'anomaly' },
    { action: 'Payslip generated', description: 'March 2026 payslips released', time: '2 days ago', type: 'payroll' },
    { action: 'Exit initiated', description: 'Vikram Singh — Resignation submitted', time: '3 days ago', type: 'exit' },
    { action: 'Training completed', description: '12 employees completed compliance training', time: '4 days ago', type: 'training' },
  ];

  const upcomingBirthdays = [
    { name: 'Sneha Reddy', date: 'Apr 22', department: 'Engineering' },
    { name: 'Ananya Iyer', date: 'Apr 25', department: 'Finance' },
    { name: 'Arjun Desai', date: 'Apr 28', department: 'Backend' },
  ];

  const pendingTasks = [
    { task: 'Approve leave request — Priya Patel', link: '/leave', priority: 'high' },
    { task: 'Review probation — Rohit Mehta', link: '/employees/7', priority: 'medium' },
    { task: 'Process April payroll', link: '/payroll', priority: 'high' },
    { task: 'Complete exit clearance — Vikram Singh', link: '/exit', priority: 'medium' },
    { task: 'Upload IT security guidelines v2', link: '/documents', priority: 'low' },
  ];

  const announcements = [
    { title: 'Office Closed — Diwali', message: 'Office will remain closed from Nov 7-10 for Diwali festivities.', date: 'Oct 15', type: 'info' },
    { title: 'Annual Appraisal Cycle', message: 'Self-assessment forms are now open. Please complete by Apr 30.', date: 'Apr 01', type: 'warning' },
  ];

  const quickActions = [
    { label: 'Add Employee', href: '/employees', icon: 'user-plus' },
    { label: 'Run Payroll', href: '/payroll', icon: 'wallet' },
    { label: 'Leave Approvals', href: '/leave', icon: 'check' },
    { label: 'Attendance', href: '/attendance', icon: 'clock' },
    { label: 'Recruitment', href: '/recruitment', icon: 'users' },
    { label: 'Master Setup', href: '/masters', icon: 'calendar' },
  ];

  return (
    <div className={styles.page}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {greeting}, {user?.firstName || 'Admin'} 👋
          </h1>
          <p className={styles.pageSubtitle}>
            Here&apos;s what&apos;s happening with your team today.
          </p>
        </div>
        <div className={styles.dateDisplay}>
          <span className={styles.dateDay}>
            {currentTime.toLocaleDateString('en-IN', { weekday: 'long' })}
          </span>
          <span className={styles.dateValue}>
            {currentTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={styles.statCard}
            data-color={stat.color}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className={styles.statIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {iconSvgs[stat.icon]}
              </svg>
            </div>
            <div className={styles.statContent}>
              <span className={styles.statLabel}>{stat.label}</span>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statChange} data-trend={stat.trend}>
                {stat.trend === 'up' && '↑ '}
                {stat.trend === 'down' && '↓ '}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Gamification Widget */}
      <Link href="/gamification" className={styles.gamifyCard}>
        <div className={styles.gamifyLeft}>
          <div className={styles.gamifyLevel}>5</div>
          <div className={styles.gamifyInfo}>
            <span className={styles.gamifyTitle}>Level 5 — Rising Star</span>
            <div className={styles.gamifyBar}>
              <div className={styles.gamifyFill} style={{ width: '65%' }} />
            </div>
            <span className={styles.gamifyXp}>2,450 / 3,000 XP</span>
          </div>
        </div>
        <div className={styles.gamifyRight}>
          <div className={styles.gamifyStreak}>
            <span>🔥</span>
            <strong>7</strong>
            <span className={styles.gamifyStreakLabel}>day streak</span>
          </div>
          <div className={styles.gamifyStreak}>
            <span>🏆</span>
            <strong>12</strong>
            <span className={styles.gamifyStreakLabel}>badges</span>
          </div>
        </div>
      </Link>

      {/* Content Grid */}
      <div className={styles.contentGrid}>
        {/* Quick Actions */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Quick Actions</h2>
          <div className={styles.quickActions}>
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className={styles.quickActionBtn}>
                <div className={styles.quickActionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {iconSvgs[action.icon]}
                  </svg>
                </div>
                <span>{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Recent Activity</h2>
          <div className={styles.activityList}>
            {recentActivities.map((activity, i) => (
              <div key={i} className={styles.activityItem}>
                <div className={styles.activityDot} data-type={activity.type} />
                <div className={styles.activityContent}>
                  <span className={styles.activityAction}>{activity.action}</span>
                  <span className={styles.activityDesc}>{activity.description}</span>
                </div>
                <span className={styles.activityTime}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📋 Pending Tasks</h2>
          <div className={styles.taskList}>
            {pendingTasks.map((t, i) => (
              <Link key={i} href={t.link} className={styles.taskItem}>
                <span className={styles.taskPriority} data-level={t.priority} />
                <span className={styles.taskText}>{t.task}</span>
                <span className={styles.taskArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Announcements */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📢 Announcements</h2>
          <div className={styles.announceList}>
            {announcements.map((a, i) => (
              <div key={i} className={styles.announceItem} data-type={a.type}>
                <div className={styles.announceHeader}>
                  <strong>{a.title}</strong>
                  <span className={styles.announceDate}>{a.date}</span>
                </div>
                <p className={styles.announceMessage}>{a.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Headcount by Department */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📊 Headcount by Department</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <DonutChart
              data={[
                { label: 'Engineering', value: 4, color: 'var(--color-primary-500)' },
                { label: 'HR', value: 2, color: 'var(--color-accent-500)' },
                { label: 'Sales', value: 1, color: 'var(--color-warning-500)' },
                { label: 'Finance', value: 1, color: '#8b5cf6' },
                { label: 'Marketing', value: 1, color: 'var(--color-info-500)' },
                { label: 'Operations', value: 1, color: 'var(--color-danger-400)' },
              ]}
              size={130}
              thickness={18}
              centerValue={10}
              centerLabel="Total"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Engineering', value: 4, color: 'var(--color-primary-500)' },
                { label: 'HR', value: 2, color: 'var(--color-accent-500)' },
                { label: 'Sales', value: 1, color: 'var(--color-warning-500)' },
                { label: 'Finance', value: 1, color: '#8b5cf6' },
                { label: 'Marketing', value: 1, color: 'var(--color-info-500)' },
              ].map(d => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 'var(--text-xs)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-secondary)', minWidth: 80 }}>{d.label}</span>
                  <strong style={{ color: 'var(--text-primary)' }}>{d.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hiring Trend */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📈 Monthly Hiring Trend</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <BarChart
              data={[
                { label: 'Oct', value: 2, color: 'var(--color-primary-400)' },
                { label: 'Nov', value: 1, color: 'var(--color-primary-400)' },
                { label: 'Dec', value: 0, color: 'var(--color-primary-400)' },
                { label: 'Jan', value: 3, color: 'var(--color-primary-400)' },
                { label: 'Feb', value: 1, color: 'var(--color-primary-400)' },
                { label: 'Mar', value: 2, color: 'var(--color-accent-400)' },
                { label: 'Apr', value: 2, color: 'var(--color-accent-400)' },
              ]}
              height={100}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>Avg: 1.6 / month</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Attrition trend
                <Sparkline data={[2, 1, 3, 1, 0, 1, 1]} width={60} height={20} color="var(--color-danger-400)" />
              </span>
            </div>
          </div>
        </div>

        {/* Upcoming Birthdays */}
        <div className={styles.card} data-compact>
          <h2 className={styles.cardTitle}>🎂 Upcoming Birthdays</h2>
          <div className={styles.birthdayList}>
            {upcomingBirthdays.map((b, i) => (
              <div key={i} className={styles.birthdayItem}>
                <div className={styles.birthdayAvatar}>
                  {b.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <span className={styles.birthdayName}>{b.name}</span>
                  <span className={styles.birthdayDept}>{b.department} · {b.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance Overview */}
        <div className={styles.card} data-compact>
          <h2 className={styles.cardTitle}>Today&apos;s Attendance</h2>
          <div className={styles.attendanceOverview}>
            <div className={styles.attendanceStat}>
              <div className={styles.attendanceCircle} data-status="present">
                <span>8</span>
              </div>
              <span>Present</span>
            </div>
            <div className={styles.attendanceStat}>
              <div className={styles.attendanceCircle} data-status="absent">
                <span>1</span>
              </div>
              <span>Absent</span>
            </div>
            <div className={styles.attendanceStat}>
              <div className={styles.attendanceCircle} data-status="leave">
                <span>1</span>
              </div>
              <span>On Leave</span>
            </div>
            <div className={styles.attendanceStat}>
              <div className={styles.attendanceCircle} data-status="late">
                <span>1</span>
              </div>
              <span>Late</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
