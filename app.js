const SUBJECTS = [
  { id:'math', name:'Mathematics', color:'#818CF8', bg:'#EEF2FF', text:'#3730A3' },
  { id:'prog', name:'Programming', color:'#34D399', bg:'#ECFDF5', text:'#065F46' },
  { id:'hist', name:'History',     color:'#FB923C', bg:'#FFF7ED', text:'#9A3412' },
  { id:'eng',  name:'English',     color:'#F472B6', bg:'#FDF2F8', text:'#9D174D' },
];

let tasks = [
  { id:1, title:'Finish algebra worksheet',         subject:'math', priority:'high',   due:'2026-04-26', done:false },
  { id:2, title:'Read chapter 5 — The Great War',   subject:'hist', priority:'medium', due:'2026-04-26', done:false },
  { id:3, title:'Build login page component',        subject:'prog', priority:'high',   due:'2026-04-26', done:false },
  { id:4, title:'Write essay introduction',          subject:'eng',  priority:'medium', due:'2026-04-28', done:false },
  { id:5, title:'Solve 10 integration problems',     subject:'math', priority:'low',    due:'2026-04-30', done:true  },
  { id:6, title:'Research Treaty of Versailles',     subject:'hist', priority:'medium', due:'2026-04-29', done:false },
  { id:7, title:'Fix form validation bug',           subject:'prog', priority:'low',    due:'2026-05-02', done:false },
  { id:8, title:'Annotate poem — Ozymandias',        subject:'eng',  priority:'high',   due:'2026-04-27', done:false },
  { id:9, title:'Database schema design',            subject:'prog', priority:'high',   due:'2026-05-01', done:true  },
  { id:10,title:'Revision notes — causes of WW1',   subject:'hist', priority:'low',    due:'2026-05-03', done:false },
];

let nextId = 11;
let currentFilter = 'all';
let calYear = 2026, calMonth = 3;

const subjectById = id => SUBJECTS.find(s => s.id === id);

function goto(page, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (el) el.classList.add('active');
  if (page === 'dashboard') renderDashboard();
  if (page === 'tasks')     renderTasks();
  if (page === 'subjects')  renderSubjects();
  if (page === 'calendar')  renderCalendar();
}

// ─── DASHBOARD ────────────────────────────────────────────────
function renderDashboard() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const today = '2026-04-26';
  const todayTasks    = tasks.filter(t => !t.done && t.due === today);
  const upcomingTasks = tasks.filter(t => !t.done && t.due > today)
                             .sort((a,b) => a.due.localeCompare(b.due)).slice(0,5);
  const deadlineAlerts = getDeadlineAlerts(today);

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-today').textContent = todayTasks.length;
  document.getElementById('stat-done').textContent  = done;
  const pct = total ? Math.round(done / total * 100) : 0;
  document.getElementById('stat-pct').textContent   = pct + '%';
  document.getElementById('stat-bar').style.width   = pct + '%';

  document.getElementById('today-tasks').innerHTML =
    todayTasks.length ? todayTasks.map(miniTask).join('') :
    '<div class="empty">🎉 Nothing due today!</div>';

  document.getElementById('upcoming-tasks').innerHTML =
    upcomingTasks.length ? upcomingTasks.map(miniTask).join('') :
    '<div class="empty">All caught up!</div>';

  document.getElementById('deadline-alerts').innerHTML =
    deadlineAlerts.length ? deadlineAlerts.map(alertItem).join('') :
    '<div class="empty" style="padding:8px 0">No deadline alerts right now.</div>';

  document.getElementById('subject-progress').innerHTML = SUBJECTS.map(s => {
    const st  = tasks.filter(t => t.subject === s.id);
    const sd  = st.filter(t => t.done).length;
    const sp  = st.length ? Math.round(sd / st.length * 100) : 0;
    return `<div style="margin-bottom:14px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:10px;height:10px;border-radius:50%;background:${s.color}"></div>
          <span style="font-size:13px;font-weight:600">${s.name}</span>
        </div>
        <span style="font-size:12px;color:var(--muted)">${sd} / ${st.length} completed</span>
      </div>
      <div class="prog-bar"><div class="prog-fill" style="width:${sp}%;background:${s.color}"></div></div>
    </div>`;
  }).join('');
}

function parseDateOnly(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDeadlineAlerts(todayStr) {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const today = parseDateOnly(todayStr);

  return tasks
    .filter(t => !t.done)
    .map(t => {
      const due = parseDateOnly(t.due);
      const diffDays = Math.round((due - today) / DAY_MS);
      return { task: t, diffDays };
    })
    .filter(({ diffDays }) => diffDays <= 7)
    .sort((a, b) => a.diffDays - b.diffDays)
    .map(({ task, diffDays }) => {
      const s = subjectById(task.subject);
      const subject = s ? s.name : 'General';

      if (diffDays < 0) {
        const d = Math.abs(diffDays);
        return {
          level: 'danger',
          title: task.title,
          subject,
          meta: `${d} day${d > 1 ? 's' : ''} overdue`,
        };
      }

      if (diffDays === 0) {
        return {
          level: 'danger',
          title: task.title,
          subject,
          meta: 'Due today',
        };
      }

      if (diffDays === 1) {
        return {
          level: 'warn',
          title: task.title,
          subject,
          meta: 'Due tomorrow',
        };
      }

      return {
        level: diffDays <= 3 ? 'warn' : 'info',
        title: task.title,
        subject,
        meta: `Due in ${diffDays} days`,
      };
    });
}

function alertItem(a) {
  return `<div class="alert-item">
    <div class="alert-main">
      <div class="alert-title">${a.title}</div>
      <div class="alert-sub">${a.subject}</div>
    </div>
    <span class="alert-badge ${a.level}">${a.meta}</span>
  </div>`;
}

function miniTask(t) {
  const s = subjectById(t.subject);
  return `<div class="task-item">
    <div class="check ${t.done?'done':''}" onclick="toggleDone(${t.id})">
      ${t.done ? checkSVG() : ''}
    </div>
    <div style="flex:1">
      <div class="task-name ${t.done?'done':''}">${t.title}</div>
      <div class="task-meta">Due ${t.due}</div>
    </div>
    ${s ? `<span class="subj-pill" style="background:${s.bg};color:${s.text}">${s.name}</span>` : ''}
  </div>`;
}

// ─── TASKS ────────────────────────────────────────────────────
function renderTasks() {
  const sbtns = document.getElementById('subject-filter-btns');
  sbtns.innerHTML = SUBJECTS.map(s =>
    `<button class="filter-btn ${currentFilter===s.id?'active':''}"
      style="${currentFilter===s.id?'background:'+s.color+';border-color:'+s.color:''}"
      onclick="filterTasks('${s.id}',this)">${s.name}</button>`
  ).join('');

  let visible = [...tasks];
  if      (currentFilter === 'todo') visible = visible.filter(t => !t.done);
  else if (currentFilter === 'done') visible = visible.filter(t => t.done);
  else if (SUBJECTS.find(s => s.id === currentFilter))
    visible = visible.filter(t => t.subject === currentFilter);

  const body = document.getElementById('task-table-body');
  body.innerHTML = visible.map(t => {
    const s = subjectById(t.subject);
    return `<div class="task-row">
      <div class="check ${t.done?'done':''}" onclick="toggleDone(${t.id});renderTasks()">
        ${t.done ? checkSVG() : ''}
      </div>
      <div>
        <div style="font-size:13px;font-weight:500;${t.done?'text-decoration:line-through;color:var(--muted)':''}">${t.title}</div>
      </div>
      <div>${s ? `<span class="subj-pill" style="background:${s.bg};color:${s.text}">${s.name}</span>` : ''}</div>
      <div style="font-size:12px;color:var(--muted)">${t.due}</div>
      <div><span class="badge badge-${t.priority}">${t.priority}</span></div>
      <div>
        <button onclick="deleteTask(${t.id})"
          style="border:none;background:none;color:var(--muted);cursor:pointer;font-size:18px;line-height:1;padding:2px">×</button>
      </div>
    </div>`;
  }).join('') || '<div class="empty" style="padding:28px 0">No tasks found.</div>';
}

function filterTasks(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('active');
    b.style.background = ''; b.style.borderColor = ''; b.style.color = '';
  });
  if (btn) { btn.classList.add('active'); }
  renderTasks();
}

// ─── SUBJECTS ─────────────────────────────────────────────────
function renderSubjects() {
  const grid = document.getElementById('subjects-grid');
  grid.innerHTML = SUBJECTS.map(s => {
    const all     = tasks.filter(t => t.subject === s.id);
    const pending = all.filter(t => !t.done).length;
    const pct     = all.length ? Math.round((all.length - pending) / all.length * 100) : 0;
    return `<div class="subject-card" onclick="filterTasks('${s.id}');goto('tasks')">
      <div class="subject-stripe" style="background:${s.color}"></div>
      <div class="subject-name">${s.name}</div>
      <div class="subject-count">${pending} pending · ${all.length} total</div>
      <div class="prog-bar" style="margin-top:12px">
        <div class="prog-fill" style="background:${s.color};width:${pct}%"></div>
      </div>
    </div>`;
  }).join('') + `<button class="add-subject-card">
    <span style="font-size:26px;line-height:1">+</span>Add subject
  </button>`;
}

// ─── CALENDAR ─────────────────────────────────────────────────
function renderCalendar() {
  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = MONTHS[calMonth] + ' ' + calYear;

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  let html = DAYS.map(d => `<div class="cal-day-header">${d}</div>`).join('');

  const firstDay    = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();

  for (let i = 0; i < firstDay; i++)
    html += `<div class="cal-day other-month"></div>`;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr  = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday  = dateStr === '2026-04-26';
    const dayTasks = tasks.filter(t => t.due === dateStr && !t.done);
    const dots = dayTasks.slice(0,3).map(t => {
      const s = subjectById(t.subject);
      return `<div class="cal-task-dot" style="background:${s?.bg||'#EEF2FF'};color:${s?.text||'#3730A3'}">${t.title}</div>`;
    }).join('');
    html += `<div class="cal-day ${isToday?'today':''}">
      <div class="cal-day-num">${d}</div>
      ${dots}
    </div>`;
  }
  document.getElementById('cal-grid').innerHTML = html;
}

function prevMonth() { if(--calMonth<0){calMonth=11;calYear--;} renderCalendar(); }
function nextMonth() { if(++calMonth>11){calMonth=0;calYear++;} renderCalendar(); }

// ─── MODAL ────────────────────────────────────────────────────
function openModal() {
  document.getElementById('inp-subject').innerHTML =
    SUBJECTS.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  document.getElementById('inp-date').value = '2026-04-26';
  document.getElementById('inp-title').value = '';
  document.getElementById('modal').classList.add('open');
  setTimeout(() => document.getElementById('inp-title').focus(), 50);
}
function closeModal() { document.getElementById('modal').classList.remove('open'); }
function addTask() {
  const title = document.getElementById('inp-title').value.trim();
  if (!title) { document.getElementById('inp-title').style.borderColor='#EF4444'; return; }
  tasks.push({
    id: nextId++,
    title,
    subject:  document.getElementById('inp-subject').value,
    priority: document.getElementById('inp-priority').value,
    due:      document.getElementById('inp-date').value || '2026-04-30',
    done:     false,
  });
  closeModal();
  toast('Task added!');
  renderTasks();
}

// ─── UTILS ────────────────────────────────────────────────────
function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.done = !t.done; renderDashboard(); }
}
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  toast('Task deleted');
  renderTasks();
}
function checkSVG() {
  return `<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l2.5 2.5L9 1" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2500);
}

document.getElementById('inp-title')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

renderDashboard();
