/**
 * PriDesk — js/course-picker.js
 * Premium combobox untuk field "Mata Kuliah / Kegiatan"
 * - Pilih dari daftar ATAU ketik baru (custom tersimpan di localStorage)
 * - Fully self-contained, tidak butuh app.js
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'pridesk_custom_courses';

  const DEFAULT_COURSES = [
    { name: 'Kalkulus',                   icon: '📐' },
    { name: 'Fisika',                     icon: '🔬' },
    { name: 'Bahasa Indonesia',           icon: '📖' },
    { name: 'Dasar Pemrograman',          icon: '💻' },
    { name: 'Keterampilan Interpersonal', icon: '🤝' },
    { name: 'Agama Islam',                icon: '🕌' }
  ];

  function loadCustom() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function saveCustom(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function addCustom(name) {
    const trimmed = String(name || '').trim();
    if (!trimmed) return;
    const custom = loadCustom();
    const exists = DEFAULT_COURSES.some(c => c.name.toLowerCase() === trimmed.toLowerCase())
                || custom.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return;
    custom.push({ name: trimmed, icon: '⭐' });
    saveCustom(custom);
  }
  function getAllCourses() {
    return [
      ...DEFAULT_COURSES.map(c => ({ ...c, custom: false })),
      ...loadCustom().map(c => ({ ...c, custom: true }))
    ];
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function positionPanel(input, panel) {
    const r = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const panelHeight = Math.min(280, panel.scrollHeight || 280);
    const openUp = spaceBelow < panelHeight + 20 && r.top > spaceBelow;

    panel.style.left  = r.left + 'px';
    panel.style.width = r.width + 'px';
    if (openUp) {
      panel.style.top = 'auto';
      panel.style.bottom = (window.innerHeight - r.top + 8) + 'px';
      panel.dataset.dir = 'up';
    } else {
      panel.style.top = (r.bottom + 8) + 'px';
      panel.style.bottom = 'auto';
      panel.dataset.dir = 'down';
    }
  }

  function initOne(root) {
    const input  = root.querySelector('input[type="text"]');
    const panel  = root.querySelector('.course-picker-panel');
    const listEl = root.querySelector('.course-picker-list');
    if (!input || !panel || !listEl) return;

    let highlighted = -1;

    function currentFiltered() {
      const q = input.value.trim().toLowerCase();
      const all = getAllCourses();
      return {
        all,
        filtered: q ? all.filter(c => c.name.toLowerCase().includes(q)) : all,
        q
      };
    }

    function buildList() {
      const { all, filtered, q } = currentFiltered();
      const exactMatch = q && all.some(c => c.name.toLowerCase() === q);
      let html = '';

      if (filtered.length === 0 && !q) {
        html = '<div class="course-picker-empty">Belum ada pilihan.</div>';
      } else {
        filtered.forEach((c, i) => {
          const isSel = c.name.toLowerCase() === input.value.trim().toLowerCase();
          html += `
            <div class="course-picker-option ${isSel ? 'selected' : ''}" data-index="${i}" style="animation-delay:${i * 30}ms">
              <div class="course-picker-option-icon">${c.icon || '📚'}</div>
              <div class="course-picker-option-text">${escapeHtml(c.name)}</div>
              ${c.custom ? '<span class="course-picker-option-tag">Custom</span>' : ''}
              <svg class="course-picker-option-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>`;
        });
      }

      if (q && !exactMatch) {
        html += `
          <div class="course-picker-option add-new" data-add="1" style="animation-delay:${filtered.length * 30}ms">
            <div class="course-picker-option-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div class="course-picker-option-text">Tambah "${escapeHtml(input.value.trim())}"</div>
          </div>`;
      }

      listEl.innerHTML = html;
      highlighted = -1;
    }

    function open() {
      buildList();
      root.classList.add('open');
      positionPanel(input, panel);
      requestAnimationFrame(() => positionPanel(input, panel));
    }
    function close() {
      root.classList.remove('open');
      highlighted = -1;
    }
    function commit(value) {
      input.value = value;
      input.dispatchEvent(new Event('input',  { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      close();
    }
    function select(index) {
      const { filtered } = currentFiltered();
      if (index >= 0 && index < filtered.length) commit(filtered[index].name);
    }
    function addNew() {
      const name = input.value.trim();
      if (!name) return;
      addCustom(name);
      commit(name);
    }
    function updateHighlight() {
      const opts = listEl.querySelectorAll('.course-picker-option');
      opts.forEach((el, i) => el.classList.toggle('highlighted', i === highlighted));
      const target = opts[highlighted];
      if (target) target.scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('focus', open);
    input.addEventListener('click', () => { if (!root.classList.contains('open')) open(); });
    input.addEventListener('input', () => {
      if (!root.classList.contains('open')) open(); else buildList();
    });

    listEl.addEventListener('mousedown', (e) => {
      const opt = e.target.closest('.course-picker-option');
      if (!opt) return;
      e.preventDefault();
      if (opt.dataset.add === '1') addNew();
      else select(parseInt(opt.dataset.index, 10));
    });

    input.addEventListener('keydown', (e) => {
      const { all, filtered, q } = currentFiltered();
      const hasAdd = q && !all.some(c => c.name.toLowerCase() === q);
      const total = filtered.length + (hasAdd ? 1 : 0);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!root.classList.contains('open')) open();
        highlighted = Math.min(highlighted + 1, total - 1);
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlighted = Math.max(highlighted - 1, 0);
        updateHighlight();
      } else if (e.key === 'Enter') {
        if (root.classList.contains('open') && highlighted >= 0) {
          e.preventDefault();
          if (highlighted < filtered.length) select(highlighted);
          else if (hasAdd) addNew();
        } else {
          // Enter tanpa highlight → simpan sebagai custom kalau belum ada
          const v = input.value.trim();
          if (v && !all.some(c => c.name.toLowerCase() === v.toLowerCase())) {
            addCustom(v);
          }
        }
      } else if (e.key === 'Escape') {
        close();
        input.blur();
      } else if (e.key === 'Tab') {
        close();
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (!root.contains(e.target) && !panel.contains(e.target)) close();
    });
    window.addEventListener('resize', () => {
      if (root.classList.contains('open')) positionPanel(input, panel);
    });
    document.addEventListener('scroll', () => {
      if (root.classList.contains('open')) positionPanel(input, panel);
    }, true);

    // Simpan otomatis saat form disubmit (jaga-jaga kalau user langsung submit)
    const form = root.closest('form');
    if (form) {
      form.addEventListener('submit', () => {
        const v = input.value.trim();
        if (v) addCustom(v);
      });
    }
  }

  function init() {
    document.querySelectorAll('.course-picker').forEach(initOne);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.addEventListener('load', init);

  window.PriDeskCoursePicker = { getAll: getAllCourses, addCustom, STORAGE_KEY };
})();