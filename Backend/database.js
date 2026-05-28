/* ==========================================
   USER DATABASE SYSTEM - LocalStorage Based
   ========================================== */

class UserDatabase {
  constructor() {
    this.USERS_KEY = 'serviceHub_users';
    this.SESSION_KEY = 'serviceHub_session';
    this.initDatabase();
  }

  // Initialize database with sample users if empty
  initDatabase() {
    if (!localStorage.getItem(this.USERS_KEY)) {
      const sampleUsers = [
        {
          id: 1,
          email: 'user@example.com',
          password: this.hashPassword('password123'),
          name: 'Demo User',
          role: 'user',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          email: 'provider@example.com',
          password: this.hashPassword('provider123'),
          name: 'Demo Provider',
          role: 'provider',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(this.USERS_KEY, JSON.stringify(sampleUsers));
    }
  }

  // Simple hash function (in production, use proper backend hashing)
  hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  // Get all users
  getAllUsers() {
    const users = localStorage.getItem(this.USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  // Save users to database
  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  // Find user by email
  findUserByEmail(email) {
    const users = this.getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  // Register new user
  register(email, password, name, role = 'user') {
    // Validation
    if (!email || !password || !name) {
      return { success: false, message: 'All fields are required' };
    }

    if (!this.isValidEmail(email)) {
      return { success: false, message: 'Invalid email format' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Check if user already exists
    if (this.findUserByEmail(email)) {
      return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const users = this.getAllUsers();
    const newUser = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
      email: email.toLowerCase(),
      password: this.hashPassword(password),
      name: name,
      role: role,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    return { success: true, message: 'Registration successful', user: this.sanitizeUser(newUser) };
  }

  // Login user
  login(email, password) {
    if (!email || !password) {
      return { success: false, message: 'Email and password are required' };
    }

    const user = this.findUserByEmail(email);
    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    const hashedPassword = this.hashPassword(password);
    if (user.password !== hashedPassword) {
      return { success: false, message: 'Invalid email or password' };
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Login successful', user: this.sanitizeUser(user) };
  }

  // Logout user
  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    return { success: true, message: 'Logged out successfully' };
  }

  // Get current session
  getCurrentSession() {
    const session = localStorage.getItem(this.SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return this.getCurrentSession() !== null;
  }

  // Remove sensitive data from user object
  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }

  // Email validation
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Get user statistics
  getStats() {
    const users = this.getAllUsers();
    return {
      totalUsers: users.length,
      totalProviders: users.filter(u => u.role === 'provider').length,
      totalClients: users.filter(u => u.role === 'user').length
    };
  }

  // Update user profile
  updateProfile(userId, updates) {
    const users = this.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return { success: false, message: 'User not found' };
    }

    // Update allowed fields only
    if (updates.name) users[userIndex].name = updates.name;
    if (updates.email && this.isValidEmail(updates.email)) {
      users[userIndex].email = updates.email.toLowerCase();
    }

    this.saveUsers(users);

    // Update session if exists
    const session = this.getCurrentSession();
    if (session && session.userId === userId) {
      session.name = users[userIndex].name;
      session.email = users[userIndex].email;
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, message: 'Profile updated', user: this.sanitizeUser(users[userIndex]) };
  }

  // Change password
  changePassword(userId, oldPassword, newPassword) {
    const users = this.getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.password !== this.hashPassword(oldPassword)) {
      return { success: false, message: 'Current password is incorrect' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters' };
    }

    user.password = this.hashPassword(newPassword);
    this.saveUsers(users);

    return { success: true, message: 'Password changed successfully' };
  }

  // Clear all data (for testing/reset)
  clearDatabase() {
    localStorage.removeItem(this.USERS_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    this.initDatabase();
  }
}

// Export for use in other scripts
window.UserDatabase = UserDatabase;
