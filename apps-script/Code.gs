/**
 * RS Machinery - Google Apps Script Backend
 *
 * Single-file API for product management system.
 * Google Sheets as database, Apps Script as API.
 *
 * Deployment: Extensions → Apps Script → Deploy → Web app
 * Execute as: Me
 * Who can access: Anyone
 */

// ─── SHEET NAMES ────────────────────────────────────────────────────────────

var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
var CACHE_TTL = 300; // seconds

var SHEET_PRODUCTS   = 'Products';
var SHEET_CATEGORIES = 'Categories';
var SHEET_SETTINGS   = 'Settings';
var SHEET_INQUIRIES  = 'Inquiries';

// ─── ENTRY POINTS ───────────────────────────────────────────────────────────

function doGet(e) {
  return handleRequest(e, 'get');
}

function doPost(e) {
  return handleRequest(e, 'post');
}

function doOptions(e) {
  return createResponse({ success: true });
}

// ─── ROUTER ─────────────────────────────────────────────────────────────────

function handleRequest(e, method) {
  try {
    var route = e && e.parameter && e.parameter.route ? e.parameter.route.trim() : '';
    if (!route) {
      return createResponse({ success: false, error: 'Route parameter required' });
    }

    switch (route) {

      // ── Public Routes ──

      case 'login':
        if (method !== 'post') return createResponse({ success: false, error: 'Use POST' });
        return handleLogin(e);

      case 'getProducts':
        return handleGetProducts(e);

      case 'getProduct':
        return handleGetProduct(e);

      case 'getCategories':
        return handleGetCategories();

      case 'addInquiry':
        if (method !== 'post') return createResponse({ success: false, error: 'Use POST' });
        return handleAddInquiry(e);

      // ── Admin Routes (auth required) ──

      case 'getDashboard':
        return requireAuth(e, handleGetDashboard);

      case 'getInquiries':
        return requireAuth(e, handleGetInquiries);

      case 'addProduct':
        return requireAuth(e, handleAddProduct);

      case 'updateProduct':
        return requireAuth(e, handleUpdateProduct);

      case 'deleteProduct':
        return requireAuth(e, handleDeleteProduct);

      case 'addCategory':
        return requireAuth(e, handleAddCategory);

      case 'updateCategory':
        return requireAuth(e, handleUpdateCategory);

      case 'deleteCategory':
        return requireAuth(e, handleDeleteCategory);

      case 'updateInquiry':
        return requireAuth(e, handleUpdateInquiry);

      case 'changePassword':
        return requireAuth(e, handleChangePassword);

      default:
        return createResponse({ success: false, error: 'Unknown route: ' + route });
    }
  } catch (err) {
    return createResponse({ success: false, error: err.message });
  }
}

// ─── AUTH ───────────────────────────────────────────────────────────────────

function sha256(input) {
  var digest = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    input,
    Utilities.Charset.UTF_8
  );
  return digest.map(function (b) {
    return ('0' + ((b + 256) % 256).toString(16)).slice(-2);
  }).join('');
}

function getSetting(key) {
  var sheet = getSheet(SHEET_SETTINGS);
  var rows = sheet.getDataRange().getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === key) {
      return String(rows[i][1]).trim();
    }
  }
  return null;
}

function updateSetting(key, value) {
  var sheet = getSheet(SHEET_SETTINGS);
  var rows = sheet.getDataRange().getValues();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value]);
}

function generateKey() {
  return Utilities.getUuid();
}

function validateKey(adminKey) {
  if (!adminKey) return false;
  var storedKey = getSetting('admin_key');
  return storedKey === adminKey;
}

function requireAuth(e, handler) {
  var adminKey = e.parameter.admin_key || '';
  if (!validateKey(adminKey)) {
    return createResponse({ success: false, error: 'Unauthorized' });
  }
  return handler(e);
}

// ─── RESPONSE HELPER ────────────────────────────────────────────────────────

function createResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ─── SHEET HELPERS ──────────────────────────────────────────────────────────

var _ss = null;

function getSpreadsheet() {
  if (!_ss) _ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return _ss;
}

function getSheet(name) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Add default headers
    if (name === SHEET_PRODUCTS) {
      sheet.appendRow(['id','name','slug','category_id','seo_title','seo_description','short_description','description','image','gallery_images','specifications','variations','featured','active','sort_order','created_at','updated_at']);
    } else if (name === SHEET_CATEGORIES) {
      sheet.appendRow(['id','name','slug','description','image','active','sort_order','created_at','updated_at']);
    } else if (name === SHEET_SETTINGS) {
      sheet.appendRow(['key','value']);
    } else if (name === SHEET_INQUIRIES) {
      sheet.appendRow(['id','date','name','phone','product','message','status']);
    }
  }
  return sheet;
}

function getHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < 1) return [];
  var headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  return headerRow.map(function (h) { return String(h).trim(); });
}

function rowToObject(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length && i < row.length; i++) {
    var val = row[i];
    // Try to parse JSON strings for specs/variations
    if (typeof val === 'string' && val.length > 0 &&
        (headers[i] === 'specifications' || headers[i] === 'variations' || headers[i] === 'gallery_images')) {
      try { val = JSON.parse(val); } catch (e) { /* keep as string */ }
    }
    obj[headers[i]] = val;
  }
  return obj;
}

function getAllRows(sheet, activeOnly) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0].map(function (h) { return String(h).trim(); });
  var results = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0] === '' || row[0] === null) continue; // skip empty rows
    if (activeOnly) {
      var activeIdx = headers.indexOf('active');
      if (activeIdx >= 0 && (String(row[activeIdx]).toUpperCase() !== 'TRUE' && row[activeIdx] !== true)) continue;
    }
    results.push(rowToObject(headers, row));
  }
  return results;
}

function getRowById(sheet, id) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;
  var headers = data[0].map(function (h) { return String(h).trim(); });
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[0]).trim() === String(id)) {
      return rowToObject(headers, row);
    }
  }
  return null;
}

function getRowBySlug(sheet, slug) {
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return null;
  var headers = data[0].map(function (h) { return String(h).trim(); });
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (String(row[1]).trim().toLowerCase() === String(slug).trim().toLowerCase()) {
      return rowToObject(headers, row);
    }
  }
  return null;
}

function getNextId(sheet) {
  var data = sheet.getDataRange().getValues();
  var maxId = 0;
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] !== '' && data[i][0] !== null) {
      var id = Number(data[i][0]);
      if (id > maxId) maxId = id;
    }
  }
  return maxId + 1;
}

function generateSlug(str) {
  return str.toString().toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

function findRowIndex(sheet, id) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(id)) {
      return i + 1;
    }
  }
  return -1;
}

// ─── HANDLERS: AUTH ─────────────────────────────────────────────────────────

function handleLogin(e) {
  var password = e.parameter.password || '';
  var storedHash = getSetting('admin_password_hash');

  if (!storedHash) {
    // First-time setup: store whatever password is sent
    var hash = sha256(password);
    updateSetting('admin_password_hash', hash);
    var key = generateKey();
    updateSetting('admin_key', key);
    return createResponse({ success: true, data: { admin_key: key, first_time: true } });
  }

  var inputHash = sha256(password);
  if (inputHash !== storedHash) {
    return createResponse({ success: false, error: 'Invalid password' });
  }

  // Generate new key (invalidates previous sessions)
  var key = generateKey();
  updateSetting('admin_key', key);

  return createResponse({ success: true, data: { admin_key: key } });
}

// ─── HANDLERS: PRODUCTS ─────────────────────────────────────────────────────

function handleGetProducts(e) {
  var sheet = getSheet(SHEET_PRODUCTS);
  var allProducts = getAllRows(sheet, false);
  var categoryId = e.parameter.category_id || '';
  var search = e.parameter.search || '';
  var featured = e.parameter.featured || '';
  var page = parseInt(e.parameter.page, 10) || 1;
  var limit = parseInt(e.parameter.limit, 10) || 20;

  // Filter: active only (public)
  var filtered = allProducts.filter(function (p) {
    if (String(p.active).toUpperCase() !== 'TRUE' && p.active !== true) return false;
    return true;
  });

  // Filter: featured
  if (featured === 'true' || featured === 'TRUE' || featured === true) {
    filtered = filtered.filter(function (p) {
      return String(p.featured).toUpperCase() === 'TRUE' || p.featured === true;
    });
  }

  // Filter: category
  if (categoryId) {
    filtered = filtered.filter(function (p) {
      return String(p.category_id) === String(categoryId);
    });
  }

  // Filter: search
  if (search) {
    var q = search.toLowerCase();
    filtered = filtered.filter(function (p) {
      var name = String(p.name || '').toLowerCase();
      var desc = String(p.short_description || '').toLowerCase();
      var full = String(p.description || '').toLowerCase();
      return name.indexOf(q) >= 0 || desc.indexOf(q) >= 0 || full.indexOf(q) >= 0;
    });
  }

  // Sort by sort_order then name
  filtered.sort(function (a, b) {
    var aOrder = Number(a.sort_order) || 0;
    var bOrder = Number(b.sort_order) || 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    var aName = String(a.name || '').toLowerCase();
    var bName = String(b.name || '').toLowerCase();
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  });

  // Paginate
  var total = filtered.length;
  var start = (page - 1) * limit;
  var paged = filtered.slice(start, start + limit);
  var hasMore = start + limit < total;

  return createResponse({
    success: true,
    data: {
      products: paged,
      total: total,
      page: page,
      limit: limit,
      hasMore: hasMore
    }
  });
}

function handleGetProduct(e) {
  var sheet = getSheet(SHEET_PRODUCTS);
  var id = e.parameter.id || '';
  var slug = e.parameter.slug || '';
  var product = null;

  if (id) {
    product = getRowById(sheet, id);
  } else if (slug) {
    product = getRowBySlug(sheet, slug);
  }

  if (!product) {
    return createResponse({ success: false, error: 'Product not found' });
  }

  // Ensure JSON fields are parsed
  try { if (typeof product.specifications === 'string') product.specifications = JSON.parse(product.specifications); } catch(e) { product.specifications = []; }
  try { if (typeof product.variations === 'string') product.variations = JSON.parse(product.variations); } catch(e) { product.variations = []; }
  try { if (typeof product.gallery_images === 'string') product.gallery_images = JSON.parse(product.gallery_images); } catch(e) { product.gallery_images = product.gallery_images ? [product.gallery_images] : []; }

  return createResponse({ success: true, data: { product: product } });
}

function handleAddProduct(e) {
  var sheet = getSheet(SHEET_PRODUCTS);
  var now = new Date().toISOString();
  var id = getNextId(sheet);
  var name = e.parameter.name || '';
  var slug = e.parameter.slug || generateSlug(name);

  // Sanitize JSON fields
  var specs = e.parameter.specifications || '[]';
  var variations = e.parameter.variations || '[]';
  var galleryImages = e.parameter.gallery_images || '[]';

  // Ensure valid JSON
  try { JSON.parse(specs); } catch(e) { specs = '[]'; }
  try { JSON.parse(variations); } catch(e) { variations = '[]'; }
  try { JSON.parse(galleryImages); } catch(e) { galleryImages = '[]'; }

  sheet.appendRow([
    id,
    name,
    slug,
    e.parameter.category_id || '',
    e.parameter.seo_title || '',
    e.parameter.seo_description || '',
    e.parameter.short_description || '',
    e.parameter.description || '',
    e.parameter.image || '',
    galleryImages,
    specs,
    variations,
    e.parameter.featured === 'true' ? 'TRUE' : 'FALSE',
    e.parameter.active === 'true' || e.parameter.active === '' ? 'TRUE' : 'FALSE',
    e.parameter.sort_order || '0',
    now,
    now
  ]);

  return createResponse({ success: true, data: { id: id } });
}

function handleUpdateProduct(e) {
  var sheet = getSheet(SHEET_PRODUCTS);
  var id = e.parameter.id || '';
  if (!id) return createResponse({ success: false, error: 'Product ID required' });

  var rowIndex = findRowIndex(sheet, id);
  if (rowIndex < 0) return createResponse({ success: false, error: 'Product not found' });

  var headers = getHeaders(sheet);
  var now = new Date().toISOString();

  // Fields that can be updated
  var fields = ['name','slug','category_id','seo_title','seo_description','short_description','description','image','gallery_images','specifications','variations','featured','active','sort_order'];

  var updates = {};
  for (var f = 0; f < fields.length; f++) {
    var key = fields[f];
    if (e.parameter[key] !== undefined && e.parameter[key] !== null) {
      var val = e.parameter[key];
      // Boolean normalization
      if (key === 'featured' || key === 'active') {
        val = (val === 'true' || val === true || val === 'TRUE') ? 'TRUE' : 'FALSE';
      }
      // JSON fields
      if (key === 'specifications' || key === 'variations' || key === 'gallery_images') {
        try { JSON.parse(val); } catch(e) { val = '[]'; }
      }
      updates[key] = val;
    }
  }
  updates.updated_at = now;

  // Apply updates (batch write)
  var updateKeys = Object.keys(updates);
  var minCol = Infinity;
  var maxCol = -Infinity;
  for (var ui = 0; ui < updateKeys.length; ui++) {
    var colIdx = headers.indexOf(updateKeys[ui]);
    if (colIdx >= 0) {
      if (colIdx < minCol) minCol = colIdx;
      if (colIdx > maxCol) maxCol = colIdx;
    }
  }
  if (maxCol >= 0) {
    var rowData = sheet.getRange(rowIndex, minCol + 1, 1, maxCol - minCol + 1).getValues()[0];
    for (var ui2 = 0; ui2 < updateKeys.length; ui2++) {
      var colIdx2 = headers.indexOf(updateKeys[ui2]);
      if (colIdx2 >= 0) {
        rowData[colIdx2 - minCol] = updates[updateKeys[ui2]];
      }
    }
    sheet.getRange(rowIndex, minCol + 1, 1, maxCol - minCol + 1).setValues([rowData]);
  }

  return createResponse({ success: true, data: {} });
}

function handleDeleteProduct(e) {
  var sheet = getSheet(SHEET_PRODUCTS);
  var id = e.parameter.id || '';
  if (!id) return createResponse({ success: false, error: 'Product ID required' });

  var rowIndex = findRowIndex(sheet, id);
  if (rowIndex < 0) return createResponse({ success: false, error: 'Product not found' });

  // Soft delete: set active to FALSE
  var headers = getHeaders(sheet);
  var activeIdx = headers.indexOf('active');
  if (activeIdx >= 0) {
    sheet.getRange(rowIndex, activeIdx + 1).setValue('FALSE');
  }

  return createResponse({ success: true, data: {} });
}

// ─── HANDLERS: CATEGORIES ───────────────────────────────────────────────────

function handleGetCategories() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('categories');
  if (cached) {
    try {
      var parsed = JSON.parse(cached);
      if (parsed && parsed.categories) {
        return createResponse({ success: true, data: parsed });
      }
    } catch (e) {}
  }

  var sheet = getSheet(SHEET_CATEGORIES);
  var allCategories = getAllRows(sheet, false);

  // Only return active
  var active = allCategories.filter(function (c) {
    return String(c.active).toUpperCase() === 'TRUE' || c.active === true;
  });

  active.sort(function (a, b) {
    var aOrder = Number(a.sort_order) || 0;
    var bOrder = Number(b.sort_order) || 0;
    if (aOrder !== bOrder) return aOrder - bOrder;
    var aName = String(a.name || '').toLowerCase();
    var bName = String(b.name || '').toLowerCase();
    return aName < bName ? -1 : aName > bName ? 1 : 0;
  });

  var result = { categories: active };
  cache.put('categories', JSON.stringify(result), CACHE_TTL);
  return createResponse({ success: true, data: result });
}

function handleAddCategory(e) {
  var sheet = getSheet(SHEET_CATEGORIES);
  var now = new Date().toISOString();
  var id = getNextId(sheet);
  var name = e.parameter.name || '';
  var slug = e.parameter.slug || generateSlug(name);

  sheet.appendRow([
    id,
    name,
    slug,
    e.parameter.description || '',
    e.parameter.image || '',
    'TRUE',
    e.parameter.sort_order || '0',
    now,
    now
  ]);

  CacheService.getScriptCache().remove('categories');
  return createResponse({ success: true, data: { id: id } });
}

function handleUpdateCategory(e) {
  var sheet = getSheet(SHEET_CATEGORIES);
  var id = e.parameter.id || '';
  if (!id) return createResponse({ success: false, error: 'Category ID required' });

  var rowIndex = findRowIndex(sheet, id);
  if (rowIndex < 0) return createResponse({ success: false, error: 'Category not found' });

  var headers = getHeaders(sheet);
  var now = new Date().toISOString();
  var fields = ['name','slug','description','image','active','sort_order'];

  for (var f = 0; f < fields.length; f++) {
    var key = fields[f];
    if (e.parameter[key] !== undefined && e.parameter[key] !== null) {
      var colIdx = headers.indexOf(key);
      if (colIdx >= 0) {
        sheet.getRange(rowIndex, colIdx + 1).setValue(e.parameter[key]);
      }
    }
  }
  var updatedAtIdx = headers.indexOf('updated_at');
  if (updatedAtIdx >= 0) {
    sheet.getRange(rowIndex, updatedAtIdx + 1).setValue(now);
  }

  CacheService.getScriptCache().remove('categories');
  return createResponse({ success: true, data: {} });
}

function handleDeleteCategory(e) {
  var sheet = getSheet(SHEET_CATEGORIES);
  var id = e.parameter.id || '';
  if (!id) return createResponse({ success: false, error: 'Category ID required' });

  var rowIndex = findRowIndex(sheet, id);
  if (rowIndex < 0) return createResponse({ success: false, error: 'Category not found' });

  var headers = getHeaders(sheet);
  var activeIdx = headers.indexOf('active');
  if (activeIdx >= 0) {
    sheet.getRange(rowIndex, activeIdx + 1).setValue('FALSE');
  }

  CacheService.getScriptCache().remove('categories');
  return createResponse({ success: true, data: {} });
}

// ─── HANDLERS: DASHBOARD ────────────────────────────────────────────────────

function handleGetDashboard(e) {
  var prodSheet = getSheet(SHEET_PRODUCTS);
  var catSheet = getSheet(SHEET_CATEGORIES);
  var inqSheet = getSheet(SHEET_INQUIRIES);

  var allProducts = getAllRows(prodSheet, false);
  var activeProducts = allProducts.filter(function (p) {
    return String(p.active).toUpperCase() === 'TRUE' || p.active === true;
  });
  var featuredProducts = activeProducts.filter(function (p) {
    return String(p.featured).toUpperCase() === 'TRUE' || p.featured === true;
  });

  var allCategories = getAllRows(catSheet, false);
  var activeCategories = allCategories.filter(function (c) {
    return String(c.active).toUpperCase() === 'TRUE' || c.active === true;
  });

  var allInquiries = getAllRows(inqSheet, false);
  var newInquiries = allInquiries.filter(function (i) {
    return String(i.status).toLowerCase() === 'new';
  });

  // Most recent inquiries
  var recent = allInquiries.slice(0, 5);

  return createResponse({
    success: true,
    data: {
      totalProducts: allProducts.length,
      activeProducts: activeProducts.length,
      featuredProducts: featuredProducts.length,
      totalCategories: allCategories.length,
      activeCategories: activeCategories.length,
      totalInquiries: allInquiries.length,
      newInquiries: newInquiries.length,
      recentInquiries: recent
    }
  });
}

// ─── HANDLERS: INQUIRIES ────────────────────────────────────────────────────

function handleGetInquiries(e) {
  var sheet = getSheet(SHEET_INQUIRIES);
  var inquiries = getAllRows(sheet, false);

  // Reverse: newest first
  inquiries.reverse();

  return createResponse({ success: true, data: { inquiries: inquiries } });
}

function handleAddInquiry(e) {
  var sheet = getSheet(SHEET_INQUIRIES);
  var now = new Date().toISOString();
  var id = getNextId(sheet);

  // Sanitize inputs
  var name = sanitize(e.parameter.name || '');
  var phone = sanitize(e.parameter.phone || '');
  var product = sanitize(e.parameter.product || '');
  var message = sanitize(e.parameter.message || '');

  sheet.appendRow([id, now, name, phone, product, message, 'new']);

  return createResponse({ success: true, data: {} });
}

// ─── HANDLERS: INQUIRY UPDATE ───────────────────────────────────────────────

function handleUpdateInquiry(e) {
  var sheet = getSheet(SHEET_INQUIRIES);
  var id = e.parameter.id || '';
  if (!id) return createResponse({ success: false, error: 'Inquiry ID required' });

  var rowIndex = findRowIndex(sheet, id);
  if (rowIndex < 0) return createResponse({ success: false, error: 'Inquiry not found' });

  var status = e.parameter.status || 'read';
  var headers = getHeaders(sheet);
  var statusIdx = headers.indexOf('status');
  if (statusIdx >= 0) {
    sheet.getRange(rowIndex, statusIdx + 1).setValue(status);
  }

  return createResponse({ success: true, data: {} });
}

// ─── HANDLERS: CHANGE PASSWORD ──────────────────────────────────────────────

function handleChangePassword(e) {
  var currentPassword = e.parameter.current_password || '';
  var newPassword = e.parameter.new_password || '';

  if (newPassword.length < 4) {
    return createResponse({ success: false, error: 'New password must be at least 4 characters' });
  }

  var storedHash = getSetting('admin_password_hash');
  var currentHash = sha256(currentPassword);

  if (currentHash !== storedHash) {
    return createResponse({ success: false, error: 'Current password is incorrect' });
  }

  var newHash = sha256(newPassword);
  updateSetting('admin_password_hash', newHash);

  // Invalidate existing sessions
  var newKey = generateKey();
  updateSetting('admin_key', newKey);

  return createResponse({ success: true, data: { admin_key: newKey, message: 'Password changed successfully.' } });
}

function sanitize(str) {
  return str.toString()
    .replace(/[<>"'&]/g, '')
    .replace(/[\\;()]/g, '')
    .substring(0, 2000);
}

// ─── DATABASE SETUP ──────────────────────────────────────────────────────────

var SHEET_DEFINITIONS = {
  Products: ['id','name','slug','category_id','seo_title','seo_description','short_description','description','image','gallery_images','specifications','variations','featured','active','sort_order','created_at','updated_at'],
  Categories: ['id','name','slug','description','image','active','sort_order','created_at','updated_at'],
  Settings: ['key','value'],
  Inquiries: ['id','date','name','phone','product','message','status']
};

var DEFAULT_SETTINGS_KEYS = ['admin_password_hash','admin_key','site_name','phone','whatsapp','email','address'];

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('RS Machinery')
    .addItem('Setup Database', 'setupDatabase')
    .addItem('Verify Database', 'verifyDatabaseInteractive')
    .addItem('Reset Sample Data', 'resetSampleData')
    .addToUi();
}

function setupDatabase() {
  var ss = getSpreadsheet();
  var report = { sheetsCreated: [], headersAdded: [], settingsAdded: [], sampleDataAdded: [] };

  var sheetNames = Object.keys(SHEET_DEFINITIONS);
  for (var s = 0; s < sheetNames.length; s++) {
    var name = sheetNames[s];
    var expectedHeaders = SHEET_DEFINITIONS[name];
    var sheet = ss.getSheetByName(name);

    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(expectedHeaders);
      report.sheetsCreated.push(name);
      report.headersAdded.push(name + ' (all ' + expectedHeaders.length + ' headers)');
    } else {
      var existingHeaders = getHeaders(sheet);
      var missing = [];
      for (var h = 0; h < expectedHeaders.length; h++) {
        if (existingHeaders.indexOf(expectedHeaders[h]) < 0) {
          missing.push(expectedHeaders[h]);
        }
      }
      if (missing.length > 0) {
        var lastCol = sheet.getLastColumn();
        sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
        report.headersAdded.push(name + ' (' + missing.length + ' headers added)');
      }
    }

    applySheetFormatting(sheet);
  }

  report.settingsAdded = ensureDefaultSettings();
  report.sampleDataAdded = insertSeedData();

  var msg = formatSetupReport(report);
  SpreadsheetApp.getUi().alert('Setup Complete', msg, SpreadsheetApp.getUi().ButtonSet.OK);
  return report;
}

function applySheetFormatting(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow < 1 || lastCol < 1) return;

  sheet.setFrozenRows(1);

  var headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setFontWeight('bold');

  try { sheet.autoResizeColumns(1, lastCol); } catch (e) { /* columns may be empty */ }

  if (lastRow > 1) {
    var dataRange = sheet.getRange(1, 1, lastRow, lastCol);
    try {
      var existing = sheet.getBandings();
      for (var b = 0; b < existing.length; b++) existing[b].remove();
      dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
    } catch (e) {
      for (var r = 2; r <= lastRow; r += 2) {
        sheet.getRange(r, 1, 1, lastCol).setBackground('#f5f5f5');
      }
    }
  }

  var filterRange = sheet.getRange(1, 1, Math.max(lastRow, 1), lastCol);
  if (sheet.getFilter()) sheet.getFilter().remove();
  filterRange.createFilter();
}

function ensureDefaultSettings() {
  var added = [];
  var sheet = getSheet(SHEET_SETTINGS);
  var rows = sheet.getDataRange().getValues();
  var existing = {};

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0]) existing[String(rows[i][0]).trim()] = true;
  }

  for (var k = 0; k < DEFAULT_SETTINGS_KEYS.length; k++) {
    if (!existing[DEFAULT_SETTINGS_KEYS[k]]) {
      sheet.appendRow([DEFAULT_SETTINGS_KEYS[k], '']);
      added.push(DEFAULT_SETTINGS_KEYS[k]);
    }
  }

  return added;
}

function insertSeedData() {
  var added = [];
  var now = new Date().toISOString();

  var catSheet = getSheet(SHEET_CATEGORIES);
  if (catSheet.getDataRange().getValues().length <= 1) {
    var cats = [
      [1,'Monkey Cranes','monkey-cranes','Heavy lifting monkey cranes for industrial use.','','TRUE',1,now,now],
      [2,'Electric Hoists','electric-hoists','Electric hoists for material handling.','','TRUE',2,now,now],
      [3,'Wire Ropes','wire-ropes','High-quality wire ropes for various applications.','','TRUE',3,now,now],
      [4,'Chain Pulley Blocks','chain-pulley-blocks','Manual chain pulley blocks for lifting.','','TRUE',4,now,now]
    ];
    for (var c = 0; c < cats.length; c++) catSheet.appendRow(cats[c]);
    added.push('categories (4 rows)');
  }

  var prodSheet = getSheet(SHEET_PRODUCTS);
  if (prodSheet.getDataRange().getValues().length <= 1) {
    var prods = [
      [1,'Heavy Duty Monkey Crane','heavy-duty-monkey-crane',1,'Heavy Duty Monkey Crane | RS Machinery','High-performance heavy duty monkey crane for construction and industrial lifting applications.','Premium quality heavy duty monkey crane for all your lifting needs.','<p>Our Heavy Duty Monkey Crane is built to handle the toughest lifting jobs. With a robust design and high-grade materials, this crane delivers exceptional performance and reliability.</p><ul><li>Load capacity: up to 10 tons</li><li>Durable steel construction</li><li>Smooth operation</li><li>Safety certified</li></ul>','/images/products/monkey-crane.jpg','["/images/products/monkey-crane-1.jpg","/images/products/monkey-crane-2.jpg"]','[{"label":"Capacity","value":"5-10 tons"},{"label":"Material","value":"High-grade steel"},{"label":"Height","value":"Variable"}]','[{"name":"5 Ton","price":250000},{"name":"10 Ton","price":450000}]','TRUE','TRUE',1,now,now],
      [2,'Electric Hoist 1 Ton','electric-hoist-1-ton',2,'Electric Hoist 1 Ton | RS Machinery','Reliable electric hoist with 1 ton capacity for warehouses and workshops.','Electric hoist with 1 ton capacity for efficient material handling.','<p>Our Electric Hoist is designed for efficient and safe lifting in warehouses, factories, and construction sites. Features include overload protection and emergency stop.</p><ul><li>1 ton capacity</li><li>Overload protection</li><li>Emergency stop</li><li>Low maintenance</li></ul>','/images/products/electric-hoist.jpg','["/images/products/electric-hoist-1.jpg"]','[{"label":"Capacity","value":"1 ton"},{"label":"Power","value":"1.5 kW"},{"label":"Voltage","value":"220V/380V"}]','[{"name":"Single Speed","price":85000},{"name":"Variable Speed","price":120000}]','TRUE','TRUE',2,now,now],
      [3,'Industrial Wire Rope','industrial-wire-rope',3,'Industrial Wire Rope | RS Machinery','High-strength industrial wire rope for heavy lifting and towing.','Premium industrial wire rope with high tensile strength.','<p>Our Industrial Wire Rope is manufactured from high-quality steel wires, providing excellent strength and durability for the most demanding applications.</p><ul><li>High tensile strength</li><li>Corrosion resistant</li><li>Flexible construction</li><li>Available in various diameters</li></ul>','/images/products/wire-rope.jpg','["/images/products/wire-rope-1.jpg"]','[{"label":"Diameter","value":"6mm-50mm"},{"label":"Material","value":"Galvanized steel"},{"label":"Breaking load","value":"Variable"}]','[]','TRUE','TRUE',3,now,now]
    ];
    for (var p = 0; p < prods.length; p++) prodSheet.appendRow(prods[p]);
    added.push('products (3 rows)');
  }

  return added;
}

function verifyDatabase() {
  var ss = getSpreadsheet();
  var report = { status: 'ok', missingSheets: [], missingHeaders: {}, missingSettings: [] };

  var sheetNames = Object.keys(SHEET_DEFINITIONS);
  for (var s = 0; s < sheetNames.length; s++) {
    var name = sheetNames[s];
    var sheet = ss.getSheetByName(name);

    if (!sheet) {
      report.missingSheets.push(name);
      report.missingHeaders[name] = SHEET_DEFINITIONS[name];
    } else {
      var existingHeaders = getHeaders(sheet);
      var expected = SHEET_DEFINITIONS[name];
      var missing = [];
      for (var h = 0; h < expected.length; h++) {
        var found = false;
        for (var eh = 0; eh < existingHeaders.length; eh++) {
          if (existingHeaders[eh] === expected[h]) { found = true; break; }
        }
        if (!found) missing.push(expected[h]);
      }
      if (missing.length > 0) report.missingHeaders[name] = missing;
    }
  }

  var settingsSheet = ss.getSheetByName(SHEET_SETTINGS);
  if (settingsSheet) {
    var rows = settingsSheet.getDataRange().getValues();
    var existingKeys = {};
    for (var i = 1; i < rows.length; i++) {
      if (rows[i][0]) existingKeys[String(rows[i][0]).trim()] = true;
    }
    for (var k = 0; k < DEFAULT_SETTINGS_KEYS.length; k++) {
      if (!existingKeys[DEFAULT_SETTINGS_KEYS[k]]) report.missingSettings.push(DEFAULT_SETTINGS_KEYS[k]);
    }
  } else {
    report.missingSettings = DEFAULT_SETTINGS_KEYS.slice();
  }

  if (report.missingSheets.length > 0 || Object.keys(report.missingHeaders).length > 0 || report.missingSettings.length > 0) {
    report.status = 'issues_found';
  }

  return report;
}

function verifyDatabaseInteractive() {
  var report = verifyDatabase();
  var msg = 'Database Verification Report\n\n';

  if (report.status === 'ok') {
    msg += 'All checks passed! Database is complete.';
  } else {
    if (report.missingSheets.length > 0) {
      msg += 'Missing Sheets:\n';
      for (var s = 0; s < report.missingSheets.length; s++) msg += '  - ' + report.missingSheets[s] + '\n';
      msg += '\n';
    }
    var headerKeys = Object.keys(report.missingHeaders);
    if (headerKeys.length > 0) {
      msg += 'Missing Headers:\n';
      for (var hs = 0; hs < headerKeys.length; hs++) {
        msg += '  ' + headerKeys[hs] + ': ' + report.missingHeaders[headerKeys[hs]].join(', ') + '\n';
      }
      msg += '\n';
    }
    if (report.missingSettings.length > 0) {
      msg += 'Missing Settings:\n';
      for (var st = 0; st < report.missingSettings.length; st++) msg += '  - ' + report.missingSettings[st] + '\n';
      msg += '\n';
    }
    msg += 'Run "Setup Database" from the RS Machinery menu to fix.';
  }

  SpreadsheetApp.getUi().alert('Database Verification', msg, SpreadsheetApp.getUi().ButtonSet.OK);
}

function formatSetupReport(report) {
  var lines = [];
  if (report.sheetsCreated.length > 0) lines.push('Sheets created: ' + report.sheetsCreated.join(', '));
  if (report.headersAdded.length > 0) lines.push('Headers added: ' + report.headersAdded.join(', '));
  if (report.settingsAdded.length > 0) lines.push('Settings added: ' + report.settingsAdded.join(', '));
  if (report.sampleDataAdded.length > 0) lines.push('Sample data added: ' + report.sampleDataAdded.join(', '));
  if (lines.length === 0) lines.push('Database is already fully set up. No changes needed.');
  return lines.join('\n');
}

function resetSampleData() {
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Reset Sample Data', 'This will clear all existing product and category data and re-insert sample data. Continue?', ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;

  var prodSheet = getSheet(SHEET_PRODUCTS);
  var prodLastRow = prodSheet.getLastRow();
  if (prodLastRow > 1) prodSheet.getRange(2, 1, prodLastRow - 1, prodSheet.getLastColumn()).clearContent();

  var catSheet = getSheet(SHEET_CATEGORIES);
  var catLastRow = catSheet.getLastRow();
  if (catLastRow > 1) catSheet.getRange(2, 1, catLastRow - 1, catSheet.getLastColumn()).clearContent();

  var added = insertSeedData();
  applySheetFormatting(prodSheet);
  applySheetFormatting(catSheet);

  ui.alert('Reset Complete', 'Sample data has been reset.\nAdded: ' + added.join(', '), ui.ButtonSet.OK);
}
