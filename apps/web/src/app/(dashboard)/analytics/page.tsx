'use client';
import toast from '@/lib/toast';

import { useState } from 'react';
import styles from './analytics.module.css';

const kpiData = [
  { label: 'Headcount', value: '10', change: '+2', trend: 'up', color: 'var(--color-primary-400)' },
  { label: 'Attrition Rate', value: '8.2%', change: '-1.3%', trend: 'down', color: 'var(--color-accent-400)' },
  { label: 'Avg Tenure', value: '2.8y', change: '+0.3y', trend: 'up', color: '#a78bfa' },
  { label: 'Cost Per Hire', value: '₹42K', change: '-₹5K', trend: 'down', color: '#06b6d4' },
  { label: 'Offer Accept Rate', value: '85%', change: '+5%', trend: 'up', color: '#f59e0b' },
  { label: 'Training Hours', value: '24h/emp', change: '+6h', trend: 'up', color: '#ec4899' },
];

const headcountByDept = [
  { dept: 'Engineering', count: 4, pct: 40 },
  { dept: 'Design', count: 1, pct: 10 },
  { dept: 'Marketing', count: 1, pct: 10 },
  { dept: 'HR', count: 2, pct: 20 },
  { dept: 'Operations', count: 1, pct: 10 },
  { dept: 'Finance', count: 1, pct: 10 },
];

const monthlyTrends = [
  { month: 'Nov', hires: 1, exits: 0, headcount: 8 },
  { month: 'Dec', hires: 0, exits: 1, headcount: 7 },
  { month: 'Jan', hires: 2, exits: 0, headcount: 9 },
  { month: 'Feb', hires: 0, exits: 0, headcount: 9 },
  { month: 'Mar', hires: 1, exits: 1, headcount: 9 },
  { month: 'Apr', hires: 2, exits: 1, headcount: 10 },
];

const aiInsights = [
  { type: 'WARNING', icon: '⚠️', title: 'Attrition Risk — Engineering', body: 'Engineering has 2 employees with tenure > 3 years who haven\'t received a promotion. Consider career development conversations.' },
  { type: 'POSITIVE', icon: '✅', title: 'Training ROI Strong', body: 'Employees who completed 20+ training hours show 30% higher performance ratings. Training investment is paying off.' },
  { type: 'INSIGHT', icon: '💡', title: 'Hiring Pipeline Slow', body: 'Average time-to-fill has increased to 35 days. Consider adding sourcing channels or revisiting JD requirements.' },
  { type: 'FORECAST', icon: '🔮', title: 'Headcount Forecast', body: 'Based on current trends, projected headcount by Dec 2026: 14 employees. Budget an additional ₹48L in annual payroll costs.' },
];

const payrollBreakdown = [
  { label: 'Basic Salary', amount: 450000, pct: 45 },
  { label: 'HRA', amount: 180000, pct: 18 },
  { label: 'Special Allowance', amount: 150000, pct: 15 },
  { label: 'PF (Employer)', amount: 54000, pct: 5.4 },
  { label: 'Bonus', amount: 80000, pct: 8 },
  { label: 'Other', amount: 86000, pct: 8.6 },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<'overview' | 'workforce' | 'payroll' | 'ai'>('overview');
  const maxBar = Math.max(...monthlyTrends.map(m => m.headcount));

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>📊 Advanced Analytics</h1>
          <p className={styles.pageSubtitle}>AI-powered workforce intelligence, forecasting, and BI dashboards</p>
        </div>
        <button className={styles.exportBtn} onClick={() => toast("Action completed", "success")}>📥 Export Report</button>
      </div>

      <div className={styles.tabs}>
        {[{ key: 'overview', label: '📈 Overview' }, { key: 'workforce', label: '👥 Workforce' }, { key: 'payroll', label: '💰 Payroll' }, { key: 'ai', label: '🤖 AI Insights' }].map(t => (
          <button key={t.key} className={styles.tab} data-active={tab === t.key} onClick={() => setTab(t.key as any)}>{t.label}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className={styles.kpiGrid}>
            {kpiData.map((kpi, i) => (
              <div key={i} className={styles.kpiCard} style={{ animationDelay: `${i * 50}ms` }}>
                <span className={styles.kpiLabel}>{kpi.label}</span>
                <span className={styles.kpiValue} style={{ color: kpi.color }}>{kpi.value}</span>
                <span className={styles.kpiChange} data-trend={kpi.trend}>{kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}</span>
              </div>
            ))}
          </div>

          <div className={styles.chartRow}>
            <div className={styles.chartCard}>
              <h3>📊 Headcount Trend</h3>
              <div className={styles.lineChart}>
                {monthlyTrends.map((m, i) => (
                  <div key={m.month} className={styles.chartCol} style={{ animationDelay: `${i * 60}ms` }}>
                    <div className={styles.chartBar} style={{ height: `${(m.headcount / maxBar) * 100}%` }}>
                      <span>{m.headcount}</span>
                    </div>
                    <span className={styles.chartLabel}>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.chartCard}>
              <h3>🔄 Hires vs Exits</h3>
              <div className={styles.hiresExits}>
                {monthlyTrends.map((m, i) => (
                  <div key={m.month} className={styles.heRow} style={{ animationDelay: `${i * 40}ms` }}>
                    <span className={styles.heMonth}>{m.month}</span>
                    <div className={styles.heBar}>
                      <div className={styles.hireBar} style={{ width: `${m.hires * 25}%` }}>{m.hires > 0 ? `+${m.hires}` : ''}</div>
                      <div className={styles.exitBar} style={{ width: `${m.exits * 25}%` }}>{m.exits > 0 ? `-${m.exits}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'workforce' && (
        <div className={styles.workforceGrid}>
          <div className={styles.chartCard}>
            <h3>🏢 Headcount by Department</h3>
            <div className={styles.deptList}>
              {headcountByDept.map((d, i) => (
                <div key={d.dept} className={styles.deptRow} style={{ animationDelay: `${i * 40}ms` }}>
                  <span className={styles.deptName}>{d.dept}</span>
                  <div className={styles.deptBar}><div className={styles.deptFill} style={{ width: `${d.pct}%` }} /></div>
                  <span className={styles.deptCount}>{d.count}</span>
                  <span className={styles.deptPct}>{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3>📊 Diversity Metrics</h3>
            <div className={styles.diversityGrid}>
              {[{ label: 'Gender Ratio', male: 60, female: 40 }, { label: 'Age Diversity', young: 40, mid: 45, senior: 15 }].map((d, i) => (
                <div key={i} className={styles.diversityItem}>
                  <h4>{d.label}</h4>
                  {'male' in d && (
                    <div className={styles.genderBar}>
                      <div className={styles.maleBar} style={{ width: `${d.male}%` }}>{d.male}% M</div>
                      <div className={styles.femaleBar} style={{ width: `${d.female}%` }}>{d.female}% F</div>
                    </div>
                  )}
                  {'young' in d && (
                    <div className={styles.ageBar}>
                      <div style={{ width: `${d.young}%`, background: '#3b82f6' }}>&lt;30</div>
                      <div style={{ width: `${d.mid}%`, background: '#8b5cf6' }}>30-45</div>
                      <div style={{ width: `${d.senior}%`, background: '#f59e0b' }}>45+</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className={styles.chartCard} data-full>
            <h3>⏰ Attendance Summary</h3>
            <div className={styles.attendGrid}>
              {[
                { label: 'Present Today', value: '8/10', color: 'var(--color-accent-400)' },
                { label: 'On Leave', value: '1', color: 'var(--color-warning-400)' },
                { label: 'WFH', value: '1', color: 'var(--color-primary-400)' },
                { label: 'Late Arrivals (MTD)', value: '3', color: 'var(--color-danger-400)' },
                { label: 'Avg Hours/Day', value: '8.2h', color: '#a78bfa' },
                { label: 'OT Hours (MTD)', value: '19.5h', color: '#06b6d4' },
              ].map((a, i) => (
                <div key={i} className={styles.attendItem}><span className={styles.attendVal} style={{ color: a.color }}>{a.value}</span><span>{a.label}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'payroll' && (
        <div className={styles.payrollGrid}>
          <div className={styles.chartCard}>
            <h3>💰 Monthly Payroll Breakdown</h3>
            <div className={styles.payrollList}>
              {payrollBreakdown.map((p, i) => (
                <div key={i} className={styles.payrollRow} style={{ animationDelay: `${i * 40}ms` }}>
                  <span>{p.label}</span>
                  <div className={styles.payrollBar}><div className={styles.payrollFill} style={{ width: `${p.pct * 2}%` }} /></div>
                  <span className={styles.payrollAmt}>₹{(p.amount / 1000).toFixed(0)}K</span>
                  <span className={styles.payrollPct}>{p.pct}%</span>
                </div>
              ))}
              <div className={styles.payrollTotal}>
                <span>Total CTC (All)</span>
                <span>₹{(payrollBreakdown.reduce((s, p) => s + p.amount, 0) / 100000).toFixed(1)}L/mo</span>
              </div>
            </div>
          </div>
          <div className={styles.chartCard}>
            <h3>📊 Statutory Compliance</h3>
            <div className={styles.complianceList}>
              {[
                { label: 'PF Deposited (Apr)', status: '✅', amount: '₹54,000' },
                { label: 'ESI Deposited (Apr)', status: '✅', amount: '₹18,000' },
                { label: 'PT Deducted (Apr)', status: '✅', amount: '₹2,500' },
                { label: 'TDS Filed (Q4)', status: '⏳', amount: '₹1,20,000' },
              ].map((c, i) => (
                <div key={i} className={styles.compRow}>
                  <span>{c.status}</span><span className={styles.compLabel}>{c.label}</span><span className={styles.compAmt}>{c.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div className={styles.aiSection}>
          <div className={styles.aiHeader}>
            <span className={styles.aiGlow}>🤖</span>
            <div>
              <h3>AI-Powered Insights</h3>
              <p>Generated by Gemini Flash based on your workforce data</p>
            </div>
          </div>
          <div className={styles.insightList}>
            {aiInsights.map((insight, i) => (
              <div key={i} className={styles.insightCard} data-type={insight.type.toLowerCase()} style={{ animationDelay: `${i * 80}ms` }}>
                <span className={styles.insightIcon}>{insight.icon}</span>
                <div>
                  <h4>{insight.title}</h4>
                  <p>{insight.body}</p>
                </div>
              </div>
            ))}
          </div>
          <button className={styles.refreshBtn} onClick={() => toast("Action completed", "success")}>🔄 Refresh Insights with AI</button>
        </div>
      )}
    </div>
  );
}
