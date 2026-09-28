/**
 * PriDesk — js/ui.js
 * Cocok dengan app.js. Semua fungsi yang dipanggil app.js ada di sini.
 */

/* =========================================================
   TOAST
   ========================================================= */
function showToast(message, type, duration) {
  type = type || "success";
  duration = duration || 2500;
  var container = document.getElementById("toastContainer");
  if (!container) return;

  var toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  var safeMsg =
    typeof sanitizeHTML === "function"
      ? sanitizeHTML(message)
      : String(message);
  toast.textContent = safeMsg; // ← cuma teks, tanpa ikon
  container.appendChild(toast);

  setTimeout(function () {
    toast.classList.add("toast-leaving");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, duration);
}

/* =========================================================
   MODAL TASK
   ========================================================= */
function openTaskModal(task) {
  var isEdit = task !== null && task !== undefined;
  var modal = document.getElementById("taskModal");
  var form = document.getElementById("taskForm");
  var modalTitle = document.getElementById("modalTitle");
  var submitBtn = document.getElementById("modalSubmitBtn");
  if (!modal || !form) return;

  form.reset();
  var idField = document.getElementById("taskId");
  if (idField) idField.value = "";
  if (modalTitle)
    modalTitle.textContent = isEdit ? "Edit Tugas" : "Tambah Tugas Baru";
  if (submitBtn)
    submitBtn.textContent = isEdit ? "Simpan Perubahan" : "Tambah Tugas";

  if (isEdit) {
    if (idField) idField.value = task.id;
    var ft = document.getElementById("fieldTitle");
    var fc = document.getElementById("fieldCourse");
    var fd = document.getElementById("fieldDescription");
    if (ft) ft.value = task.title || "";
    if (fc) fc.value = task.course || "";
    if (fd) fd.value = task.description || "";
    var fp = document.getElementById("fieldDeadline");
    if (fp && fp._flatpickr) fp._flatpickr.setDate(task.deadline || "", false);
    else if (fp) fp.value = task.deadline || "";
  } else {
    var fp2 = document.getElementById("fieldDeadline");
    if (fp2 && fp2._flatpickr) fp2._flatpickr.clear();
  }

  // Clear image preview when opening modal (fresh state)
  clearImagePreview();
  // Render image preview section (shows file input; preloads existing image if editing)
  renderImagePreviewSection(isEdit ? task : null);

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(function () {
    var f = document.getElementById("fieldTitle");
    if (f) f.focus();
  }, 100);
}

function closeTaskModal() {
  var modal = document.getElementById("taskModal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}


/* =========================================================
   IMAGE PREVIEW HELPERS (Modal)
   ========================================================= */
function clearImagePreview() {
  var preview = document.getElementById("imagePreviewContainer");
  if (preview) preview.remove();
  var fileInput = document.getElementById("taskImage");
  if (fileInput) {
    fileInput._imageRemoved = true;
    fileInput.value = "";
  }
}

function renderImagePreviewSection(task) {
  var form = document.getElementById("taskForm");
  if (!form) return;

  clearImagePreview();

  // Reset removal flag when modal is opened fresh
  var fi = document.getElementById("taskImage");
  if (fi) fi._imageRemoved = false;

  // ====== Inject CSS sekali saja (idempotent) ======
  if (!document.getElementById("imagePreviewStyles")) {
    var style = document.createElement("style");
    style.id = "imagePreviewStyles";
    style.textContent = `
      /* ==== Wrapper ==== */
      .img-upload-wrap {
        margin-top: 12px;
        animation: imgFadeIn .35s ease both;
      }
      @keyframes imgFadeIn {
        from { opacity: 0; transform: translateY(6px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .img-upload-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 8px;
      }
      .img-upload-label .label-text {
        font-size: 0.7rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #94a3b8;
      }
      .img-upload-label .label-badge {
        font-size: 0.65rem;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 999px;
        background: linear-gradient(135deg, #22d3ee, #0ea5e9);
        color: #04222e;
        box-shadow: 0 4px 12px rgba(14,165,233,.35);
      }

      /* ==== Dropzone ==== */
      .img-dropzone {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 22px 16px;
        border-radius: 16px;
        border: 2px dashed rgba(56,189,248,.45);
        background:
          radial-gradient(circle at 20% 20%, rgba(56,189,248,.10), transparent 55%),
          radial-gradient(circle at 80% 80%, rgba(168,85,247,.10), transparent 55%),
          rgba(15, 23, 42, 0.35);
        cursor: pointer;
        transition: transform .25s ease, border-color .25s ease, background .25s ease, box-shadow .25s ease;
        overflow: hidden;
      }
      .img-dropzone::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.06) 50%, transparent 70%);
        transform: translateX(-100%);
        transition: transform .8s ease;
        pointer-events: none;
      }
      .img-dropzone:hover::before { transform: translateX(100%); }
      .img-dropzone:hover {
        border-color: #38bdf8;
        background:
          radial-gradient(circle at 20% 20%, rgba(56,189,248,.18), transparent 55%),
          radial-gradient(circle at 80% 80%, rgba(168,85,247,.18), transparent 55%),
          rgba(15, 23, 42, 0.5);
        transform: translateY(-2px);
        box-shadow: 0 14px 32px rgba(56,189,248,.18);
      }
      .img-dropzone.is-dragging {
        border-color: #22d3ee;
        background:
          radial-gradient(circle at 50% 50%, rgba(34,211,238,.25), transparent 60%),
          rgba(15, 23, 42, 0.6);
        transform: scale(1.015);
        box-shadow: 0 18px 42px rgba(34,211,238,.35);
      }
      .img-dropzone.has-file {
        padding: 0;
        border-style: solid;
        border-color: rgba(56,189,248,.35);
        cursor: default;
      }

      .img-dropzone .dz-icon {
        font-size: 1.8rem;
        line-height: 1;
        filter: drop-shadow(0 6px 14px rgba(56,189,248,.5));
        animation: dzFloat 3s ease-in-out infinite;
      }
      @keyframes dzFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-4px); }
      }
      .img-dropzone .dz-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: #e2e8f0;
      }
      .img-dropzone .dz-sub {
        font-size: 0.7rem;
        color: #94a3b8;
      }

      .img-file-input { display: none; }

      /* ==== Preview area ==== */
      .image-preview-area {
        margin-top: 12px;
        position: relative;
        border-radius: 16px;
        overflow: hidden;
        animation: previewPop .4s cubic-bezier(.2,.9,.3,1.4) both;
      }
      @keyframes previewPop {
        from { opacity: 0; transform: scale(.94); }
        to   { opacity: 1; transform: scale(1); }
      }

      .image-preview-area img {
        display: block;
        width: 100%;
        max-height: 240px;
        object-fit: cover;
        border-radius: 16px;
        transition: transform .5s ease;
      }
      .image-preview-area:hover img { transform: scale(1.03); }

      .image-preview-overlay {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
        padding: 12px;
        background: linear-gradient(to top, rgba(2,6,23,.85), transparent 55%);
        opacity: 0;
        transition: opacity .3s ease;
        border-radius: 16px;
      }
      .image-preview-area:hover .image-preview-overlay { opacity: 1; }

      .image-preview-meta {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .image-preview-meta .meta-name {
        font-size: 0.75rem;
        font-weight: 700;
        color: #f1f5f9;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 220px;
      }
      .image-preview-meta .meta-size {
        font-size: 0.65rem;
        color: #94a3b8;
      }

      .image-preview-actions {
        display: flex;
        gap: 6px;
      }
      .image-preview-actions button {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,.15);
        background: rgba(15,23,42,.7);
        color: #f1f5f9;
        font-size: 0.85rem;
        cursor: pointer;
        transition: transform .2s ease, background .2s ease, border-color .2s ease;
        backdrop-filter: blur(6px);
      }
      .image-preview-actions button:hover {
        transform: translateY(-2px);
        background: rgba(15,23,42,.95);
      }
      .image-preview-actions .btn-replace:hover { border-color: #38bdf8; color: #38bdf8; }
      .image-preview-actions .btn-remove:hover  { border-color: #ef4444; color: #ef4444; }

      /* ==== Loading skeleton ==== */
      .image-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 26px 16px;
        border-radius: 16px;
        background: rgba(15,23,42,.45);
        border: 1px solid rgba(56,189,248,.2);
      }
      .image-loading .spinner {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 3px solid rgba(56,189,248,.25);
        border-top-color: #38bdf8;
        animation: spin .8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .image-loading span {
        font-size: 0.72rem;
        color: #94a3b8;
        font-weight: 600;
      }

      .hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  // ====== Build wrapper ======
  var container = document.createElement("div");
  container.id = "imagePreviewContainer";
  container.className = "img-upload-wrap";
  container.innerHTML = `
    <div class="img-upload-label">
      <span class="label-text">📎 Lampiran Foto (Opsional)</span>
      <span class="label-badge">Max 5MB</span>
    </div>

    <label class="img-dropzone" id="imageDropzone" for="taskImage">
      <input type="file" id="taskImage" accept="image/*" class="img-file-input">
      <div class="dz-icon">📷</div>
      <div class="dz-title">Klik atau seret foto ke sini</div>
      <div class="dz-sub">JPG · PNG · WebP — otomatis dikompres</div>
    </label>

    <div id="imagePreview" class="image-preview-area hidden"></div>
  `;

  // Insert before action buttons
  var btnDiv = form.querySelector('.flex.items-center.justify-end');
  if (btnDiv) {
    btnDiv.parentNode.insertBefore(container, btnDiv);
  } else {
    form.appendChild(container);
  }

  // ====== Show existing image if editing ======
  if (task && task.image) {
    showImagePreview(task.image, task.imageName || "Foto tersimpan", null);
  }

  // ====== Wire up file input + drag & drop ======
  var fileInput = document.getElementById("taskImage");
  var dropzone  = document.getElementById("imageDropzone");

  function handleFile(file) {
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      showToast("File harus berupa gambar!", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File terlalu besar! Maksimal 5MB.", "error");
      return;
    }

    // Show loading state
    var preview = document.getElementById("imagePreview");
    if (preview) {
      preview.classList.remove("hidden");
      preview.innerHTML =
        '<div class="image-loading">' +
          '<div class="spinner"></div>' +
          '<span>Memproses gambar…</span>' +
        '</div>';
    }

    var reader = new FileReader();
    reader.onload = function (ev) {
      showImagePreview(ev.target.result, file.name, file.size);
    };
    reader.onerror = function () {
      showToast("Gagal membaca file gambar.", "error");
    };
    reader.readAsDataURL(file);
  }

  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      handleFile(e.target.files[0]);
    });
  }

  if (dropzone) {
    ["dragenter", "dragover"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("is-dragging");
      });
    });
    ["dragleave", "drop"].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("is-dragging");
      });
    });
    dropzone.addEventListener("drop", function (e) {
      var file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      handleFile(file);
    });
  }
}

function showImagePreview(src, fileName, fileSize) {
  var preview = document.getElementById("imagePreview");
  var dropzone = document.getElementById("imageDropzone");
  if (!preview) return;

  var sizeText = "";
  if (fileSize && typeof fileSize === "number") {
    sizeText = fileSize > 1024 * 1024
      ? (fileSize / (1024 * 1024)).toFixed(2) + " MB"
      : Math.max(1, Math.round(fileSize / 1024)) + " KB";
  }

  var safeName = (fileName || "foto.jpg")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  preview.classList.remove("hidden");
  preview.innerHTML =
    '<img src="' + src + '" alt="Preview">' +
    '<div class="image-preview-overlay">' +
      '<div class="image-preview-meta">' +
        '<span class="meta-name">' + safeName + '</span>' +
        (sizeText ? '<span class="meta-size">' + sizeText + '</span>' : '') +
      '</div>' +
      '<div class="image-preview-actions">' +
        '<button type="button" class="btn-replace" title="Ganti foto">🔄</button>' +
        '<button type="button" class="btn-remove"  title="Hapus foto">✕</button>' +
      '</div>' +
    '</div>';

  if (dropzone) dropzone.classList.add("has-file");

  var replaceBtn = preview.querySelector(".btn-replace");
  var removeBtn  = preview.querySelector(".btn-remove");
  var fileInput  = document.getElementById("taskImage");

  if (replaceBtn) {
    replaceBtn.addEventListener("click", function () {
      if (fileInput) fileInput.click();
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      if (fileInput) {
        fileInput.value = "";
        fileInput._imageRemoved = true;
      }
      preview.innerHTML = "";
      preview.classList.add("hidden");
      if (dropzone) dropzone.classList.remove("has-file");
      showToast("Foto dihapus.", "success");
    });
  }
}

/* =========================================================
   MODAL KONFIRMASI
   ========================================================= */
function openConfirmModal(title, message, onConfirm) {
  var modal = document.getElementById("confirmModal");
  var titleEl = document.getElementById("confirmTitle");
  var msgEl = document.getElementById("confirmMessage");
  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  var btn = document.getElementById("confirmOkBtn");
  if (btn) {
    var newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener("click", function () {
      if (typeof onConfirm === "function") onConfirm();
      closeConfirmModal();
    });
  }

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeConfirmModal() {
  var modal = document.getElementById("confirmModal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

/* =========================================================
   RENDER TASK CARD
   ========================================================= */
function renderTaskCard(task) {
  var status =
    typeof getDeadlineStatus === "function"
      ? getDeadlineStatus(task.deadline, task.completed)
      : {
          label: "Tanpa Deadline",
          emoji: "📋",
          colorClass: "status-none",
          isOverdue: false,
        };

  var san =
    typeof sanitizeHTML === "function"
      ? sanitizeHTML
      : function (s) {
          return s;
        };
  var fmtFn =
    typeof formatDateShort === "function"
      ? formatDateShort
      : function (d) {
          return d;
        };

  var titleClass = task.completed
    ? "line-through text-slate-400"
    : "text-slate-900";
  var cardClass = task.completed
    ? "task-card completed-card"
    : status.isOverdue
      ? "task-card overdue-card"
      : "task-card";

  var deadlineHtml = task.deadline
    ? '<span class="deadline-badge ' +
      status.colorClass +
      '">' +
      status.emoji +
      " " +
      san(status.label) +
      " · " +
      fmtFn(task.deadline) +
      "</span>"
    : '<span class="deadline-badge status-none">📋 Tanpa Deadline</span>';

  var descHtml = task.description
    ? '<p class="text-xs text-slate-500 mt-1.5 line-clamp-2">' +
      san(task.description) +
      "</p>"
    : "";

  var courseHtml = task.course
    ? '<span class="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">' +
      san(task.course) +
      "</span>"
    : "";

  return (
    '<div class="' +
    cardClass +
    '" data-task-id="' +
    task.id +
    '">' +
    '<div class="flex items-start gap-3">' +
    '<label class="task-checkbox-wrapper mt-0.5">' +
    '<input type="checkbox" class="task-complete-checkbox" data-id="' +
    task.id +
    '"' +
    (task.completed ? " checked" : "") +
    ">" +
    '<div class="task-checkbox-visual"></div>' +
    "</label>" +
    '<div class="flex-1 min-w-0">' +
    '<div class="flex flex-wrap items-start justify-between gap-2">' +
    '<div class="flex-1 min-w-0">' +
    '<h3 class="text-sm font-semibold ' +
    titleClass +
    ' leading-snug break-words">' +
    san(task.title) +
    "</h3>" +
    descHtml +
    (task.image ? '<div class="task-card-image"><img src="' + sanitizeHTML(task.image) + '" alt="Lampiran" loading="lazy" data-task-image-id="' + task.id + '"></div>' : '') +
    "</div>" +
    '<div class="flex items-center gap-0.5 shrink-0 task-actions">' +
    '<button class="btn-icon" data-action="edit-task" data-id="' +
    task.id +
    '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>' +
    '<button class="btn-icon" data-action="duplicate-task" data-id="' +
    task.id +
    '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>' +
    '<button class="btn-icon btn-icon-danger" data-action="delete-task" data-id="' +
    task.id +
    '"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg></button>' +
    "</div>" +
    "</div>" +
    '<div class="flex flex-wrap items-center gap-2 mt-2">' +
    courseHtml +
    deadlineHtml +
    "</div>" +
    "</div>" +
    "</div>" +
    "</div>"
  );
}

/* =========================================================
   RENDER LIST
   ========================================================= */
function renderTaskList(tasks, containerId, emptyMessage) {
  emptyMessage = emptyMessage || "Tidak ada tugas.";
  var container = document.getElementById(containerId);
  if (!container) return;

  if (!tasks || tasks.length === 0) {
    container.innerHTML =
      '<div class="empty-state p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">' +
      '<div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">' +
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>' +
      '<p class="text-sm font-semibold text-slate-700">' +
      emptyMessage +
      "</p></div>";
    return;
  }

  container.innerHTML = tasks.map(renderTaskCard).join("");
}

/* =========================================================
   DASHBOARD STATS (3 parameter sesuai app.js)
   ========================================================= */
function updateDashboardStats(stats, allTasks, todayTasks) {
  if (typeof updateGreeting === "function") updateGreeting();

  var dateEl = document.getElementById("dashboardDate");
  if (dateEl) {
    var now = new Date();
    var opts = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    try {
      dateEl.textContent = now.toLocaleDateString("id-ID", opts);
    } catch (e) {
      dateEl.textContent = now.toDateString();
    }
  }

  var setEl = function (id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  setEl("statTotal", (stats && stats.total) || 0);
  setEl("statActive", (stats && stats.active) || 0);
  setEl("statCompleted", (stats && stats.completed) || 0);
  setEl("statOverdue", (stats && stats.overdue) || 0);

  var progressBar = document.getElementById("progressBarFill");
  var progressLabel = document.getElementById("progressLabel");
  var progressVal = (stats && stats.progress) || 0;
  if (progressBar) progressBar.style.width = progressVal + "%";
  if (progressLabel) progressLabel.textContent = progressVal + "%";

  var allList = Array.isArray(allTasks) ? allTasks : [];
  var todayList = Array.isArray(todayTasks) ? todayTasks : [];
  var upcoming = stats && Array.isArray(stats.upcoming) ? stats.upcoming : [];
  var courses = stats && Array.isArray(stats.courses) ? stats.courses : [];

  // Tugas Hari Ini
  var todayContainer = document.getElementById("dashboardTodayList");
  if (todayContainer) {
    if (todayList.length === 0) {
      todayContainer.innerHTML =
        '<div class="empty-state-mini">Tidak ada tugas untuk hari ini. Nikmati waktu luangmu!</div>';
    } else {
      todayContainer.innerHTML = todayList
        .slice(0, 3)
        .map(renderTaskCard)
        .join("");
    }
  }

  // Tugas Terbaru
  var recentContainer = document.getElementById("dashboardRecentList");
  if (recentContainer) {
    var recent = allList
      .filter(function (t) {
        return !t.completed;
      })
      .sort(function (a, b) {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      })
      .slice(0, 3);
    if (recent.length === 0) {
      recentContainer.innerHTML =
        '<div class="empty-state-mini">Belum ada tugas terbaru.</div>';
    } else {
      recentContainer.innerHTML = recent.map(renderTaskCard).join("");
    }
  }

  // Deadline Terdekat
  var upcomingContainer = document.getElementById("upcomingList");
  if (upcomingContainer) {
    if (upcoming.length === 0) {
      upcomingContainer.innerHTML =
        '<div class="empty-state-mini">Tidak ada deadline terdekat.</div>';
    } else {
      var getDS =
        typeof getDeadlineStatus === "function"
          ? getDeadlineStatus
          : function () {
              return { label: "-", emoji: "", colorClass: "" };
            };
      var san =
        typeof sanitizeHTML === "function"
          ? sanitizeHTML
          : function (s) {
              return s;
            };
      upcomingContainer.innerHTML = upcoming
        .map(function (task) {
          var st = getDS(task.deadline, task.completed);
          return (
            '<div class="upcoming-item">' +
            '<div class="upcoming-info">' +
            '<div class="upcoming-title">' +
            san(task.title) +
            "</div>" +
            '<div class="upcoming-subject">' +
            san(task.course || "Umum") +
            "</div>" +
            "</div>" +
            '<span class="status-badge ' +
            st.colorClass +
            '">' +
            st.emoji +
            " " +
            st.label +
            "</span>" +
            "</div>"
          );
        })
        .join("");
    }
  }

  // Per Mata Kuliah
  var courseContainer = document.getElementById("courseList");
  if (courseContainer) {
    if (courses.length === 0) {
      courseContainer.innerHTML =
        '<div class="empty-state-mini">Belum ada data mata kuliah.</div>';
      return;
    }
    var palette = [
      ["#3b82f6", "#2563eb"],
      ["#8b5cf6", "#6366f1"],
      ["#ec4899", "#db2777"],
      ["#f59e0b", "#d97706"],
      ["#10b981", "#059669"],
      ["#06b6d4", "#0891b2"],
      ["#f43f5e", "#e11d48"],
      ["#84cc16", "#65a30d"],
    ];
    var pickColor = function (n) {
      var h = 0;
      for (var i = 0; i < n.length; i++) h = n.charCodeAt(i) + ((h << 5) - h);
      return palette[Math.abs(h) % palette.length];
    };
    var san2 =
      typeof sanitizeHTML === "function"
        ? sanitizeHTML
        : function (s) {
            return s;
          };

    var sorted = courses.slice().sort(function (a, b) {
      var aHas = (a.total || 0) > 0,
        bHas = (b.total || 0) > 0;
      if (aHas !== bHas) return aHas ? -1 : 1;
      if (aHas && bHas) return (b.total || 0) - (a.total || 0);
      return String(a.name || "").localeCompare(String(b.name || ""), "id");
    });

    courseContainer.innerHTML = sorted
      .map(function (c) {
        var total = c.total || 0,
          done = c.completed || 0;
        var pct = total > 0 ? Math.round((done / total) * 100) : 0;
        var nama = String(c.name || "");
        var initial = (nama.trim().charAt(0) || "?").toUpperCase();
        var col = pickColor(nama);
        return (
          '<div class="course-item ' +
          (total > 0 ? "has-tasks" : "is-empty") +
          '">' +
          '<div class="course-avatar" style="background:linear-gradient(135deg,' +
          col[0] +
          "," +
          col[1] +
          ')">' +
          san2(initial) +
          "</div>" +
          '<div class="course-item-main">' +
          '<div class="course-name">' +
          san2(nama) +
          "</div>" +
          '<div class="course-meta">' +
          (total > 0
            ? total + " tugas · " + done + " selesai"
            : "Belum ada tugas") +
          "</div>" +
          "</div>" +
          '<div class="course-stats">' +
          (total > 0
            ? '<div class="course-progress-mini"><div class="course-progress-mini-fill" style="width:' +
              pct +
              '%"></div></div><span class="course-count-badge">' +
              done +
              "/" +
              total +
              "</span>"
            : '<span class="course-count-empty">KOSONG</span>') +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }
}

/* =========================================================
   GREETING
   ========================================================= */
function updateGreeting() {
  var el = document.getElementById("greetingText");
  if (!el) return;
  var h = new Date().getHours();
  var g = "Selamat Pagi";
  if (h >= 10 && h < 15) g = "Selamat Siang";
  else if (h >= 15 && h < 18) g = "Selamat Sore";
  else if (h >= 18) g = "Selamat Malam";
  el.textContent = g + "! 👋";
}

/* =========================================================
   KALENDER
   ========================================================= */
function renderCalendar(tasks, targetDate) {
  var calTitle = document.getElementById("calendarMonthYear");
  var calGrid = document.getElementById("calendarGrid");
  if (!calGrid) return;

  var year = targetDate.getFullYear();
  var month = targetDate.getMonth();
  var today = new Date();
  var monthNames = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  if (calTitle) calTitle.textContent = monthNames[month] + " " + year;

  var byDate = {};
  (tasks || []).forEach(function (task) {
    if (!task.deadline) return;
    var d = new Date(task.deadline);
    var key = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(task);
  });

  var firstDay = new Date(year, month, 1).getDay();
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var daysInPrev = new Date(year, month, 0).getDate();

  var html = "";
  for (var i = firstDay - 1; i >= 0; i--) {
    html +=
      '<div class="calendar-day other-month"><span class="font-medium text-slate-400">' +
      (daysInPrev - i) +
      "</span></div>";
  }
  for (var d = 1; d <= daysInMonth; d++) {
    var key2 = year + "-" + month + "-" + d;
    var dayTasks = byDate[key2] || [];
    var isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === d;
    var hasTasks = dayTasks.length > 0;
    var dots = dayTasks
      .slice(0, 3)
      .map(function (t) {
        var st =
          typeof getDeadlineStatus === "function"
            ? getDeadlineStatus(t.deadline, t.completed)
            : { isOverdue: false, isToday: false };
        var cls = st.isOverdue ? "high" : st.isToday ? "medium" : "low";
        return '<span class="cal-dot ' + cls + '"></span>';
      })
      .join("");

    // ⚡ FIX: SEMUA tanggal bisa diklik (ada tugas atau tidak)
    var clickAttr =
      'data-action="calendar-day-click" data-key="' +
      key2 +
      '" data-day="' +
      d +
      '"';

    html +=
      '<div class="calendar-day ' +
      (isToday ? "today-marker" : "") +
      " " +
      (hasTasks ? "has-tasks" : "") +
      '" ' +
      clickAttr +
      ">" +
      '<span class="text-xs font-semibold">' +
      d +
      "</span>" +
      '<div class="flex gap-0.5 flex-wrap justify-center mt-1">' +
      dots +
      "</div>" +
      "</div>";
  }
  var totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  var remaining = totalCells - firstDay - daysInMonth;
  for (var k = 1; k <= remaining; k++) {
    html +=
      '<div class="calendar-day other-month"><span class="font-medium text-slate-400">' +
      k +
      "</span></div>";
  }
  calGrid.innerHTML = html;
}

/* =========================================================
   SIDEBAR BADGES
   ========================================================= */
function updateSidebarBadges(tasks) {
  if (!tasks) tasks = [];
  var getDS =
    typeof getDeadlineStatus === "function"
      ? getDeadlineStatus
      : function () {
          return { isToday: false, isOverdue: false };
        };
  var active = tasks.filter(function (t) {
    return !t.completed;
  }).length;
  var today = tasks.filter(function (t) {
    var s = getDS(t.deadline, t.completed);
    return !t.completed && (s.isToday || s.isOverdue);
  }).length;
  var overdue = tasks.filter(function (t) {
    var s = getDS(t.deadline, t.completed);
    return !t.completed && s.isOverdue;
  }).length;
  var completed = tasks.filter(function (t) {
    return t.completed;
  }).length;
  var set = function (id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val > 0 ? val : "";
  };
  set("badgeAll", active);
  set("badgeToday", today);
  set("badgeOverdue", overdue);
  set("badgeDone", completed);
}

/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */
function openMobileSidebar() {
  var sb = document.getElementById("sidebar");
  var ov = document.getElementById("mobileOverlay");
  if (sb) sb.classList.add("mobile-open");
  if (ov) ov.classList.remove("hidden");
  document.body.classList.add("sidebar-is-open");
  document.body.style.overflow = "hidden";
}

function closeMobileSidebar() {
  var sb = document.getElementById("sidebar");
  var ov = document.getElementById("mobileOverlay");
  if (sb) sb.classList.remove("mobile-open");
  if (ov) ov.classList.add("hidden");
  document.body.classList.remove("sidebar-is-open");
  document.body.style.overflow = "";
}

/* =========================================================
   MODAL DETAIL TUGAS
   ========================================================= */
function openTaskDetailModal(taskId) {
  if (!taskId) return;
  var tasks = typeof loadTasks === "function" ? loadTasks() : [];
  var task = tasks.find(function (t) {
    return t.id === taskId;
  });
  if (!task) return;

  var modal = document.getElementById("taskDetailModal");
  if (!modal) return;

  var san =
    typeof sanitizeHTML === "function"
      ? sanitizeHTML
      : function (s) {
          return s;
        };
  var status =
    typeof getDeadlineStatus === "function"
      ? getDeadlineStatus(task.deadline, task.completed)
      : { label: "Tanpa Deadline", emoji: "📋", colorClass: "status-none" };

  var titleEl = document.getElementById("detailModalTitle");
  if (titleEl) titleEl.textContent = task.title || "(Tanpa judul)";

  var badgesEl = document.getElementById("detailModalBadges");
  if (badgesEl) {
    var badges = [];
    if (task.course)
      badges.push(
        '<span class="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">' +
          san(task.course) +
          "</span>",
      );
    badges.push(
      '<span class="deadline-badge ' +
        status.colorClass +
        '">' +
        status.emoji +
        " " +
        status.label +
        "</span>",
    );
    if (task.completed)
      badges.push('<span class="deadline-badge status-done">✅ Selesai</span>');
    badgesEl.innerHTML = badges.join("");
  }

var bodyEl = document.getElementById('detailModalBody');
if (bodyEl) {
  var parts = [];

  // Tenggat waktu + waktu sisa
  var deadlineFormatted = task.deadline
    ? formatDateIndonesian(task.deadline)
    : 'Tidak ada deadline';
  var timeInfo = task.deadline ? getTimeRemaining(task.deadline) : null;
  var timeBadge = '';
  if (timeInfo && !task.completed) {
    var cls = timeInfo.isLate ? 'detail-time-late' : 'detail-time-ok';
    timeBadge = '<div class="detail-time-badge ' + cls + '">' +
      (timeInfo.isLate ? '⏰ ' : '⏳ ') + san(timeInfo.label) +
    '</div>';
  }
  parts.push(
    '<div class="detail-section">' +
      '<div class="detail-label">Tenggat Waktu</div>' +
      '<div class="detail-value">' + san(deadlineFormatted) + '</div>' +
      timeBadge +
    '</div>'
  );

  // Deskripsi
  if (task.description) {
    parts.push(
      '<div class="detail-section">' +
        '<div class="detail-label">Deskripsi</div>' +
        '<div class="detail-value">' + san(task.description) + '</div>' +
      '</div>'
    );
  }

  // Dibuat
  parts.push(
    '<div class="detail-section">' +
      '<div class="detail-label">Dibuat</div>' +
      '<div class="detail-value text-sm">' + (task.createdAt || '—') + '</div>' +
    '</div>'
  );

  // Diselesaikan (kalau ada)
  if (task.completed && task.completedAt) {
    parts.push(
      '<div class="detail-section">' +
        '<div class="detail-label">Diselesaikan</div>' +
        '<div class="detail-value text-sm">' + task.completedAt + '</div>' +
      '</div>'
    );
  }

  // ⚡ INI YANG HILANG — render ke DOM
  bodyEl.innerHTML = parts.join('');
}

  var toggleBtn = document.getElementById("detailToggleBtn");
  var editBtn = document.getElementById("detailEditBtn");
  var deleteBtn = document.getElementById("detailDeleteBtn");
  var closeBtn = document.getElementById("closeDetailModalBtn");

  if (toggleBtn) {
    toggleBtn.textContent = task.completed
      ? "↩️ Tandai Belum Selesai"
      : "✅ Tandai Selesai";
    toggleBtn.onclick = function () {
      closeTaskDetailModal();
      var all = loadTasks();
      var t = all.find(function (x) {
        return x.id === taskId;
      });
      if (!t) return;
      t.completed = !t.completed;
      t.completedAt = t.completed ? new Date().toISOString() : null;
      saveTasks(all);
      if (window.AppState) window.AppState.tasks = all;
      if (typeof renderCurrentPageContent === "function")
        renderCurrentPageContent();
      showToast(
        t.completed ? "Tugas selesai! 🎉" : "Tugas dikembalikan aktif.",
        "success",
      );
    };
  }
  if (editBtn)
    editBtn.onclick = function () {
      closeTaskDetailModal();
      openTaskModal(task);
    };
  if (deleteBtn)
    deleteBtn.onclick = function () {
      closeTaskDetailModal();
      openConfirmModal(
        "Hapus Tugas?",
        "Tugas ini akan dihapus permanen.",
        function () {
          var all = loadTasks().filter(function (t) {
            return t.id !== taskId;
          });
          saveTasks(all);
          if (window.AppState) window.AppState.tasks = all;
          if (typeof renderCurrentPageContent === "function")
            renderCurrentPageContent();
          showToast("Tugas dihapus.", "success");
        },
      );
    };
  if (closeBtn) closeBtn.onclick = closeTaskDetailModal;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeTaskDetailModal() {
  var modal = document.getElementById("taskDetailModal");
  if (modal) modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Event delegation untuk card → detail modal + image lightbox
document.addEventListener("click", function (e) {
  // Lightbox for task image
  var img = e.target.closest("[data-task-image-id]");
  if (img) {
    e.preventDefault();
    e.stopPropagation();
    var taskId = img.getAttribute("data-task-image-id");
    var src = img.getAttribute("src");
    openImageLightbox(src);
    return;
  }
  var card = e.target.closest("[data-task-id]");
  if (!card) return;
  if (e.target.closest("button, input, label, a, [data-action]")) return;
  var id = card.getAttribute("data-task-id");
  if (id) openTaskDetailModal(id);
});

/* =========================================================
    IMAGE LIGHTBOX
    ========================================================= */
function openImageLightbox(src) {
  var existing = document.getElementById("imageLightbox");
  if (existing) existing.remove();

  var overlay = document.createElement("div");
  overlay.id = "imageLightbox";
  overlay.className = "lightbox-overlay";
  overlay.innerHTML =
    '<div class="lightbox-content">' +
    '<button id="lightboxCloseBtn" class="lightbox-close-btn" aria-label="Tutup"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '<img src="' + sanitizeHTML(src) + '" class="lightbox-image" alt="Lampiran tugas">' +
    '</div>';
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  var closeBtn = document.getElementById("lightboxCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closeImageLightbox);
  overlay.addEventListener("click", function (ev) {
    if (ev.target === overlay) closeImageLightbox();
  });
}

function closeImageLightbox() {
  var lb = document.getElementById("imageLightbox");
  if (lb) lb.remove();
  document.body.style.overflow = "";
}

// ESC tutup semua modal
document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  closeTaskDetailModal();
  closeTaskModal();
  closeConfirmModal();
  closeMobileSidebar();
});

// Pastikan sidebar tertutup saat halaman pertama kali dibuka
document.addEventListener("DOMContentLoaded", function () {
  closeMobileSidebar();
});

/* =========================================================
   COURSE PICKER — Self-Contained
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "pridesk_custom_courses";
  var DEFAULT_COURSES = [
    { name: "Kalkulus", icon: "📐" },
    { name: "Fisika", icon: "🔬" },
    { name: "Bahasa Indonesia", icon: "📖" },
    { name: "Dasar Pemrograman", icon: "💻" },
    { name: "Keterampilan Interpersonal", icon: "🤝" },
    { name: "Agama Islam", icon: "🕌" },
  ];

  function loadCustom() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveCustom(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  function getAllCourses() {
    return DEFAULT_COURSES.concat(loadCustom());
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c];
    });
  }

  function bindPicker() {
    var wrapper = document.querySelector(".course-picker");
    if (!wrapper || wrapper.__bound) return;
    wrapper.__bound = true;

    var input = wrapper.querySelector(".course-picker-input");
    var list = wrapper.querySelector(".course-picker-list");
    if (!input || !list) return;

    function render() {
      var q = (input.value || "").trim().toLowerCase();
      var all = getAllCourses();
      var filtered = q
        ? all.filter(function (c) {
            return c.name.toLowerCase().indexOf(q) !== -1;
          })
        : all;

      var html = "";
      filtered.forEach(function (c) {
        var isSel = c.name.toLowerCase() === input.value.trim().toLowerCase();
        html +=
          '<div class="course-picker-option ' +
          (isSel ? "selected" : "") +
          '" data-value="' +
          esc(c.name) +
          '">' +
          '<div class="course-picker-option-icon">' +
          (c.icon || "📚") +
          "</div>" +
          '<div class="course-picker-option-text">' +
          esc(c.name) +
          "</div>" +
          "</div>";
      });

      var exact = all.some(function (c) {
        return c.name.toLowerCase() === q;
      });
      if (q && !exact) {
        html +=
          '<div class="course-picker-option add-new" data-add="1" data-value="' +
          esc(input.value.trim()) +
          '">' +
          '<div class="course-picker-option-icon">+</div>' +
          '<div class="course-picker-option-text">Tambah "' +
          esc(input.value.trim()) +
          '"</div>' +
          "</div>";
      }

      list.innerHTML =
        html || '<div class="course-picker-empty">Tidak ada pilihan</div>';
    }

    function open() {
      wrapper.classList.add("open");
      render();
    }
    function close() {
      wrapper.classList.remove("open");
    }

    input.addEventListener("focus", open);
    input.addEventListener("click", open);
    input.addEventListener("input", function () {
      if (!wrapper.classList.contains("open")) open();
      else render();
    });

    list.addEventListener("mousedown", function (e) {
      var opt = e.target.closest(".course-picker-option");
      if (!opt) return;
      e.preventDefault();

      if (opt.dataset.add === "1") {
        var name = opt.dataset.value;
        if (name) {
          var custom = loadCustom();
          var exists =
            DEFAULT_COURSES.some(function (c) {
              return c.name.toLowerCase() === name.toLowerCase();
            }) ||
            custom.some(function (c) {
              return c.name.toLowerCase() === name.toLowerCase();
            });
          if (!exists) {
            custom.push({ name: name, icon: "⭐" });
            saveCustom(custom);
          }
          input.value = name;
        }
      } else {
        input.value = opt.dataset.value;
      }

      input.dispatchEvent(new Event("input", { bubbles: true }));
      close();
    });

    document.addEventListener("mousedown", function (e) {
      if (!wrapper.contains(e.target)) close();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindPicker);
  } else {
    bindPicker();
  }

  // Re-bind tiap kali modal dibuka (karena openTaskModal reset form)
  window.addEventListener("load", bindPicker);
  setTimeout(bindPicker, 500);
  setTimeout(bindPicker, 1500);
})();
