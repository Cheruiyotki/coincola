// Country Data
const COUNTRIES = [
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'Ghana', code: '+233', flag: '🇬🇭' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
];

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const showPasswordBtn = document.querySelector('.show-password-btn');
const tabButtons = document.querySelectorAll('.tab-btn');
const phoneSection = document.getElementById('phoneSection');
const emailSection = document.getElementById('emailSection');
const countryCodeBtn = document.getElementById('countryCodeBtn');
const countryDropdown = document.getElementById('countryDropdown');
const countrySearch = document.getElementById('countrySearch');
const countryList = document.getElementById('countryList');
const flagEmoji = document.getElementById('flagEmoji');
const countryCodeSpan = document.getElementById('countryCode');
const selectedMethod = document.getElementById('selectedLoginMethod');

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// State
let currentTab = 'phone';
let selectedCountry = null;
let userCountry = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderCountryList();
    detectUserLocation();
    checkAuthStatus();
});

// Setup Event Listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    showPasswordBtn.addEventListener('click', togglePasswordVisibility);
    tabButtons.forEach(btn => {
        btn.addEventListener('click', handleTabSwitch);
    });
    countryCodeBtn.addEventListener('click', toggleCountryDropdown);
    countrySearch.addEventListener('input', filterCountries);
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.country-code-selector')) {
            countryDropdown.classList.add('hidden');
            countryCodeBtn.classList.remove('active');
        }
    });
}

// Detect User Location
async function detectUserLocation() {
    try {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await fetchCountryFromLocation(latitude, longitude);
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    setDefaultCountry();
                }
            );
        } else {
            setDefaultCountry();
        }
    } catch (error) {
        console.log('Location detection error:', error);
        setDefaultCountry();
    }
}

// Fetch Country from Coordinates
async function fetchCountryFromLocation(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
        );
        const data = await response.json();
        const countryName = data.address?.country;
        
        const country = COUNTRIES.find(c => 
            c.name.toLowerCase() === countryName?.toLowerCase()
        );
        
        if (country) {
            selectedCountry = country;
            updateCountryDisplay();
        } else {
            setDefaultCountry();
        }
    } catch (error) {
        console.log('Country fetch error:', error);
        setDefaultCountry();
    }
}

// Set Default Country
function setDefaultCountry() {
    selectedCountry = COUNTRIES[0]; // United States
    updateCountryDisplay();
}

// Update Country Display
function updateCountryDisplay() {
    if (selectedCountry) {
        flagEmoji.textContent = selectedCountry.flag;
        countryCodeSpan.textContent = selectedCountry.code;
        userCountry = selectedCountry;
    }
}

// Render Country List
function renderCountryList() {
    countryList.innerHTML = COUNTRIES.map((country, index) => `
        <div class="country-item" data-index="${index}">
            <span class="flag">${country.flag}</span>
            <span class="name">${country.name}</span>
            <span class="code">${country.code}</span>
        </div>
    `).join('');
    
    // Add click listeners to country items
    document.querySelectorAll('.country-item').forEach(item => {
        item.addEventListener('click', selectCountry);
    });
}

// Select Country
function selectCountry(e) {
    const index = e.currentTarget.dataset.index;
    selectedCountry = COUNTRIES[index];
    updateCountryDisplay();
    countryDropdown.classList.add('hidden');
    countryCodeBtn.classList.remove('active');
    countrySearch.value = '';
}

// Toggle Country Dropdown
function toggleCountryDropdown() {
    countryDropdown.classList.toggle('hidden');
    countryCodeBtn.classList.toggle('active');
    if (!countryDropdown.classList.contains('hidden')) {
        countrySearch.focus();
    }
}

// Filter Countries
function filterCountries(e) {
    const query = e.target.value.toLowerCase();
    const items = document.querySelectorAll('.country-item');
    
    items.forEach(item => {
        const name = item.querySelector('.name').textContent.toLowerCase();
        const code = item.querySelector('.code').textContent;
        const matches = name.includes(query) || code.includes(query);
        item.style.display = matches ? 'flex' : 'none';
    });
}

// Toggle Password Visibility
function togglePasswordVisibility(e) {
    e.preventDefault();
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    showPasswordBtn.textContent = isPassword ? '🙈' : '👁️';
}

// Handle Tab Switch
function handleTabSwitch(e) {
    tabButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    
    currentTab = e.target.dataset.tab;
    
    if (currentTab === 'phone') {
        phoneSection.classList.remove('hidden');
        emailSection.classList.add('hidden');
        phoneInput.focus();
        selectedMethod.textContent = 'Login by phone';
        emailInput.removeAttribute('required');
        phoneInput.setCustomValidity('');
    } else {
        phoneSection.classList.add('hidden');
        emailSection.classList.remove('hidden');
        emailInput.focus();
        selectedMethod.textContent = 'Login by email';
        phoneInput.removeAttribute('required');
        emailInput.setCustomValidity('');
    }
    
    clearErrors();
}

// Validate Form
function validateForm() {
    const errors = [];

    if (currentTab === 'phone') {
        if (!phoneInput.value.trim()) {
            errors.push('Phone number is required');
        } else if (!/^\d{5,15}$/.test(phoneInput.value.replace(/\s/g, ''))) {
            errors.push('Phone number must be 5-15 digits');
        }
    } else {
        if (!emailInput.value.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim())) {
            errors.push('Please enter a valid email');
        }
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

// Clear Errors
function clearErrors() {
    errorMessage.classList.add('hidden');
    errorMessage.textContent = '';
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
        let loginData = {
            password: passwordInput.value,
        };

        if (currentTab === 'phone') {
            loginData.phone = selectedCountry.code + phoneInput.value.replace(/\s/g, '');
            loginData.loginType = 'phone';
        } else {
            loginData.email = emailInput.value.trim();
            loginData.loginType = 'email';
        }

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
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
