const STORAGE_KEY = 'habitpulse_dashboard_v2';
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Default Starter Habits
const DEFAULT_HABITS = [
  {
    id: 'h1',
    name: 'Practice C / Java Coding',
    category: 'Coding',
    icon: '💻',
    color: '#6366f1',
    days: [true, true, true, false, true, true, false]
  },
  {
    id: 'h2',
    name: 'Data Science Lecture & Notes',
    category: 'Academics',
    icon: '📊',
    color: '#06b6d4',
    days: [true, true, true, true, false, true, false]
  },
  {
    id: 'h3',
    name: 'Daily Graphite Sketching',
    category: 'Creative',
    icon: '🎨',
    color: '#ec4899',
    days: [false, true, true, true, true, false, true]
  },
  {
    id: 'h4',
    name: 'Read 15 Pages (Non-Fiction)',
    category: 'Mind & Growth',
    icon: '📖',
    color: '#f59e0b',
    days: [true, false, true, true, true, true, true]
  },
  {
    id: 'h5',
    name: 'Spoken English Practice',
    category: 'Mind & Growth',
    icon: '🗣️',
    color: '#8b5cf6',
    days: [true, true, false, true, true, false, false]
  },
  {
    id: 'h6',
    name: '25m Mobility & Core Workout',
    category: 'Fitness',
    icon: '🏋️',
    color: '#10b981',
    days: [true, true, true, false, true, false, false]
  }
];

// Application State
let habits = [];
let activeCategory = 'All';
let selectedDayIndex = 2; // Default to Wednesday
let isManageMode = false;
let selectedHabitIds = new Set();
let selectedColor = '#6366f1';
let lastDeletedBackup = null;
let undoTimeoutId = null;

// DOM Elements
const habitTableBody = document.getElementById('habitTableBody');
const tableWrapper = document.getElementById('tableWrapper');
const emptyState = document.getElementById('emptyState');
const weeklyBarChart = document.getElementById('weeklyBarChart');
const categoryBreakdownList = document.getElementById('categoryBreakdownList');
const manageModeBtn = document.getElementById('manageModeBtn');
const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
const selectedCountSpan = document.getElementById('selectedCount');
const selectAllTh = document.getElementById('selectAllTh');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const undoToast = document.getElementById('undoToast');
const undoToastMessage = document.getElementById('undoToastMessage');

// Initialize App
function initApp() {
  loadState();
  bindEvents();
  renderAll();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      habits = JSON.parse(saved);
    } catch (e) {
      habits = structuredClone(DEFAULT_HABITS);
    }
  } else {
    habits = structuredClone(DEFAULT_HABITS);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

// Calculate current active streak for a habit row
function calculateStreak(daysArray) {
  let currentStreak = 0;
  let maxStreak = 0;
  for (let i = 0; i < daysArray.length; i++) {
    if (daysArray[i]) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }
  return maxStreak;
}

// Render Entire Dashboard
function renderAll() {
  renderTable();
  renderKPIs();
  renderWeeklyChart();
  renderCategoryMastery();
  updateDayHeaderHighlight();
}

// Render 7-Day Habit Matrix Table
function renderTable() {
  const filteredHabits = activeCategory === 'All'
    ? habits
    : habits.filter(h => h.category === activeCategory);

  if (habits.length === 0) {
    tableWrapper.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  } else {
    tableWrapper.classList.remove('hidden');
    emptyState.classList.add('hidden');
  }

  habitTableBody.innerHTML = '';
  habitTableBody.classList.toggle('manage-active', isManageMode);
  selectAllTh.classList.toggle('hidden', !isManageMode);

  filteredHabits.forEach(habit => {
    const tr = document.createElement('tr');
    const streak = calculateStreak(habit.days);
    const isCheckedForDelete = selectedHabitIds.has(habit.id);

    // Bulk checkbox cell
    const selectTd = document.createElement('td');
    selectTd.className = `select-col ${isManageMode ? '' : 'hidden'}`;
    selectTd.innerHTML = `
      <input type="checkbox" class="row-select-cb" data-id="${habit.id}" ${isCheckedForDelete ? 'checked' : ''} />
    `;
    tr.appendChild(selectTd);

    // Habit Title & Category cell
    const infoTd = document.createElement('td');
    infoTd.innerHTML = `
      <div class="habit-info-cell">
        <div class="habit-icon" style="background:${habit.color}22; color:${habit.color}">
          ${habit.icon}
        </div>
        <div>
          <span class="habit-title">${escapeHTML(habit.name)}</span>
          <span class="habit-cat-tag">${escapeHTML(habit.category)}</span>
        </div>
      </div>
    `;
    tr.appendChild(infoTd);

    // 7 Day Check Buttons
    habit.days.forEach((done, dayIdx) => {
      const td = document.createElement('td');
      const btn = document.createElement('button');
      btn.className = `check-btn ${done ? 'completed' : ''}`;
      if (done) {
        btn.style.backgroundColor = habit.color;
      }
      btn.innerHTML = '✓';
      btn.title = `${habit.name} - ${DAYS[dayIdx]}`;
      btn.addEventListener('click', () => toggleHabitDay(habit.id, dayIdx));
      td.appendChild(btn);
      tr.appendChild(td);
    });

    // Streak column
    const streakTd = document.createElement('td');
    streakTd.innerHTML = `
      <span class="streak-pill ${streak >= 3 ? 'hot' : ''}">
        🔥 ${streak}d
      </span>
    `;
    tr.appendChild(streakTd);

    // Remove Button column
    const removeTd = document.createElement('td');
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-habit-btn';
    removeBtn.title = `Remove "${habit.name}"`;
    removeBtn.innerHTML = '🗑️';
    removeBtn.addEventListener('click', () => removeSingleHabit(habit.id));
    removeTd.appendChild(removeBtn);
    tr.appendChild(removeTd);

    habitTableBody.appendChild(tr);
  });

  // Bind row checkboxes for bulk delete
  document.querySelectorAll('.row-select-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      if (e.target.checked) {
        selectedHabitIds.add(id);
      } else {
        selectedHabitIds.delete(id);
      }
      updateBulkDeleteUI();
    });
  });

  updateBulkDeleteUI();
}

// Toggle completion state for a habit on a specific day
function toggleHabitDay(habitId, dayIdx) {
  const habit = habits.find(h => h.id === habitId);
  if (!habit) return;

  habit.days[dayIdx] = !habit.days[dayIdx];
  selectedDayIndex = dayIdx;
  saveState();
  renderAll();
}

// Remove a single habit with Undo support
function removeSingleHabit(habitId) {
  const index = habits.findIndex(h => h.id === habitId);
  if (index === -1) return;

  const removedHabit = habits[index];
  lastDeletedBackup = [{ habit: structuredClone(removedHabit), index }];

  habits.splice(index, 1);
  selectedHabitIds.delete(habitId);
  saveState();
  renderAll();
  showUndoToast(`Removed "${removedHabit.name}"`);
}

// Remove multiple selected habits in Manage Mode
function removeSelectedHabits() {
  if (selectedHabitIds.size === 0) return;

  lastDeletedBackup = [];
  habits.forEach((h, idx) => {
    if (selectedHabitIds.has(h.id)) {
      lastDeletedBackup.push({ habit: structuredClone(h), index: idx });
    }
  });

  const count = selectedHabitIds.size;
  habits = habits.filter(h => !selectedHabitIds.has(h.id));
  selectedHabitIds.clear();
  selectAllCheckbox.checked = false;

  saveState();
  renderAll();
  showUndoToast(`Removed ${count} habit${count > 1 ? 's' : ''}`);
}

// Undo last deletion
function undoLastDelete() {
  if (!lastDeletedBackup || lastDeletedBackup.length === 0) return;

  lastDeletedBackup
    .sort((a, b) => a.index - b.index)
    .forEach(item => {
      habits.splice(item.index, 0, item.habit);
    });

  lastDeletedBackup = null;
  undoToast.classList.add('hidden');
  saveState();
  renderAll();
}

function showUndoToast(msg) {
  undoToastMessage.textContent = msg;
  undoToast.classList.remove('hidden');

  if (undoTimeoutId) clearTimeout(undoTimeoutId);
  undoTimeoutId = setTimeout(() => {
    undoToast.classList.add('hidden');
  }, 5500);
}

function updateBulkDeleteUI() {
  const count = selectedHabitIds.size;
  selectedCountSpan.textContent = count;
  if (isManageMode && count > 0) {
    deleteSelectedBtn.classList.remove('hidden');
  } else {
    deleteSelectedBtn.classList.add('hidden');
  }
}

// Update KPI summary cards
function renderKPIs() {
  const totalPossible = habits.length * 7;
  let totalCompleted = 0;
  let topStreak = 0;
  let topHabitName = 'No active streaks';

  habits.forEach(h => {
    const doneCount = h.days.filter(Boolean).length;
    totalCompleted += doneCount;

    const st = calculateStreak(h.days);
    if (st > topStreak) {
      topStreak = st;
      topHabitName = h.name;
    }
  });

  const pct = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  document.getElementById('kpiWeeklyScore').textContent = `${pct}%`;
  document.getElementById('kpiTasksCompleted').textContent = `${totalCompleted} / ${totalPossible} check-ins`;

  // Update SVG ring (r=26 => circumference = 163.36)
  const circumference = 163.36;
  const offset = circumference - (pct / 100) * circumference;
  document.getElementById('scoreRingCircle').style.strokeDashoffset = offset;

  document.getElementById('kpiTopStreak').textContent = `${topStreak} Day${topStreak === 1 ? '' : 's'}`;
  document.getElementById('kpiTopHabitName').textContent = topHabitName;

  // Selected Day Progress
  const completedOnDay = habits.filter(h => h.days[selectedDayIndex]).length;
  document.getElementById('selectedDayLabel').textContent = DAYS[selectedDayIndex];
  document.getElementById('kpiTodayCount').textContent = `${completedOnDay} / ${habits.length}`;
  document.getElementById('chartActiveDayBadge').textContent = `Inspecting: ${DAYS[selectedDayIndex]}`;
}

// Render 7-Day Bar Chart
function renderWeeklyChart() {
  weeklyBarChart.innerHTML = '';

  DAYS.forEach((dayName, idx) => {
    const doneCount = habits.filter(h => h.days[idx]).length;
    const pct = habits.length > 0 ? Math.round((doneCount / habits.length) * 100) : 0;

    const col = document.createElement('div');
    col.className = `bar-col ${idx === selectedDayIndex ? 'active-day' : ''}`;
    col.innerHTML = `
      <span class="bar-pct">${pct}%</span>
      <div class="bar-track">
        <div class="bar-fill" style="height: ${pct}%"></div>
      </div>
      <span class="bar-day-label">${dayName}</span>
    `;
    col.addEventListener('click', () => {
      selectedDayIndex = idx;
      renderAll();
    });
    weeklyBarChart.appendChild(col);
  });
}

// Render Category Mastery Progress Bars
function renderCategoryMastery() {
  categoryBreakdownList.innerHTML = '';

  if (habits.length === 0) {
    categoryBreakdownList.innerHTML = `<p class="card-sub">No habits logged yet.</p>`;
    return;
  }

  const categories = [...new Set(habits.map(h => h.category))];

  categories.forEach(cat => {
    const catHabits = habits.filter(h => h.category === cat);
    const possible = catHabits.length * 7;
    const completed = catHabits.reduce((acc, h) => acc + h.days.filter(Boolean).length, 0);
    const pct = possible > 0 ? Math.round((completed / possible) * 100) : 0;

    const item = document.createElement('div');
    item.innerHTML = `
      <div class="cat-item-top">
        <span>${escapeHTML(cat)}</span>
        <span>${pct}% (${completed}/${possible})</span>
      </div>
      <div class="cat-progress-bg">
        <div class="cat-progress-fill" style="width: ${pct}%"></div>
      </div>
    `;
    categoryBreakdownList.appendChild(item);
  });
}

function updateDayHeaderHighlight() {
  document.querySelectorAll('.day-th').forEach(th => {
    const dayIdx = Number(th.getAttribute('data-day'));
    th.classList.toggle('selected-day', dayIdx === selectedDayIndex);
  });
}

// Event Listeners
function bindEvents() {
  // Theme Toggle
  document.getElementById('themeToggleBtn').addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    document.getElementById('themeIcon').textContent = next === 'dark' ? '☀️' : '🌙';
  });

  // Restore Sample Habits
  const restoreHandler = () => {
    habits = structuredClone(DEFAULT_HABITS);
    selectedHabitIds.clear();
    saveState();
    renderAll();
  };
  document.getElementById('restoreSampleBtn').addEventListener('click', restoreHandler);
  document.getElementById('emptyRestoreBtn').addEventListener('click', restoreHandler);

  // Manage Mode Toggle
  manageModeBtn.addEventListener('click', () => {
    isManageMode = !isManageMode;
    manageModeBtn.classList.toggle('active-manage', isManageMode);
    manageModeBtn.textContent = isManageMode ? '✓ Done Managing' : '⚙️ Manage Habits';
    if (!isManageMode) {
      selectedHabitIds.clear();
      selectAllCheckbox.checked = false;
    }
    renderTable();
  });

  // Select All Checkbox
  selectAllCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      habits.forEach(h => selectedHabitIds.add(h.id));
    } else {
      selectedHabitIds.clear();
    }
    renderTable();
  });

  // Bulk Delete Button
  deleteSelectedBtn.addEventListener('click', removeSelectedHabits);

  // Undo Toast Button
  document.getElementById('undoDeleteBtn').addEventListener('click', undoLastDelete);

  // Category Filters
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.getAttribute('data-cat');
      renderTable();
    });
  });

  // Day Table Header Inspection
  document.querySelectorAll('.day-th').forEach(th => {
    th.addEventListener('click', () => {
      selectedDayIndex = Number(th.getAttribute('data-day'));
      renderAll();
    });
  });

  // Modal Open/Close
  const modal = document.getElementById('addHabitModal');
  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => modal.classList.add('hidden');

  document.getElementById('openAddModalBtn').addEventListener('click', openModal);
  document.getElementById('emptyAddBtn').addEventListener('click', openModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn').addEventListener('click', closeModal);

  // Color Picker Swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedColor = swatch.getAttribute('data-color');
    });
  });

  // Add Habit Form Submit
  document.getElementById('addHabitForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('habitNameInput');
    const categoryInput = document.getElementById('habitCategoryInput');
    const iconInput = document.getElementById('habitIconInput');

    const newHabit = {
      id: 'h_' + Date.now(),
      name: nameInput.value.trim(),
      category: categoryInput.value,
      icon: iconInput.value,
      color: selectedColor,
      days: [false, false, false, false, false, false, false]
    };

    habits.push(newHabit);
    saveState();
    renderAll();
    nameInput.value = '';
    closeModal();
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[tag]));
}

// Start App
document.addEventListener('DOMContentLoaded', initApp);