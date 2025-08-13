// =====================================================
// SUPABASE CONFIGURATION
// =====================================================

// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://uojhzjbsfwsgxbnxusar.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvamh6amJzZndzZ3hibnh1c2FyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzM3OTMsImV4cCI6MjA3MDY0OTc5M30.Zq0_EnshfRWqO430e7gKAuvh8MzBm8JFeqSpjy0BNiQ';

// Initialize Supabase Client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    },
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    },
    global: {
        headers: {
            'x-application-name': 'CRM-PM-System'
        }
    }
});

// =====================================================
// APPLICATION CONSTANTS
// =====================================================

const CONFIG = {
    // Application Info
    APP: {
        NAME: 'CRM/PM System',
        VERSION: '1.0.0',
        COMPANY: 'Your Company Name'
    },
    
    // User Roles
    ROLES: {
        ADMIN: 'admin',
        PM: 'pm', 
        ACC: 'acc',
        USER: 'user'
    },
    
    // Role Display Names (Vietnamese)
    ROLE_NAMES: {
        admin: 'Quản trị viên',
        pm: 'Quản lý dự án',
        acc: 'Kế toán',
        user: 'Nhân viên'
    },
    
    // Task Status
    TASK_STATUS: {
        PENDING: 'pending',
        IN_PROGRESS: 'in_progress',
        PENDING_APPROVAL: 'pending_approval',
        COMPLETED: 'completed',
        REJECTED: 'rejected'
    },
    
    // Task Status Display (Vietnamese)
    TASK_STATUS_NAMES: {
        pending: 'Chờ xử lý',
        in_progress: 'Đang thực hiện',
        pending_approval: 'Chờ duyệt',
        completed: 'Hoàn thành',
        rejected: 'Từ chối'
    },
    
    // Task Priority
    TASK_PRIORITY: {
        LOW: 'low',
        MEDIUM: 'medium',
        HIGH: 'high'
    },
    
    // Task Priority Display (Vietnamese)
    TASK_PRIORITY_NAMES: {
        low: 'Thấp',
        medium: 'Trung bình',
        high: 'Cao'
    },
    
    // Project Status
    PROJECT_STATUS: {
        DRAFT: 'draft',
        ACTIVE: 'active',
        ON_HOLD: 'on_hold',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    // Project Status Display (Vietnamese)
    PROJECT_STATUS_NAMES: {
        draft: 'Nháp',
        active: 'Đang thực hiện',
        on_hold: 'Tạm dừng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    },
    
    // Weekly Report Status
    WR_STATUS: {
        DRAFT: 'draft',
        SUBMITTED: 'submitted',
        PM_REVIEWED: 'pm_reviewed',
        APPROVED: 'approved',
        REJECTED: 'rejected'
    },
    
    // WR Status Display (Vietnamese)
    WR_STATUS_NAMES: {
        draft: 'Nháp',
        submitted: 'Đã nộp',
        pm_reviewed: 'PM đã xem',
        approved: 'Đã duyệt',
        rejected: 'Từ chối'
    },
    
    // Weekly Plan Status
    PLAN_STATUS: {
        DRAFT: 'draft',
        SUBMITTED: 'submitted',
        PM_SEEN: 'pm_seen'
    },
    
    // Plan Status Display (Vietnamese)
    PLAN_STATUS_NAMES: {
        draft: 'Nháp',
        submitted: 'Đã nộp',
        pm_seen: 'PM đã xem'
    },
    
    // Payment Status
    PAYMENT_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },
    
    // Payment Status Display (Vietnamese)
    PAYMENT_STATUS_NAMES: {
        pending: 'Chờ thanh toán',
        completed: 'Đã thanh toán',
        cancelled: 'Đã hủy'
    },
    
    // UI Settings
    UI: {
        ITEMS_PER_PAGE: 20,
        MAX_ITEMS_PER_PAGE: 100,
        DEBOUNCE_DELAY: 500,
        SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes in milliseconds
        IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
        NOTIFICATION_DURATION: 5000, // 5 seconds
        DATE_FORMAT: 'DD/MM/YYYY',
        DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
        TIME_FORMAT: 'HH:mm',
        CURRENCY_FORMAT: 'vi-VN',
        CURRENCY: 'VND',
        LOCALE: 'vi-VN',
        TIMEZONE: 'Asia/Ho_Chi_Minh',
        WEEK_START: 1, // Monday
        WORKING_HOURS: {
            START: '08:00',
            END: '17:00'
        },
        WR_DEADLINE: {
            DAY: 5, // Friday
            HOUR: 17, // 5 PM
            MINUTE: 0
        }
    },
    
    // Validation Rules
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^(0|\+84)[0-9]{9,10}$/,
        TAX_CODE_REGEX: /^[0-9]{10,13}$/,
        USERNAME_REGEX: /^[a-zA-Z0-9_]{3,50}$/,
        EMPLOYEE_CODE_REGEX: /^V[0-9]{3}$/,
        PROJECT_CODE_REGEX: /^P[0-9]{2}[0-9]{3}$/,
        WR_CODE_REGEX: /^W_[0-9]{2}[0-9]{2}_V[0-9]{3}$/,
        MIN_PASSWORD: 8,
        MAX_PASSWORD: 100,
        MIN_TITLE: 3,
        MAX_TITLE: 500,
        MIN_DESCRIPTION: 0,
        MAX_DESCRIPTION: 5000,
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_FILE_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
    },
    
    // Features Flags
    FEATURES: {
        ENABLE_PWA: false, // Phase 3
        ENABLE_NOTIFICATIONS: true,
        ENABLE_REALTIME: true,
        ENABLE_EXPORT: true,
        ENABLE_IMPORT: true,
        ENABLE_AUDIT_LOG: true,
        ENABLE_COMMENTS: true,
        ENABLE_MENTIONS: true,
        ENABLE_ATTACHMENTS: false, // Not in Phase 1
        ENABLE_DARK_MODE: false,
        ENABLE_MULTI_LANGUAGE: false,
        ENABLE_2FA: false,
        ENABLE_API: false,
        ENABLE_WEBHOOKS: false
    },
    
    // API Endpoints (if any external APIs needed)
    API: {
        EXPORT_URL: '/api/export',
        UPLOAD_URL: '/api/upload',
        WEBHOOK_URL: '/api/webhook'
    },
    
    // Storage Keys
    STORAGE: {
        AUTH_TOKEN: 'crm_pm_auth_token',
        USER_PROFILE: 'crm_pm_user_profile',
        PREFERENCES: 'crm_pm_preferences',
        THEME: 'crm_pm_theme',
        LANGUAGE: 'crm_pm_language',
        LAST_ROUTE: 'crm_pm_last_route',
        FILTERS: 'crm_pm_filters'
    },
    
    // Notification Types
    NOTIFICATIONS: {
        TASK_ASSIGNED: 'task_assigned',
        TASK_UPDATED: 'task_updated',
        TASK_COMPLETED: 'task_completed',
        COMMENT_ADDED: 'comment_added',
        MENTION: 'mention',
        WR_SUBMITTED: 'wr_submitted',
        WR_REVIEWED: 'wr_reviewed',
        WR_APPROVED: 'wr_approved',
        WR_REJECTED: 'wr_rejected',
        PAYMENT_ADDED: 'payment_added',
        PROJECT_UPDATED: 'project_updated'
    },
    
    // Colors for UI elements
    COLORS: {
        PRIMARY: '#3B82F6', // Blue
        SUCCESS: '#10B981', // Green
        WARNING: '#F59E0B', // Yellow
        DANGER: '#EF4444', // Red
        INFO: '#6366F1', // Indigo
        SECONDARY: '#6B7280', // Gray
        DARK: '#1F2937',
        LIGHT: '#F9FAFB'
    },
    
    // Default values
    DEFAULTS: {
        AVATAR: '/assets/images/default-avatar.png',
        CURRENCY_SYMBOL: '₫',
        HOURS_PER_DAY: 8,
        DAYS_PER_WEEK: 5,
        WEEKS_PER_MONTH: 4,
        MONTHS_PER_YEAR: 12
    },
    
    // Messages (Vietnamese)
    MESSAGES: {
        LOADING: 'Đang tải...',
        SAVING: 'Đang lưu...',
        SUCCESS: 'Thành công!',
        ERROR: 'Có lỗi xảy ra!',
        CONFIRM_DELETE: 'Bạn có chắc chắn muốn xóa?',
        CONFIRM_LOGOUT: 'Bạn có chắc chắn muốn đăng xuất?',
        SESSION_EXPIRED: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
        NO_DATA: 'Không có dữ liệu',
        NO_PERMISSION: 'Bạn không có quyền thực hiện thao tác này',
        REQUIRED_FIELD: 'Trường này là bắt buộc',
        INVALID_EMAIL: 'Email không hợp lệ',
        INVALID_PHONE: 'Số điện thoại không hợp lệ',
        PASSWORD_TOO_SHORT: `Mật khẩu phải có ít nhất ${8} ký tự`,
        PASSWORDS_NOT_MATCH: 'Mật khẩu không khớp',
        DEADLINE_PASSED: 'Đã quá hạn nộp báo cáo'
    }
};

// =====================================================
// STATUS & PRIORITY COLORS
// =====================================================

const STATUS_COLORS = {
    // Task status colors
    pending: 'bg-gray-100 text-gray-800 border-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    pending_approval: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    completed: 'bg-green-100 text-green-800 border-green-300',
    rejected: 'bg-red-100 text-red-800 border-red-300',
    
    // Project status colors
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    active: 'bg-blue-100 text-blue-800 border-blue-300',
    on_hold: 'bg-orange-100 text-orange-800 border-orange-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    
    // WR status colors
    submitted: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    pm_reviewed: 'bg-purple-100 text-purple-800 border-purple-300',
    approved: 'bg-green-100 text-green-800 border-green-300'
};

const PRIORITY_COLORS = {
    low: 'bg-gray-100 text-gray-600 border-gray-300',
    medium: 'bg-yellow-100 text-yellow-600 border-yellow-300',
    high: 'bg-red-100 text-red-600 border-red-300'
};

const ROLE_COLORS = {
    admin: 'bg-purple-100 text-purple-800 border-purple-300',
    pm: 'bg-blue-100 text-blue-800 border-blue-300',
    acc: 'bg-green-100 text-green-800 border-green-300',
    user: 'bg-gray-100 text-gray-800 border-gray-300'
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Format currency (VND)
function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '0';
    if (typeof amount === 'string' && amount === '***') return '***';
    
    return new Intl.NumberFormat(CONFIG.UI.CURRENCY_FORMAT, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount) + ' ₫';
}

// Format date
function formatDate(date, format = CONFIG.UI.DATE_FORMAT) {
    if (!date) return '';
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return format
        .replace('DD', day)
        .replace('MM', month)
        .replace('YYYY', year)
        .replace('HH', hours)
        .replace('mm', minutes);
}

// Format datetime
function formatDateTime(date) {
    return formatDate(date, CONFIG.UI.DATETIME_FORMAT);
}

// Get week number
function getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Get current week and year
function getCurrentWeekYear() {
    const now = new Date();
    return {
        week: getWeekNumber(now),
        year: now.getFullYear()
    };
}

// Check if deadline passed (for WR)
function isDeadlinePassed(week, year) {
    const now = new Date();
    const deadline = getWeekDeadline(week, year);
    return now > deadline;
}

// Get week deadline (Friday 17:00)
function getWeekDeadline(week, year) {
    const jan1 = new Date(year, 0, 1);
    const daysToAdd = (week - 1) * 7;
    const weekStart = new Date(jan1.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
    
    // Find Friday of that week
    const friday = new Date(weekStart);
    const dayOfWeek = friday.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    friday.setDate(friday.getDate() + daysUntilFriday);
    
    // Set time to 17:00
    friday.setHours(17, 0, 0, 0);
    
    return friday;
}

// =====================================================
// EXPORT CONFIGURATION
// =====================================================

window.CONFIG = CONFIG;
window.supabase = supabase;
window.STATUS_COLORS = STATUS_COLORS;
window.PRIORITY_COLORS = PRIORITY_COLORS;
window.ROLE_COLORS = ROLE_COLORS;

// Export helper functions
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getWeekNumber = getWeekNumber;
window.getCurrentWeekYear = getCurrentWeekYear;
window.isDeadlinePassed = isDeadlinePassed;
window.getWeekDeadline = getWeekDeadline;

console.log('✅ Config loaded successfully');
