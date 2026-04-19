const dashboardGreeting = document.getElementById('dashboardGreeting');
const accountIdentity = document.getElementById('accountIdentity');
const accountStatus = document.getElementById('accountStatus');
const securityEmail = document.getElementById('securityEmail');
const securityPhone = document.getElementById('securityPhone');
const securityToken = document.getElementById('securityToken');
const logoutBtn = document.getElementById('logoutBtn');

const DASHBOARD_API_BASE_URL = (() => {
    const { protocol, hostname, port } = window.location;

    if (protocol.startsWith('http') && port === '3000') {
        return `${protocol}//${hostname}:${port}/api`;
    }

    const resolvedHost = hostname || 'localhost';
    return `http://${resolvedHost}:3000/api`;
})();

document.addEventListener('DOMContentLoaded', () => {
    logoutBtn.addEventListener('click', logout);
    hydrateDashboard();
});

function hydrateDashboard() {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
        window.location.href = './index.html';
        return;
    }

    let user = null;

    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        user = null;
    }

    renderUser(user);
    verifyToken(token);
}

function renderUser(user) {
    const firstName = user?.firstName?.trim();
    const fallbackName = user?.email || user?.phone || 'Trader';
    const displayName = firstName || fallbackName;

    dashboardGreeting.textContent = `Welcome back, ${displayName}`;
    accountIdentity.textContent = user?.email || user?.phone || 'Signed in user';
    accountStatus.textContent = (user?.status || 'active').replace(/^./, (char) => char.toUpperCase());
    securityEmail.textContent = `Email: ${user?.email || 'not available'}`;
    securityPhone.textContent = `Phone: ${user?.phone || 'not available'}`;
    securityToken.textContent = 'Session: verifying token...';
}

async function verifyToken(token) {
    try {
        const response = await fetch(`${DASHBOARD_API_BASE_URL}/auth/verify`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Session expired');
        }

        const data = await response.json();
        localStorage.setItem('user', JSON.stringify(data.user));
        renderUser(data.user);
        securityToken.textContent = 'Session: verified';
    } catch (error) {
        logout();
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = './index.html';
}
