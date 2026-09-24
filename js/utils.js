/**
 * PriDesk — js/utils.js
 * Helper functions untuk status deadline, format tanggal, dll
 */

function generateId() {
  return 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
}

function sanitizeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  try {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  } catch (e) { return dateStr; }
}

function formatDateIndonesian(dateStr) {
  if (!dateStr) return '—';
  try {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    var opts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString('id-ID', opts);
  } catch (e) { return dateStr; }
}

function getDeadlineStatus(deadlineStr, completed) {
  if (completed) {
    return { label: 'Selesai', emoji: '✅', colorClass: 'status-done', isOverdue: false, isToday: false, isNear: false };
  }
  if (!deadlineStr) {
    return { label: 'Tanpa Deadline', emoji: '📋', colorClass: 'status-none', isOverdue: false, isToday: false, isNear: false };
  }

  var now = new Date();
  var d = new Date(deadlineStr);
  if (isNaN(d.getTime())) {
    return { label: 'Tanpa Deadline', emoji: '📋', colorClass: 'status-none', isOverdue: false, isToday: false, isNear: false };
  }

  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var diffDays = Math.round((targetDay - today) / (1000 * 60 * 60 * 24));

  // ⚡ FIX: cek jam-menit duluan — kalau udah lewat, itu TERLAMBAT
  if (d < now) {
    return { label: 'Terlambat', emoji: '🔴', colorClass: 'status-overdue', isOverdue: true, isToday: false, isNear: false };
  }

  // Deadline masih di masa depan (jam belum lewat)
  if (diffDays === 0) {
    return { label: 'Hari Ini', emoji: '🟠', colorClass: 'status-today', isOverdue: false, isToday: true, isNear: false };
  }
  if (diffDays <= 3) {
    return { label: 'Mulai Dekat', emoji: '🟡', colorClass: 'status-near', isOverdue: false, isToday: false, isNear: true };
  }
  return { label: 'Masih Lama', emoji: '🟢', colorClass: 'status-far', isOverdue: false, isToday: false, isNear: false };
}

function getTodayTasks(tasks) {
  var now = new Date();
  var endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  return tasks.filter(function (t) {
    if (t.completed || !t.deadline) return false;
    return new Date(t.deadline) <= endToday;
  });
}

function getCompletedTasks(tasks) {
  return tasks.filter(function (t) { return t.completed; });
}

function sortTasks(tasks) {
  return tasks.slice().sort(function (a, b) {
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline) - new Date(b.deadline);
  });
}

function filterTasks(tasks, filters) {
  var list = tasks.slice();
  if (filters.search) {
    var q = filters.search.toLowerCase();
    list = list.filter(function (t) {
      return (t.title || '').toLowerCase().indexOf(q) !== -1 ||
             (t.course || '').toLowerCase().indexOf(q) !== -1 ||
             (t.description || '').toLowerCase().indexOf(q) !== -1;
    });
  }
  if (filters.status === 'active') list = list.filter(function (t) { return !t.completed; });
  if (filters.status === 'completed') list = list.filter(function (t) { return t.completed; });
  if (filters.deadline === 'overdue') {
    list = list.filter(function (t) {
      var s = getDeadlineStatus(t.deadline, t.completed);
      return s.isOverdue;
    });
  }
  if (filters.deadline === 'today') {
    list = list.filter(function (t) {
      var s = getDeadlineStatus(t.deadline, t.completed);
      return s.isToday;
    });
  }
  return list;
}

function calculateStats(tasks) {
  var total = tasks.length;
  var completed = tasks.filter(function (t) { return t.completed; }).length;
  var active = total - completed;
  var overdue = tasks.filter(function (t) {
    var s = getDeadlineStatus(t.deadline, t.completed);
    return s.isOverdue;
  }).length;
  var progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Upcoming: 5 tugas terdekat
  var upcoming = sortTasks(tasks.filter(function (t) { return !t.completed && t.deadline; })).slice(0, 5);

  // Courses: group by course
  var courseMap = {};
  tasks.forEach(function (t) {
    var c = (t.course || '').trim();
    if (!c) return;
    if (!courseMap[c]) courseMap[c] = { name: c, total: 0, completed: 0 };
    courseMap[c].total++;
    if (t.completed) courseMap[c].completed++;
  });
  var courses = Object.keys(courseMap).map(function (k) { return courseMap[k]; });

  return { total: total, active: active, completed: completed, overdue: overdue, progress: progress, upcoming: upcoming, courses: courses };
}

function getTimeRemaining(deadlineStr) {
  if (!deadlineStr) return null;
  var d = new Date(deadlineStr);
  if (isNaN(d.getTime())) return null;

  var now = new Date();
  var diff = d - now;
  var isLate = diff < 0;
  diff = Math.abs(diff);

  var days = Math.floor(diff / (1000 * 60 * 60 * 24));
  var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  var parts = [];
  if (days > 0) parts.push(days + ' hari');
  if (hours > 0) parts.push(hours + ' jam');
  if (minutes > 0 && days === 0) parts.push(minutes + ' menit');

  var text = parts.length > 0 ? parts.join(' ') : 'kurang dari 1 menit';

  return {
    text: text,
    isLate: isLate,
    label: isLate ? 'Terlambat ' + text + ' yang lalu' : 'Sisa ' + text
  };
}