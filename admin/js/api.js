/**
 * RS Machinery - API Client
 *
 * Handles all communication with Google Apps Script backend.
 */

var RSM_API = (function () {

  // ── CONFIG ──────────────────────────────────────────────────────────────
  // Local PHP API
  var BASE_URL = '/api/index.php';

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

  // ── ADMIN ENDPOINTS (auth temporarily disabled) ─────────────────────────

  /** Get dashboard stats */
  function getDashboard() {
    return postToApi({ route: 'getDashboard' });
  }

  /** Get all inquiries (admin) */
  function getInquiries() {
    return postToApi({ route: 'getInquiries' });
  }

  /** Add a new product */
  function addProduct(data) {
    data.route = 'addProduct';
    return postToApi(data);
  }

  /** Update an existing product */
  function updateProduct(data) {
    data.route = 'updateProduct';
    return postToApi(data);
  }

  /** Delete (soft-deactivate) a product */
  function deleteProduct(id) {
    return postToApi({ route: 'deleteProduct', id: id });
  }

  /** Add a new category */
  function addCategory(data) {
    data.route = 'addCategory';
    return postToApi(data);
  }

  /** Update an existing category */
  function updateCategory(data) {
    data.route = 'updateCategory';
    return postToApi(data);
  }

  /** Delete (soft-deactivate) a category */
  function deleteCategory(id) {
    return postToApi({ route: 'deleteCategory', id: id });
  }

  /** Update inquiry status */
  function updateInquiry(id, status) {
    return postToApi({ route: 'updateInquiry', id: id, status: status });
  }

  /** Change admin password */
  function changePassword(currentPassword, newPassword) {
    return postToApi({ route: 'changePassword', current_password: currentPassword, new_password: newPassword });
  }

  // ── SETTINGS ROUTES ─────────────────────────────────────────────────────

  /** Get a public setting by key */
  function getSetting(key) {
    return getFromApi('route=getSetting&key=' + encodeURIComponent(key));
  }

  /** Update a setting (admin only) */
  function updateSetting(key, value) {
    return postToApi({ route: 'updateSetting', key: key, value: value });
  }

  // ── IMAGE URL HELPER ───────────────────────────────────────────────────

  function getProductImageUrl(filename) {
    if (!filename) return 'assets/placeholder.svg';
    if (filename.indexOf('http') === 0 || filename.charAt(0) === '/') return filename;
    return '/uploads/products/' + filename;
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
    getSetting: getSetting,
    updateSetting: updateSetting,
    getProductImageUrl: getProductImageUrl,
    setBaseUrl: function (url) { BASE_URL = url; }
  };

})();
