/**
 * KANJI BOYS HOSTEL - Premium Interactive Engine
 * Architecture: Vanilla JS, Data-Driven UI, LocalStorage State Management
 */

// --- STATE MANAGEMENT ---
const DEFAULT_DATA = {
    rooms: [
        // { id: '201', residents: ['Reserved for Admin'], status: 'reserved', max: 1 },
        { id: '201', residents: ['Sarvesh', 'Bhavya'], status: 'occupied', max: 2 },
        { id: '203', residents: ['Karan', 'Kunal Bhaiya'], status: 'occupied', max: 2 },
        { id: '205', residents: ['Shubham', 'Naman'], status: 'occupied', max: 2 },
        { id: '206', residents: ['Rishi', 'Tushar'], status: 'occupied', max: 2 }
    ],
    notices: [
        { title: 'Dinner Timing', desc: 'Dinner will be served strictly from 8:00 PM to 10:00 PM in the mess hall.', date: 'Today' },
        { title: 'Electricity Notice', desc: 'Scheduled maintenance block from 2 PM to 4 PM. Inverter backup active.', date: 'Tomorrow' },
        { title: 'Cleaning Schedule', desc: 'First floor deep cleaning scheduled for Saturday morning.', date: 'Upcoming' }
        
    ],
    settings: {
        darkMode: true,
        animations: true,
        sound: false,
        particles: true,
        glassEffect: true
    }
};

let appData = JSON.parse(localStorage.getItem('kanjiHostelData')) || DEFAULT_DATA;
const saveData = () => localStorage.setItem('kanjiHostelData', JSON.stringify(appData));

// --- DOM ELEMENTS ---
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
const loader = document.getElementById('loader');
const progressBar = document.getElementById('progress-bar');
const loadingText = document.getElementById('loading-text');

// --- LOADER LOGIC ---
let loadProgress = 0;
const simulateLoading = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 15) + 5;
    if (loadProgress >= 100) {
        loadProgress = 100;
        clearInterval(simulateLoading);
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            initAnimations(); // Start entry animations
        }, 800);
    }
    progressBar.style.width = `${loadProgress}%`;
    loadingText.innerText = `${loadProgress}% SYSTEM READY`;
}, 150);

// --- CUSTOM CURSOR PHYSICS (60FPS) ---
let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;
const isMobile = window.innerWidth < 768;

if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });

    const animateCursor = () => {
        // Easing for smooth trailing effect
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateCursor);
    };
    animateCursor();

    // Magnetic interactions on interactive elements
    const interactives = document.querySelectorAll('a, button, input, select, .glass-panel');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => cursorOutline.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursorOutline.classList.remove('hover'));
    });
}

// --- NAVIGATION & SCROLL ---
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
});

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        navLinks.classList.remove('active');
        const target = document.querySelector(this.getAttribute('href'));
        if(target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// --- RENDER ENGINE ---

function renderDashboard() {
    const totalRooms = appData.rooms.length;
    let totalResidents = 0;
    appData.rooms.forEach(r => {
        if(r.status === 'occupied') totalResidents += r.residents.length;
    });
    
    const statsHTML = `
        <div class="glass-panel stat-card">
            <h3>Total Rooms</h3>
            <div class="value">${totalRooms}</div>
        </div>
        <div class="glass-panel stat-card">
            <h3>Active Residents</h3>
            <div class="value">${totalResidents}</div>
        </div>
        <div class="glass-panel stat-card">
            <h3>Hostel Capacity</h3>
            <div class="value">10</div>
        </div>
        <div class="glass-panel stat-card">
            <h3>Occupancy Rate</h3>
            <div class="value">${Math.round((totalResidents / 10) * 100)}%</div>
        </div>
    `;
    document.getElementById('stats-grid').innerHTML = statsHTML;
}

function renderRooms(filter = '') {
    const grid = document.getElementById('room-grid');
    grid.innerHTML = '';
    
    appData.rooms.filter(r => r.id.includes(filter) || r.residents.some(res => res.toLowerCase().includes(filter.toLowerCase()))).forEach(room => {
        const occPct = (room.residents.length / room.max) * 100;
        const resList = room.residents.map(r => `<li>• ${r}</li>`).join('');
        
        const card = `
            <div class="glass-panel room-card fade-up">
                <div class="room-header">
                    <h3>Room ${room.id}</h3>
                    <span class="badge ${room.status}">${room.status}</span>
                </div>
                <ul class="residents">
                    ${resList}
                </ul>
                <div class="progress-container">
                    <div class="progress-fill" style="width: ${occPct}%"></div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', card);
    });
}

function renderResidents(filter = '') {
    const grid = document.getElementById('resident-grid');
    grid.innerHTML = '';
    
    let avatarCounter = 1;
    appData.rooms.forEach(room => {
        if (room.status === 'occupied') {
            room.residents.forEach(res => {
                if(res.toLowerCase().includes(filter.toLowerCase())) {
                    // Simulating placeholders: avatar1.jpg, avatar2.jpg etc. If missing, it shows alt
                    const card = `
                        <div class="glass-panel resident-card fade-up">
                            <div class="avatar-container">
                                <img src="assets/avatars/avatar${avatarCounter}.jpg" alt="${res}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzIyMiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0iI2ZmZiIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+T0s8L3RleHQ+PC9zdmc+'">
                                <div class="online-dot"></div>
                            </div>
                            <h3>${res}</h3>
                            <p>Room ${room.id}</p>
                        </div>
                    `;
                    grid.insertAdjacentHTML('beforeend', card);
                    avatarCounter = avatarCounter > 5 ? 1 : avatarCounter + 1;
                }
            });
        }
    });
}

function renderNotices() {
    const grid = document.getElementById('notice-grid');
    grid.innerHTML = appData.notices.map(n => `
        <div class="glass-panel fade-up">
            <span style="color:var(--accent); font-size:0.8rem; font-weight:700; text-transform:uppercase">${n.date}</span>
            <h3 style="margin: 10px 0;">${n.title}</h3>
            <p style="color:var(--text-muted);">${n.desc}</p>
        </div>
    `).join('');
}

function renderSettings() {
    const settingsList = [
        { id: 'darkMode', label: 'Dark Mode', desc: 'Cinematic dark interface' },
        { id: 'animations', label: 'UI Animations', desc: 'Smooth 60FPS transitions' },
        { id: 'particles', label: 'Background Particles', desc: 'Floating ambient effects' },
        { id: 'glassEffect', label: 'Glassmorphism', desc: 'Blur & transparency effects' }
    ];

    const grid = document.getElementById('settings-grid');
    grid.innerHTML = settingsList.map(s => `
        <div class="glass-panel setting-item fade-up">
            <div class="setting-info">
                <h4>${s.label}</h4>
                <p>${s.desc}</p>
            </div>
            <label class="switch">
                <input type="checkbox" id="set-${s.id}" ${appData.settings[s.id] ? 'checked' : ''} onchange="toggleSetting('${s.id}', this.checked)">
                <span class="slider"></span>
            </label>
        </div>
    `).join('');
}

// --- LOGIC BINDINGS ---

// Search Listeners
document.getElementById('search-rooms').addEventListener('input', (e) => renderRooms(e.target.value));
document.getElementById('search-residents').addEventListener('input', (e) => renderResidents(e.target.value));

// Admin Form Submit
document.getElementById('add-resident-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('res-name').value;
    const roomId = document.getElementById('res-room').value;
    
    const room = appData.rooms.find(r => r.id === roomId);
    if(room && room.residents.length < room.max) {
        room.residents.push(name);
        room.status = 'occupied';
        saveData();
        renderAll();
        showToast(`Resident ${name} added to Room ${roomId}`, 'success');
        e.target.reset();
    } else {
        showToast(`Room ${roomId} is at full capacity!`, 'error');
    }
});

// System Operations
document.getElementById('reset-btn').addEventListener('click', () => {
    if(confirm("Are you sure you want to reset all data to default?")) {
        appData = JSON.parse(JSON.stringify(DEFAULT_DATA)); // Deep copy
        saveData();
        renderAll();
        showToast("System reset to defaults", 'success');
    }
});

document.getElementById('export-btn').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "kanji_hostel_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    showToast("Data exported successfully", 'success');
});

window.toggleSetting = (key, value) => {
    appData.settings[key] = value;
    saveData();
    showToast(`${key} updated`, 'success');
    // Live apply effects
    if(key === 'particles') document.getElementById('particles').style.display = value ? 'block' : 'none';
};

// --- UTILITIES ---

function showToast(message, type='success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div style="width:10px; height:10px; border-radius:50%; background:${type==='error'?'#f44336':'#4caf50'}"></div>
        ${message}
    `;
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// Intersection Observer for Scroll Animations
const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function initAnimations() {
    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// Footer Year
document.getElementById('year').innerText = new Date().getFullYear();

// Initialize App
function renderAll() {
    renderDashboard();
    renderRooms();
    renderResidents();
    renderNotices();
    renderSettings();
    // Re-bind observer to dynamically injected elements
    setTimeout(initAnimations, 100);
}

// Boot up
window.onload = () => {
    renderAll();
    if(!appData.settings.particles) document.getElementById('particles').style.display = 'none';
};