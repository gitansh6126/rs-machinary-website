/**
 * RS Machinery - Admin Portal
 *
 * Handles: login, auth guard, sidebar nav, toast notifications,
 * shared API helpers for admin pages.
 */

var RS_ADMIN = (function () {

  // ─── CONFIG ────────────────────────────────────────────────────────────────

  var ADMIN_KEY = 'rsm_admin_key';
  var API_BASE = (function () {
    var stored = localStorage.getItem('rsm_api_base');
    if (stored) return stored;
    return 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
  })();

  // ─── INIT ──────────────────────────────────────────────────────────────────

  function init() {
    if (typeof RSM_API === 'undefined') {
      showToast('API client not loaded. Check your internet connection.', 'error');
      return;
    }

    RSM_API.setBaseUrl(API_BASE);

    var page = document.body.getAttribute('data-page');

    if (page === 'login') {
      // Login disabled - redirect directly to dashboard
      window.location.href = 'dashboard.html';
      return;
    }

    initSidebar();
    initLogout();

    // Page-specific init
    switch (page) {
      case 'dashboard':   initDashboard();   break;
      case 'products':    initProducts();    break;
      case 'product-form': initProductForm(); break;
      case 'categories':  initCategories();  break;
      case 'inquiries':   initInquiries();   break;
      case 'settings':    initSettings();    break;
    }
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────────

  function getAdminKey() {
    return sessionStorage.getItem(ADMIN_KEY);
  }

  function setAdminKey(key) {
    sessionStorage.setItem(ADMIN_KEY, key);
  }

  function clearAdminKey() {
    sessionStorage.removeItem(ADMIN_KEY);
  }

  function redirectToLogin() {
    window.location.href = 'index.html';
  }

  // ─── API HELPERS ───────────────────────────────────────────────────────────

  function checkAuth(res) {
    return true;
  }

  function api() {
    return {
      getDashboard: function () {
        return RSM_API.getDashboard();
      },
      getProducts: function (params) {
        return RSM_API.getProducts(params || {});
      },
      getProduct: function (id) {
        return RSM_API.getProduct(id);
      },
      addProduct: function (data) {
        return RSM_API.addProduct(data);
      },
      updateProduct: function (data) {
        return RSM_API.updateProduct(data);
      },
      deleteProduct: function (id) {
        return RSM_API.deleteProduct(id);
      },
      getCategories: function () {
        return RSM_API.getCategories();
      },
      addCategory: function (data) {
        return RSM_API.addCategory(data);
      },
      updateCategory: function (data) {
        return RSM_API.updateCategory(data);
      },
      deleteCategory: function (id) {
        return RSM_API.deleteCategory(id);
      },
      getInquiries: function () {
        return RSM_API.getInquiries();
      },
      login: function (password) {
        return RSM_API.login(password);
      },
      updateInquiry: function (id, status) {
        return RSM_API.updateInquiry(id, status);
      },
      changePassword: function (currentPassword, newPassword) {
        return RSM_API.changePassword(currentPassword, newPassword);
      },
      getSetting: function (key) {
        return RSM_API.getSetting(key);
      },
      updateSetting: function (key, value) {
        return RSM_API.updateSetting(key, value);
      },
      handleResponse: function (promise, cb) {
        return promise.then(function (res) {
          if (!checkAuth(res)) return;
          if (cb) cb(res);
        }).catch(function () {
          showToast('Network error. Please try again.', 'error');
        });
      },
      setApiBase: function (url) {
        API_BASE = url;
        localStorage.setItem('rsm_api_base', url);
        RSM_API.setBaseUrl(url);
      },
      getApiBase: function () {
        return API_BASE;
      }
    };
  }

  // ─── TOAST NOTIFICATIONS ───────────────────────────────────────────────────

  function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 300ms ease';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3500);
  }

  // ─── SIDEBAR ───────────────────────────────────────────────────────────────

  function initSidebar() {
    // Highlight current page
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.admin-nav a').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage) {
        link.classList.add('is-active');
      }
    });

    // Mobile toggle
    var toggleBtn = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('adminSidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('is-open');
      });
    }

    // Close sidebar on nav link click (mobile)
    document.querySelectorAll('.admin-nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (sidebar) sidebar.classList.remove('is-open');
      });
    });
  }

  // ─── LOGOUT ────────────────────────────────────────────────────────────────

  function initLogout() {
    var btn = document.getElementById('logoutBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {
      if (confirm('Logout disabled - login is temporarily disabled.')) {
      }
    });
  }

  // ─── LOGIN PAGE ────────────────────────────────────────────────────────────

  function initLoginPage() {
    var form = document.getElementById('loginForm');
    if (!form) return;

    // If already logged in, go to dashboard
    if (getAdminKey()) {
      window.location.href = 'dashboard.html';
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var password = form.querySelector('[name="password"]').value;
      var submitBtn = form.querySelector('button[type="submit"]');
      var errorEl = document.getElementById('loginError');

      if (errorEl) errorEl.textContent = '';
      if (submitBtn) submitBtn.disabled = true;

      api().login(password).then(function (res) {
        if (submitBtn) submitBtn.disabled = false;

        if (res.success && res.data && res.data.admin_key) {
          setAdminKey(res.data.admin_key);
          if (res.data.first_time) {
            showToast('First-time setup complete. Your password has been saved.', 'success');
          }
          window.location.href = 'dashboard.html';
        } else {
          if (errorEl) errorEl.textContent = res.error || 'Login failed. Check your password.';
        }
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        if (errorEl) errorEl.textContent = 'Network error. Please try again.';
      });
    });
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────

  function initDashboard() {
    var container = document.getElementById('dashboardContent');
    if (!container) return;

    api().handleResponse(api().getDashboard(), function (res) {
      if (!res.success || !res.data) {
        container.innerHTML = '<div class="empty-state"><p>Failed to load dashboard data.</p></div>';
        return;
      }

      var d = res.data;
      container.innerHTML =
        '<div class="stats-grid">' +
          '<div class="stat-card"><h3>Active Products</h3><div class="stat-value">' + d.activeProducts + '</div></div>' +
          '<div class="stat-card"><h3>Featured Products</h3><div class="stat-value">' + d.featuredProducts + '</div></div>' +
          '<div class="stat-card"><h3>Total Products</h3><div class="stat-value">' + d.totalProducts + '</div></div>' +
          '<div class="stat-card"><h3>Active Categories</h3><div class="stat-value">' + d.activeCategories + '</div></div>' +
          '<div class="stat-card"><h3>New Inquiries</h3><div class="stat-value">' + d.newInquiries + '</div></div>' +
          '<div class="stat-card"><h3>Total Inquiries</h3><div class="stat-value">' + d.totalInquiries + '</div></div>' +
        '</div>';

      if (d.recentInquiries && d.recentInquiries.length > 0) {
        var html = '<div class="card"><h2>Recent Inquiries</h2><div class="table-wrapper"><table class="data-table">' +
          '<thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Product</th><th>Status</th></tr></thead><tbody>';
        d.recentInquiries.forEach(function (inq) {
          html += '<tr>' +
            '<td>' + escapeHtml((inq.date || '').substring(0, 10)) + '</td>' +
            '<td>' + escapeHtml(inq.name || '') + '</td>' +
            '<td>' + escapeHtml(inq.phone || '') + '</td>' +
            '<td>' + escapeHtml(inq.product || '') + '</td>' +
            '<td><span class="status-badge status-' + (inq.status || 'new') + '">' + escapeHtml(inq.status || 'new') + '</span></td>' +
          '</tr>';
        });
        html += '</tbody></table></div></div>';
        container.innerHTML += html;
      }
    }).catch(function () {
      container.innerHTML = '<div class="empty-state"><p>Failed to load dashboard. Network error.</p></div>';
    });
  }

  // ─── PRODUCTS LIST ─────────────────────────────────────────────────────────

  function initProducts() {
    var container = document.getElementById('productsList');
    if (!container) return;

    container.innerHTML = '<div class="loading-spinner">Loading products...</div>';

    // Check paused state and setup toggle
    checkPauseState();

    // Load categories for name mapping
    api().getCategories().then(function (catRes) {
      var catMap = {};
      if (catRes.success && catRes.data) {
        (catRes.data.categories || []).forEach(function (c) { catMap[c.id] = c.name; });
      }

      api().handleResponse(api().getProducts({ limit: 1000 }), function (res) {
        if (!res.success || !res.data) {
          container.innerHTML = '<div class="empty-state"><p>Failed to load products.</p></div>';
          return;
        }

        var products = res.data.products || [];
        if (products.length === 0) {
          container.innerHTML = '<div class="empty-state"><p>No products found.</p><a href="product-form.html" class="btn-primary">Add First Product</a></div>';
          return;
        }

        var html = '<div class="table-wrapper"><table class="data-table">' +
          '<thead><tr><th>Image</th><th>ID</th><th>Name</th><th>Category</th><th>Featured</th><th>Active</th><th class="actions-cell">Actions</th></tr></thead><tbody>';

        products.forEach(function (p) {
          var imgSrc = getProductImageUrl(p.image);
          var imgHtml = imgSrc && imgSrc !== 'assets/placeholder.svg' ? '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(p.name || '') + '" style="width:50px;height:50px;object-fit:cover;border-radius:4px;">' : '<span style="color:#999;font-size:12px;">No image</span>';
          html += '<tr>' +
            '<td>' + imgHtml + '</td>' +
            '<td>' + escapeHtml(p.id) + '</td>' +
            '<td><strong>' + escapeHtml(p.name || '') + '</strong></td>' +
            '<td>' + escapeHtml(catMap[p.category_id] || '-') + '</td>' +
            '<td>' + (p.featured === true || p.featured === 'TRUE' ? 'Yes' : 'No') + '</td>' +
            '<td>' + (p.active === true || p.active === 'TRUE' ? 'Yes' : 'No') + '</td>' +
            '<td class="actions-cell">' +
              '<a href="product-form.html?id=' + p.id + '" class="btn-primary btn-sm">Edit</a> ' +
              '<button class="btn-danger btn-sm" onclick="RS_ADMIN.deleteProductItem(' + p.id + ')">Delete</button>' +
            '</td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
      });
    });
  }

  function deleteProductItem(id) {
    if (!confirm('Are you sure you want to delete this product? It will be deactivated.')) return;
    api().deleteProduct(id).then(function (res) {
      if (res.success) {
        showToast('Product deactivated.', 'success');
        initProducts();
      } else {
        showToast(res.error || 'Failed to delete product.', 'error');
      }
    });
  }

  function checkPauseState() {
    var pauseBanner = document.getElementById('pauseBanner');
    var pauseBtn = document.getElementById('pauseBtn');
    var resumeTopBtn = document.getElementById('resumeTopBtn');
    if (!pauseBanner || !pauseBtn) return;

    api().getSetting('products_paused').then(function (res) {
      var paused = res.success && res.data && res.data.value === 'TRUE';
      pauseBanner.style.display = paused ? 'flex' : 'none';
      pauseBtn.style.display = paused ? 'none' : 'inline-flex';
      if (resumeTopBtn) resumeTopBtn.style.display = paused ? 'inline-flex' : 'none';
    });

    pauseBtn.addEventListener('click', function () {
      pauseBtn.disabled = true;
      api().updateSetting('products_paused', 'TRUE').then(function (res) {
        pauseBtn.disabled = false;
        if (res.success) {
          showToast('Products paused. They are now hidden from the website.', 'success');
          checkPauseState();
          initProducts();
        } else {
          showToast(res.error || 'Failed to pause.', 'error');
        }
      });
    });

    var resumeBtns = document.querySelectorAll('#resumeBtn, #resumeTopBtn');
    resumeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btn.disabled = true;
        api().updateSetting('products_paused', 'FALSE').then(function (res) {
          btn.disabled = false;
          if (res.success) {
            showToast('Products resumed. They are now visible on the website.', 'success');
            checkPauseState();
            initProducts();
          } else {
            showToast(res.error || 'Failed to resume.', 'error');
          }
        });
      });
    });
  }

  // ─── PRODUCT FORM ──────────────────────────────────────────────────────────

  function initProductForm() {
    var form = document.getElementById('productForm');
    var titleEl = document.getElementById('formTitle');
    if (!form) return;

    var params = new URLSearchParams(window.location.search);
    var editId = params.get('id');
    var isEdit = !!editId;

    if (titleEl) titleEl.textContent = isEdit ? 'Edit Product' : 'Add Product';

    // Init local upload
    initLocalUpload(form, editId);

    // Load categories for dropdown
    var catSelect = form.querySelector('[name="category_id"]');
    if (catSelect) {
      api().getCategories().then(function (res) {
        if (res.success && res.data) {
          (res.data.categories || []).forEach(function (cat) {
            var opt = document.createElement('option');
            opt.value = cat.id;
            opt.textContent = cat.name;
            catSelect.appendChild(opt);
          });
        }

        // If editing, load product data
        if (isEdit) {
          api().getProduct(editId).then(function (res) {
            if (res.success && res.data && res.data.product) {
              populateForm(res.data.product);
            } else {
              showToast('Product not found.', 'error');
            }
          });
        }
      });
    } else {
      if (isEdit) {
        api().getProduct(editId).then(function (res) {
          if (res.success && res.data && res.data.product) {
            populateForm(res.data.product);
          }
        });
      }
    }

    // Main image URL preview
    var imageInput = form.querySelector('[name="image"]');
    if (imageInput) {
      imageInput.addEventListener('input', function () {
        var preview = document.getElementById('mainImagePreview');
        if (!preview) return;
        var val = imageInput.value.trim();
        if (val) {
          var previewSrc = getProductImageUrl(val);
          preview.innerHTML = '<img src="' + escapeHtml(previewSrc) + '" alt="Preview" style="max-width:200px;max-height:150px;margin-top:8px;border:1px solid #ddd;border-radius:4px;" onerror="this.parentNode.innerHTML=\'<span style=color:red>Invalid image</span>\'">';
        } else {
          preview.innerHTML = '';
        }
      });
    }

    function populateForm(product) {
      form.querySelector('[name="name"]').value = product.name || '';
      form.querySelector('[name="slug"]').value = product.slug || '';
      if (catSelect) catSelect.value = product.category_id || '';
      form.querySelector('[name="short_description"]').value = product.short_description || '';
      form.querySelector('[name="description"]').value = product.description || '';
      form.querySelector('[name="image"]').value = product.image || '';
      form.querySelector('[name="gallery_images"]').value = formatJsonField(product.gallery_images);
      form.querySelector('[name="specifications"]').value = formatJsonField(product.specifications);
      form.querySelector('[name="variations"]').value = formatJsonField(product.variations);
      form.querySelector('[name="seo_title"]').value = product.seo_title || '';
      form.querySelector('[name="seo_description"]').value = product.seo_description || '';
      form.querySelector('[name="sort_order"]').value = product.sort_order || '0';
      if (form.querySelector('[name="featured"]')) form.querySelector('[name="featured"]').checked = product.featured === true || product.featured === 'TRUE';
      if (form.querySelector('[name="active"]')) form.querySelector('[name="active"]').checked = product.active === true || product.active === 'TRUE';
      // Trigger image preview
      if (imageInput) imageInput.dispatchEvent(new Event('input'));
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      var data = {
        name: form.querySelector('[name="name"]').value,
        slug: form.querySelector('[name="slug"]').value,
        category_id: form.querySelector('[name="category_id"]') ? form.querySelector('[name="category_id"]').value : '',
        short_description: form.querySelector('[name="short_description"]').value,
        description: form.querySelector('[name="description"]').value,
        image: form.querySelector('[name="image"]').value,
        gallery_images: form.querySelector('[name="gallery_images"]').value || '[]',
        specifications: form.querySelector('[name="specifications"]').value || '[]',
        variations: form.querySelector('[name="variations"]').value || '[]',
        seo_title: form.querySelector('[name="seo_title"]').value,
        seo_description: form.querySelector('[name="seo_description"]').value,
        sort_order: form.querySelector('[name="sort_order"]').value || '0',
        featured: form.querySelector('[name="featured"]') ? form.querySelector('[name="featured"]').checked : false,
        active: form.querySelector('[name="active"]') ? form.querySelector('[name="active"]').checked : true
      };

      // Validate JSON fields
      try { JSON.parse(data.gallery_images); } catch(e) { showToast('Gallery images must be valid JSON.', 'error'); if(submitBtn) submitBtn.disabled = false; return; }
      try { JSON.parse(data.specifications); } catch(e) { showToast('Specifications must be valid JSON.', 'error'); if(submitBtn) submitBtn.disabled = false; return; }
      try { JSON.parse(data.variations); } catch(e) { showToast('Variations must be valid JSON.', 'error'); if(submitBtn) submitBtn.disabled = false; return; }

      var apiCall = isEdit ? api().updateProduct(Object.assign(data, { id: editId })) : api().addProduct(data);

      apiCall.then(function (res) {
        if (submitBtn) submitBtn.disabled = false;
        if (res.success) {
          showToast(isEdit ? 'Product updated successfully.' : 'Product added successfully.', 'success');
          if (!isEdit) form.reset();
          setTimeout(function () { window.location.href = 'products.html'; }, 1200);
        } else {
          showToast(res.error || 'Failed to save product.', 'error');
        }
      }).catch(function () {
        if (submitBtn) submitBtn.disabled = false;
        showToast('Network error. Please try again.', 'error');
      });
    });
  }

  // ─── LOCAL IMAGE UPLOAD ──────────────────────────────────────────────────

  function initLocalUpload(form, editId) {
    var dropArea = document.getElementById('dropArea');
    var fileInput = document.getElementById('fileInput');
    var uploadPreview = document.getElementById('uploadPreview');
    var uploadBtn = document.getElementById('uploadBtn');
    var uploadProgress = document.getElementById('uploadProgress');
    var progressFill = document.getElementById('progressFill');
    var progressText = document.getElementById('progressText');
    var uploadResult = document.getElementById('uploadResult');
    var selectedFiles = [];

    if (!dropArea || !fileInput) return;

    // Load upload key from settings
    var uploadKey = '';

    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (evt) {
      dropArea.addEventListener(evt, function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(function (evt) {
      dropArea.addEventListener(evt, function () {
        dropArea.classList.add('is-dragover');
      });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropArea.addEventListener(evt, function () {
        dropArea.classList.remove('is-dragover');
      });
    });

    dropArea.addEventListener('drop', function (e) {
      var files = e.dataTransfer.files;
      handleFiles(files);
    });

    dropArea.querySelector('.upload-link').addEventListener('click', function () {
      fileInput.click();
    });
    dropArea.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      handleFiles(fileInput.files);
    });

    function handleFiles(files) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var err = validateFile(file);
        if (err) {
          showToast(err, 'error');
          continue;
        }
        selectedFiles.push(file);
        addFilePreview(file);
      }
      uploadBtn.disabled = selectedFiles.length === 0;
      updateFileCount();
    }

    function validateFile(file) {
      var ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
      var MAX_SIZE = 5 * 1024 * 1024;
      if (ALLOWED.indexOf(file.type) === -1) {
        return 'Invalid format: ' + file.name + '. Only JPG, PNG, WebP allowed.';
      }
      if (file.size > MAX_SIZE) {
        return 'File too large: ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB). Max 5 MB.';
      }
      return null;
    }

    function addFilePreview(file) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var div = document.createElement('div');
        div.className = 'upload-preview-item';

        var isImage = file.type.startsWith('image/');
        div.innerHTML =
          '<div class="preview-thumb">' +
            (isImage ? '<img src="' + e.target.result + '" alt="">' : '<div class="preview-pdf">IMG</div>') +
          '</div>' +
          '<div class="preview-info">' +
            '<span class="preview-name">' + escapeHtml(file.name) + '</span>' +
            '<span class="preview-size">' + Math.round(file.size / 1024) + ' KB</span>' +
          '</div>' +
          '<button type="button" class="preview-remove">&times;</button>';

        div.querySelector('.preview-remove').addEventListener('click', function () {
          var idx = -1;
          for (var j = 0; j < selectedFiles.length; j++) {
            if (selectedFiles[j].name === file.name) { idx = j; break; }
          }
          if (idx >= 0) selectedFiles.splice(idx, 1);
          div.remove();
          uploadBtn.disabled = selectedFiles.length === 0;
          updateFileCount();
        });

        uploadPreview.appendChild(div);
      };
      reader.readAsDataURL(file);
    }

    function updateFileCount() {
      var count = selectedFiles.length;
      uploadBtn.textContent = count > 0 ? 'Upload ' + count + ' file(s)' : 'Upload to Server';
    }

    // Upload button handler
    uploadBtn.addEventListener('click', function () {
      if (selectedFiles.length === 0) return;
      var name = form.querySelector('[name="name"]').value.trim();
      if (!name) {
        showToast('Enter a product name before uploading.', 'error');
        return;
      }
      performUpload(name);
    });

    function performUpload(productName) {
      uploadBtn.disabled = true;
      uploadProgress.style.display = 'block';
      uploadResult.innerHTML = '';
      var total = selectedFiles.length;

      function uploadNext(index) {
        if (index >= total) {
          uploadBtn.disabled = false;
          uploadBtn.textContent = 'Upload to Server';
          showToast('All ' + total + ' file(s) uploaded!', 'success');
          selectedFiles = [];
          uploadPreview.innerHTML = '';
          updateFileCount();
          return;
        }

        var file = selectedFiles[index];
        var variant = index === 0 ? 'MAIN' : 'GAL' + padZero(index, 2);

        var formData = new FormData();
        formData.append('image', file);
        formData.append('product_name', productName);
        formData.append('variant', variant);

        var pct = Math.round(((index + 1) / total) * 100);
        progressFill.style.width = pct + '%';
        progressText.textContent = 'Uploading ' + (index + 1) + '/' + total + ' (' + pct + '%)';

        uploadToServer(formData)
          .then(function (res) {
            if (res.success) {
              var item = document.createElement('div');
              item.className = 'upload-result-item success';
              item.innerHTML =
                '<span class="result-icon">&#10003;</span>' +
                '<span class="result-name">' + escapeHtml(res.filename || file.name) + '</span>' +
                '<a href="' + escapeHtml(res.url) + '" target="_blank" class="result-link">View</a>';
              uploadResult.appendChild(item);

              // Auto-fill image filename for MAIN variant
              if (variant === 'MAIN' && res.filename) {
                var imgInput = form.querySelector('[name="image"]');
                if (imgInput) {
                  imgInput.value = res.filename;
                  imgInput.dispatchEvent(new Event('input'));
                }
              }
              // Auto-fill gallery filenames for GAL variants
              if (variant.indexOf('GAL') === 0 && res.filename) {
                var galInput = form.querySelector('[name="gallery_images"]');
                if (galInput) {
                  var existing = [];
                  try { existing = JSON.parse(galInput.value || '[]'); } catch(e) { existing = []; }
                  existing.push(res.filename);
                  galInput.value = JSON.stringify(existing);
                }
              }
            } else {
              var errItem = document.createElement('div');
              errItem.className = 'upload-result-item error';
              errItem.innerHTML =
                '<span class="result-icon">&#10007;</span>' +
                '<span class="result-name">' + escapeHtml(file.name) + '</span>' +
                '<span class="result-error">' + escapeHtml(res.message || 'Upload failed') + '</span>';
              uploadResult.appendChild(errItem);
            }
            uploadNext(index + 1);
          })
          .catch(function () {
            var errItem = document.createElement('div');
            errItem.className = 'upload-result-item error';
            errItem.innerHTML =
              '<span class="result-icon">&#10007;</span>' +
              '<span class="result-name">' + escapeHtml(file.name) + '</span>' +
              '<span class="result-error">Network error</span>';
            uploadResult.appendChild(errItem);
            uploadNext(index + 1);
          });
      }

      uploadNext(0);
    }
  }

  function uploadToServer(formData) {
    return fetch('/api/upload.php', {
      method: 'POST',
      body: formData
    }).then(function (response) {
      return response.json();
    }).catch(function () {
      return { success: false, message: 'Could not reach upload server' };
    });
  }

  function getProductImageUrl(filename) {
    if (!filename) return 'assets/placeholder.svg';
    if (filename.indexOf('http') === 0 || filename.charAt(0) === '/') return filename;
    return '/uploads/products/' + filename;
  }

  function padZero(num, len) {
    var s = String(num);
    while (s.length < len) s = '0' + s;
    return s;
  }

  function formatJsonField(val) {
    if (!val) return '[]';
    if (typeof val === 'string') {
      try { return JSON.stringify(JSON.parse(val), null, 2); } catch(e) { return val; }
    }
    return JSON.stringify(val, null, 2);
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────────

  function initCategories() {
    var container = document.getElementById('categoriesList');
    var form = document.getElementById('categoryForm');
    if (!container) return;

    var editId = null;

    function loadCategories() {
      container.innerHTML = '<div class="loading-spinner">Loading categories...</div>';
      api().handleResponse(api().getCategories(), function (res) {
        if (!res.success || !res.data) {
          container.innerHTML = '<div class="empty-state"><p>Failed to load categories.</p></div>';
          return;
        }

        var cats = res.data.categories || [];
        if (cats.length === 0) {
          container.innerHTML = '<div class="empty-state"><p>No categories yet.</p></div>';
          return;
        }

        var html = '<div class="table-wrapper"><table class="data-table">' +
          '<thead><tr><th>ID</th><th>Name</th><th>Slug</th><th>Sort</th><th class="actions-cell">Actions</th></tr></thead><tbody>';

        cats.forEach(function (c) {
          html += '<tr>' +
            '<td>' + escapeHtml(c.id) + '</td>' +
            '<td><strong>' + escapeHtml(c.name || '') + '</strong></td>' +
            '<td>' + escapeHtml(c.slug || '') + '</td>' +
            '<td>' + (c.sort_order || '0') + '</td>' +
            '<td class="actions-cell">' +
              '<button class="btn-primary btn-sm" onclick="RS_ADMIN.editCategory(' + c.id + ')">Edit</button> ' +
              '<button class="btn-danger btn-sm" onclick="RS_ADMIN.deleteCategoryItem(' + c.id + ')">Delete</button>' +
            '</td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
      });
    }

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = form.querySelector('[name="name"]').value;
        var desc = form.querySelector('[name="description"]').value;
        var sortOrder = form.querySelector('[name="sort_order"]').value || '0';
        var submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        var apiCall;
        if (editId) {
          apiCall = api().updateCategory({ id: editId, name: name, description: desc, sort_order: sortOrder });
        } else {
          apiCall = api().addCategory({ name: name, description: desc, sort_order: sortOrder });
        }

        apiCall.then(function (res) {
          if (submitBtn) submitBtn.disabled = false;
          if (res.success) {
            showToast(editId ? 'Category updated.' : 'Category added.', 'success');
            form.reset();
            editId = null;
            form.querySelector('button[type="submit"]').textContent = 'Add Category';
            loadCategories();
          } else {
            showToast(res.error || 'Failed to save category.', 'error');
          }
        });
      });
    }

    loadCategories();
  }

  function editCategory(id) {
    var form = document.getElementById('categoryForm');
    if (!form) return;

    api().getCategories().then(function (res) {
      if (!res.success || !res.data) return;
      var cat = (res.data.categories || []).find(function (c) { return String(c.id) === String(id); });
      if (!cat) { showToast('Category not found.', 'error'); return; }

      form.querySelector('[name="name"]').value = cat.name || '';
      form.querySelector('[name="description"]').value = cat.description || '';
      form.querySelector('[name="sort_order"]').value = cat.sort_order || '0';
      form.querySelector('button[type="submit"]').textContent = 'Update Category';
      editId = id;
    });
  }

  function deleteCategoryItem(id) {
    if (!confirm('Delete this category? It can be re-activated later.')) return;
    api().deleteCategory(id).then(function (res) {
      if (res.success) {
        showToast('Category deactivated.', 'success');
        initCategories();
      } else {
        showToast(res.error || 'Failed to delete.', 'error');
      }
    });
  }

  // ─── INQUIRIES ─────────────────────────────────────────────────────────────

  function initInquiries() {
    var container = document.getElementById('inquiriesList');
    if (!container) return;

    loadInquiries();

    function loadInquiries() {
      container.innerHTML = '<div class="loading-spinner">Loading inquiries...</div>';

      api().handleResponse(api().getInquiries(), function (res) {
        var inquiries = res.data.inquiries || [];
        if (inquiries.length === 0) {
          container.innerHTML = '<div class="empty-state"><p>No inquiries yet.</p></div>';
          return;
        }

        var statuses = ['new', 'read', 'replied'];
        var html = '<div class="table-wrapper"><table class="data-table">' +
          '<thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Product</th><th>Message</th><th>Status</th><th class="actions-cell">Action</th></tr></thead><tbody>';

        inquiries.forEach(function (inq) {
          var statusOptions = statuses.map(function (s) {
            var selected = s === inq.status ? ' selected' : '';
            return '<option value="' + s + '"' + selected + '>' + s + '</option>';
          }).join('');

          html += '<tr>' +
            '<td>' + escapeHtml((inq.date || '').substring(0, 10)) + '</td>' +
            '<td>' + escapeHtml(inq.name || '') + '</td>' +
            '<td>' + escapeHtml(inq.phone || '') + '</td>' +
            '<td>' + escapeHtml(inq.product || '') + '</td>' +
            '<td>' + escapeHtml((inq.message || '').substring(0, 80)) + '</td>' +
            '<td><select class="status-select" data-id="' + inq.id + '">' + statusOptions + '</select></td>' +
            '<td class="actions-cell"><button class="btn-primary btn-sm update-status-btn" data-id="' + inq.id + '">Update</button></td>' +
          '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;

        // Attach status update handlers
        container.querySelectorAll('.update-status-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var id = btn.getAttribute('data-id');
            var select = container.querySelector('.status-select[data-id="' + id + '"]');
            if (!select) return;
            var status = select.value;
            btn.disabled = true;
            btn.textContent = 'Saving...';
            api().handleResponse(api().updateInquiry(id, status), function () {
              showToast('Status updated.', 'success');
              loadInquiries();
            });
          });
        });
      });
    }
  }

  // ─── SETTINGS ──────────────────────────────────────────────────────────────

  function initSettings() {
    var baseUrlInput = document.getElementById('apiBaseUrl');
    if (baseUrlInput) {
      baseUrlInput.value = API_BASE;
    }

    var saveBtn = document.getElementById('saveApiUrl');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var url = baseUrlInput.value.trim();
        if (!url) {
          showToast('Please enter a valid URL.', 'error');
          return;
        }
        api().setApiBase(url);
        showToast('API URL updated.', 'success');
      });
    }

    // Upload key config
    var uploadKeyInput = document.getElementById('uploadKey');
    var saveUploadKeyBtn = document.getElementById('saveUploadKey');

    if (uploadKeyInput && saveUploadKeyBtn) {
      api().getSetting('upload_key').then(function (res) {
        if (res.success && res.data && res.data.value) {
          uploadKeyInput.value = res.data.value;
        }
      });

      saveUploadKeyBtn.addEventListener('click', function () {
        var key = uploadKeyInput.value.trim();
        if (!key) {
          showToast('Please enter an upload key.', 'error');
          return;
        }
        saveUploadKeyBtn.disabled = true;
        saveUploadKeyBtn.textContent = 'Saving...';
        api().updateSetting('upload_key', key).then(function (res) {
          saveUploadKeyBtn.disabled = false;
          saveUploadKeyBtn.textContent = 'Save Upload Key';
          if (res.success) {
            showToast('Upload key saved. Make sure it matches upload.php', 'success');
          } else {
            showToast(res.error || 'Failed to save.', 'error');
          }
        });
      });
    }

    var passwordBtn = document.getElementById('savePassword');
    if (passwordBtn) {
      passwordBtn.addEventListener('click', function () {
        var current = document.getElementById('currentPassword').value;
        var newPass = document.getElementById('newPassword').value;
        if (!current || !newPass) {
          showToast('Please fill in both password fields.', 'error');
          return;
        }
        if (newPass.length < 4) {
          showToast('New password must be at least 4 characters.', 'error');
          return;
        }
        passwordBtn.disabled = true;
        passwordBtn.textContent = 'Saving...';
        api().handleResponse(api().changePassword(current, newPass), function (res) {
          if (res.success && res.data && res.data.admin_key) {
            setAdminKey(res.data.admin_key);
            showToast(res.data.message || 'Password changed successfully.', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
          }
          passwordBtn.disabled = false;
          passwordBtn.textContent = 'Change Password';
        });
      });
    }
  }

  // ─── UTILITY ───────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str)));
    return div.innerHTML;
  }

  // ─── PUBLIC API ────────────────────────────────────────────────────────────

  return {
    init: init,
    showToast: showToast,
    deleteProductItem: deleteProductItem,
    editCategory: editCategory,
    deleteCategoryItem: deleteCategoryItem,
    api: api,
    getAdminKey: getAdminKey,
    setAdminKey: setAdminKey,
    clearAdminKey: clearAdminKey
  };

})();

// ─── AUTO-INIT ────────────────────────────────────────────────────────────────

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', RS_ADMIN.init);
} else {
  RS_ADMIN.init();
}
