# RS Machinery — Complete Deployment & Testing Guide

> **Document Version**: 1.0  
> **Stack**: Google Apps Script + Google Sheets (backend), Vanilla HTML/CSS/JS (frontend)  
> **Hosting**: Hostinger  
> **Repository**: Single GitHub repo (`website/`, `admin/`, `apps-script/`)

---

## PHASE 1: GOOGLE SHEET SETUP

### 1.1 Create the Google Sheet

1. Go to **https://sheets.new** (or create via Google Drive → New → Google Sheets).
2. You will see a single default sheet tab called `Sheet1`.
3. Locate the **Spreadsheet ID** in the URL bar:

```
https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T/edit#gid=0
                                        ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                        THIS IS YOUR SPREADSHEET ID
```

4. Copy this ID. You will need it for **Phase 2.4**.

### 1.2 Create the Four Sheet Tabs

Rename `Sheet1` and create the remaining three tabs. The tab names are **case-sensitive** and **must match exactly**.

| Tab Name | Status |
|---|---|
| **Settings** | Rename `Sheet1` to this |
| **Products** | Create new |
| **Categories** | Create new |
| **Inquiries** | Create new |

**How to rename a sheet tab**: Double-click the tab name at the bottom → type the new name → press Enter.

**How to add a new sheet tab**: Click the **+** (plus) icon at the bottom-left corner.

### 1.3 Column Headers — Settings

In the **Settings** tab, enter these exact headers in **Row 1**:

| A | B |
|---|---|
| key | value |

Then add these seed rows starting **Row 2**:

| A (key) | B (value) |
|---|---|
| `admin_password_hash` | *(leave empty — set during first login)* |
| `admin_key` | *(leave empty — generated during first login)* |
| `site_name` | `RSMachinery` |
| `site_phone` | `+918708795253` |
| `site_whatsapp` | `918708795253` |
| `site_address` | `Begu Road, wali gali, Near Parshuram Chowk, Opposite Sarsainath Mandir, Sirsa, Haryana 125055` |
| `site_email` | *(optional)* |

> **Warning**: Do NOT manually enter `admin_password_hash` or `admin_key`. These are auto-generated on first login. If you put values here, the system will not enter first-time setup mode.

---

### 1.4 Column Headers — Products

In the **Products** tab, enter this single row in **Row 1**:

```
id | name | slug | category_id | seo_title | seo_description | short_description | description | image | gallery_images | specifications | variations | featured | active | sort_order | created_at | updated_at
```

17 columns total. Each column separated by a tab (or paste the comma/tab-separated line directly into cell A1).

**Seed data** — add these 3 rows starting **Row 2** to verify the system works immediately:

| id | name | slug | category_id | seo_title | seo_description | short_description | description | image | gallery_images | specifications | variations | featured | active | sort_order | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `1` | `Mini Electric Wire Rope Hoist Winch` | `mini-electric-wire-rope-hoist-winch` | `1` | `Mini Electric Wire Rope Hoist Winch - RSMachinery` | `Powerful mini electric wire rope hoist winch for industrial lifting.` | `Powerful lifting with smooth operation. Ideal for workshops and factories.` | `Our Mini Electric Wire Rope Hoist Winch is designed for reliable lifting in tight spaces. Built with industrial-grade components.` | `assets/product img/61tUmzq5dKL.jpg` | `[]` | `[{"label":"Capacity","value":"500 kg"},{"label":"Voltage","value":"220V Single Phase"},{"label":"Lift Height","value":"12 meters"}]` | `[{"label":"Single Phase","value":"₹12,500"},{"label":"Three Phase","value":"₹14,000"}]` | `TRUE` | `TRUE` | `1` | `2026-01-01T00:00:00.000Z` | `2026-01-01T00:00:00.000Z` |
| `2` | `Construction Monkey Lift` | `construction-monkey-lift` | `1` | `Construction Monkey Lift - RSMachinery` | `Monkey lift for vertical construction lifting.` | `Vertical lifting for construction sites. Heavy duty and reliable.` | `Our Construction Monkey Crane Lift is engineered for fast material lifting at construction projects.` | `assets/product img/construction-monkey-lift-1000x1000.webp` | `[]` | `[{"label":"Capacity","value":"500 kg"},{"label":"Motor Power","value":"2 HP"},{"label":"Lift Height","value":"30 ft"}]` | `[]` | `TRUE` | `TRUE` | `2` | `2026-01-01T00:00:00.000Z` | `2026-01-01T00:00:00.000Z` |
| `3` | `Stainless Steel Wire Rope` | `stainless-steel-wire-rope` | `2` | `Stainless Steel Wire Rope - RSMachinery` | `Corrosion-resistant premium quality wire rope.` | `Corrosion-resistant premium quality. Available in multiple diameters.` | `Premium quality stainless steel wire ropes for cranes, hoists, and rigging applications.` | `assets/hero-images/industrial-steel-wire-rope-500x500.webp` | `[]` | `[{"label":"Diameter","value":"6mm to 24mm"},{"label":"Material","value":"Stainless Steel 304"},{"label":"Breaking Load","value":"2000 kg"}]` | `[]` | `TRUE` | `TRUE` | `3` | `2026-01-01T00:00:00.000Z` | `2026-01-01T00:00:00.000Z` |

---

### 1.5 Column Headers — Categories

In the **Categories** tab, enter this single row in **Row 1**:

```
id | name | slug | description | image | active | sort_order | created_at | updated_at
```

**Seed data** — add these 2 rows starting **Row 2**:

| id | name | slug | description | image | active | sort_order | created_at | updated_at |
|---|---|---|---|---|---|---|---|---|
| `1` | `Hoists & Cranes` | `hoists-cranes` | `Electric hoists, wire rope hoists, and cranes for industrial lifting.` | `` | `TRUE` | `1` | `2026-01-01T00:00:00.000Z` | `2026-01-01T00:00:00.000Z` |
| `2` | `Wire Ropes & Accessories` | `wire-ropes-accessories` | `Steel wire ropes, slings, and rigging accessories.` | `` | `TRUE` | `2` | `2026-01-01T00:00:00.000Z` | `2026-01-01T00:00:00.000Z` |

---

### 1.6 Column Headers — Inquiries

In the **Inquiries** tab, enter this single row in **Row 1**:

```
id | date | name | phone | product | message | status
```

Leave the rows below empty. Inquiries will be auto-populated when customers submit the website inquiry form.

---

### 1.7 Final Sheet Verification

Before proceeding, verify:

- [ ] Sheet tab names exactly: `Settings`, `Products`, `Categories`, `Inquiries`
- [ ] Settings has headers `key` and `value` in Row 1
- [ ] Products has **17** columns with headers matching exactly
- [ ] Categories has **9** columns with headers matching exactly
- [ ] Inquiries has **7** columns with headers matching exactly
- [ ] At least 3 product seed rows and 2 category seed rows are populated
- [ ] `admin_password_hash` and `admin_key` rows are **empty** in Settings

> **Common mistake**: Extra spaces in header names (e.g., `"name "` instead of `"name"`). The script trims headers, but best to avoid spaces.  
> **Common mistake**: Tab names with typos. `"Product"` instead of `"Products"` will cause the script to auto-create a **second** Products tab, leaving yours unused.

---

## PHASE 2: GOOGLE APPS SCRIPT DEPLOYMENT

### 2.1 Create the Apps Script Project

1. In your Google Sheet, go to **Extensions → Apps Script**.
2. This opens the Apps Script editor in a new tab. A default `Code.gs` file exists with a `myFunction()` stub.
3. Delete the default content entirely.
4. **Important**: Do NOT use the "Create script from template" option. Start from a blank project.

### 2.2 Paste Code.gs

1. Open the file `apps-script/Code.gs` from your local repository in any text editor (Notepad, VS Code, etc.).
2. **Select ALL** content (Ctrl+A) and copy (Ctrl+C).
3. In the Apps Script editor, paste (Ctrl+V) into `Code.gs`.
4. Press **Ctrl+S** (or File → Save) to save.
5. Name the project: `RSMachinery API` (or any name you prefer — this is internal).

### 2.3 Configure Spreadsheet ID

1. In the Apps Script editor, find **line 14**:
   ```
   var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
2. Replace `'YOUR_SPREADSHEET_ID_HERE'` with your actual Spreadsheet ID from **Phase 1.1**.
3. Correct example:
   ```
   var SPREADSHEET_ID = '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T';
   ```
4. Press **Ctrl+S** to save.

### 2.4 Verify Script Properties (Optional)

Some deployments use Script Properties for sensitive data. This project keeps `SPREADSHEET_ID` directly in the code for simplicity. No Script Properties are required.

### 2.5 Deploy the Web App

1. Click the **Deploy** button (blue button top-right) → **New deployment**.
2. Click the gear icon (type selector) and choose **Web app**.
3. Fill in the deployment form:

| Field | Value |
|---|---|
| **Description** | `RSMachinery API v1.0` (or whatever you like) |
| **Execute as** | **Me** *(your Google account email)* |
| **Who can access** | **Anyone** *(this makes it public — the API has its own auth)* |

4. Click **Deploy**.
5. A modal will appear. Click **Authorize access** (you may need to log into your Google account).
6. The authorization screen will show a warning: *"This app is not verified"*. Click **Advanced → Go to RSMachinery API (unsafe)**. This is normal for personal/small-business Apps Script projects.
7. Grant the required permissions:
   - **View and manage your spreadsheets in Google Drive**
   - (Possibly) **Connect to an external service**
8. After authorization, you will see the **Web App URL**:

```
https://script.google.com/macros/s/AKfycbyxyz123abc456def/exec
```

9. **Copy this URL immediately**. You will need it for **Phase 4**.

### 2.6 Common Deployment Mistakes

| Mistake | Symptom | Fix |
|---|---|---|
| **Wrong Execute As** | API returns `401 Unauthorized` for all requests, or CORS errors | Redeploy with **Execute as: Me** |
| **Wrong Access setting** | Public site returns `401` or `404` | Redeploy with **Who can access: Anyone** |
| **Using Editor URL instead of Deployed URL** | Login returns `{"success":false,"error":"Route parameter required"}` | Use the `/exec` URL from Deploy modal |
| **Old deployment version** | Changes not reflected after editing code | Click **Deploy → Manage deployments → Copy latest version** or create new deployment |
| **Spreadsheet ID missing/wrong** | `TypeError: Cannot read property 'getSheetByName' of null` | Double-check the ID in line 14 |
| **Missing sheet tabs** | Script auto-creates tabs but with wrong headers | Ensure tab names match exactly (case-sensitive) |

### 2.7 How to Update After Changes

If you modify `Code.gs` later:

1. Edit the code in the Apps Script editor.
2. Click **Deploy → Manage deployments**.
3. Find your active deployment and click the pencil/edit icon.
4. Click **Deploy** (this creates a new version).
5. The **Web App URL stays the same**. You do NOT need to update the URL in `api.js`.

---

## PHASE 3: HOSTINGER DEPLOYMENT

### 3.1 Access Hostinger File Manager

1. Log in to your **Hostinger hPanel**.
2. Go to **Hosting → Manage → File Manager**.
3. Navigate to `public_html/` (your website's root directory).

### 3.2 Upload Public Website Files

1. On your local machine, select ALL files and folders inside the `website/` directory:
   - `index.html`
   - `products.html`
   - `product.html`
   - `styles.css`
   - `js/` (entire folder)
   - `assets/` (entire folder)
2. **Do NOT** include the `website/` folder itself — upload its **contents**.
3. Upload these into `public_html/` on Hostinger.
4. Verify the structure after upload:

```
public_html/
  index.html
  products.html
  product.html
  styles.css
  js/
    api.js
    app.js
  assets/
    placeholder.svg
    hero-images/...
    product img/...
    (other images)
```

### 3.3 Configure Root Domain

1. In Hostinger hPanel, go to **Hosting → Domain**.
2. Ensure your primary domain (e.g., `rsmachinery.com`) points to `public_html/`.
3. If you are using a domain purchased elsewhere, update nameservers to Hostinger's:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`
4. Wait for DNS propagation (up to 24 hours, typically 1-2 hours).

### 3.4 Create Admin Subdomain

1. In Hostinger hPanel, go to **Hosting → Domains → Subdomain**.
2. Create a subdomain: **`admin`** → (e.g., `admin.rsmachinery.com`).
3. Set the document root to: `public_html/admin`
4. The subdomain will take effect within a few minutes.

### 3.5 Upload Admin Files

1. On your local machine, select ALL files inside the `admin/` directory:
   - `index.html`
   - `dashboard.html`
   - `products.html`
   - `product-form.html`
   - `categories.html`
   - `inquiries.html`
   - `settings.html`
   - `css/admin.css`
   - `js/api.js`
   - `js/admin.js`
2. Upload these into the subdomain's document root (`public_html/admin`), **not** into `public_html/`.
3. Verify the admin subdomain structure:

```
admin.rsmachinery.com (→ public_html/admin/)
  index.html
  dashboard.html
  products.html
  product-form.html
  categories.html
  inquiries.html
  settings.html
  css/
    admin.css
  js/
    api.js
    admin.js
```

### 3.6 SSL Verification

1. In Hostinger hPanel, go to **SSL**.
2. Enable **Auto SSL** or **Let's Encrypt** for both:
   - `rsmachinery.com`
   - `admin.rsmachinery.com`
3. Click **Install** and wait for the green "SSL Active" status.
4. Verify: Visit `https://rsmachinery.com` and `https://admin.rsmachinery.com` — you should see a padlock icon in the address bar.
5. **Important**: If the site loads but shows "Not Secure," force HTTPS redirect:
   - Go to **Hosting → Advanced → Redirects**
   - Add: Redirect `http://rsmachinery.com` → `https://rsmachinery.com` (301 Permanent)
   - Add: Redirect `http://admin.rsmachinery.com` → `https://admin.rsmachinery.com` (301 Permanent)

### 3.7 DNS Verification

Run these checks to confirm everything resolves:

| Check | Expected Result |
|---|---|
| `https://rsmachinery.com` | Loads the RSMachinery homepage |
| `https://rsmachinery.com/products.html` | Loads the product listing page |
| `https://rsmachinery.com/product.html` | Loads the product detail page |
| `https://admin.rsmachinery.com` | Loads the admin login page |
| `https://admin.rsmachinery.com/dashboard.html` | Redirects to login (if not authenticated) |
| SSL Status (both domains) | Padlock icon, valid certificate |

> **Common mistake**: Uploading admin files inside `public_html/rsmachinery/admin/` instead of the subdomain root. The subdomain document root MUST be set to the directory containing the admin files.

---

## PHASE 4: CONFIGURATION

### 4.1 Configuration Table

| Configuration Item | Where to Set It | Value Type | Example |
|---|---|---|---|
| Spreadsheet ID | `apps-script/Code.gs` line 14 | String | `1A2B3C...` |
| API Web App URL | `website/js/api.js` line 11 | URL | `https://script.google.com/macros/s/abc123/exec` |
| API Web App URL | `admin/js/api.js` line 11 | URL | `https://script.google.com/macros/s/abc123/exec` |
| API Web App URL | Admin Settings page (runtime) | URL | Same URL |
| WhatsApp Number | `website/index.html` (multiple hrefs) | Phone | `918708795253` |
| Phone Number | `website/index.html` (tel links) | Phone | `+918708795253` |
| Admin Password | First login on admin site | Any string | Set by first admin user |

### 4.2 Step-by-Step: Update Spreadsheet ID

**File**: `D:\rs website\apps-script\Code.gs` **line 14**

```javascript
// BEFORE (placeholder — will NOT work):
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// AFTER (replace with your real ID):
var SPREADSHEET_ID = '1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T';
```

> **You must do this BEFORE deploying the Apps Script.** If you already deployed, edit it in the Apps Script editor and re-deploy (Phase 2.7).

### 4.3 Step-by-Step: Update API URL in Both api.js Files

**File 1**: `D:\rs website\website\js\api.js` **line 11**  
**File 2**: `D:\rs website\admin\js\api.js` **line 11**

```javascript
// BEFORE (placeholder):
var BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// AFTER (paste your actual Web App URL from Phase 2.5 step 9):
var BASE_URL = 'https://script.google.com/macros/s/AKfycbyxyz123abc456def/exec';
```

> **Critical**: Both files must have the SAME URL. The website API client and admin API client are separate copies — both must be updated.

### 4.4 Step-by-Step: Save API URL in Admin Settings

This is a **runtime fallback**. It overrides the hardcoded URL in `admin/js/api.js`:

1. Visit `https://admin.rsmachinery.com`
2. Complete first-time login (Phase 5.3).
3. In the sidebar, click **Settings**.
4. In the **API Configuration** card, paste the Web App URL.
5. Click **Save URL**.
6. A toast will confirm: "API URL updated."

### 4.5 Verification After Configuration

| Check | How |
|---|---|
| Spreadsheet ID correct | Open Apps Script → Run `doGet` test → Google Sheet shows auto-created tabs |
| API URL correct | Open browser DevTools → Network tab → Visit website → Requests go to your `/exec` URL |
| Admin API URL correct | Open admin Settings page → Input shows your URL |

---

## PHASE 5: PRE-LAUNCH TESTING CHECKLIST

### 5.1 Public Website Tests

- [ ] **Homepage loads**: `https://rsmachinery.com` — hero slider, products grid, category filters visible
- [ ] **About section renders**: Text and images load without broken assets
- [ ] **Contact section renders**: Address, phone, WhatsApp links, inquiry form visible
- [ ] **Footer renders**: Quick links, contact info, copyright year (2026)
- [ ] **All images load**: No broken image icons anywhere
- [ ] **CSS loads**: Colors, fonts (Manrope/Sora), layout matches original design
- [ ] **Mobile responsive**: Resize to 375px width — no horizontal scroll, nav hamburger works
- [ ] **Language toggle (English → Hindi → English)**: Text switches correctly for all labels
- [ ] **Language toggle persists**: Click Hindi → refresh page → state is maintained
- [ ] **Placeholder image**: View a product with no image → placeholder.svg displays

### 5.2 Product Features

- [ ] **Product cards render**: Name, image, short description, WhatsApp button visible
- [ ] **Category filter works**: Click a category — only products in that category show
- [ ] **"All" filter works**: Click "All" — all products return
- [ ] **Search works**: Type "hoist" — only matching products appear
- [ ] **Search debounced**: Rapid typing does NOT fire API calls on every keystroke
- [ ] **Search + category combined**: Select category + type search — both filters apply
- [ ] **Empty search results**: Search for "zzzx" — "No products found" message shows
- [ ] **Product detail page**: Click a product → URL changes to `product.html?slug=...`
- [ ] **Product specs display**: Specifications table renders with label/value rows
- [ ] **Product variations display**: Variations table (if any) renders with label/price
- [ ] **WhatsApp button on detail page**: Click → opens WhatsApp with pre-filled message
- [ ] **Gallery images**: (If multiple images exist) gallery displays correctly
- [ ] **Breadcrumbs**: Product detail shows Home > Products > Product Name

### 5.3 Admin Panel

- [ ] **Login page loads**: `https://admin.rsmachinery.com` — centered login card
- [ ] **First-time login**: Enter any password → redirects to dashboard → success toast
- [ ] **Subsequent login**: Same password → redirects to dashboard
- [ ] **Invalid password**: Wrong password → "Invalid password" error message
- [ ] **Logout**: Click Logout → redirects to login page
- [ ] **Session persistence**: Refresh dashboard page — stays logged in
- [ ] **Session expiry**: Login on browser A, login again on browser B → browser A gets "Unauthorized" on next API call → toast + redirect to login
- [ ] **Sidebar navigation**: All links (Dashboard, Products, Categories, Inquiries, Settings) work
- [ ] **Mobile sidebar**: Hamburger toggle opens/closes sidebar

### 5.4 Product CRUD (Admin)

- [ ] **Products list**: Navigate to Products → table shows all products with ID, Name, Category, Featured, Active, Actions
- [ ] **Edit product**: Click Edit on any product → product-form.html?id=X loads with pre-filled data
- [ ] **Add product**: Navigate to product-form.html (no ?id) → empty form
- [ ] **Save new product**: Fill name, category, description → Submit → success toast → redirect to products list → new product appears
- [ ] **Update existing product**: Edit name, description → Submit → success toast → updated in list
- [ ] **JSON fields save correctly**: Enter `[{"label":"Test","value":"100"}]` in specifications → save → edit again → JSON is preserved
- [ ] **Invalid JSON rejected**: Enter `{bad json}` in specifications → error toast → form not submitted
- [ ] **Featured toggle**: Check featured → save → "Yes" shows in products list
- [ ] **Active toggle**: Uncheck active → save → product hidden from public site but visible in admin
- [ ] **Delete (soft)**: Click Delete → confirm dialog → product deactivated → "No" in Active column
- [ ] **Sort order**: Set sort_order → products respect order on public site

### 5.5 Category CRUD (Admin)

- [ ] **Categories list**: Shows all categories with ID, Name, Slug, Sort
- [ ] **Add category**: Type name, description → Submit → appears in list
- [ ] **Edit category**: Click Edit → form pre-filled → change name → Submit → updated
- [ ] **Delete category**: Click Delete → confirm → deactivated
- [ ] **Category used in products**: Add product with a category → product shows under that filter

### 5.6 Inquiry System

- [ ] **Submit inquiry**: Fill name, phone, message on public site → Submit → success
- [ ] **Inquiry appears in admin**: Go to Inquiries in admin → new inquiry visible
- [ ] **Inquiry details**: Date, name, phone, product, message, status all display
- [ ] **Status toggle**: Change status from "new" to "read" → click Update → status changes
- [ ] **Status toggle**: Change to "replied" → updates correctly
- [ ] **Inquiry list reverse-chronological**: Newest inquiry appears first

### 5.7 Dashboard

- [ ] **Stats load**: Active Products, Featured Products, Total Products, Active Categories, New Inquiries, Total Inquiries numbers display
- [ ] **Recent inquiries table**: Shows last 5 inquiries with date, name, phone, product, status
- [ ] **Numbers are accurate**: Cross-check dashboard counts against actual sheet data

### 5.8 Settings & Security

- [ ] **API URL settings**: Settings page shows current URL → change it → saved
- [ ] **Password change**: Enter current password + new password → Submit → "Password changed" toast
- [ ] **Password change persists**: Logout → login with new password → success
- [ ] **Password change rejects old password**: Try old password after change → "Invalid password"
- [ ] **Short password rejected**: Try 3-char password → error toast
- [ ] **Empty password rejected**: Submit with empty fields → error toast

### 5.9 Cross-Cutting

- [ ] **API error handling**: Kill network → all pages show "Failed to load" / "Network error" messages
- [ ] **Link: WhatsApp floating button**: Bottom-right corner → opens WhatsApp
- [ ] **Link: Phone buttons**: All "Call Now" buttons have correct `tel:+918708795253`
- [ ] **Link: WhatsApp buttons**: All WhatsApp links have correct `wa.me/918708795253`
- [ ] **No console errors**: Open DevTools Console — no 404s, no TypeError, no uncaught exceptions
- [ ] **No broken links**: Click every navigation link — no 404 pages
- [ ] **Browser back button**: Navigate through products → back button works correctly

---

## PHASE 6: PRODUCTION TESTING — 50 CRITICAL TESTS

### Test Execution Instructions

1. Open two browser tabs: one for the public site, one for the admin panel.
2. Have a DevTools console open (F12) on both tabs.
3. For each test, record **Pass** or **Fail**.
4. If any test fails, mark it and fix before going live.

---

### 6.1 Public Site — Core (Tests 01–12)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 01 | Homepage Load | Navigate to `https://rsmachinery.com` | Page loads in <3 seconds. Hero slider visible. Product grid visible. Footer visible. | |
| 02 | Responsive Layout | Resize browser to 375px width | No horizontal scroll. Mobile menu hamburger appears. Cards stack vertically. | |
| 03 | Language Toggle | Click language button (Hindi → English) | All `data-i18n` text elements switch between English and Hindi. Button label toggles. | |
| 04 | Product Cards Render | Scroll to product grid | Each card has image, name, short description, WhatsApp button. No broken images. | |
| 05 | Product Card Links | Click a product card name | Navigates to `product.html?slug=<slug>` with correct product. | |
| 06 | Category Filter | Click a category button (e.g., "Hoists & Cranes") | Grid filters to only products in that category. Active button highlighted. | |
| 07 | "All" Filter | Click "All" button | All active products display. "All" button is active. | |
| 08 | Search — Match | Type "wire" in search box | Products matching "wire" appear. Non-matching products hidden. | |
| 09 | Search — No Match | Type "xyznonexistent" | "No products found" message displays. | |
| 10 | Search + Category | Select category + type search | Both filters apply simultaneously. | |
| 11 | Empty Product Category | Create a category with 0 products (via admin) | Category button still shows. Clicking it shows "No products found." | |
| 12 | WhatsApp Float Button | Click the floating WhatsApp icon | Opens WhatsApp with pre-filled number `918708795253`. | |

### 6.2 Public Site — Product Detail (Tests 13–22)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 13 | Product Detail Load | Click any product | `product.html` loads with product image, name, description, specs. | |
| 14 | Specifications Table | View product with specs | Specs display as a two-column table (label/value). | |
| 15 | Variations Table | View product with variations | Variations display with label and price columns. | |
| 16 | No Specs / Variations | View product without specs/variations | Section is hidden (no empty table). | |
| 17 | Breadcrumb | Product detail page | Shows: Home > Products > Product Name. Each part is clickable. | |
| 18 | WhatsApp Button (Detail) | Click WhatsApp button on product detail | Opens WhatsApp with pre-filled "I'm interested in [Product Name]". | |
| 19 | Back to Products | Click "Products" in breadcrumb | Navigates to `products.html`. | |
| 20 | Direct URL Access | Navigate to `product.html?slug=non-existent` | Shows "Product not found" message (or 404-style error). | |
| 21 | Direct ID Access | Navigate to `product.html?id=1` | Loads product with ID 1. | |
| 22 | Gallery Images | View product with gallery_images JSON | Gallery thumbnails display. Click to view larger. | |

### 6.3 Public Site — Inquiry Form (Tests 23–26)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 23 | Submit Inquiry | Fill name, phone, message → Submit | Success message appears. Data appears in admin Inquiries. | |
| 24 | Empty Fields | Click Submit with empty fields | HTML5 validation prevents submission (or shows error). | |
| 25 | Special Characters | Enter `<script>` tags in message field | Tags are sanitized/stripped. Inquiry saves without script tags. | |
| 26 | Long Message | Enter 3000+ character message | Message is truncated to 2000 characters. | |

### 6.4 Admin — Authentication (Tests 27–35)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 27 | Login Page | Visit `https://admin.rsmachinery.com` | Login form displays. No auto-redirect. | |
| 28 | First-Time Login | Enter password "admin123" | Redirects to dashboard. Toast: "First-time setup complete." | |
| 29 | Relogin (Correct) | Logout → Login with same password | Redirects to dashboard. No first-time message. | |
| 30 | Relogin (Wrong) | Enter incorrect password | "Invalid password" error. Stays on login page. | |
| 31 | Logout | Click Logout button | Redirects to login page. `sessionStorage` cleared. | |
| 32 | Direct URL (No Auth) | Visit `dashboard.html` without logging in | Redirects to `index.html` (login page). | |
| 33 | Session Persistence | Login → Refresh browser | Stays logged in. Dashboard loads. | |
| 34 | Session Expiry | Login on Browser A → Login on Browser B → Return to Browser A and trigger an API call | Toast: "Session expired. Redirecting to login." Redirects to login page. | |
| 35 | HTTPS Redirect | Visit `http://admin.rsmachinery.com` | Redirects to `https://admin.rsmachinery.com` | |

### 6.5 Admin — Dashboard (Tests 36–38)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 36 | Dashboard Load | After login | Stats grid with 6 cards displays. Recent inquiries table visible. | |
| 37 | Stats Accuracy | Cross-check with Google Sheet | Active Products = count of TRUE in Products sheet. New Inquiries = count of "new" in Inquiries. | |
| 38 | Recent Inquiries | Check recent inquiries table | Shows 5 most recent inquiries (or fewer if less exist). | |

### 6.6 Admin — Products (Tests 39–44)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 39 | Products List | Go to Products | All non-deleted products appear with ID, Name, Category, Featured, Active, Actions. | |
| 40 | Add Product | Create product with all fields filled | Saved. Appears in list. Appears on public site (if Active). | |
| 41 | Edit Product | Change name, description, price (in variations JSON) → Submit | Updated. Public site reflects changes. | |
| 42 | Delete Product | Click Delete → Confirm | Product deactivated. Column shows "No" for Active. Hidden from public site. | |
| 43 | JSON Validation | Enter invalid JSON in Specifications → Submit | Toast error: "Specifications must be valid JSON." Form not submitted. | |
| 44 | Boolean Fields | Add product with Featured=checked, Active=checked | Shows "Yes" for both in list. Appears in featured filter on site. | |

### 6.7 Admin — Categories (Tests 45–47)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 45 | Add Category | Enter name, description → Submit | Category added. Appears in category filter on public site. | |
| 46 | Edit Category | Change category name → Submit | Updated everywhere. Products assigned to this category show new name. | |
| 47 | Delete Category | Delete → Confirm | Category deactivated (soft delete). Hidden from public site filters. | |

### 6.8 Admin — Inquiries & Settings (Tests 48–50)

| # | Test Name | Action | Expected Result | Pass/Fail |
|---|---|---|---|---|
| 48 | Inquiry Status | Select "read" → Update | Status badge changes. On reload, status persists. | |
| 49 | Password Change | Current password → New password → Submit | Toast: "Password changed successfully." Logout → New password works. | |
| 50 | Full Product Lifecycle | Add product → Verify on website → Edit → Verify change → Delete → Verify hidden | Complete cycle works without errors. | |

---

## PHASE 7: BACKUP STRATEGY

### 7.1 What to Back Up

| Asset | Where It Lives | Backup Method | Frequency |
|---|---|---|---|
| Google Sheet (all data) | Google Drive | **File → Make a copy** (manual) or **Google Takeout** (automated) | Weekly |
| Apps Script Code.gs | Google Drive (Apps Script project) | **File → Download → .gs file** OR copy-paste to local repo | After every code change |
| Website HTML/CSS/JS | GitHub repo (`website/`) | `git push` | After every change |
| Admin HTML/CSS/JS | GitHub repo (`admin/`) | `git push` | After every change |
| Images & Assets | GitHub repo (`website/assets/`) | `git push` | After every asset change |

### 7.2 Google Sheet Backup (Manual)

1. Open the Google Sheet.
2. **File → Make a copy**.
3. Name it: `RSMachinery Backup YYYY-MM-DD`.
4. Store it in a separate folder (e.g., "Backups") in Google Drive.
5. **Do NOT** change the data in the backup. It is for restore-only.

### 7.3 Google Sheet Backup (Automated — Apps Script)

Create a NEW Apps Script file inside the Google Sheet:

```
Tools → Script editor → New script file → backup.gs
```

Paste this backup script (you need to write your own; here is a template):

```javascript
function createBackup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var backupName = 'RSMachinery Backup ' + Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
  var existing = DriveApp.getFilesByName(backupName);
  if (existing.hasNext()) return; // already backed up today
  ss.makeCopy(backupName, DriveApp.getFolderById('YOUR_BACKUP_FOLDER_ID'));
}
```

Then set a time-driven trigger:
- Click the clock icon (Triggers) → Add Trigger
- Function: `createBackup`
- Time-driven: **Weekly** (e.g., every Monday 2:00 AM)

### 7.4 Apps Script Backup

1. Open the Apps Script project.
2. **File → Manage versions → Save new version**.
3. Use descriptive names: `v1.0-launch`, `v1.1-fix-login`, etc.
4. Additionally, always keep `apps-script/Code.gs` in your GitHub repo.
5. After every change to Code.gs, commit the updated file to GitHub.

### 7.5 GitHub Backup (Repo Mirror)

Your local repo should already be connected to GitHub. To ensure everything is backed up:

```bash
git add -A
git commit -m "Deployment: YYYY-MM-DD description"
git push origin main
```

**What to commit**:
- `apps-script/Code.gs` — always (with SPREADSHEET_ID replaced)
- `website/` — always
- `admin/` — always
- `DEPLOYMENT.md` — always
- `.gitignore` — always

**What NOT to commit**: Secrets like `admin_key` values. These are auto-generated at runtime and stored in Google Sheets/Session Storage, never in the repo.

### 7.6 Recovery Process

#### Scenario A: Google Sheet corrupted or deleted

1. If you have a backup copy: **File → Open** the backup → **File → Make a copy** → Use the new copy's Spreadsheet ID.
2. Update `SPREADSHEET_ID` in Apps Script Code.gs.
3. Re-deploy Apps Script (Phase 2.7).
4. If the backup is more than 24 hours old, you will lose data entered after the backup.

#### Scenario B: Apps Script deleted or corrupted

1. Open `apps-script/Code.gs` from your GitHub repo.
2. Create a new Apps Script project (Phase 2.1).
3. Paste the code, update `SPREADSHEET_ID`.
4. Deploy and get a new Web App URL.
5. Update `api.js` files (Phase 4.3) and admin Settings (Phase 4.4).

#### Scenario C: Hostinger files lost

1. Pull the latest from GitHub: `git pull origin main`.
2. Re-upload `website/` contents to `public_html/` (Phase 3.2).
3. Re-upload `admin/` contents to `admin.rsmachinery.com` (Phase 3.5).

#### Scenario D: Admin password lost

1. Open the Google Sheet → **Settings** tab.
2. **Delete the rows** for `admin_password_hash` and `admin_key` (delete both rows, not just the values).
3. Visit `https://admin.rsmachinery.com` — the system will enter **first-time setup mode**.
4. Enter a new password. This becomes the new admin password.
5. A new `admin_password_hash` and `admin_key` will be auto-generated.

> **Warning**: Deleting these rows resets ALL admin sessions. All previously logged-in browsers will need to re-login.

---

## APPENDIX: File Manifest

### Public Website (`website/`)

| File | Description | Must Deploy? |
|---|---|---|
| `index.html` | Homepage with hero, products, contact, inquiry form | Yes |
| `products.html` | Full product listing with filters, search, pagination | Yes |
| `product.html` | Product detail page with specs, variations, WhatsApp | Yes |
| `styles.css` | All styles: 2960 lines | Yes |
| `js/api.js` | API client — must update BASE_URL | Yes |
| `js/app.js` | Frontend app: language toggle, product grid, slider, etc. | Yes |
| `assets/placeholder.svg` | Fallback image for products without images | Yes |

### Admin Portal (`admin/`)

| File | Description | Must Deploy? |
|---|---|---|
| `index.html` | Login page | Yes |
| `dashboard.html` | Dashboard with stats and recent inquiries | Yes |
| `products.html` | Product list with edit/delete | Yes |
| `product-form.html` | Add/Edit product form | Yes |
| `categories.html` | Category list with add/edit/delete | Yes |
| `inquiries.html` | Inquiry list with status toggle | Yes |
| `settings.html` | API URL config + password change | Yes |
| `css/admin.css` | Admin panel styles | Yes |
| `js/api.js` | API client (self-contained copy) | Yes |
| `js/admin.js` | Admin app logic: auth, sidebar, page controllers | Yes |

### Backend (`apps-script/`)

| File | Description | Must Deploy to Apps Script? |
|---|---|---|
| `Code.gs` | Complete backend API — 757 lines | Yes |

---

## END OF DEPLOYMENT GUIDE
