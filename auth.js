// =====================================================
// AUTHENTICATION MANAGER
// =====================================================

class AuthManager {
    constructor() {
        this.user = null;
        this.profile = null;
        this.session = null;
        this.sessionTimer = null;
        this.idleTimer = null;
        this.lastActivity = Date.now();
        this.listeners = [];
        this.initialized = false;
    }
    
    // Initialize authentication
    async init() {
        if (this.initialized) return this.session;
        
        try {
            // Get current session from Supabase
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session) {
                this.session = session;
                await this.loadUserProfile(session.user.id);
                this.startSessionManagement();
                this.setupActivityTracking();
            }
            
            // Listen for auth state changes
            supabase.auth.onAuthStateChange(async (event, session) => {
                console.log('Auth event:', event);
                
                switch (event) {
                    case 'SIGNED_IN':
                        this.session = session;
                        await this.loadUserProfile(session.user.id);
                        this.startSessionManagement();
                        this.notifyListeners('signin', this.user);
                        break;
                        
                    case 'SIGNED_OUT':
                        this.cleanup();
                        this.notifyListeners('signout', null);
                        window.location.href = 'login.html';
                        break;
                        
                    case 'TOKEN_REFRESHED':
                        this.session = session;
                        console.log('Token refreshed successfully');
                        break;
                        
                    case 'USER_UPDATED':
                        this.session = session;
                        await this.loadUserProfile(session.user.id);
                        this.notifyListeners('update', this.user);
                        break;
                }
            });
            
            this.initialized = true;
            return this.session;
            
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.cleanup();
            return null;
        }
    }
    
    // Login with email and password
    async login(email, password, rememberMe = false) {
        try {
            // Validate inputs
            if (!email || !password) {
                throw new Error('Email và mật khẩu là bắt buộc');
            }
            
            if (!CONFIG.VALIDATION.EMAIL_REGEX.test(email)) {
                throw new Error('Email không hợp lệ');
            }
            
            // Show loading
            this.notifyListeners('loading', { message: 'Đang đăng nhập...' });
            
            // Sign in with Supabase
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(),
                password: password
            });
            
            if (error) {
                if (error.message.includes('Invalid login credentials')) {
                    throw new Error('Email hoặc mật khẩu không chính xác');
                }
                throw error;
            }
            
            // Load user profile
            await this.loadUserProfile(data.user.id);
            
            // Check if user is active
            if (!this.profile.is_active) {
                await this.logout();
                throw new Error('Tài khoản của bạn đã bị vô hiệu hóa');
            }
            
            // Check force change password
            if (this.profile.force_change_password) {
                return { 
                    success: true,
                    requirePasswordChange: true,
                    user: this.profile 
                };
            }
            
            // Update last login
            await this.updateLastLogin();
            
            // Setup session management
            this.startSessionManagement();
            this.setupActivityTracking();
            
            // Store remember me preference
            if (rememberMe) {
                localStorage.setItem('remember_me', 'true');
            } else {
                sessionStorage.setItem('session_only', 'true');
            }
            
            return { 
                success: true,
                user: this.profile 
            };
            
        } catch (error) {
            console.error('Login error:', error);
            this.notifyListeners('error', { message: error.message });
            throw error;
        }
    }
    
    // Load user profile from database
    async loadUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
                    *,
                    manager:manager_id(full_name, employee_code)
                `)
                .eq('id', userId)
                .single();
            
            if (error) throw error;
            
            this.profile = data;
            this.user = {
                id: userId,
                email: this.session?.user?.email,
                ...data
            };
            
            // Store in localStorage for quick access
            localStorage.setItem(CONFIG.STORAGE.USER_PROFILE, JSON.stringify(this.user));
            
            return data;
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            throw new Error('Không thể tải thông tin người dùng');
        }
    }
    
    // Logout
    async logout() {
        try {
            // Clear all timers
            this.cleanup();
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            // Clear all local storage
            localStorage.removeItem(CONFIG.STORAGE.USER_PROFILE);
            localStorage.removeItem(CONFIG.STORAGE.AUTH_TOKEN);
            localStorage.removeItem(CONFIG.STORAGE.PREFERENCES);
            sessionStorage.clear();
            
            // Redirect to login
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force redirect even if error
            window.location.href = 'login.html';
        }
    }
    
    // Change password
    async changePassword(currentPassword, newPassword, confirmPassword) {
        try {
            // Validate new password
            if (!newPassword || newPassword.length < CONFIG.VALIDATION.MIN_PASSWORD) {
                throw new Error(`Mật khẩu mới phải có ít nhất ${CONFIG.VALIDATION.MIN_PASSWORD} ký tự`);
            }
            
            if (newPassword !== confirmPassword) {
                throw new Error('Mật khẩu xác nhận không khớp');
            }
            
            if (currentPassword === newPassword) {
                throw new Error('Mật khẩu mới phải khác mật khẩu hiện tại');
            }
            
            // Verify current password first
            const { error: verifyError } = await supabase.auth.signInWithPassword({
                email: this.user.email,
                password: currentPassword
            });
            
            if (verifyError) {
                throw new Error('Mật khẩu hiện tại không chính xác');
            }
            
            // Update password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            
            if (error) throw error;
            
            // Update force_change_password flag if needed
            if (this.profile.force_change_password) {
                const { error: updateError } = await supabase
                    .from('user_profiles')
                    .update({ 
                        force_change_password: false,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', this.user.id);
                
                if (updateError) throw updateError;
                
                this.profile.force_change_password = false;
            }
            
            return { success: true, message: 'Đổi mật khẩu thành công' };
            
        } catch (error) {
            console.error('Change password error:', error);
            throw error;
        }
    }
    
    // Reset password (send email)
    async resetPassword(email) {
        try {
            if (!email || !CONFIG.VALIDATION.EMAIL_REGEX.test(email)) {
                throw new Error('Email không hợp lệ');
            }
            
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password.html`
            });
            
            if (error) throw error;
            
            return { 
                success: true,
                message: 'Email khôi phục mật khẩu đã được gửi'
            };
            
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }
    
    // Update user profile
    async updateProfile(updates) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString()
                })
                .eq('id', this.user.id)
                .select()
                .single();
            
            if (error) throw error;
            
            // Update local profile
            this.profile = data;
            this.user = { ...this.user, ...data };
            
            // Update localStorage
            localStorage.setItem(CONFIG.STORAGE.USER_PROFILE, JSON.stringify(this.user));
            
            return { success: true, data };
            
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }
    
    // Session Management
    startSessionManagement() {
        // Clear existing timers
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
        }
        
        // Set session timeout warning (1 minute before timeout)
        const warningTime = CONFIG.UI.SESSION_TIMEOUT - 60000;
        
        this.sessionTimer = setTimeout(() => {
            this.showSessionWarning();
        }, warningTime);
    }
    
    // Show session timeout warning
    showSessionWarning() {
        const remaining = 60; // seconds
        
        const modal = confirm(
            `Phiên làm việc sẽ hết hạn sau ${remaining} giây.\n` +
            'Bạn có muốn tiếp tục làm việc?'
        );
        
        if (modal) {
            this.extendSession();
        } else {
            this.logout();
        }
    }
    
    // Extend session
    async extendSession() {
        try {
            // Refresh session token
            const { data, error } = await supabase.auth.refreshSession();
            
            if (error) throw error;
            
            this.session = data.session;
            this.lastActivity = Date.now();
            this.startSessionManagement();
            
            console.log('Session extended successfully');
            
        } catch (error) {
            console.error('Error extending session:', error);
            this.logout();
        }
    }
    
    // Activity tracking for idle detection
    setupActivityTracking() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        const updateActivity = () => {
            this.lastActivity = Date.now();
        };
        
        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, updateActivity, true);
        });
        
        // Check for idle every minute
        if (this.idleTimer) {
            clearInterval(this.idleTimer);
        }
        
        this.idleTimer = setInterval(() => {
            const idleTime = Date.now() - this.lastActivity;
            
            if (idleTime >= CONFIG.UI.IDLE_TIMEOUT) {
                console.log('User idle timeout');
                this.logout();
            }
        }, 60000); // Check every minute
    }
    
    // Update last login timestamp
    async updateLastLogin() {
        try {
            await supabase
                .from('user_profiles')
                .update({ 
                    last_login_at: new Date().toISOString()
                })
                .eq('id', this.user.id);
        } catch (error) {
            console.error('Error updating last login:', error);
        }
    }
    
    // Permission checks
    hasRole(role) {
        return this.profile?.role === role;
    }
    
    hasAnyRole(roles) {
        return roles.includes(this.profile?.role);
    }
    
    canAccess(feature) {
        const permissions = {
            // Feature: [allowed roles]
            projects: ['admin', 'pm', 'acc'],
            customers: ['admin', 'pm', 'acc'],
            audit: ['admin', 'pm', 'acc'],
            payments_write: ['admin', 'acc'],
            approve_wr: ['admin'],
            review_wr: ['admin', 'pm'],
            manage_users: ['admin'],
            export_data: ['admin', 'pm', 'acc']
        };
        
        return permissions[feature]?.includes(this.profile?.role) ?? false;
    }
    
    // Check if user can perform action on entity
    canPerformAction(action, entity, entityData = {}) {
        const role = this.profile?.role;
        
        // Admin can do everything
        if (role === 'admin') return true;
        
        // Specific permission logic
        switch (entity) {
            case 'project':
                if (action === 'create') return role === 'acc';
                if (action === 'update') return role === 'pm' && entityData.pm_id === this.user.id;
                if (action === 'delete') return false;
                break;
                
            case 'task':
                if (action === 'create') return role === 'pm';
                if (action === 'update_status') {
                    return (role === 'pm') || 
                           (role === 'user' && entityData.assignee_id === this.user.id);
                }
                if (action === 'complete') return role === 'pm';
                break;
                
            case 'weekly_report':
                if (action === 'submit') return entityData.user_id === this.user.id;
                if (action === 'review') return role === 'pm';
                if (action === 'approve') return role === 'admin';
                break;
                
            case 'payment':
                if (action === 'create' || action === 'update') {
                    return role === 'admin' || role === 'acc';
                }
                break;
        }
        
        return false;
    }
    
    // Getters
    isAuthenticated() {
        return !!this.session && !!this.profile;
    }
    
    getSession() {
        return this.session;
    }
    
    getCurrentUser() {
        return this.user;
    }
    
    getProfile() {
        return this.profile;
    }
    
    getRole() {
        return this.profile?.role;
    }
    
    getUserId() {
        return this.user?.id;
    }
    
    getToken() {
        return this.session?.access_token;
    }
    
    // Event listeners
    onAuthChange(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }
    
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }
    
    // Cleanup
    cleanup() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        if (this.idleTimer) {
            clearInterval(this.idleTimer);
            this.idleTimer = null;
        }
        
        this.user = null;
        this.profile = null;
        this.session = null;
        this.lastActivity = Date.now();
    }
}

// =====================================================
// CREATE SINGLETON INSTANCE
// =====================================================

const authManager = new AuthManager();

// Auto-initialize on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', async () => {
        await authManager.init();
    });
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.authManager = authManager;
}

console.log('✅ Auth module loaded successfully');
