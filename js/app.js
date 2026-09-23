/**
 * PriDesk — app.js
 * Inisialisasi state, event listeners, dan logika multi-halaman HTML
 */

const AppState = {
  tasks: [],
  currentPage: 'dashboard',
  filters: { search: '', status: 'all', deadline: 'all' },
  calendarDate: new Date(),
  autoRefreshInterval: null,
};

function renderCurrentPageContent() {
  const { tasks, currentPage, calendarDate } = AppState;
  switch (currentPage) {
    case 'dashboard': initDashboard(); break;
    case 'all': renderAllTasksPage(); break;
    case 'today': renderTodayPage(); break;
    case 'overdue': renderOverduePage(); break;
    case 'calendar': renderCalendar(tasks, calendarDate); break;
    case 'done': renderDonePage(); break;
  }
  updateSidebarBadges(tasks);
}

function initDashboard() {
  const { tasks } = AppState;
  const stats = calculateStats(tasks);
  const todayTasks = sortTasks(getTodayTasks(tasks));
  updateDashboardStats(stats, tasks, todayTasks);
}

function refreshDashboard() {
  if (AppState.currentPage === 'dashboard') initDashboard();
  updateSidebarBadges(AppState.tasks);
}

function renderAllTasksPage() {
  const { tasks, filters } = AppState;
  let filtered = filterTasks(tasks, filters);
  const active = filtered.filter(t => !t.completed);
  const done = filtered.filter(t => t.completed);
  const sorted = [...sortTasks(active), ...sortTasks(done)];
  renderTaskList(sorted, 'allTasksList', 'Tidak ada tugas yang cocok dengan filter.');
  const countEl = document.getElementById('allTasksCount');
  if (countEl) countEl.textContent = `${sorted.length} tugas`;
}

function renderTodayPage() {
  const { tasks } = AppState;
  const todayTasks = sortTasks(getTodayTasks(tasks));
  renderTaskList(todayTasks, 'todayTasksList', 'Tidak ada tugas untuk hari ini. Kerja bagus!');
  const totalCount = document.getElementById('todayTotalCount');
  const activeCount = document.getElementById('todayActiveCount');
  const doneCount = document.getElementById('todayDoneCount');
  if (totalCount) totalCount.textContent = todayTasks.length;
  if (activeCount) activeCount.textContent = todayTasks.filter(t => !t.completed).length;
  if (doneCount) doneCount.textContent = todayTasks.filter(t => t.completed).length;
  const dateEl = document.getElementById('todayDate');
  if (dateEl) {
    const now = new Date();
    const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try { dateEl.textContent = now.toLocaleDateString('id-ID', opts); } catch (e) { dateEl.textContent = now.toDateString(); }
  }
}

function renderOverduePage() {
  const { tasks } = AppState;
  const overdueTasks = sortTasks(tasks.filter(task => {
    return getDeadlineStatus(task.deadline, task.completed).isOverdue;
  }));
  renderTaskList(overdueTasks, 'overdueTasksList', 'Tidak ada tugas yang terlambat. Kerja bagus!');
  const countEl = document.getElementById('overdueTasksCount');
  if (countEl) countEl.textContent = `${overdueTasks.length} tugas`;
  const alertCountEl = document.getElementById('overdueAlertCount');
  if (alertCountEl) alertCountEl.textContent = overdueTasks.length;
}

function renderDonePage() {
  const { tasks } = AppState;
  const doneTasks = getCompletedTasks(tasks).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
  renderTaskList(doneTasks, 'doneTasksList', 'Belum ada tugas yang diselesaikan.');
  const countEl = document.getElementById('doneTasksCount');
  if (countEl) countEl.textContent = `${doneTasks.length} tugas selesai`;
}

function handleAddTaskClick() { openTaskModal(null); }

function handleEditTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  if (task) openTaskModal(task);
}

function handleDuplicateTask(taskId) {
  AppState.tasks = duplicateTask(AppState.tasks, taskId);
  renderCurrentPageContent();
  refreshDashboard();
  showToast('Tugas berhasil diduplikasi.', 'success');
}

function handleDeleteTask(taskId) {
  const task = AppState.tasks.find(t => t.id === taskId);
  openConfirmModal('Hapus Tugas?', `Yakin ingin menghapus "${task ? task.title : 'tugas ini'}"?`, () => {
    AppState.tasks = deleteTask(AppState.tasks, taskId);
    renderCurrentPageContent();
    refreshDashboard();
    showToast('Tugas berhasil dihapus.', 'success');
  });
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  const taskId = document.getElementById('taskId').value;
  const title = document.getElementById('fieldTitle').value.trim();
  const course = document.getElementById('fieldCourse').value.trim();
  const description = document.getElementById('fieldDescription').value.trim();
  const deadline = document.getElementById('fieldDeadline').value;

  if (!title) {
    showToast('Judul tugas tidak boleh kosong.', 'error');
    document.getElementById('fieldTitle').focus();
    return;
  }

  if (taskId) {
    AppState.tasks = updateTask(AppState.tasks, taskId, { title, course, description, deadline });
  } else {
    AppState.tasks = addTask(AppState.tasks, { title, course, description, deadline });
  }

  closeTaskModal();
  renderCurrentPageContent();
  refreshDashboard();
  showToast(taskId ? 'Tugas diperbarui.' : 'Tugas ditambahkan.', 'success');
}

function handleToggleComplete(taskId, completed) {
  AppState.tasks = updateTask(AppState.tasks, taskId, { completed });
  renderCurrentPageContent();
  refreshDashboard();
  showToast(completed ? 'Tugas ditandai selesai! 🎉' : 'Tugas dikembalikan ke aktif.', 'success');
}

function handleSearchChange(value) { AppState.filters.search = value; renderCurrentPageContent(); }
function handleFilterChange(key, value) { AppState.filters[key] = value; renderCurrentPageContent(); }

function handleResetFilters() {
  AppState.filters = { search: '', status: 'all', deadline: 'all' };
  const searchInput = document.getElementById('searchInput');
  const filterStatus = document.getElementById('filterStatus');
  const filterDeadline = document.getElementById('filterDeadline');
  if (searchInput) searchInput.value = '';
  if (filterStatus) filterStatus.value = 'all';
  if (filterDeadline) filterDeadline.value = 'all';
  renderCurrentPageContent();
}

function handleExportData() {
  if (AppState.tasks.length === 0) { showToast('Tidak ada data untuk diekspor.', 'info'); return; }
  exportData(AppState.tasks);
  showToast(`${AppState.tasks.length} tugas berhasil diekspor.`, 'success');
}

function handleImportData(e) {
  const file = e.target.files[0];
  if (!file) return;
  e.target.value = '';
  importData(file)
    .then(importedTasks => {
      AppState.tasks = importedTasks;
      renderCurrentPageContent();
      refreshDashboard();
      showToast(`${importedTasks.length} tugas berhasil diimpor.`, 'success');
    })
    .catch(err => { showToast('Gagal mengimpor: ' + err.message, 'error'); });
}

function handleResetAllData() {
  openConfirmModal('Reset Seluruh Data?', 'Semua tugas akan dihapus permanen.', () => {
    AppState.tasks = resetAllData();
    renderCurrentPageContent();
    refreshDashboard();
    showToast('Semua data telah direset.', 'info');
  });
}

function navigateCalendar(direction) {
  const d = AppState.calendarDate;
  AppState.calendarDate = new Date(d.getFullYear(), d.getMonth() + direction, 1);
  renderCalendar(AppState.tasks, AppState.calendarDate);
}

function handleCalendarDayClick(key, day) {
  const [year, month] = key.split('-').map(Number);
  const dayTasks = AppState.tasks.filter(t => {
    if (!t.deadline) return false;
    const d = new Date(t.deadline);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
  });

  const panel = document.getElementById('calendarTaskPanel');
  const panelTitle = document.getElementById('calendarPanelTitle');
  if (!panel || !panelTitle) return;

  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

  panelTitle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> Tugas ${day} ${months[month]} ${year}`;

  if (dayTasks.length === 0) {
    panel.innerHTML = `
      <div class="empty-state-premium" style="padding:40px 20px;text-align:center;">
        <div class="empty-icon" style="width:72px;height:72px;margin:0 auto 16px;border-radius:20px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#d1fae5,#a7f3d0);color:#059669;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h4 style="font-size:1rem;font-weight:800;color:#0f172a;margin-bottom:6px;">Tidak ada tugas 🎉</h4>
        <p style="font-size:0.82rem;color:#64748b;font-weight:500;line-height:1.5;max-width:240px;margin:0 auto;">
          Selamat belajar! Nikmati waktu luangmu atau tambahkan tugas baru.
        </p>
      </div>`;
    return;
  }

  const sorted = sortTasks(dayTasks);
  panel.innerHTML = sorted.map(t => renderTaskCard(t)).join('');
}

function startDeadlineAutoUpdate() {
  if (AppState.autoRefreshInterval) clearInterval(AppState.autoRefreshInterval);
  AppState.autoRefreshInterval = setInterval(() => renderCurrentPageContent(), 30 * 1000);
}

function stopDeadlineAutoUpdate() {
  if (AppState.autoRefreshInterval) {
    clearInterval(AppState.autoRefreshInterval);
    AppState.autoRefreshInterval = null;
  }
}

// Expose ke global untuk modal detail
window.handleEditTask = handleEditTask;
window.handleDeleteTask = handleDeleteTask;
window.handleToggleComplete = handleToggleComplete;

/* =========================================================
   INIT EVENT LISTENERS
   ========================================================= */
function initEventListeners() {
  var taskForm = document.getElementById('taskForm');
  if (taskForm) taskForm.addEventListener('submit', handleTaskFormSubmit);

  var closeModalBtn = document.getElementById('closeModalBtn');
  var cancelModalBtn = document.getElementById('cancelModalBtn');
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeTaskModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeTaskModal);

  var taskModal = document.getElementById('taskModal');
  if (taskModal) taskModal.addEventListener('click', function (e) {
    if (e.target === taskModal) closeTaskModal();
  });

  var confirmCancelBtn = document.getElementById('confirmCancelBtn');
  if (confirmCancelBtn) confirmCancelBtn.addEventListener('click', closeConfirmModal);

  var confirmModal = document.getElementById('confirmModal');
  if (confirmModal) confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) closeConfirmModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeTaskModal();
      closeConfirmModal();
      closeMobileSidebar();
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.classList.contains('task-complete-checkbox')) {
      handleToggleComplete(e.target.dataset.id, e.target.checked);
    }
  });

  var searchInput = document.getElementById('searchInput');
  if (searchInput) searchInput.addEventListener('input', function (e) {
    handleSearchChange(e.target.value);
  });

  var filterStatus = document.getElementById('filterStatus');
  var filterDeadline = document.getElementById('filterDeadline');
  if (filterStatus) filterStatus.addEventListener('change', function (e) {
    handleFilterChange('status', e.target.value);
  });
  if (filterDeadline) filterDeadline.addEventListener('change', function (e) {
    handleFilterChange('deadline', e.target.value);
  });

  var resetFilterBtn = document.getElementById('resetFilterBtn');
  if (resetFilterBtn) resetFilterBtn.addEventListener('click', handleResetFilters);

  var exportBtn = document.getElementById('exportBtn');
  var importBtn = document.getElementById('importBtn');
  var importFileInput = document.getElementById('importFileInput');
  var resetDataBtn = document.getElementById('resetDataBtn');
  if (exportBtn) exportBtn.addEventListener('click', handleExportData);
  if (importFileInput) importFileInput.addEventListener('change', handleImportData);
  if (importBtn) importBtn.addEventListener('click', function () {
    if (importFileInput) importFileInput.click();
  });
  if (resetDataBtn) resetDataBtn.addEventListener('click', handleResetAllData);

  var calTodayBtn = document.getElementById('calTodayBtn');
  var calPrevBtn = document.getElementById('calPrevBtn');
  var calNextBtn = document.getElementById('calNextBtn');
  if (calTodayBtn) calTodayBtn.addEventListener('click', function () {
    AppState.calendarDate = new Date();
    renderCalendar(AppState.tasks, AppState.calendarDate);
  });
  if (calPrevBtn) calPrevBtn.addEventListener('click', function () { navigateCalendar(-1); });
  if (calNextBtn) calNextBtn.addEventListener('click', function () { navigateCalendar(1); });

  /* =========================================================
     MOBILE SIDEBAR
     ========================================================= */
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var mobileOverlay = document.getElementById('mobileOverlay');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var sb = document.getElementById('sidebar');
      var isOpen = sb && sb.classList.contains('mobile-open');
      if (isOpen) closeMobileSidebar();
      else openMobileSidebar();
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      closeMobileSidebar();
    });
  }

  var sidebarLinks = document.querySelectorAll('#sidebar a');
  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      setTimeout(closeMobileSidebar, 100);
    });
  });

  /* =========================================================
     EVENT DELEGATION — Tombol [data-action]
     ========================================================= */
  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-action]');
    if (!target) return;
    var action = target.dataset.action;
    var taskId = target.dataset.id;
    switch (action) {
      case 'add-task': handleAddTaskClick(); break;
      case 'edit-task': if (taskId) handleEditTask(taskId); break;
      case 'duplicate-task': if (taskId) handleDuplicateTask(taskId); break;
      case 'delete-task': if (taskId) handleDeleteTask(taskId); break;
      case 'calendar-day-click': {
        var key = target.dataset.key, day = target.dataset.day;
        if (key && day) handleCalendarDayClick(key, parseInt(day));
      } break;
    }
  });
}

/* =========================================================
   INIT FLATPICKR
   ========================================================= */
function initFlatpickr() {
  const el = document.getElementById('fieldDeadline');
  if (!el) return;
  if (typeof flatpickr === 'undefined') {
    console.warn('Flatpickr tidak dimuat. Fallback ke input datetime-local.');
    el.type = 'datetime-local';
    el.removeAttribute('readonly');
    return;
  }
  flatpickr(el, {
    enableTime: true,
    dateFormat: 'Y-m-d H:i',
    time_24hr: true,
    locale: {
      weekdays: { shorthand: ['Min','Sen','Sel','Rab','Kam','Jum','Sab'], longhand: ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'] },
      months: { shorthand: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'], longhand: ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'] }
    },
    disableMobile: false
  });
}

/* =========================================================
   INIT APP
   ========================================================= */
function initApp() {
  AppState.tasks = loadTasks();
  AppState.currentPage = document.body.dataset.page || 'dashboard';
  initFlatpickr();
  initEventListeners();
  renderCurrentPageContent();
  startDeadlineAutoUpdate();
}

window.addEventListener('beforeunload', () => { stopDeadlineAutoUpdate(); });
document.addEventListener('DOMContentLoaded', initApp);