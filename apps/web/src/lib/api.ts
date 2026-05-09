const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { timeout = 10000, ...fetchOptions } = options;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.status === 401) {
        // Token expired — redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        throw new Error('Session expired');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      clearTimeout(timer);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  }

  // ── Auth ──
  async login(email: string, password: string) {
    return this.request<{
      accessToken: string;
      refreshToken: string;
      user: any;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // ── Organization ──
  async getDashboardStats() {
    return this.request<any>('/api/v1/organization/dashboard-stats');
  }

  async getDepartments() {
    return this.request<any[]>('/api/v1/organization/departments');
  }

  async getLocations() {
    return this.request<any[]>('/api/v1/organization/locations');
  }

  async getDesignations() {
    return this.request<any[]>('/api/v1/organization/designations');
  }

  async getGrades() {
    return this.request<any[]>('/api/v1/organization/grades');
  }

  async getShifts() {
    return this.request<any[]>('/api/v1/organization/shifts');
  }

  async getHolidays() {
    return this.request<any[]>('/api/v1/organization/holidays');
  }

  // ── Employees ──
  async getEmployees(params?: { search?: string; status?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status && params.status !== 'ALL') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return this.request<{ data: any[]; total: number }>(`/api/v1/employees?${query}`);
  }

  async getEmployee(id: string) {
    return this.request<any>(`/api/v1/employees/${id}`);
  }

  async getEmployeeProfile360(id: string) {
    return this.request<any>(`/api/v1/employees/${id}/profile-360`);
  }

  async createEmployee(data: any) {
    return this.request<any>('/api/v1/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id: string, data: any) {
    return this.request<any>(`/api/v1/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getHeadcount() {
    return this.request<any>('/api/v1/employees/reports/headcount');
  }

  // ── Attendance ──
  async clockIn(data?: { latitude?: number; longitude?: number }) {
    return this.request<any>('/api/v1/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify(data || {}),
    });
  }

  async clockOut() {
    return this.request<any>('/api/v1/attendance/clock-out', {
      method: 'POST',
    });
  }

  async getMyAttendance(month: number, year: number) {
    return this.request<any>(`/api/v1/attendance/my?month=${month}&year=${year}`);
  }

  async getTeamAttendance(date: string) {
    return this.request<any[]>(`/api/v1/attendance/team?date=${date}`);
  }

  async getAttendanceSummary(employeeId: string, month: number, year: number) {
    return this.request<any>(`/api/v1/attendance/summary/${employeeId}?month=${month}&year=${year}`);
  }

  // ── Leave ──
  async getLeaveTypes() {
    return this.request<any[]>('/api/v1/leave/types');
  }

  async getLeaveBalances(employeeId?: string) {
    const q = employeeId ? `?employeeId=${employeeId}` : '';
    return this.request<any[]>(`/api/v1/leave/balances${q}`);
  }

  async applyLeave(data: { leaveTypeId: string; startDate: string; endDate: string; reason: string; isHalfDay?: boolean }) {
    return this.request<any>('/api/v1/leave/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveLeave(id: string) {
    return this.request<any>(`/api/v1/leave/${id}/approve`, { method: 'PATCH' });
  }

  async rejectLeave(id: string, reason: string) {
    return this.request<any>(`/api/v1/leave/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ rejectionReason: reason }),
    });
  }

  async getTeamCalendar(month: number, year: number) {
    return this.request<any[]>(`/api/v1/leave/team-calendar?month=${month}&year=${year}`);
  }

  // ── Payroll ──
  async getSalaryStructure(employeeId: string) {
    return this.request<any>(`/api/v1/payroll/salary-structure/${employeeId}`);
  }

  async getPayrollRuns() {
    return this.request<any[]>('/api/v1/payroll/runs');
  }

  async processPayroll(data: { month: number; year: number }) {
    return this.request<any>('/api/v1/payroll/process', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPayslips(employeeId: string) {
    return this.request<any[]>(`/api/v1/payroll/payslips/${employeeId}`);
  }
}

export const api = new ApiService(API_BASE);
export default api;
