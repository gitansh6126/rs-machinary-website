# RS Machinery — Image Management System

---

## Architecture

```
Admin Panel (admin.rsmachinery.com)
│
├── Select image file(s)
│
├── POST to upload.php
│   Headers: X-Upload-Key: <secret>
│   Body: image, product_name, variant
│
├── upload.php validates:
│   ├── X-Upload-Key match
│   ├── File size ≤ 5MB
│   ├── Real MIME type (finfo_file)
│   └── Valid image (getimagesize)
│
├── upload.php optimizes:
│   ├── Resize to max 1600px width
│   ├── JPEG/WEBP quality 80%
│   └── Preserve aspect ratio
│
├── upload.php generates thumbnail:
│   ├── 400px max width
│   └── Saved as {name}_thumb.webp
│
├── Saves to: assets/product-images/{slug}_{VARIANT}.{ext}
│
├── Returns JSON { success, data: { url, thumbnail, filename, size } }
│
├── Admin JS auto-fills URL into form
│
├── URL saved to Google Sheet (relative path)
│
└── Website loads: <img src="assets/product-images/foo_MAIN.jpg">
```

---

## File Naming Convention

**Format:** `{product-slug}_{VARIANT}.{ext}`

**Examples:**
```
heavy-duty-monkey-crane_MAIN.jpg
heavy-duty-monkey-crane_GAL01.webp
heavy-duty-monkey-crane_GAL02.jpg
heavy-duty-monkey-crane_MAIN_thumb.webp   (auto-generated thumbnail)
```

**Variants:**
| Variant | Purpose |
|---------|---------|
| `MAIN` | Primary product image |
| `GAL01`–`GAL99` | Gallery images |
| `SPEC01`–`SPEC10` | Specification sheets/diagrams |
| `THUMB` | Standalone thumbnail |
| `BANNER` | Category/product banner |

**Slug rules:**
- Lowercase
- Spaces → hyphens
- Special characters removed
- Truncated to 100 chars

---

## Upload Validation

| Check | Method | Limit |
|-------|--------|-------|
| File size | `$_FILES['image']['size']` | 5 MB (5,242,880 bytes) |
| Format | `finfo_file()` real MIME | `image/jpeg`, `image/png`, `image/webp` |
| Image validity | `getimagesize()` | Must return valid dimensions |
| Auth | `X-Upload-Key` header | Must match `UPLOAD_KEY` in `upload.php` |

---

## Image Optimization

| Setting | Value |
|---------|-------|
| Max width | 1600px |
| Aspect ratio | Maintained |
| JPEG quality | 80% |
| WEBP quality | 80% |
| Thumbnail width | 400px |
| Thumbnail format | WEBP |

---

## Upload Response Formats

**Success (HTTP 200):**
```json
{
  "success": true,
  "data": {
    "url": "assets/product-images/heavy-duty-monkey-crane_MAIN.jpg",
    "thumbnail": "assets/product-images/heavy-duty-monkey-crane_MAIN_thumb.webp",
    "filename": "heavy-duty-monkey-crane_MAIN.jpg",
    "size": 12345
  }
}
```

**Failure (HTTP 4xx):**
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "error": "Readable error message"
}
```

**Error codes:**
| Code | HTTP | Meaning |
|------|------|---------|
| `UNAUTHORIZED` | 403 | Invalid upload key |
| `METHOD_NOT_ALLOWED` | 405 | Not a POST request |
| `MISSING_NAME` | 400 | Product name not provided |
| `FILE_TOO_LARGE` | 400 | Exceeds 5 MB |
| `INVALID_IMAGE` | 400 | Wrong format or corrupt |
| `UPLOAD_ERROR` | 400 | Upload failed (PHP error) |
| `SAVE_FAIL` | 500 | Could not write file |
| `DIR_FAIL` | 500 | Could not create directory |

---

## Files

| File | Role |
|------|------|
| `upload.php` | Receives, validates, optimizes, saves images |

| `assets/product-images/` | Storage directory |

| `assets/placeholder.svg` | Fallback when image missing |

| `js/app.js` (`getImageUrl`, `getThumbnailUrl`) | Frontend image rendering |

---

## Cache Strategy

| Asset | Strategy |
|-------|----------|
| Product images | Browser cache (standard `Cache-Control`) |
| Thumbnails | Same as full images (smaller files) |
| Placeholder SVG | Long cache (stays same) |
| Uploaded files | No client cache on upload response |

---

## Security

| Concern | Mitigation |
|---------|-----------|
| Unauthenticated uploads | `X-Upload-Key` header validated against `upload.php` config |
| MIME spoofing | `finfo_file()` reads actual file bytes, not extension |
| Path traversal | Filename sanitized via slug generation, no user-controlled path segments |
| File bomb | `getimagesize()` + max dimension 1600px |
| Overwrite | Timestamp appended if filename already exists |
| PHP info leak | No error display, JSON-only responses |
