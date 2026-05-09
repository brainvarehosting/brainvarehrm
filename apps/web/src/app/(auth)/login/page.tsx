'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Demo user data for offline fallback
  const demoUsers: Record<string, { password: string; user: any }> = {
    'admin@brainvare.com': {
      password: 'admin123',
      user: {
        id: '1', email: 'admin@brainvare.com', firstName: 'Arjun', lastName: 'Nair',
        employeeCode: 'EMP-0001', roles: ['SUPER_ADMIN'], role: 'SUPER_ADMIN',
        department: 'Engineering', designation: 'CEO',
      },
    },
    'priya@brainvare.com': {
      password: 'priya123',
      user: {
        id: '4', email: 'priya@brainvare.com', firstName: 'Priya', lastName: 'Patel',
        employeeCode: 'EMP-0004', roles: ['HR_ADMIN'], role: 'HR_ADMIN',
        department: 'Human Resources', designation: 'HR Manager',
      },
    },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Try real API first (Next.js API route → SQLite DB)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      // Fallback to demo mode if API is unreachable or returns error
      const demo = demoUsers[email];
      if (demo && demo.password === password) {
        localStorage.setItem('accessToken', 'demo-token-' + Date.now());
        localStorage.setItem('refreshToken', 'demo-refresh-' + Date.now());
        localStorage.setItem('user', JSON.stringify(demo.user));
        router.push('/dashboard');
        return;
      }
      if (err.name === 'AbortError' || err.message?.includes('fetch') || err.message?.includes('Failed') || err.message?.includes('NetworkError') || err.message?.includes('Invalid')) {
        setError('Invalid credentials. Use the demo buttons below.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated background */}
      <div className={styles.bgGradient}>
        <div className={styles.bgOrb1} />
        <div className={styles.bgOrb2} />
        <div className={styles.bgOrb3} />
        <div className={styles.bgGrid} />
      </div>

      <div className={styles.content}>
        {/* Left branding panel */}
        <div className={styles.branding}>
          <div className={styles.brandingInner}>
            <div className={styles.logoMark}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="url(#logo-grad)" />
                <path d="M14 16h6v16h-6V16zm14 0h6v16h-6V16zm-7 6h6v10h-6V22z" fill="white" fillOpacity="0.95"/>
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#3b82f6"/>
                    <stop offset="1" stopColor="#8b5cf6"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className={styles.brandTitle}>BrainvareHRM</h1>
            <p className={styles.brandSubtitle}>People Operations Platform</p>
            
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <div>
                  <h3>Complete Lifecycle</h3>
                  <p>Hire to retire — every stage managed</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div>
                  <h3>India Compliance</h3>
                  <p>PF, ESIC, PT, TDS built-in</p>
                </div>
              </div>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="3" y1="9" x2="21" y2="9"/>
                    <line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                <div>
                  <h3>Smart Payroll</h3>
                  <p>Automated salary processing & payslips</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right login form */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h2>Welcome back</h2>
              <p>Sign in to your HRM workspace</p>
            </div>

            {error && (
              <div className={styles.errorAlert}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldGroup}>
                <label htmlFor="email" className={styles.label}>Email address</label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <div className={styles.labelRow}>
                  <label htmlFor="password" className={styles.label}>Password</label>
                  <button type="button" className={styles.forgotLink}>
                    Forgot password?
                  </button>
                </div>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? (
                  <span className={styles.spinner} />
                ) : (
                  <>
                    Sign in
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                      <polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className={styles.demoCredentials}>
              <p>Demo Credentials</p>
              <div className={styles.demoButtons}>
                <button
                  type="button"
                  className={styles.demoBtn}
                  onClick={() => {
                    setEmail('admin@brainvare.com');
                    setPassword('admin123');
                  }}
                >
                  <span className={styles.demoBadge}>Super Admin</span>
                  admin@brainvare.com
                </button>
                <button
                  type="button"
                  className={styles.demoBtn}
                  onClick={() => {
                    setEmail('priya@brainvare.com');
                    setPassword('priya123');
                  }}
                >
                  <span className={styles.demoBadge} data-variant="accent">HR Admin</span>
                  priya@brainvare.com
                </button>
              </div>
            </div>

            <p className={styles.footer}>
              © 2026 Brainvare Infotech. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
