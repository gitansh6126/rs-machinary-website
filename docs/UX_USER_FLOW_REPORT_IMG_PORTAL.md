# img.rsmachinary.in — UI/UX User Flow Report

**Site**: img.rsmachinary.in | **Type**: Image to WebP Converter + Gallery Manager  
**Stack**: PHP 7+, GD Library, Vanilla HTML/CSS/JS, Apache  
**Updated**: June 2026

---

## 1. User Personas

| Persona | Goal | Entry Point |
|---------|------|-------------|
| **Admin/Content Manager** | Convert product images to WebP, get public URLs, manage uploaded images | `index.html` (bulk upload + gallery) |
| **Developer** | Quick single-image conversion for development/testing | `index.php` (single converter) |

---

## 2. Two Interfaces Overview

The portal has **two separate entry points** serving different use cases:

| Interface | URL | Purpose | Complexity |
|-----------|-----|---------|------------|
| **Single Converter** | `/index.php` | One-at-a-time image conversion with immediate URL output | Simple |
| **Bulk Manager** | `/` or `/index.html` | Multi-file batch conversion + gallery browsing + rename/delete management | Full-featured |

Both share the same 4 PHP API backends: `upload.php`, `list.php`, `delete.php`, `rename.php`.

---

## 3. Primary User Flows

### Flow A: Single Image Conversion (index.php)

```
User lands on index.php
  ├─ Sees dark-themed card with upload zone
  │   └─ Shown: camera icon, "Click to select or drag & drop an image", hint text
  │
  ├─ Selects image via:
  │   ├─ Click zone → OS file picker → selects 1 image
  │   └─ Drag image from desktop onto zone
  │
  ├─ Preview appears:
  │   ├─ Thumbnail image rendered
  │   ├─ Filename displayed
  │   └─ File size displayed
  │
  ├─ "Convert to WebP" button enabled (was disabled)
  │   └─ User clicks it
  │       ├─ Button shows spinner + "Converting..."
  │       ├─ Status: "Converting to WebP..."
  │       └─ POST to upload.php with FormData (image field)
  │
  ├─ On SUCCESS:
  │   ├─ Result URL displayed in blue monospace box
  │   ├─ "Copy" button appears (green)
  │   ├─ Status: "Conversion successful!" (green text)
  │   └─ Clicks Copy → "Copied!" checkmark (2s) → URL in clipboard
  │
  └─ On FAILURE:
      ├─ Status shows error message in red
      ├─ Button re-enabled
      └─ User can retry with same or different file
```

**States covered**:
- Initial: upload zone visible, no preview, button disabled
- File selected: preview + filename + size shown, button enabled
- Converting: button disabled with spinner, status updating
- Success: URL + copy button appear, green status
- Error: red error message, button re-enabled for retry
- Network error: "Network error. Please try again."

---

### Flow B: Bulk Upload (index.html — Upload Tab)

```
User lands on index.html
  ├─ Default tab: "Upload" (active, underlined)
  │
  ├─ Two-panel layout:
  │   ├─ LEFT panel: "Select Images" with file count badge
  │   │   ├─ Upload zone (dashed border, click or drag)
  │   │   └─ File list (scrollable, max 340px)
  │   │
  │   └─ RIGHT panel: "Convert"
  │       ├─ "Convert All (N)" button (disabled until files added)
  │       ├─ Progress bar (hidden until conversion starts)
  │       ├─ Status list (per-file results)
  │       └─ "Copy All" button (hidden until files processed)
  │
  ├─ User adds files:
  │   ├─ Click zone → multi-file picker (multiple attribute)
  │   ├─ Drag multiple files onto zone
  │   └─ Each file validated: image type only, duplicates skipped
  │
  ├─ File list populates:
  │   ├─ Each row: thumbnail (via FileReader), filename, size, status badge ("pending"), remove (✕) button
  │   ├─ File count badge updates
  │   └─ "Convert All (N)" enables with file count
  │
  ├─ User can remove individual files via ✕
  │   └─ If all removed: reset to "No images selected" + button disabled
  │
  ├─ User clicks "Convert All":
  │   ├─ Button shows spinner + "Converting..."
  │   ├─ Progress bar appears (fill animates)
  │   ├─ Status list populates per-file (index, filename, status: "queue" → "converting...")
  │   ├─ File list status badges update: pending → queue → converting
  │   └─ Files processed sequentially (queue pattern)
  │
  ├─ Each file → POST upload.php:
  │   ├─ SUCCESS:
  │   │   ├─ Status row: clickable filename link (opens in new tab)
  │   │   ├─ Copy URL button (clipboard icon) appears
  │   │   ├─ Rename button (pencil icon) appears
  │   │   ├─ File list badge: "done" (green)
  │   │   └─ URL added to copy-all dataset
  │   │
  │   └─ FAILURE:
  │       ├─ Status row shows error message
  │       ├─ File list badge: "fail" (red)
  │       └─ Progress continues with next file
  │
  └─ All files done:
      ├─ Progress bar: "Done: X converted, Y failed"
      ├─ Button re-enabled with updated count
      ├─ "Copy All" button appears (if any succeeded)
      └─ User can copy all URLs (newline-separated) to clipboard
```

**States covered**:
- Empty: "No images selected" placeholder, button disabled
- Files selected: file list with thumbnails, remove available, button enabled
- Converting: sequential processing with per-file status, progress bar animating
- Partial failure: some done, some fail — each row shows its status
- All complete: copy-all available, individual copy/rename per file
- Empty after removal: back to empty state gracefully

---

### Flow C: Inline Rename (from Bulk Upload Results)

```
After successful conversion:
  ├─ Each status row has a pencil icon (✎)
  │
  ├─ User clicks pencil:
  │   ├─ Filename link hides
  │   ├─ Inline form appears: text input (pre-filled, no .webp) + "Save" button
  │   └─ Other files remain visible
  │
  ├─ User edits name (sanitized: a-zA-Z0-9_- only)
  │
  ├─ User clicks "Save":
  │   ├─ POST to rename.php: {filename, newname}
  │   │
  │   ├─ SUCCESS:
  │   │   ├─ Filename link updated with new name
  │   │   ├─ URL map updated
  │   │   ├─ "Copy All" URL list refreshed
  │   │   └─ Toast: "Renamed to newname.webp" (2.5s)
  │   │
  │   └─ FAILURE:
  │       └─ Toast shows server error (e.g., "A file with that name already exists")
  │
  └─ User can cancel by:
      ├─ Clicking elsewhere
      ├─ Save with empty/unchanged name (implicit cancel)
      └─ Form hides, filename link shows again
```

---

### Flow D: Gallery Browsing (index.html — Gallery Tab)

```
User clicks "Gallery" tab:
  ├─ Search bar + Refresh button
  ├─ 4 skeleton shimmer placeholders while loading
  ├─ GET list.php → returns all .webp files (newest first)
  │
  ├─ Gallery renders as responsive grid:
  │   ├─ Each item:
  │   │   ├─ Thumbnail image (loading="lazy", click → opens in new tab)
  │   │   ├─ Filename (truncated, full name in title tooltip)
  │   │   ├─ Formatted file size + date
  │   │   ├─ "Copy URL" button (green, clipboard icon)
  │   │   └─ "Delete" button (red)
  │   │
  │   └─ Grid: auto-fill, min 220px (140px on mobile)
  │
  ├─ Search:
  │   ├─ Type in filter input
  │   ├─ 400ms debounce
  │   ├─ Re-fetches list, filters client-side via String.includes()
  │   └─ Grid updates live
  │
  └─ Empty state: "No images yet — upload some."
```

**States covered**:
- Loading: 4 skeleton shimmer cards
- Populated: responsive grid with thumbnails + metadata
- Empty: centered text "No images yet — upload some."
- Search no results: gallery grid empty, empty state shown
- API failure: "Failed to load."

---

### Flow E: Delete (from Gallery)

```
User clicks "Delete" on a gallery item:
  ├─ Browser confirm dialog: 'Delete "filename"?'
  │
  ├─ CONFIRM:
  │   ├─ Button shows "..." and disables
  │   ├─ POST delete.php with JSON {filename}
  │   │
  │   ├─ SUCCESS:
  │   │   ├─ Toast: "Deleted" (2.5s)
  │   │   └─ Gallery refreshes (re-fetches list)
  │   │
  │   └─ FAILURE:
  │       ├─ Toast with error message
  │       └─ Button re-enabled
  │
  └─ CANCEL:
      └─ Nothing happens
```

---

### Flow F: Copy URL (all contexts)

```
Copy URL triggered from:
  ├─ Gallery item: green clipboard button
  ├─ Upload results: per-file clipboard button
  ├─ Copy All: button in upload results panel
  └─ Single converter: "Copy" button

Process:
  ├─ Primary: navigator.clipboard.writeText()
  ├─ Fallback: document.execCommand('copy') via hidden textarea
  ├─ Visual feedback: button shows checkmark icon for 2 seconds
  └─ On error: toast "Copy failed"

Copy All:
  ├─ Collects all successful URLs from current batch
  └─ Copies them joined by newline separator
```

---

## 4. Navigation Architecture

### Single Converter (index.php) — Single Page, No Navigation

```
┌─────────────────────────────┐
│  Image to WebP Converter    │
│  Upload an image, convert   │
│  to WebP, get a public URL  │
│                             │
│  ┌───────────────────────┐  │
│  │   📷                  │  │
│  │  Click to select or   │  │
│  │  drag & drop an image │  │
│  │  PNG, JPEG, WebP, GIF │  │
│  └───────────────────────┘  │
│                             │
│  [Preview + filename + size]│
│                             │
│  [⚡ Convert to WebP]       │
│                             │
│  Status line                │
│                             │
│  [Result URL box]           │
│  [📋 Copy]                  │
└─────────────────────────────┘
```

### Bulk Manager (index.html) — Two Tab Views

```
┌──────────────────────────────────────────┐
│ img.rsmachinary.in | Bulk WebP Converter | v2 · q80 │
├──────────────────────────────────────────┤
│ [Upload]  [Gallery]                      │
├──────────────────────────────────────────┤
│                                          │
│  UPLOAD TAB:                             │
│  ┌──────────────┐ ┌──────────────┐      │
│  │ Select Images│ │ Convert      │      │
│  │ [0]          │ │              │      │
│  │ ┌───┐        │ │ [Convert All]│      │
│  │ │📷 │        │ │ [Progress]   │      │
│  │ │file│        │ │ [Status list]│      │
│  │ │size│        │ │ [Copy All]   │      │
│  │ └───┘        │ │              │      │
│  └──────────────┘ └──────────────┘      │
│                                          │
│  GALLERY TAB:                            │
│  ┌──────────────────────────────────┐    │
│  │ [🔍 Filter images...]    [↻]     │    │
│  ├──────────────────────────────────┤    │
│  │ ┌──────┐ ┌──────┐ ┌──────┐      │    │
│  │ │🖼️   │ │🖼️   │ │🖼️   │      │    │
│  │ │name  │ │name  │ │name  │      │    │
│  │ │size  │ │size  │ │size  │      │    │
│  │ │📋🗑️ │ │📋🗑️ │ │📋🗑️ │      │    │
│  │ └──────┘ └──────┘ └──────┘      │    │
│  └──────────────────────────────────┘    │
│                                          │
└──────────────────────────────────────────┘
│ Toast: bottom center, auto-dismiss 2.5s │
└──────────────────────────────────────────┘
```

---

## 5. API Endpoints

| Endpoint | Method | Purpose | Input | Output |
|----------|--------|---------|-------|--------|
| **`/upload.php`** | POST | Upload + convert to WebP | `FormData` with `image` field (file, max 10MB) | `{success, url, filename, size}` |
| **`/list.php`** | GET | List all WebP files | `?search=` (optional, unused server-side) | `{success, data: [{filename, url, size, size_formatted, modified}], total}` |
| **`/delete.php`** | POST | Delete a file | JSON `{filename}` | `{success, message, filename}` |
| **`/rename.php`** | POST | Rename a file | JSON `{filename, newname}` | `{success, filename, url}` |

All endpoints: CORS `*` open, JSON responses, error suppression (`error_reporting(0)`).

---

## 6. Error & Edge Case States

### Backend Errors (HTTP + JSON)

| Endpoint | HTTP | Condition |
|----------|------|-----------|
| **upload.php** | 405 | Wrong HTTP method |
| | 400 | No file / exceeds 10MB / bad extension / not a valid image |
| | 500 | GD missing / read failure / conversion failure |
| **list.php** | 405 | Wrong HTTP method |
| **delete.php** | 405 | Wrong HTTP method |
| | 400 | Missing filename |
| | 404 | File not found on disk |
| | 403 | Path traversal attempt detected |
| | 500 | `unlink()` failed |
| **rename.php** | 405 | Wrong HTTP method |
| | 400 | Missing `filename` or `newname` / invalid characters |
| | 403 | Path traversal attempt |
| | 404 | Original file not found |
| | 409 | Destination name already exists |
| | 500 | `rename()` failed |

### Frontend States

| State | Visual | Behavior |
|-------|--------|----------|
| **No file selected** | Button disabled, upload zone visible | No action possible |
| **Invalid file type** | Silently ignored | Filtered out in `addFiles()` — no error shown |
| **Duplicate file** | Silently ignored | Same name + size = skipped |
| **Upload network error** | Per-row: "network error" in red | Button re-enabled, progress bar continues |
| **API failure response** | Per-row: error message from server | Button re-enabled, progress shows partial |
| **Empty gallery** | Centered text | "No images yet — upload some." |
| **Gallery fetch failure** | Empty state changes | "Failed to load." |
| **Delete fails** | Toast notification | Shows `res.error` or "Network error" |
| **Clipboard API fails** | Hidden textarea fallback | `execCommand('copy')` as backup; toast if both fail |
| **Rename fails** | Toast notification | Server error shown; input remains for retry |
| **Rename conflict** | Toast | "A file with that name already exists" |
| **Path traversal attempt** | Server-side 403 | Silent rejection; no info leaked |

---

## 7. UI Interactions & Micro-Details

| Element | Interaction |
|---------|-------------|
| **Upload zone hover** | Dashed border shifts to indigo (`#6366f1`), background lightens |
| **Upload zone drag-over** | `.drop-active` class added, icon color changes to indigo |
| **File list scrollbar** | Custom thin (5px) scrollbar with rounded thumb |
| **File item hover** | Light gray background (`#f9fafb`) |
| **Tab switch** | Sticky top bar + tab bar; underline indicator animates |
| **Gallery thumbnail click** | Opens image in new tab (`window.open`) |
| **Gallery search debounce** | 400ms delay before re-fetching gallery |
| **Progress bar fill** | Smooth width transition (0.3s) |
| **Skeleton shimmer** | Gradient animation at 1s infinite; 4 placeholder cards |
| **Toast** | Fixed bottom-center; appears instantly, auto-dismisses after 2.5s; queues single toast |
| **Copy button feedback** | Icon changes to checkmark for 2s, then reverts |
| **Button disabled state** | 50% opacity, `cursor: not-allowed` |
| **Rename inline edit** | Filename link hidden, input + save button shown in same row |
| **File list thumbnails** | Generated client-side via `FileReader.readAsDataURL()` |
| **Image lazy loading** | `<img loading="lazy">` on gallery thumbnails |

---

## 8. Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| **>800px** | Full two-column upload layout (grid: 1fr 1fr) |
| **≤800px** | Upload grid collapses to single column; panels stack |
| **≤700px** | Topbar subtitle + version hidden; tabs become scrollable; container padding reduced; gallery grid min-width drops to 140px |
| **≤480px** | `index.php`: card padding reduced (32px→20px), upload zone padding reduced (40px→28px) |

---

## 9. Security Observations (UI/UX Impact)

| Issue | User Impact |
|-------|-------------|
| **No authentication** | Anyone with the URL can upload, delete, rename files — no login barrier |
| **No rate limiting** | Bulk upload can overwhelm the server; no user-facing feedback on limits |
| **No audit log** | No undo for delete; deletion is permanent with confirmation dialog only |
| **Open CORS (`*`)** | Any external site can use this as an open image upload proxy |

---

## 10. Recommended UX Improvements

1. **Add password gate** — simple session-based auth before accessing index.html
2. **Add pagination/lazy-load** to gallery — loading all images at once will slow down with hundreds of files
3. **Add bulk delete** in gallery — checkbox selection + "Delete Selected"
4. **Add upload progress per file** — show upload percentage (XMLHttpRequest with `upload.onprogress`)
5. **Add drag-to-reorder** in the upload file list
6. **Add "Converted" date** to upload results (not just gallery)
7. **Add keyboard shortcuts** — Escape to close/cancel, Ctrl+Enter to convert
8. **Persist rename and cancel** via a "Cancel" button next to Save in rename mode
9. **Show remaining quota or disk usage** if disk limits exist
10. **Add file type badge** (PNG, JPEG, GIF, WebP) on file list items
11. **Add "Select all / Deselect all"** for bulk delete in gallery
12. **Add inline image preview** on hover in gallery (tooltip-style)
13. **Show WebP file size reduction** compared to original after conversion
14. **Add download button** for converted files (not just copy URL)
15. **Add confirmation before closing tab** during active conversion
