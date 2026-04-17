// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const showPasswordBtn = document.querySelector('.show-password-btn');
const tabButtons = document.querySelectorAll('.tab-btn');

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkAuthStatus();
});

// Setup Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    showPasswordBtn.addEventListener('click', togglePasswordVisibility);
    tabButtons.forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
}

// Toggle Password Visibility
function togglePasswordVisibility(e) {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    showPasswordBtn.textContent = isPassword ? '🙈' : '👁️';
}

// Handle Tab Switch (Phone/Email)
function handleTabSwitch(e) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    const tabType = e.target.dataset.tab;
    if (tabType === 'phone') {
        emailInput.placeholder = 'Phone Number';
        emailInput.type = 'tel';
    } else {
        emailInput.placeholder = 'Email';
        emailInput.type = 'email';
    }
}

// Validate Form
function validateForm() {
    const errors = [];

    if (!emailInput.value.trim()) {
        errors.push('Email or phone number is required');
    }

    if (!passwordInput.value) {
        errors.push('Password is required');
    }

    if (passwordInput.value.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    return errors;
}

// Show Error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    setTimeout(() => {
        errorMessage.classList.add('hidden');
    }, 5000);
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();

    // Validate
    const errors = validateForm();
    if (errors.length > 0) {
        showError(errors[0]);
        return;
    }

    // Show loading
    loadingSpinner.classList.remove('hidden');
    loginForm.style.opacity = '0.5';
    loginForm.style.pointerEvents = 'none';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: emailInput.value.trim(),
                password: passwordInput.value,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect to dashboard
        window.location.href = '/dashboard';
    } catch (error) {
        showError(error.message);
    } finally {
        loadingSpinner.classList.add('hidden');
        loginForm.style.opacity = '1';
        loginForm.style.pointerEvents = 'auto';
    }
}

// Check Auth Status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        // User is already logged in
        verifyToken(token);
    }
}

// Verify Token
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (response.ok) {
            // Token is valid, redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// Logout (can be called from other pages)
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}
