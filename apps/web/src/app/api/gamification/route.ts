import { NextResponse } from 'next/server';
const gamification = {
  user: { level: 5, title: 'Rising Star', xp: 2450, xpToNext: 3000, streak: 7, totalBadges: 12, rank: 3, totalUsers: 10 },
  badges: [
    { id: '1', name: 'First Login', icon: '🔑', earned: true, earnedAt: '2026-01-15' },
    { id: '2', name: 'Profile Complete', icon: '✅', earned: true, earnedAt: '2026-01-16' },
    { id: '3', name: 'Early Bird', icon: '🌅', earned: true, earnedAt: '2026-02-01', description: 'Clocked in before 9 AM for 5 consecutive days' },
    { id: '4', name: 'Team Player', icon: '🤝', earned: true, earnedAt: '2026-02-15', description: 'Gave recognition to 5 colleagues' },
    { id: '5', name: 'Marathon Runner', icon: '🏃', earned: true, earnedAt: '2026-03-01', description: '30-day attendance streak' },
    { id: '6', name: 'Quick Learner', icon: '📚', earned: true, earnedAt: '2026-03-15', description: 'Completed 3 training courses' },
    { id: '7', name: 'Mentor', icon: '🎓', earned: false, description: 'Mentor a new joiner through onboarding' },
    { id: '8', name: 'Innovation Star', icon: '💡', earned: false, description: 'Submit 5 improvement suggestions' },
  ],
  leaderboard: [
    { rank: 1, name: 'Sneha Reddy', code: 'EMP-0002', xp: 3200, level: 6, streak: 12 },
    { rank: 2, name: 'Amit Kumar', code: 'EMP-0003', xp: 2800, level: 5, streak: 8 },
    { rank: 3, name: 'Arjun Nair', code: 'EMP-0001', xp: 2450, level: 5, streak: 7 },
    { rank: 4, name: 'Priya Patel', code: 'EMP-0004', xp: 2100, level: 4, streak: 5 },
    { rank: 5, name: 'Rohit Mehta', code: 'EMP-0007', xp: 1800, level: 4, streak: 3 },
  ],
  recentActivity: [
    { action: 'Earned badge: Quick Learner', xp: 100, date: '2026-03-15' },
    { action: 'Completed training course', xp: 50, date: '2026-03-14' },
    { action: 'Gave recognition to colleague', xp: 20, date: '2026-03-12' },
    { action: '7-day attendance streak!', xp: 70, date: '2026-03-10' },
  ],
};
export async function GET() { return NextResponse.json(gamification); }
export async function POST() { return NextResponse.json({ success: true }); }
