// ─────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────
let DB = {
    users: [],
    exercises: [],
    diet: [],
    weights: [],
    goals: [],
    groups: []
};

let currentUser = null;

// Seed with demo user
DB.users.push({
    username: 'demo', password: 'demo123',
    name: 'Alex Johnson', email: 'alex@example.com',
    height: 178, weight: 82, dob: '1998-05-14',
    gender: 'Male', targetWeight: 75
});

// ─────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach((t,i) => {
        t.classList.toggle('active', (i===0) === (tab==='login'));
    });
    document.getElementById('login-form').classList.toggle('active', tab==='login');
    document.getElementById('register-form').classList.toggle('active', tab==='register');
}

function checkUsername() {
    const val = document.getElementById('reg-username').value.trim();
    const msg = document.getElementById('reg-username-msg');
    if (!val) { msg.textContent = ''; return; }
    const exists = DB.users.some(u => u.username.toLowerCase() === val.toLowerCase());
    msg.textContent = exists ? '✗ Username already taken' : '✓ Available';
    msg.style.color = exists ? 'var(--danger)' : 'var(--accent)';
}

function validateEmail() {
    const val = document.getElementById('reg-email').value.trim();
    const msg = document.getElementById('reg-email-msg');
    if (!val) { msg.textContent = ''; return; }
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    msg.textContent = valid ? '' : '✗ Please enter a valid email address';
}

function calcBMI() {
    const h = parseFloat(document.getElementById('reg-height').value);
    const w = parseFloat(document.getElementById('reg-weight').value);
    const fb = document.getElementById('bmi-feedback');
    if (!h || !w) { fb.style.display='none'; return; }
    const bmi = w / ((h/100)**2);
    const { cat, msg } = getBMICat(bmi);
    fb.style.display='block';
    fb.innerHTML = `Your BMI: <strong>${bmi.toFixed(1)}</strong> — ${cat}<br><small>${msg}</small>`;
    fb.style.color = bmi < 18.5 || bmi >= 30 ? 'var(--warn)' : 'var(--accent)';
}

function getBMICat(bmi) {
    if (bmi < 18.5) return { cat:'Underweight', msg:'Consider consulting a nutritionist for a healthy gain plan.' };
    if (bmi < 25) return { cat:'Healthy Weight ✓', msg:'Great! Maintain your current diet and exercise habits.' };
    if (bmi < 30) return { cat:'Overweight', msg:'Small changes in diet and regular exercise can help.' };
    return { cat:'Obese', msg:'We recommend speaking with a healthcare professional.' };
}

function handleLogin() {
    const u = document.getElementById('login-username').value.trim();
    const p = document.getElementById('login-password').value;
    const err = document.getElementById('login-error');
    const user = DB.users.find(x => x.username.toLowerCase() === u.toLowerCase() && x.password === p);
    if (!user) {
        err.style.display='block';
        err.textContent = 'Incorrect username or password.';
        return;
    }
    currentUser = user;
    launchApp();
}

function handleRegister() {
    const username = document.getElementById('reg-username').value.trim();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const height = parseFloat(document.getElementById('reg-height').value);
    const weight = parseFloat(document.getElementById('reg-weight').value);
    const dob = document.getElementById('reg-dob').value;
    const gender = document.getElementById('reg-gender').value;
    const targetWeight = parseFloat(document.getElementById('reg-target-weight').value) || null;
    const err = document.getElementById('reg-error');

    if (!username || !name || !email || !password) { err.style.display='block'; err.textContent='Please fill all required fields.'; return; }
    if (DB.users.some(u => u.username.toLowerCase() === username.toLowerCase())) { err.style.display='block'; err.textContent='Username already taken.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { err.style.display='block'; err.textContent='Invalid email format.'; return; }
    if (password.length < 6) { err.style.display='block'; err.textContent='Password must be at least 6 characters.'; return; }

    const user = { username, name, email, password, height, weight, dob, gender, targetWeight };
    DB.users.push(user);
    currentUser = user;
    launchApp();
}

function logout() {
    currentUser = null;
    document.getElementById('app').classList.remove('visible');
    document.getElementById('auth-screen').style.display='flex';
    showToast('Signed out successfully', 'success');
}

function launchApp() {
    document.getElementById('auth-screen').style.display='none';
    document.getElementById('app').classList.add('visible');
    populateSidebar();
    refreshDashboard();
    setTodayDates();
    checkGoalAlerts();
    navigate('dashboard');
}

// ─────────────────────────────────────────────
// NAVIGATION
// ─────────────────────────────────────────────
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-'+page).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
        if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'"+page+"'")) n.classList.add('active');
    });

    if (page==='dashboard') refreshDashboard();
    if (page==='exercise') renderExercise();
    if (page==='diet') renderDiet();
    if (page==='weight') renderWeight();
    if (page==='goals') renderGoals();
    if (page==='history') renderHistory();
    if (page==='groups') renderGroups();
    if (page==='profile') loadProfile();
}

// ─────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────
function populateSidebar() {
    document.getElementById('sidebar-name').textContent = currentUser.name;
    document.getElementById('sidebar-handle').textContent = '@' + currentUser.username;
}

// ─────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────
function refreshDashboard() {
    const hr = new Date().getHours();
    const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    document.getElementById('dash-greeting').textContent = greet + ', ' + currentUser.name.split(' ')[0] + ' 👋';

    // BMI
    const h = currentUser.height, w = currentUser.weight;
    if (h && w) {
        const bmi = w / ((h/100)**2);
        const { cat } = getBMICat(bmi);
        document.getElementById('dash-bmi').innerHTML = bmi.toFixed(1);
        document.getElementById('dash-bmi-cat').textContent = cat;
        document.getElementById('bmi-detail-text').textContent = `Your BMI is ${bmi.toFixed(1)} (${cat}). Height: ${h}cm, Weight: ${w}kg`;
        // needle position: bmi range 15-40 → 0-100%
        const pct = Math.min(Math.max((bmi-15)/25*100, 2), 98);
        document.getElementById('bmi-needle').style.left = pct+'%';
    }

    // Today's calories
    const today = todayStr();
    const todayDiet = DB.diet.filter(d => d.userId===currentUser.username && d.date===today);
    const totalCal = todayDiet.reduce((s,d)=>s+d.calories,0);
    document.getElementById('dash-calories').innerHTML = totalCal + '<span class="stat-unit">kcal</span>';
    document.getElementById('dash-cal-note').textContent = todayDiet.length ? `${todayDiet.length} meals today` : 'No meals logged';

    // Today's exercise
    const todayEx = DB.exercises.filter(e => e.userId===currentUser.username && e.date===today);
    const totalMin = todayEx.reduce((s,e)=>s+e.duration,0);
    document.getElementById('dash-exercise').innerHTML = totalMin + '<span class="stat-unit">min</span>';
    document.getElementById('dash-ex-note').textContent = todayEx.length ? `${todayEx.length} session(s)` : 'No sessions logged';

    // Weekly charts
    renderWeeklyCharts();
}

function renderWeeklyCharts() {
    const calChart = document.getElementById('cal-chart');
    const exChart = document.getElementById('ex-chart');
    calChart.innerHTML=''; exChart.innerHTML='';

    const days = [];
    for (let i=6;i>=0;i--) {
        const d = new Date(); d.setDate(d.getDate()-i);
        days.push(d.toISOString().split('T')[0]);
    }

    const calData = days.map(day => DB.diet.filter(d=>d.userId===currentUser.username&&d.date===day).reduce((s,d)=>s+d.calories,0));
    const exData = days.map(day => DB.exercises.filter(e=>e.userId===currentUser.username&&e.date===day).reduce((s,e)=>s+e.duration,0));

    const maxCal = Math.max(...calData, 1);
    const maxEx = Math.max(...exData, 1);

    calData.forEach(v => {
        const bar = document.createElement('div');
        bar.className = 'mini-bar';
        bar.style.height = (v/maxCal*100)+'%';
        bar.title = v + ' kcal';
        calChart.appendChild(bar);
    });

    exData.forEach(v => {
        const bar = document.createElement('div');
        bar.className = 'mini-bar';
        bar.style.height = (v/maxEx*100)+'%';
        bar.title = v + ' min';
        exChart.appendChild(bar);
    });
}

// ─────────────────────────────────────────────
// EXERCISE
// ─────────────────────────────────────────────
function logExercise() {
    const type = document.getElementById('ex-type').value;
    const duration = parseInt(document.getElementById('ex-duration').value);
    const distance = parseFloat(document.getElementById('ex-distance').value) || null;
    const date = document.getElementById('ex-date').value;
    const notes = document.getElementById('ex-notes').value.trim();

    if (!duration || !date) { showToast('Please fill duration and date', 'error'); return; }

    DB.exercises.push({ userId: currentUser.username, type, duration, distance, date, notes, id: Date.now() });
    closeModal('exercise-modal');
    showToast('Exercise session logged! 🏃', 'success');
    renderExercise();
    refreshDashboard();
}

function renderExercise() {
    const list = document.getElementById('exercise-list');
    const entries = DB.exercises.filter(e=>e.userId===currentUser.username).sort((a,b)=>b.date.localeCompare(a.date));
    if (!entries.length) { list.innerHTML = emptyState('🏃','No exercise logged yet'); return; }

    list.innerHTML = `<table class="data-table">
        <thead><tr><th>Date</th><th>Type</th><th>Duration</th><th>Distance</th><th>Notes</th><th></th></tr></thead>
        <tbody>
            ${entries.map(e => `
                <tr>
                    <td>${formatDate(e.date)}</td>
                    <td><span class="badge badge-green">${e.type}</span></td>
                    <td>${e.duration} min</td>
                    <td>${e.distance ? e.distance+'km' : '—'}</td>
                    <td style="color:var(--muted)">${e.notes||'—'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteEntry('exercises',${e.id})">✕</button></td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

// ─────────────────────────────────────────────
// DIET
// ─────────────────────────────────────────────
function prefillCalories() {
    const sel = document.getElementById('diet-food');
    const opt = sel.options[sel.selectedIndex];
    const customWrap = document.getElementById('custom-food-wrap');
    customWrap.style.display = sel.value === 'custom' ? 'block' : 'none';
    if (opt.dataset.cal) document.getElementById('diet-calories').value = opt.dataset.cal;
}

function logDiet() {
    const meal = document.getElementById('diet-meal').value;
    const foodSel = document.getElementById('diet-food');
    const isCustom = foodSel.value === 'custom';
    const food = isCustom ? document.getElementById('diet-custom-food').value.trim() : (foodSel.options[foodSel.selectedIndex].text.replace(/ \(\d+ kcal\)/,''));
    const calories = parseInt(document.getElementById('diet-calories').value);
    const date = document.getElementById('diet-date').value;

    if (!food || !calories || !date) { showToast('Please fill all required fields', 'error'); return; }

    DB.diet.push({ userId: currentUser.username, meal, food, calories, date, id: Date.now() });
    closeModal('diet-modal');
    showToast('Meal logged! 🥗', 'success');
    renderDiet();
    refreshDashboard();
}

function renderDiet() {
    const today = todayStr();
    const allEntries = DB.diet.filter(e=>e.userId===currentUser.username).sort((a,b)=>b.date.localeCompare(a.date));
    const todayEntries = allEntries.filter(e=>e.date===today);

    const todayList = document.getElementById('diet-today-list');
    const mealTypes = ['Breakfast','Lunch','Dinner','Snack','Drink'];

    if (!todayEntries.length) {
        todayList.innerHTML = emptyState('🍽️','No meals logged today');
    } else {
        const grouped = {};
        mealTypes.forEach(m => grouped[m] = todayEntries.filter(e=>e.meal===m));
        todayList.innerHTML = mealTypes.map(m => grouped[m].length ? `
            <div style="margin-bottom:12px">
                <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;font-weight:600">${m}</div>
                ${grouped[m].map(e=>`
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
                        <span style="font-size:13px">${e.food}</span>
                        <div style="display:flex;align-items:center;gap:12px">
                            <span class="badge badge-blue">${e.calories} kcal</span>
                            <button class="btn btn-danger btn-sm" onclick="deleteEntry('diet',${e.id})">✕</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : '').join('');
        const total = todayEntries.reduce((s,e)=>s+e.calories,0);
        todayList.innerHTML += `<div style="text-align:right;font-size:13px;font-weight:700;color:var(--accent);margin-top:8px">Total: ${total} kcal</div>`;
    }

    const allList = document.getElementById('diet-list');
    if (!allEntries.length) { allList.innerHTML = emptyState('🥗','No food entries yet'); return; }
    allList.innerHTML = `<table class="data-table">
        <thead><tr><th>Date</th><th>Meal</th><th>Food</th><th>Calories</th><th></th></tr></thead>
        <tbody>
            ${allEntries.map(e=>`
                <tr>
                    <td>${formatDate(e.date)}</td>
                    <td><span class="badge badge-yellow">${e.meal}</span></td>
                    <td>${e.food}</td>
                    <td><span class="badge badge-blue">${e.calories} kcal</span></td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteEntry('diet',${e.id})">✕</button></td>
                </tr>
            `).join('')}
        </tbody>
    </table>`;
}

// ─────────────────────────────────────────────
// WEIGHT
// ─────────────────────────────────────────────
function logWeight() {
    const weight = parseFloat(document.getElementById('wt-input').value);
    const date = document.getElementById('wt-date').value;
    const notes = document.getElementById('wt-notes').value.trim();
    if (!weight || !date) { showToast('Please fill weight and date', 'error'); return; }

    DB.weights.push({ userId: currentUser.username, weight, date, notes, id: Date.now() });
    // Update user's current weight
    currentUser.weight = weight;
    closeModal('weight-modal');
    showToast('Weight logged! ⚖️', 'success');
    renderWeight();
    refreshDashboard();
}

function renderWeight() {
    const entries = DB.weights.filter(e=>e.userId===currentUser.username).sort((a,b)=>b.date.localeCompare(a.date));
    const latest = entries[0];
    document.getElementById('wt-current').innerHTML = (latest ? latest.weight : (currentUser.weight||'—')) + '<span class="stat-unit">kg</span>';
    document.getElementById('wt-target').innerHTML = (currentUser.targetWeight||'—') + '<span class="stat-unit">kg</span>';

    const list = document.getElementById('weight-list');
    if (!entries.length) { list.innerHTML = emptyState('⚖️','No weight entries yet'); return; }

    list.innerHTML = `<table class="data-table">
        <thead><tr><th>Date</th><th>Weight</th><th>Change</th><th>Notes</th><th></th></tr></thead>
        <tbody>
            ${entries.map((e,i) => {
                const prev = entries[i+1];
                const delta = prev ? (e.weight - prev.weight).toFixed(1) : null;
                const deltaHtml = delta === null ? '—' : `<span style="color:${delta>0?'var(--danger)':'var(--accent)'}">${delta>0?'+':''}${delta} kg</span>`;
                return `<tr>
                    <td>${formatDate(e.date)}</td>
                    <td><strong>${e.weight} kg</strong></td>
                    <td>${deltaHtml}</td>
                    <td style="color:var(--muted)">${e.notes||'—'}</td>
                    <td><button class="btn btn-danger btn-sm" onclick="deleteEntry('weights',${e.id})">✕</button></td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>`;
}

// ─────────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────────
function updateGoalFields() {
    const type = document.getElementById('goal-type').value;
    document.querySelectorAll('.goal-type-fields').forEach(f=>f.style.display='none');
    document.getElementById('goal-fields-'+type).style.display='block';
}

function saveGoal() {
    const type = document.getElementById('goal-type').value;
    const targetDate = document.getElementById('goal-date').value;
    if (!targetDate) { showToast('Please set a target date', 'error'); return; }

    let description = '';
    if (type==='weight') {
        const tw = document.getElementById('goal-target-weight').value;
        if (!tw) { showToast('Enter target weight', 'error'); return; }
        description = `Reach ${tw}kg`;
    } else if (type==='run') {
        const dist = document.getElementById('goal-run-dist').value;
        const time = document.getElementById('goal-run-time').value;
        description = `Run ${dist}km in under ${time} minutes`;
    } else if (type==='exercise') {
        const count = document.getElementById('goal-ex-count').value;
        description = `${count} exercise sessions per week`;
    } else if (type==='calorie') {
        const lim = document.getElementById('goal-cal-limit').value;
        description = `Stay under ${lim} kcal per day`;
    } else {
        const desc = document.getElementById('goal-custom-desc').value.trim();
        if (!desc) { showToast('Describe your goal', 'error'); return; }
        description = desc;
    }

    DB.goals.push({ userId: currentUser.username, type, description, targetDate, met: false, id: Date.now(), createdAt: todayStr() });
    closeModal('goal-modal');
    showToast('Goal set! 🎯', 'success');
    renderGoals();
}

function renderGoals() {
    const goals = DB.goals.filter(g=>g.userId===currentUser.username).sort((a,b)=>a.targetDate.localeCompare(b.targetDate));
    const list = document.getElementById('goals-list');
    if (!goals.length) { list.innerHTML = emptyState('🎯','No goals set yet. Set your first goal!'); return; }

    const today = todayStr();
    list.innerHTML = goals.map(g => {
        const overdue = g.targetDate < today && !g.met;
        const daysLeft = Math.ceil((new Date(g.targetDate)-new Date(today))/(1000*60*60*24));
        return `
            <div class="goal-item">
                <div class="goal-item-header">
                    <div>
                        <div class="goal-name">${g.description}</div>
                        <div class="goal-meta">Target: ${formatDate(g.targetDate)} · ${g.met ? 'Completed' : overdue ? 'Overdue' : daysLeft + ' days left'}</div>
                    </div>
                    <div style="display:flex;gap:8px;align-items:center">
                        ${g.met ? `<span class="badge badge-green">✓ Met</span>` : overdue ? `<span class="badge badge-red">Overdue</span>` : `<span class="badge badge-yellow">In Progress</span>`}
                        ${!g.met ? `<button class="btn btn-ghost btn-sm" onclick="markGoalMet(${g.id})">Mark Met</button>` : ''}
                        <button class="btn btn-danger btn-sm" onclick="deleteGoal(${g.id})">✕</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function markGoalMet(id) {
    const goal = DB.goals.find(g=>g.id===id);
    if (goal) {
        goal.met = true;
        showToast('🎉 Goal marked as completed! Great work!', 'success');
        renderGoals();
        checkGoalAlerts();
    }
}

function deleteGoal(id) {
    DB.goals = DB.goals.filter(g=>g.id!==id);
    renderGoals();
}

function checkGoalAlerts() {
    const today = todayStr();
    const alerts = document.getElementById('goal-alerts');
    if (!alerts) return;
    const overdue = DB.goals.filter(g=>g.userId===currentUser?.username && !g.met && g.targetDate < today);
    const upcoming = DB.goals.filter(g=>g.userId===currentUser?.username && !g.met && g.targetDate >= today && Math.ceil((new Date(g.targetDate)-new Date(today))/(1000*60*60*24)) <= 7);

    let html = '';
    overdue.forEach(g => {
        html += `<div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:8px;padding:12px 16px;margin-bottom:8px;font-size:13px;display:flex;justify-content:space-between;align-items:center">
            <span>⚠️ Overdue goal: <strong>${g.description}</strong></span>
            <button class="btn btn-ghost btn-sm" onclick="openModal('goal-modal')">Set New Goal</button>
        </div>`;
    });
    upcoming.forEach(g => {
        const days = Math.ceil((new Date(g.targetDate)-new Date(today))/(1000*60*60*24));
        html += `<div style="background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:8px;padding:12px 16px;margin-bottom:8px;font-size:13px">
            ⏰ Goal due in ${days} day(s): <strong>${g.description}</strong>
        </div>`;
    });
    alerts.innerHTML = html;
}

// ─────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────
function renderHistory() {
    const uid = currentUser.username;
    const all = [
        ...DB.exercises.filter(e=>e.userId===uid).map(e=>({ date:e.date, icon:'🏃', text:`${e.type} — ${e.duration} min${e.distance?', '+e.distance+'km':''}`, type:'exercise' })),
        ...DB.diet.filter(e=>e.userId===uid).map(e=>({ date:e.date, icon:'🥗', text:`${e.meal}: ${e.food} (${e.calories} kcal)`, type:'diet' })),
        ...DB.weights.filter(e=>e.userId===uid).map(e=>({ date:e.date, icon:'⚖️', text:`Weight logged: ${e.weight} kg`, type:'weight' })),
        ...DB.goals.filter(g=>g.userId===uid && g.met).map(g=>({ date:g.targetDate, icon:'🎯', text:`Goal achieved: ${g.description}`, type:'goal' }))
    ].sort((a,b)=>b.date.localeCompare(a.date));

    const list = document.getElementById('history-list');
    if (!all.length) { list.innerHTML = emptyState('📊','No activity recorded yet. Start logging!'); return; }

    list.innerHTML = all.map(e => `
        <div style="display:flex;gap:14px;padding:12px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:20px;width:28px;text-align:center;flex-shrink:0">${e.icon}</span>
            <div>
                <div style="font-size:13px;color:var(--text)">${e.text}</div>
                <div style="font-size:11px;color:var(--muted);margin-top:2px">${formatDate(e.date)}</div>
            </div>
        </div>
    `).join('');
}

// ─────────────────────────────────────────────
// GROUPS
// ─────────────────────────────────────────────
function createGroup() {
    const name = document.getElementById('group-name-input').value.trim();
    const desc = document.getElementById('group-desc-input').value.trim();
    if (!name) { showToast('Group name is required', 'error'); return; }
    if (DB.groups.some(g=>g.name.toLowerCase()===name.toLowerCase())) {
        showToast('Group name already taken', 'error'); return;
    }
    const code = Math.random().toString(36).slice(2,8).toUpperCase();
    DB.groups.push({ name, desc, code, members: [currentUser.username], createdBy: currentUser.username, id: Date.now() });
    closeModal('group-modal');
    showToast(`Group "${name}" created! Code: ${code}`, 'success');
    renderGroups();
}

function joinGroupByCode() {
    const code = document.getElementById('join-code-input').value.trim().toUpperCase();
    const group = DB.groups.find(g=>g.code===code);
    if (!group) { showToast('Group not found with that code', 'error'); return; }
    if (group.members.includes(currentUser.username)) { showToast('Already a member!', 'error'); return; }
    group.members.push(currentUser.username);
    document.getElementById('join-code-input').value='';
    showToast(`Joined "${group.name}"! 🎉`, 'success');
    renderGroups();
}

function leaveGroup(id) {
    const group = DB.groups.find(g=>g.id===id);
    if (group) {
        group.members = group.members.filter(m=>m!==currentUser.username);
        showToast(`Left "${group.name}"`, 'success');
        renderGroups();
    }
}

function shareGroup(id) {
    const group = DB.groups.find(g=>g.id===id);
    if (group) {
        const body = `Hi! Join my health tracking group "${group.name}" on VitalTrack. Use code: ${group.code}`;
        showToast(`Email composed for group "${group.name}" (Code: ${group.code})`, 'success');
        // In a real app: window.location.href = 'mailto:?subject=Join my VitalTrack Group&body='+encodeURIComponent(body);
    }
}

function renderGroups() {
    const myGroups = DB.groups.filter(g=>g.members.includes(currentUser.username));
    const list = document.getElementById('groups-list');
    if (!myGroups.length) { list.innerHTML = emptyState('👥','No groups yet. Create one or join with a code!'); return; }

    list.innerHTML = myGroups.map(g=>`
        <div class="group-card" style="margin-bottom:10px">
            <div style="display:flex;align-items:center;gap:14px">
                <div class="group-avatar">👥</div>
                <div>
                    <div style="font-size:14px;font-weight:600;color:var(--text)">${g.name}</div>
                    <div style="font-size:12px;color:var(--muted)">${g.desc||''} · ${g.members.length} member(s) · Code: <strong style="color:var(--accent)">${g.code}</strong></div>
                </div>
            </div>
            <div style="display:flex;gap:8px">
                <button class="btn btn-ghost btn-sm" onclick="shareGroup(${g.id})">📧 Share</button>
                <button class="btn btn-danger btn-sm" onclick="leaveGroup(${g.id})">Leave</button>
            </div>
        </div>
    `).join('');
}

// ─────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────
function loadProfile() {
    document.getElementById('prof-name').value = currentUser.name || '';
    document.getElementById('prof-email').value = currentUser.email || '';
    document.getElementById('prof-dob').value = currentUser.dob || '';
    document.getElementById('prof-gender').value = currentUser.gender || 'Male';
    document.getElementById('prof-height').value = currentUser.height || '';
    document.getElementById('prof-weight').value = currentUser.weight || '';
    document.getElementById('prof-target').value = currentUser.targetWeight || '';
    updateProfileBMI();
}

function updateProfileBMI() {
    const h = parseFloat(document.getElementById('prof-height').value);
    const w = parseFloat(document.getElementById('prof-weight').value);
    const bmiVal = document.getElementById('prof-bmi-val');
    const bmiCat = document.getElementById('prof-bmi-cat');
    if (h && w) {
        const bmi = w / ((h/100)**2);
        const { cat } = getBMICat(bmi);
        bmiVal.textContent = bmi.toFixed(1);
        bmiCat.textContent = cat;
        bmiCat.style.color = bmi >= 25 || bmi < 18.5 ? 'var(--warn)' : 'var(--accent)';
    }
}

function saveProfile() {
    currentUser.name = document.getElementById('prof-name').value.trim();
    currentUser.email = document.getElementById('prof-email').value.trim();
    currentUser.dob = document.getElementById('prof-dob').value;
    currentUser.gender = document.getElementById('prof-gender').value;
    currentUser.height = parseFloat(document.getElementById('prof-height').value) || currentUser.height;
    currentUser.weight = parseFloat(document.getElementById('prof-weight').value) || currentUser.weight;
    currentUser.targetWeight = parseFloat(document.getElementById('prof-target').value) || null;
    populateSidebar();
    showToast('Profile saved! ✓', 'success');
    refreshDashboard();
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function deleteEntry(table, id) {
    DB[table] = DB[table].filter(e=>e.id!==id);
    if (table==='exercises') renderExercise();
    if (table==='diet') renderDiet();
    if (table==='weights') renderWeight();
    refreshDashboard();
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(str) {
    if (!str) return '—';
    const d = new Date(str+'T00:00:00');
    return d.toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function emptyState(icon, text) {
    return `<div class="empty"><div class="empty-icon">${icon}</div><p>${text}</p></div>`;
}

function setTodayDates() {
    const today = todayStr();
    ['ex-date','diet-date','wt-date'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = today;
    });
}

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
function openModal(id) {
    document.getElementById(id).classList.add('open');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('open');
}

// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
    });
});

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function showToast(message, type='success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type==='success' ? '✓' : '✗'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
// Auto-login demo for testing
document.getElementById('login-username').value = 'demo';
document.getElementById('login-password').value = 'demo123';

// Set goal field default
document.getElementById('goal-date').value = new Date(Date.now()+30*24*60*60*1000).toISOString().split('T')[0];
// =============================================================
// STUDENT ADDITION: GROUP LEADERBOARD FEATURE
// =============================================================

// Extends the existing renderGroups function to add a Leaderboard button
const baseRenderGroups = renderGroups;
renderGroups = function() {
    // Call the original rendering logic first so we don't break anything
    baseRenderGroups();
    
    const userGroups = DB.groups.filter(group => group.members.includes(currentUser.username));
    const listElement = document.getElementById('groups-list');
    
    // If user has groups, inject the custom Leaderboard button into each group card
    if (userGroups.length > 0 && listElement) {
        listElement.innerHTML = userGroups.map(group => `
            <div class="group-card" style="margin-bottom: 12px; padding: 12px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <div style="font-size: 14px; font-weight: 600; color: var(--text)">👥 ${group.name}</div>
                    <div style="font-size: 12px; color: var(--muted)">${group.desc || ''} · Code: <strong>${group.code}</strong></div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost btn-sm" onclick="calculateLeaderboard(${group.id})">🏆 View Rank</button>
                    <button class="btn btn-danger btn-sm" onclick="leaveGroup(${group.id})">Leave</button>
                </div>
            </div>
        `).join('');
    }
};

// Function to calculate and display user rankings based on exercise duration
function calculateLeaderboard(groupId) {
    const currentGroup = DB.groups.find(g => g.id === groupId);
    if (!currentGroup) return;

    let leaderboardArray = [];

    // Loop through each member of the group to calculate their total minutes
    currentGroup.members.forEach(username => {
        const userAccount = DB.users.find(u => u.username === username);
        const displayName = userAccount ? userAccount.name : username;
        
        let totalMinutes = 0;
        
        // Filter and sum up durations from the exercise array
        DB.exercises.forEach(exercise => {
            if (exercise.userId === username) {
                totalMinutes += exercise.duration;
            }
        });

        leaderboardArray.push({
            name: displayName,
            username: username,
            minutes: totalMinutes
        });
    });

    // Sort the array in descending order (highest minutes first)
    leaderboardArray.sort((a, b) => b.minutes - a.minutes);

    // Render the scoreboard results into the HTML container
    const leaderboardDiv = document.getElementById('group-leaderboard-container');
    if (leaderboardDiv) {
        leaderboardDiv.innerHTML = `
            <div style="background: var(--surface2, #f9f9f9); border: 1px solid var(--border); padding: 15px; border-radius: 8px; margin-top: 15px;">
                <h4 style="margin: 0 0 10px 0; font-size: 13px; color: var(--text); font-weight: 600;">🏆 ${currentGroup.name} - Activity Standings</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${leaderboardArray.map((member, index) => `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
                            <span>
                                <strong>#${index + 1}</strong> ${member.name} 
                                ${member.username === currentUser.username ? '<span style="color: var(--accent); font-size: 11px;">(You)</span>' : ''}
                            </span>
                            <span class="badge badge-green">${member.minutes} mins</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}