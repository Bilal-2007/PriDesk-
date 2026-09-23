/**
 * PriDesk — js/storage.js
 * Semua fungsi return array baru (immutable), sesuai app.js
 * TIDAK ADA sample data.
 */

var STORAGE_KEY = "pridesk_tasks";

/* ---------- LOAD / SAVE ---------- */
function loadTasks() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === "null" || raw === "undefined") return [];
    var parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[storage] Gagal baca:", e);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.isArray(tasks) ? tasks : []));
    return true;
  } catch (e) {
    console.error("[storage] Gagal simpan:", e);
    return false;
  }
}

/* ---------- CRUD (return array baru) ---------- */
function addTask(tasks, data) {
  var now = new Date().toISOString();
  var newTask = {
    id: (typeof generateId === 'function') ? generateId() : ('task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)),
    title: String(data.title || '').trim(),
    course: String(data.course || '').trim(),
    description: String(data.description || '').trim(),
    deadline: data.deadline || '',
    completed: false,
    createdAt: now,
    updatedAt: now,
    completedAt: null
  };
  var list = Array.isArray(tasks) ? tasks.slice() : [];
  list.push(newTask);
  saveTasks(list);
  return list;
}

function updateTask(tasks, id, updates) {
  var list = Array.isArray(tasks) ? tasks.slice() : [];
  var idx = -1;
  for (var i = 0; i < list.length; i++) { if (list[i].id === id) { idx = i; break; } }
  if (idx === -1) return list;

  var merged = Object.assign({}, list[idx], updates || {});
  merged.updatedAt = new Date().toISOString();

  // Kalau completed berubah, set completedAt
  if (typeof updates.completed === 'boolean') {
    merged.completedAt = updates.completed ? new Date().toISOString() : null;
  }

  list[idx] = merged;
  saveTasks(list);
  return list;
}

function deleteTask(tasks, id) {
  var list = (Array.isArray(tasks) ? tasks : []).filter(function (t) { return t.id !== id; });
  saveTasks(list);
  return list;
}

function duplicateTask(tasks, id) {
  var list = Array.isArray(tasks) ? tasks.slice() : [];
  var found = null;
  for (var i = 0; i < list.length; i++) { if (list[i].id === id) { found = list[i]; break; } }
  if (!found) return list;

  var now = new Date().toISOString();
  var copy = Object.assign({}, found, {
    id: (typeof generateId === 'function') ? generateId() : ('task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8)),
    title: found.title + ' (Copy)',
    completed: false,
    completedAt: null,
    createdAt: now,
    updatedAt: now
  });
  list.push(copy);
  saveTasks(list);
  return list;
}

function resetAllData() {
  saveTasks([]);
  return [];
}

/* ---------- EXPORT / IMPORT ---------- */
function exportData(tasks) {
  var data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks: Array.isArray(tasks) ? tasks : loadTasks()
  };
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "pridesk-backup-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(file) {
  return new Promise(function (resolve, reject) {
    if (!file) return reject(new Error("File tidak valid"));
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        var parsed = JSON.parse(ev.target.result);
        var incoming = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.tasks) ? parsed.tasks : null);
        if (!incoming) return reject(new Error("Format JSON tidak dikenali"));

        // Merge dengan data yang ada (hindari duplikat by id)
        var current = loadTasks();
        var map = {};
        for (var i = 0; i < current.length; i++) { map[current[i].id] = current[i]; }
        for (var j = 0; j < incoming.length; j++) {
          if (incoming[j] && incoming[j].id) map[incoming[j].id] = incoming[j];
        }
        var merged = Object.keys(map).map(function (k) { return map[k]; });
        saveTasks(merged);
        resolve(merged);
      } catch (err) { reject(err); }
    };
    reader.onerror = function () { reject(new Error("Gagal baca file")); };
    reader.readAsText(file);
  });
}