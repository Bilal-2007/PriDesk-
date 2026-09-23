# Bug Fix Summary — Mobile Sidebar Blur & Menu Click

## ROOT CAUSES IDENTIFIED

### 1. `.modal-backdrop.hidden` missing `display: none`
- CSS class `.modal-backdrop.hidden` didn't enforce `display: none`
- Modal was always rendered with `backdrop-filter: blur()` active
- This caused the entire screen to appear blurred on every page load

### 2. `#mobileOverlay.hidden` missing `display: none !important`
- Overlay had `display: none` default but `.hidden` class didn't override with `!important`
- Inline `style.display = 'block'` from IIFE was not being reset

### 3. Duplicate function declarations in `js/ui.js`
- `openMobileSidebar` and `closeMobileSidebar` existed at line 504 AND line 627
- IIFE at line 838-918 was overwriting `window.openMobileSidebar` with a buggy implementation
- The IIFE called `close()` on page load, hiding the sidebar immediately

### 4. Capture-phase handler conflict
- Multiple `addEventListener('click', ...)` with different phases were competing
- The IIFE's capture-phase handler was intercepting ALL clicks, preventing sidebar interaction

## FIXES APPLIED

### css/global.css
```css
/* Added display: none !important to modal-backdrop.hidden */
.modal-backdrop.hidden {
  display: none !important;
  pointer-events: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

.modal-backdrop { display: none; } /* default */
.modal-backdrop:not(.hidden) { display: flex; }

/* Added display: none !important to #mobileOverlay.hidden */
#mobileOverlay.hidden {
  display: none !important;
  pointer-events: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

#mobileOverlay { display: none; } /* default */
#mobileOverlay:not(.hidden) { display: block !important; }
```

### js/ui.js — Cleanup
- Removed duplicate `openMobileSidebar`/`closeMobileSidebar` at line 627-657
- Removed buggy IIFE at line 838-918 that was overwriting window functions
- Kept single `openMobileSidebar`/`closeMobileSidebar` at line 502/510
- Added `openTaskDetailModal`/`closeTaskDetailModal` functions
- Kept event delegation for card clicks (bubble phase)

### js/app.js — Capture Phase Fix
- Changed capture-phase handler to mobile-only (innerWidth <= 767)
- Only closes sidebar when clicking outside sidebar/overlay on mobile
- Desktop clicks not intercepted

## RESULT
- ✅ No blur on page load — modals properly hidden
- ✅ Sidebar menu clicks work on mobile
- ✅ Overlay properly hides/shows
- ✅ No duplicate event handlers
- ✅ No IIFE overwriting window functions
- ✅ All 6 HTML pages consistent

## VIEWPORT TESTS (320-1440px)
- ✅ 320px — No horizontal scroll, menu tappable
- ✅ 375px — Same
- ✅ 430px — Same
- ✅ 768px — Sidebar visible, not blur
- ✅ 1024px — Full desktop experience
- ✅ 1280px — Optimal spacing
- ✅ 1440px — No over-stretching
