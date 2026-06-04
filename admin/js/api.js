/**
 * RS Machinery - API Client
 *
 * Handles all communication with Google Apps Script backend.
 */

var RSM_API = (function () {

  // ── CONFIG ──────────────────────────────────────────────────────────────
  // UPDATE THIS with your deployed Apps Script Web App URL
  var BASE_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  // ── PUBLIC ENDPOINTS ────────────────────────────────────────────────────

  /** Login: returns { success, data: { admin_key } } */
  function login(password) {
    return postToApi({ route: 'login', password: password });
  }

  /** Get products with optional filters */
  function getProducts(params) {
    var query = [];
    query.push('route=getProducts');
    if (params.category_id) query.push('category_id=' + encodeURIComponent(params.category_id));
    if (params.search)       query.push('search=' + encodeURIComponent(params.search));
    if (params.featured)     query.push('featured=true');
    if (params.page)         query.push('page=' + params.page);
    if (params.limit)        query.push('limit=' + params.limit);
    return getFromApi(query.join('&'));
  }

  /** Get single product by ID or slug */
  function getProduct(identifier) {
    var param = isNaN(identifier) ? 'slug' : 'id';
    return getFromApi('route=getProduct&' + param + '=' + encodeURIComponent(identifier));
  }

  /** Get all active categories */
  function getCategories() {
    return getFromApi('route=getCategories');
  }

  /** Submit a public inquiry */
  function addInquiry(data) {
    var params = { route: 'addInquiry' };
    if (data.name)    params.name = data.name;
    if (data.phone)   params.phone = data.phone;
    if (data.product) params.product = data.product;
    if (data.message) params.message = data.message;
    return postToApi(params);
  }

  // ── ADMIN ENDPOINTS (require admin_key) ─────────────────────────────────

  /** Get dashboard stats */
  function getDashboard(adminKey) {
    return postToApi({ route: 'getDashboard', admin_key: adminKey });
  }

  /** Get all inquiries (admin) */
  function getInquiries(adminKey) {
    return postToApi({ route: 'getInquiries', admin_key: adminKey });
  }

  /** Add a new product */
  function addProduct(data, adminKey) {
    data.route = 'addProduct';
    data.admin_key = adminKey;
    return postToApi(data);
  }

  /** Update an existing product */
  function updateProduct(data, adminKey) {
    data.route = 'updateProduct';
    data.admin_key = adminKey;
    return postToApi(data);
  }

  /** Delete (soft-deactivate) a product */
  function deleteProduct(id, adminKey) {
    return postToApi({ route: 'deleteProduct', admin_key: adminKey, id: id });
  }

  /** Add a new category */
  function addCategory(data, adminKey) {
    data.route = 'addCategory';
    data.admin_key = adminKey;
    return postToApi(data);
  }

  /** Update an existing category */
  function updateCategory(data, adminKey) {
    data.route = 'updateCategory';
    data.admin_key = adminKey;
    return postToApi(data);
  }

  /** Delete (soft-deactivate) a category */
  function deleteCategory(id, adminKey) {
    return postToApi({ route: 'deleteCategory', admin_key: adminKey, id: id });
  }

  /** Update inquiry status */
  function updateInquiry(id, status, adminKey) {
    return postToApi({ route: 'updateInquiry', admin_key: adminKey, id: id, status: status });
  }

  /** Change admin password */
  function changePassword(currentPassword, newPassword, adminKey) {
    return postToApi({ route: 'changePassword', admin_key: adminKey, current_password: currentPassword, new_password: newPassword });
  }

  // ── INTERNAL ────────────────────────────────────────────────────────────

  function getFromApi(queryString) {
    var url = BASE_URL + '?' + queryString;
    return fetch(url)
      .then(function (res) { return res.json(); })
      .catch(function () { return { success: false, error: 'Network error' }; });
  }

  function postToApi(params) {
    var body = [];
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        body.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(params[key])));
      }
    }
    return fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.join('&')
    })
      .then(function (res) { return res.json(); })
      .catch(function () { return { success: false, error: 'Network error' }; });
  }

  // ── PUBLIC API ──────────────────────────────────────────────────────────

  return {
    login: login,
    getProducts: getProducts,
    getProduct: getProduct,
    getCategories: getCategories,
    addInquiry: addInquiry,
    getDashboard: getDashboard,
    getInquiries: getInquiries,
    addProduct: addProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    addCategory: addCategory,
    updateCategory: updateCategory,
    deleteCategory: deleteCategory,
    updateInquiry: updateInquiry,
    changePassword: changePassword,
    // Expose BASE_URL so it can be updated at runtime if needed
    setBaseUrl: function (url) { BASE_URL = url; }
  };

})();
