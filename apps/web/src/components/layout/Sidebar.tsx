'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
  user: any;
}

const navigation = [
  {
    section: 'OVERVIEW',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: 'grid' },
      { name: 'Approvals', href: '/approvals', icon: 'check' },
      { name: 'Announcements', href: '/announcements', icon: 'message-circle' },
      { name: 'Calendar', href: '/calendar', icon: 'calendar' },
      { name: 'Gamification', href: '/gamification', icon: 'gamepad' },
    ],
  },
  {
    section: 'PEOPLE',
    items: [
      { name: 'Employees', href: '/employees', icon: 'users' },
      { name: 'Positions', href: '/positions', icon: 'briefcase' },
      { name: 'Preboarding', href: '/preboarding', icon: 'user-plus' },
      { name: 'Onboarding', href: '/onboarding', icon: 'user-plus' },
      { name: 'Exit Management', href: '/exit', icon: 'user-minus' },
      { name: 'Alumni', href: '/alumni', icon: 'users' },
      { name: 'Freelancers', href: '/freelancers', icon: 'briefcase' },
    ],
  },
  {
    section: 'TALENT',
    items: [
      { name: 'Recruitment', href: '/recruitment', icon: 'search' },
      { name: 'Skills Matrix', href: '/skills', icon: 'layers' },
      { name: 'Succession', href: '/succession', icon: 'crown' },
      { name: 'Career Paths', href: '/career', icon: 'layers' },
      { name: 'Performance', href: '/performance', icon: 'target' },
      { name: 'Compensation', href: '/compensation', icon: 'star' },
      { name: 'Training', href: '/training', icon: 'book-open' },
      { name: 'Goals & OKR', href: '/goals', icon: 'target' },
    ],
  },
  {
    section: 'TIME & PAY',
    items: [
      { name: 'Attendance', href: '/attendance', icon: 'clock' },
      { name: 'Leave', href: '/leave', icon: 'calendar' },
      { name: 'Payroll', href: '/payroll', icon: 'wallet' },
      { name: 'Shifts', href: '/shifts', icon: 'clock' },
      { name: 'Loans', href: '/loans', icon: 'banknote' },
      { name: 'Benefits', href: '/benefits', icon: 'heart' },
      { name: 'Overtime', href: '/overtime', icon: 'clock' },
      { name: 'Timesheet', href: '/timesheet', icon: 'clock' },
    ],
  },
  {
    section: 'ENGAGE',
    items: [
      { name: 'Recognition', href: '/recognition', icon: 'star' },
      { name: 'Surveys', href: '/surveys', icon: 'clipboard' },
      { name: 'Social Feed', href: '/social', icon: 'message-circle' },
      { name: 'Wellness', href: '/wellness', icon: 'heart' },
      { name: 'Helpdesk', href: '/helpdesk', icon: 'life-buoy' },
      { name: 'Cases', href: '/cases', icon: 'clipboard' },
    ],
  },
  {
    section: 'OPERATIONS',
    items: [
      { name: 'Projects', href: '/projects', icon: 'folder' },
      { name: 'Assets', href: '/assets', icon: 'package' },
      { name: 'Expenses', href: '/expenses', icon: 'credit-card' },
      { name: 'Travel', href: '/travel', icon: 'briefcase' },
    ],
  },
  {
    section: 'DOCUMENTS',
    items: [
      { name: 'Documents', href: '/documents', icon: 'file' },
      { name: 'Letters', href: '/letters', icon: 'file-text' },
      { name: 'Policies', href: '/policies', icon: 'clipboard' },
    ],
  },
  {
    section: 'ADMIN',
    items: [
      { name: 'Master Setup', href: '/masters', icon: 'settings' },
      { name: 'Organization', href: '/organization', icon: 'building' },
      { name: 'Org Chart', href: '/orgchart', icon: 'git-branch' },
      { name: 'Workflows', href: '/workflows', icon: 'git-branch' },
      { name: 'Forms Builder', href: '/forms', icon: 'file-text' },
      { name: 'Integrations', href: '/integrations', icon: 'git-branch' },
      { name: 'Reports', href: '/reports', icon: 'bar-chart' },
      { name: 'Analytics', href: '/analytics', icon: 'bar-chart' },
      { name: 'Compliance', href: '/compliance', icon: 'clipboard' },
      { name: 'Audit Logs', href: '/audit', icon: 'file-text' },
      { name: 'Settings', href: '/settings', icon: 'settings' },
    ],
  },
];

const iconPaths: Record<string, string> = {
  'grid': 'M3 3h7v7H3V3zm11 0h7v7h-7V3zm0 11h7v7h-7v-7zm-11 0h7v7H3v-7z',
  'gamepad': 'M6 11h4M8 9v4M15 12h.01M18 10h.01M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.198 12.4 2 16.43 2 18a2 2 0 0 0 4 0c.55 0 1-.45 1-1h10c0 .55.45 1 1 1a2 2 0 0 0 4 0c0-1.57-.198-5.6-.702-9.41A4 4 0 0 0 17.32 5z',
  'users': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm13 14v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  'user-plus': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6',
  'user-minus': 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 11h-6',
  'briefcase': 'M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2',
  'search': 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  'layers': 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  'clipboard': 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z',
  'folder': 'M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z',
  'crown': 'M2 20h20M5 17l3-10 4 6 4-6 3 10',
  'banknote': 'M2 8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'message-circle': 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  'heart': 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
  'clock': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2',
  'calendar': 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
  'wallet': 'M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4M20 12a2 2 0 0 1 0 4H4V6M20 12H4',
  'target': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  'book-open': 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  'life-buoy': 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24',
  'file': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  'file-text': 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'building': 'M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18zM6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2M10 6h4M10 10h4M10 14h4M10 18h4',
  'bar-chart': 'M12 20V10M18 20V4M6 20v-4',
  'package': 'M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12',
  'credit-card': 'M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22',
  'git-branch': 'M6 3v12M18 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9',
  'settings': 'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
};

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose, user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={styles.sidebar}
      data-collapsed={collapsed}
      data-mobile-open={mobileOpen}
    >
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" rx="12" fill="url(#sidebar-logo-grad)" />
            <path d="M14 16h6v16h-6V16zm14 0h6v16h-6V16zm-7 6h6v10h-6V22z" fill="white" fillOpacity="0.95"/>
            <defs>
              <linearGradient id="sidebar-logo-grad" x1="0" y1="0" x2="48" y2="48">
                <stop stopColor="#3b82f6"/>
                <stop offset="1" stopColor="#8b5cf6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        {!collapsed && (
          <span className={styles.logoText}>BrainvareHRM</span>
        )}
        <button
          className={styles.collapseBtn}
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {collapsed ? (
              <polyline points="9 18 15 12 9 6" />
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {navigation.map((group) => (
          <div key={group.section} className={styles.navGroup}>
            {!collapsed && (
              <span className={styles.navGroupLabel}>{group.section}</span>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.navItem}
                  data-active={isActive}
                  title={collapsed ? item.name : undefined}
                >
                  <svg
                    className={styles.navIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={iconPaths[item.icon] || iconPaths['grid']} />
                  </svg>
                  {!collapsed && (
                    <span className={styles.navLabel}>{item.name}</span>
                  )}
                  {isActive && <div className={styles.activeIndicator} />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User card at bottom */}
      <div className={styles.userCard}>
        <div className={styles.userAvatar}>
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        {!collapsed && (
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </span>
            <span className={styles.userRole}>
              {user?.roles?.[0]?.replace('_', ' ') || 'User'}
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
