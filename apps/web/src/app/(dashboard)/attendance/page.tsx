'use client';
import toast from '@/lib/toast';

import { useState, useEffect, useCallback } from 'react';
import styles from './attendance.module.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Office locations with geofence radius
const officeLocations = [
  { name: 'Brainvare HQ — Kochi', lat: 9.9312, lng: 76.2673, radius: 200 },
  { name: 'Brainvare — Bangalore', lat: 12.9716, lng: 77.5946, radius: 200 },
  { name: 'Remote / WFH', lat: 0, lng: 0, radius: 999999 },
];

interface GeoLocation {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
  officeName?: string;
  distance?: number;
  withinGeofence: boolean;
  timestamp: Date;
}

// Calculate distance between two GPS points (Haversine formula)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Mock attendance data for current month
const mockAttendance: Record<number, { status: string; clockIn?: string; clockOut?: string; hours?: string; location?: string; lat?: number; lng?: number }> = {
  1: { status: 'PRESENT', clockIn: '09:02', clockOut: '18:15', hours: '9h 13m', location: 'Brainvare HQ — Kochi', lat: 9.9312, lng: 76.2673 },
  2: { status: 'PRESENT', clockIn: '09:10', clockOut: '18:30', hours: '9h 20m', location: 'Brainvare HQ — Kochi', lat: 9.9315, lng: 76.2670 },
  3: { status: 'PRESENT', clockIn: '08:55', clockOut: '18:00', hours: '9h 05m', location: 'Remote / WFH', lat: 10.0159, lng: 76.3419 },
  4: { status: 'PRESENT', clockIn: '09:05', clockOut: '18:20', hours: '9h 15m', location: 'Brainvare HQ — Kochi', lat: 9.9310, lng: 76.2675 },
  7: { status: 'PRESENT', clockIn: '09:15', clockOut: '18:45', hours: '9h 30m', location: 'Brainvare HQ — Kochi', lat: 9.9313, lng: 76.2671 },
  8: { status: 'ON_LEAVE', clockIn: undefined, clockOut: undefined },
  9: { status: 'ON_LEAVE', clockIn: undefined, clockOut: undefined },
  10: { status: 'PRESENT', clockIn: '09:00', clockOut: '18:10', hours: '9h 10m', location: 'Brainvare — Bangalore', lat: 12.9716, lng: 77.5946 },
  11: { status: 'PRESENT', clockIn: '09:22', clockOut: '18:30', hours: '9h 08m', location: 'Brainvare HQ — Kochi', lat: 9.9311, lng: 76.2674 },
  14: { status: 'PRESENT', clockIn: '09:08', clockOut: '18:05', hours: '8h 57m', location: 'Brainvare HQ — Kochi', lat: 9.9312, lng: 76.2673 },
  15: { status: 'HALF_DAY', clockIn: '09:00', clockOut: '13:00', hours: '4h 00m', location: 'Remote / WFH', lat: 10.0159, lng: 76.3419 },
  16: { status: 'PRESENT', clockIn: '09:12', clockOut: '18:40', hours: '9h 28m', location: 'Brainvare HQ — Kochi', lat: 9.9314, lng: 76.2672 },
  17: { status: 'PRESENT', clockIn: '09:05', clockOut: '18:15', hours: '9h 10m', location: 'Brainvare HQ — Kochi', lat: 9.9312, lng: 76.2673 },
  18: { status: 'ABSENT' },
};

const mockTeamAttendance = [
  { name: 'Priya Patel', code: 'EMP-0004', status: 'PRESENT', clockIn: '09:02', location: 'Bangalore HQ' },
  { name: 'Amit Kumar', code: 'EMP-0005', status: 'PRESENT', clockIn: '09:15', location: 'Bangalore HQ' },
];

// Fetched from API
let _teamFetched = false;

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PRESENT: { label: 'Present', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  ABSENT: { label: 'Absent', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ON_LEAVE: { label: 'On Leave', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  HALF_DAY: { label: 'Half Day', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  HOLIDAY: { label: 'Holiday', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  LATE: { label: 'Late', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  WEEKEND: { label: 'Weekend', color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
};

export default function AttendancePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<'my' | 'team'>('my');
  const [teamAttendance, setTeamAttendance] = useState(mockTeamAttendance);
  const [showTeamDetail, setShowTeamDetail] = useState<any>(null);
  const [editingTeam, setEditingTeam] = useState(false);
  const [teamEditData, setTeamEditData] = useState<any>({});

  // Geo-location state
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'denied'>('idle');
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | null>(null);
  const [punchInLocation, setPunchInLocation] = useState<GeoLocation | null>(null);
  const [punchOutLocation, setPunchOutLocation] = useState<GeoLocation | null>(null);
  const [locationHistory, setLocationHistory] = useState<GeoLocation[]>([]);

  // Fetch team attendance from API
  useEffect(() => {
    if (_teamFetched) return;
    _teamFetched = true;
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/attendance?date=${today}`)
      .then(r => r.json())
      .then(data => {
        if (data.data?.length) {
          const mapped = data.data.map((r: any) => ({
            name: `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.trim(),
            code: r.employee?.employeeCode || '',
            status: r.status,
            clockIn: r.clockIn ? new Date(r.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : null,
            location: r.shift?.name || 'Office',
          }));
          setTeamAttendance(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get current GPS location
  const getLocation = useCallback((): Promise<GeoLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      setGeoStatus('loading');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng, accuracy } = position.coords;

          // Find nearest office
          let nearestOffice = officeLocations[officeLocations.length - 1]; // Default to Remote
          let minDistance = Infinity;

          for (const office of officeLocations) {
            if (office.lat === 0) continue; // Skip remote
            const dist = haversineDistance(lat, lng, office.lat, office.lng);
            if (dist < minDistance) {
              minDistance = dist;
              nearestOffice = office;
            }
          }

          const withinGeofence = minDistance <= nearestOffice.radius;
          const isRemote = minDistance > 500; // > 500m from any office => remote

          // Reverse geocode (simple, no external API)
          let address = `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
            if (resp.ok) {
              const data = await resp.json();
              address = data.display_name?.split(',').slice(0, 3).join(', ') || address;
            }
          } catch { /* Ignore geocode errors — use coordinates */ }

          const loc: GeoLocation = {
            lat, lng, accuracy,
            address,
            officeName: isRemote ? 'Remote / WFH' : nearestOffice.name,
            distance: isRemote ? undefined : Math.round(minDistance),
            withinGeofence: isRemote || withinGeofence,
            timestamp: new Date(),
          };

          setCurrentLocation(loc);
          setGeoStatus('success');
          resolve(loc);
        },
        (err) => {
          if (err.code === 1) setGeoStatus('denied');
          else setGeoStatus('error');
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // Auto-get location on mount
  useEffect(() => {
    getLocation().catch(() => {});
  }, [getLocation]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const today = new Date().getDate();
  const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();

  const handleClockIn = async () => {
    try {
      const loc = await getLocation();
      if (!loc.withinGeofence) {
        toast(`You are ${loc.distance}m away from ${loc.officeName}. Geofence radius is ${officeLocations.find(o => o.name === loc.officeName)?.radius || 200}m. Contact HR if you need assistance.`);
      }
      const now = new Date();
      setClockInTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setClockedIn(true);
      setPunchInLocation(loc);
      setLocationHistory(prev => [...prev, loc]);
      // POST to API
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await fetch('/api/attendance', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: user.employeeId || user.employee?.id, clockIn: new Date().toISOString(), latitude: loc.lat, longitude: loc.lng, status: 'PRESENT' }),
        });
      } catch {}
    } catch {
      // Location unavailable — allow clock-in but flag it
      const now = new Date();
      setClockInTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setClockedIn(true);
      setPunchInLocation(null);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        await fetch('/api/attendance', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employeeId: user.employeeId || user.employee?.id, clockIn: new Date().toISOString(), status: 'PRESENT' }),
        });
      } catch {}
    }
  };

  const handleClockOut = async () => {
    try {
      const loc = await getLocation();
      setPunchOutLocation(loc);
      setLocationHistory(prev => [...prev, loc]);
    } catch { /* Ignore */ }
    setClockedIn(false);
    setClockInTime(null);
  };

  const summary = Object.values(mockAttendance).reduce(
    (acc, r) => {
      if (r.status === 'PRESENT') acc.present++;
      else if (r.status === 'ABSENT') acc.absent++;
      else if (r.status === 'ON_LEAVE') acc.onLeave++;
      else if (r.status === 'HALF_DAY') acc.halfDay++;
      return acc;
    },
    { present: 0, absent: 0, onLeave: 0, halfDay: 0 },
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Attendance</h1>
          <p className={styles.pageSubtitle}>Track your time with location-based punch-in</p>
        </div>
        <div className={styles.viewToggle}>
          <button className={styles.viewBtn} data-active={activeView === 'my'} onClick={() => setActiveView('my')}>My Attendance</button>
          <button className={styles.viewBtn} data-active={activeView === 'team'} onClick={() => setActiveView('team')}>Team View</button>
        </div>
      </div>

      {activeView === 'my' ? (
        <>
          {/* Clock In/Out Card */}
          <div className={styles.clockCard}>
            <div className={styles.clockTime}>
              {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <p className={styles.clockDate}>
              {currentTime.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            {/* Location Badge */}
            <div className={styles.locationBadge}>
              {geoStatus === 'loading' && (
                <div className={styles.locating}>
                  <div className={styles.locatingSpinner} />
                  <span>Detecting location...</span>
                </div>
              )}
              {geoStatus === 'success' && currentLocation && (
                <div className={styles.locationInfo}>
                  <div className={styles.locationIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div className={styles.locationDetails}>
                    <span className={styles.locationName}>
                      {currentLocation.withinGeofence ? '✅' : '⚠️'} {currentLocation.officeName}
                    </span>
                    <span className={styles.locationAddress}>{currentLocation.address}</span>
                    {currentLocation.distance !== undefined && (
                      <span className={styles.locationDistance}>
                        📍 {currentLocation.distance < 1000
                          ? `${currentLocation.distance}m from office`
                          : `${(currentLocation.distance / 1000).toFixed(1)}km from office`
                        }
                        {' · '}Accuracy: ±{Math.round(currentLocation.accuracy)}m
                      </span>
                    )}
                  </div>
                  <button className={styles.refreshLocBtn} onClick={() => getLocation()} title="Refresh location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                  </button>
                </div>
              )}
              {geoStatus === 'denied' && (
                <div className={styles.locationDenied}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <span>Location access denied. Enable location to geo-tag your attendance.</span>
                  <button className={styles.retryBtn} onClick={() => getLocation()}>Retry</button>
                </div>
              )}
              {geoStatus === 'error' && (
                <div className={styles.locationDenied}>
                  <span>⚠️ Unable to get location.</span>
                  <button className={styles.retryBtn} onClick={() => getLocation()}>Retry</button>
                </div>
              )}
            </div>

            <div className={styles.clockActions}>
              {!clockedIn ? (
                <button className={styles.clockInBtn} onClick={handleClockIn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Clock In
                  {geoStatus === 'success' && currentLocation?.withinGeofence && <span className={styles.geoTag}>📍 Geo-tagged</span>}
                </button>
              ) : (
                <>
                  <div className={styles.clockedInStatus}>
                    <div className={styles.pulseDot} />
                    <span>Clocked in at {clockInTime}</span>
                    {punchInLocation && <span className={styles.locationChip}>📍 {punchInLocation.officeName}</span>}
                  </div>
                  <button className={styles.clockOutBtn} onClick={handleClockOut}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Clock Out
                  </button>
                </>
              )}
            </div>

            {/* Punch Location Summary */}
            {(punchInLocation || punchOutLocation) && (
              <div className={styles.punchSummary}>
                {punchInLocation && (
                  <div className={styles.punchEntry}>
                    <span className={styles.punchLabel}>🟢 Punch In</span>
                    <span className={styles.punchLoc}>{punchInLocation.officeName}</span>
                    <span className={styles.punchCoords}>{punchInLocation.lat.toFixed(4)}°N, {punchInLocation.lng.toFixed(4)}°E</span>
                    <span className={styles.punchTime}>{punchInLocation.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
                {punchOutLocation && (
                  <div className={styles.punchEntry}>
                    <span className={styles.punchLabel}>🔴 Punch Out</span>
                    <span className={styles.punchLoc}>{punchOutLocation.officeName}</span>
                    <span className={styles.punchCoords}>{punchOutLocation.lat.toFixed(4)}°N, {punchOutLocation.lng.toFixed(4)}°E</span>
                    <span className={styles.punchTime}>{punchOutLocation.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Geofence Config */}
          <div className={styles.geofenceCard}>
            <h3 className={styles.geofenceTitle}>📍 Office Locations & Geofences</h3>
            <div className={styles.geofenceList}>
              {officeLocations.filter(o => o.lat !== 0).map(office => {
                const dist = currentLocation ? Math.round(haversineDistance(currentLocation.lat, currentLocation.lng, office.lat, office.lng)) : null;
                const isNearby = dist !== null && dist <= office.radius;
                return (
                  <div key={office.name} className={styles.geofenceItem}>
                    <div className={styles.geofenceDot} data-active={isNearby} />
                    <div className={styles.geofenceInfo}>
                      <span className={styles.geofenceName}>{office.name}</span>
                      <span className={styles.geofenceCoords}>
                        {office.lat.toFixed(4)}°N, {office.lng.toFixed(4)}°E · Radius: {office.radius}m
                      </span>
                    </div>
                    {dist !== null && (
                      <span className={styles.geofenceDistance} data-nearby={isNearby}>
                        {dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stats */}
          <div className={styles.statsRow}>
            {Object.entries(summary).map(([key, val]) => (
              <div key={key} className={styles.statChip} data-type={key}>
                <span className={styles.statNum}>{val}</span>
                <span className={styles.statLabel}>{key === 'onLeave' ? 'On Leave' : key === 'halfDay' ? 'Half Day' : key.charAt(0).toUpperCase() + key.slice(1)}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <button className={styles.calNavBtn} onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                else setCurrentMonth(m => m - 1);
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <h2 className={styles.calMonthYear}>{MONTHS[currentMonth]} {currentYear}</h2>
              <button className={styles.calNavBtn} onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                else setCurrentMonth(m => m + 1);
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div className={styles.calendarGrid}>
              {DAYS.map(d => <div key={d} className={styles.calDayHeader}>{d}</div>)}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} className={styles.calEmpty} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const date = new Date(currentYear, currentMonth, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const record = mockAttendance[day];
                const isFuture = isCurrentMonth && day > today;
                const isToday = isCurrentMonth && day === today;
                const status = record?.status || (isWeekend ? 'WEEKEND' : isFuture ? '' : '');
                const cfg = status ? statusConfig[status] : null;

                return (
                  <button
                    key={day}
                    className={styles.calDay}
                    data-today={isToday}
                    data-weekend={isWeekend}
                    data-future={isFuture}
                    data-selected={selectedDay === day}
                    data-has-location={!!record?.location}
                    onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                    style={cfg ? { backgroundColor: cfg.bg } : undefined}
                  >
                    <span className={styles.calDayNum}>{day}</span>
                    {cfg && <span className={styles.calDot} style={{ background: cfg.color }} />}
                    {record?.location && <span className={styles.calGeoIcon}>📍</span>}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className={styles.calendarLegend}>
              {Object.entries(statusConfig).filter(([k]) => k !== 'LATE').map(([key, cfg]) => (
                <div key={key} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: cfg.color }} />
                  <span>{cfg.label}</span>
                </div>
              ))}
              <div className={styles.legendItem}>
                <span>📍</span>
                <span>Geo-tagged</span>
              </div>
            </div>
          </div>

          {/* Selected Day Detail with Location */}
          {selectedDay && mockAttendance[selectedDay] && (
            <div className={styles.dayDetail}>
              <h3>{selectedDay} {MONTHS[currentMonth]} {currentYear}</h3>
              <div className={styles.dayDetailGrid}>
                <div><label>Status</label><span style={{ color: statusConfig[mockAttendance[selectedDay].status]?.color }}>{statusConfig[mockAttendance[selectedDay].status]?.label}</span></div>
                {mockAttendance[selectedDay].clockIn && <div><label>Clock In</label><span>{mockAttendance[selectedDay].clockIn}</span></div>}
                {mockAttendance[selectedDay].clockOut && <div><label>Clock Out</label><span>{mockAttendance[selectedDay].clockOut}</span></div>}
                {mockAttendance[selectedDay].hours && <div><label>Hours Worked</label><span>{mockAttendance[selectedDay].hours}</span></div>}
              </div>
              {mockAttendance[selectedDay].location && (
                <div className={styles.dayLocationInfo}>
                  <div className={styles.dayLocationIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <span className={styles.dayLocName}>{mockAttendance[selectedDay].location}</span>
                    {mockAttendance[selectedDay].lat && (
                      <span className={styles.dayLocCoords}>
                        {mockAttendance[selectedDay].lat?.toFixed(4)}°N, {mockAttendance[selectedDay].lng?.toFixed(4)}°E
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Team View */
        <div className={styles.teamCard}>
          <h2 className={styles.teamTitle}>Team Attendance — Today</h2>
          <div className={styles.teamGrid}>
            {teamAttendance.map((member) => {
              const cfg = statusConfig[member.status] || statusConfig.PRESENT;
              return (
                <div key={member.code} className={styles.teamMember} style={{ cursor: 'pointer' }} onClick={() => { setShowTeamDetail(member); setTeamEditData(member); setEditingTeam(false); }}>
                  <div className={styles.teamAvatar}>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className={styles.teamInfo}>
                    <span className={styles.teamName}>{member.name}</span>
                    <span className={styles.teamCode}>{member.code}</span>
                  </div>
                  <div className={styles.teamStatus}>
                    <span className={styles.statusPill} style={{ background: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {member.clockIn && <span className={styles.teamClockIn}>{member.clockIn}</span>}
                      {member.location && <span className={styles.teamLocation}>📍 {member.location}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Detail Modal */}
      {showTeamDetail && (
        <div className="modal-overlay" onClick={() => setShowTeamDetail(null)}><div className="modal-content" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div className="avatar avatar-sm">{showTeamDetail.name.split(' ').map((n: string) => n[0]).join('')}</div>
              <div><h2 style={{ margin: 0 }}>{showTeamDetail.name}</h2><p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{showTeamDetail.code}</p></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editingTeam ? <><button className="btn btn-ghost btn-sm" onClick={() => { setEditingTeam(false); setTeamEditData(showTeamDetail); }}>Cancel</button><button className="btn btn-primary btn-sm" onClick={() => { setTeamAttendance(teamAttendance.map(t => t.code === showTeamDetail.code ? { ...t, ...teamEditData } : t)); setShowTeamDetail({ ...showTeamDetail, ...teamEditData }); setEditingTeam(false); toast('Attendance updated!', 'success'); }}>Save</button></> : <button className="btn btn-ghost btn-sm" onClick={() => setEditingTeam(true)}>✏️ Edit</button>}
              <button onClick={() => setShowTeamDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
          </div>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Status selector */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['PRESENT', 'ABSENT', 'ON_LEAVE', 'HALF_DAY', 'LATE'].map(s => {
                const cfg = statusConfig[s];
                return <button key={s} onClick={() => { const d = { status: s }; setTeamAttendance(teamAttendance.map(t => t.code === showTeamDetail.code ? { ...t, ...d } : t)); setShowTeamDetail({ ...showTeamDetail, ...d }); toast(`Status → ${cfg.label}`, 'success'); }} style={{ flex: 1, padding: '6px', textAlign: 'center', borderRadius: 'var(--radius-md)', fontSize: 9, fontWeight: 600, background: showTeamDetail.status === s ? cfg.bg : 'var(--bg-tertiary)', color: showTeamDetail.status === s ? cfg.color : 'var(--text-muted)', cursor: 'pointer', border: 'none' }}>{cfg.label}</button>;
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
              <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Clock In</div>{editingTeam ? <input className="input-field" type="time" style={{ height: 30, marginTop: 2 }} value={teamEditData.clockIn || ''} onChange={e => setTeamEditData({ ...teamEditData, clockIn: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginTop: 2, color: 'var(--color-accent-400)' }}>{showTeamDetail.clockIn || '—'}</div>}</div>
              <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 500 }}>Location</div>{editingTeam ? <input className="input-field" style={{ height: 30, marginTop: 2 }} value={teamEditData.location || ''} onChange={e => setTeamEditData({ ...teamEditData, location: e.target.value })} /> : <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginTop: 2 }}>📍 {showTeamDetail.location || '—'}</div>}</div>
            </div>
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Today's Status</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: (statusConfig[showTeamDetail.status] || statusConfig.PRESENT).color }}>{(statusConfig[showTeamDetail.status] || statusConfig.PRESENT).label}</div>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', padding: 'var(--space-3)', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-md)' }}>💡 Use the status buttons above to change this employee's attendance for today. Click Edit to modify clock-in time or location.</div>
          </div>
        </div></div>
      )}
    </div>
  );
}
