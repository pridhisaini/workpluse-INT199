// ─── User & Auth ────────────────────────────────────────
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    role: UserRole;
    department?: string;
    designation?: string;
    phone?: string;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
}

export type UserRole = 'admin' | 'manager' | 'employee';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    tokens: AuthTokens;
}

// ─── Employee ───────────────────────────────────────────
export interface Employee extends User {
    employeeId: string;
    joiningDate: string;
    manager?: string;
    team?: string;
    shift?: Shift;
}

export interface Shift {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
}

// ─── Projects ───────────────────────────────────────────
export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate: string;
    endDate?: string;
    members: string[];
    budget?: number;
    progress: number;
    createdAt: string;
    updatedAt: string;
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';

// ─── Time Tracking ──────────────────────────────────────
export interface TimeEntry {
    id: string;
    userId: string;
    projectId?: string;
    task?: string;
    description?: string;
    startTime: string;
    endTime?: string;
    duration: number; // in seconds
    status: TimeEntryStatus;
    date: string;
}

export type TimeEntryStatus = 'running' | 'paused' | 'completed';

export interface TimesheetSummary {
    date: string;
    totalHours: number;
    productiveHours: number;
    entries: TimeEntry[];
}

// ─── Attendance ─────────────────────────────────────────
export interface Attendance {
    id: string;
    userId: string;
    date: string;
    checkIn?: string;
    checkOut?: string;
    status: AttendanceStatus;
    workHours?: number;
    overtime?: number;
    notes?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'leave' | 'holiday';

// ─── Dashboard Stats ────────────────────────────────────
export interface AdminDashboardStats {
    totalEmployees: number;
    activeEmployees: number;
    presentToday: number;
    absentToday: number;
    activeProjects: number;
    totalHoursToday: number;
    avgProductivity: number;
    pendingLeaves: number;
}

export interface EmployeeDashboardStats {
    todayHours: number;
    weekHours: number;
    monthHours: number;
    attendanceRate: number;
    activeProjects: number;
    pendingTasks: number;
    currentStreak: number;
    productivity: number;
}

// ─── Reports ────────────────────────────────────────────
export type Trend = 'up' | 'down' | 'stable';

export interface ProductivityReport {
    score: number;
    change: string;
    trend: Trend;
    history: number[];
    topPerformers: Array<{
        id: string;
        name: string;
        avatar?: string;
        productivity: number;
        hours: number;
        trend: Trend;
    }>;
}

export interface ProjectReport {
    efficiency: number;
    utilization: number;
    completion: number;
    projects: Array<{
        id: string;
        name: string;
        efficiency: number;
        teamSize: number;
        status: ProjectStatus;
        deadline: string;
    }>;
}

// ─── API Response ───────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// ─── Socket Events ──────────────────────────────────────
export interface ServerToClientEvents {
    'user:status-change': (data: { userId: string; status: UserStatus }) => void;
    'attendance:update': (data: Attendance) => void;
    'time:tick': (data: { userId: string; duration: number }) => void;
    'notification': (data: AppNotification) => void;
    'dashboard:stats-update': (data: Partial<AdminDashboardStats> & { userId?: string; productivity?: number }) => void;
    'session:sync': (data: { type: 'start' | 'stop' | 'sync'; projectId?: string; task?: string; seconds?: number }) => void;
}

export interface ClientToServerEvents {
    'time:start': (data: { projectId?: string; task?: string }) => void;
    'time:stop': (data: { entryId?: string; seconds?: number }) => void;
    'time:pause': (data: { entryId: string }) => void;
    'attendance:check-in': () => void;
    'attendance:check-out': () => void;
    'productivity:update': (data: { value: number }) => void;
}

// ─── Notifications ──────────────────────────────────────
export interface AppNotification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

// ─── Activity ───────────────────────────────────────────
export interface ActivityLog {
    id: string;
    userId: string;
    userName: string;
    action: string;
    details?: string;
    timestamp: string;
    type: 'login' | 'logout' | 'time' | 'project' | 'attendance' | 'system';
}
