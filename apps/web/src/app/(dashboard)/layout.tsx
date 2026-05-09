'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import AIAssistant from '@/components/ai/AIAssistant';
import styles from './layout.module.css';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        router.push('/login');
      }
    }
  }, [router]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        user={user}
      />

      <div
        className={styles.main}
        data-sidebar-collapsed={sidebarCollapsed}
      >
        <Header
          user={user}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onLogout={handleLogout}
        />

        <main className={styles.content}>
          {children}
        </main>
      </div>

      {mobileSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <MobileNav />
      <AIAssistant />
    </div>
  );
}
