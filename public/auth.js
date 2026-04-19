const COUNTRIES = [
    { name: 'Nigeria', code: '+234', badge: 'NG' },
    { name: 'Ghana', code: '+233', badge: 'GH' },
    { name: 'Kenya', code: '+254', badge: 'KE' },
];

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

const API_BASE_URL = (() => {
    const { protocol, hostname, port } = window.location;

    if (protocol.startsWith('http') && port === '3000') {
        return `${protocol}//${hostname}:${port}/api`;
    }

    const resolvedHost = hostname || 'localhost';
    return `http://${resolvedHost}:3000/api`;
})();

let currentTab = 'phone';
let selectedCountry = COUNTRIES[0];

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    renderCountryList();
    updateCountryDisplay();
    setActiveTab(currentTab);
    detectUserLocation();
    checkAuthStatus();
});

function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    showPasswordBtn.addEventListener('click', togglePasswordVisibility);
    tabButtons.forEach((button) => {
        button.addEventListener('click', handleTabSwitch);
    });
    countryCodeBtn.addEventListener('click', toggleCountryDropdown);
    countrySearch.addEventListener('input', filterCountries);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.country-code-selector')) {
            closeCountryDropdown();
        }
    });
}

function closeCountryDropdown() {
    countryDropdown.classList.add('hidden');
    countryCodeBtn.classList.remove('active');
    countryCodeBtn.setAttribute('aria-expanded', 'false');
}

function detectUserLocation() {
    if (!('geolocation' in navigator)) {
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
            await fetchCountryFromLocation(coords.latitude, coords.longitude);
        },
        () => {
            updateLoginSummary();
        },
        {
            timeout: 6000,
            maximumAge: 300000,
        }
    );
}

async function fetchCountryFromLocation(latitude, longitude) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );

        if (!response.ok) {
            throw new Error('Unable to resolve location');
        }

        const data = await response.json();
        const countryName = data.address?.country;
        const matchedCountry = COUNTRIES.find((country) =>
            country.name.toLowerCase() === countryName?.toLowerCase()
        );

        if (matchedCountry) {
            selectedCountry = matchedCountry;
            updateCountryDisplay();
        }
    } catch (error) {
        console.info('Country detection skipped:', error.message);
    }
}

function updateCountryDisplay() {
    flagEmoji.textContent = selectedCountry.badge;
    countryCodeSpan.textContent = selectedCountry.code;
    updateLoginSummary();
}

function renderCountryList() {
    countryList.innerHTML = COUNTRIES.map((country, index) => `
        <button class="country-item" type="button" data-index="${index}">
            <span class="flag-badge">${country.badge}</span>
            <span class="name">${country.name}</span>
            <span class="code">${country.code}</span>
        </button>
    `).join('');

    document.querySelectorAll('.country-item').forEach((item) => {
        item.addEventListener('click', selectCountry);
    });
}

function selectCountry(event) {
    selectedCountry = COUNTRIES[Number(event.currentTarget.dataset.index)];
    updateCountryDisplay();
    countrySearch.value = '';
    filterCountries({ target: countrySearch });
    closeCountryDropdown();
}

function toggleCountryDropdown() {
    const isHidden = countryDropdown.classList.toggle('hidden');
    countryCodeBtn.classList.toggle('active', !isHidden);
    countryCodeBtn.setAttribute('aria-expanded', String(!isHidden));

    if (!isHidden) {
        countrySearch.focus();
    }
}

function filterCountries(event) {
    const query = event.target.value.trim().toLowerCase();
    const items = document.querySelectorAll('.country-item');

    items.forEach((item) => {
        const name = item.querySelector('.name').textContent.toLowerCase();
        const code = item.querySelector('.code').textContent;
        const matches = name.includes(query) || code.includes(query);
        item.style.display = matches ? 'flex' : 'none';
    });
}

function togglePasswordVisibility(event) {
    event.preventDefault();

    const showingPassword = passwordInput.type === 'text';
    passwordInput.type = showingPassword ? 'password' : 'text';
    showPasswordBtn.textContent = showingPassword ? 'Show' : 'Hide';
    showPasswordBtn.setAttribute('aria-label', showingPassword ? 'Show password' : 'Hide password');
}

function handleTabSwitch(event) {
    setActiveTab(event.currentTarget.dataset.tab);
    clearErrors();
}

function setActiveTab(nextTab) {
    currentTab = nextTab;

    tabButtons.forEach((button) => {
        const isActive = button.dataset.tab === currentTab;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-selected', String(isActive));
    });

    const usingPhone = currentTab === 'phone';
    phoneSection.classList.toggle('hidden', !usingPhone);
    emailSection.classList.toggle('hidden', usingPhone);
    phoneInput.required = usingPhone;
    emailInput.required = !usingPhone;

    updateLoginSummary();
}

function updateLoginSummary() {
    if (currentTab === 'phone') {
        selectedMethod.textContent = `Phone login selected for ${selectedCountry.name} ${selectedCountry.code}`;
        return;
    }

    selectedMethod.textContent = 'Email login selected';
}

function validateForm() {
    const errors = [];
    const normalizedPhone = phoneInput.value.replace(/\D/g, '');

    if (currentTab === 'phone') {
        if (!normalizedPhone) {
            errors.push('Phone number is required');
        } else if (!/^\d{5,15}$/.test(normalizedPhone)) {
            errors.push('Phone number must be between 5 and 15 digits');
        }
    } else {
        const email = emailInput.value.trim();

        if (!email) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Enter a valid email address');
        }
    }

    if (!passwordInput.value) {
        errors.push('Password is required');
    } else if (passwordInput.value.length < 6) {
        errors.push('Password must be at least 6 characters');
    }

    return errors;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function clearErrors() {
    errorMessage.textContent = '';
    errorMessage.classList.add('hidden');
}

async function handleLogin(event) {
    event.preventDefault();
    clearErrors();

    const errors = validateForm();
    if (errors.length > 0) {
        showError(errors[0]);
        return;
    }

    loadingSpinner.classList.remove('hidden');
    loginForm.style.opacity = '0.55';
    loginForm.style.pointerEvents = 'none';

    try {
        const loginData = {
            password: passwordInput.value,
            loginType: currentTab,
        };

        if (currentTab === 'phone') {
            loginData.phone = `${selectedCountry.code}${phoneInput.value.replace(/\D/g, '')}`;
        } else {
            loginData.email = emailInput.value.trim();
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

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = './dashboard.html';
    } catch (error) {
        showError(error.message || 'Unable to log in right now');
    } finally {
        loadingSpinner.classList.add('hidden');
        loginForm.style.opacity = '1';
        loginForm.style.pointerEvents = 'auto';
    }
}

function checkAuthStatus() {
    const token = localStorage.getItem('token');

    if (token) {
        verifyToken(token);
    }
}

async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            window.location.href = './dashboard.html';
            return;
        }

        localStorage.removeItem('token');
        localStorage.removeItem('user');
    } catch (error) {
        console.info('Token verification skipped:', error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = './index.html';
}
