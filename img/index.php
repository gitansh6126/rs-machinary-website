<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Image to WebP Converter</title>
<style>
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,sans-serif;background:#0f172a;color:#e2e8f0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:32px;width:100%;max-width:480px;box-shadow:0 25px 50px rgba(0,0,0,.4)}
h1{margin:0 0 4px;font-size:1.3rem;font-weight:700;color:#f8fafc}
.subtitle{margin:0 0 24px;font-size:.85rem;color:#64748b}
.upload-zone{position:relative;border:2px dashed #475569;border-radius:12px;padding:40px 24px;text-align:center;cursor:pointer;transition:all .2s;background:#0f172a}
.upload-zone:hover,.upload-zone.drag-over{border-color:#60a5fa;background:#1e293b}
.upload-zone-icon{font-size:2.5rem;margin-bottom:8px}
.upload-zone p{margin:0;color:#94a3b8;font-size:.9rem}
.upload-zone strong{color:#e2e8f0}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-zone .hint{font-size:.78rem;color:#475569;margin-top:8px}
.preview-wrap{display:none;margin-top:16px}
.preview-wrap.visible{display:block}
.preview-wrap img{width:100%;max-height:280px;object-fit:contain;border-radius:8px;background:#0f172a;border:1px solid #334155}
.file-info{display:flex;justify-content:space-between;align-items:center;margin:8px 0 0;font-size:.82rem;color:#94a3b8}
.file-info .name{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:70%}
.btn{display:inline-flex;align-items:center;justify-content:center;width:100%;padding:14px 24px;border:none;border-radius:10px;font-size:.95rem;font-weight:600;cursor:pointer;transition:all .15s;margin-top:12px}
.btn-convert{background:#3b82f6;color:#fff}
.btn-convert:hover{background:#2563eb}
.btn-convert:disabled{opacity:.5;cursor:not-allowed}
.btn-copy{background:#059669;color:#fff}
.btn-copy:hover{background:#047857}
.btn-copy.copied{background:#2563eb}
.status{font-size:.85rem;color:#64748b;margin-top:12px;text-align:center;min-height:1.3em}
.status.success{color:#34d399}
.status.error{color:#f87171}
.result-wrap{display:none;margin-top:16px;padding:12px 16px;background:#0f172a;border:1px solid #334155;border-radius:8px;word-break:break-all;font-size:.82rem;color:#60a5fa}
.result-wrap.visible{display:block}
@keyframes spin{to{transform:rotate(360deg)}}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid #475569;border-top-color:#60a5fa;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px}
@media(max-width:480px){
.card{padding:20px}
.upload-zone{padding:28px 16px}
}
</style>
</head>
<body>

<div class="card">
<h1>Image to WebP Converter</h1>
<p class="subtitle">Upload an image, convert to WebP, get a public URL</p>

<div class="upload-zone" id="uploadZone">
<div class="upload-zone-icon">&#128247;</div>
<p><strong>Click to select</strong> or drag &amp; drop an image</p>
<p class="hint">PNG, JPEG, WebP, GIF &mdash; Max 10MB</p>
<input type="file" id="fileInput" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif">
</div>

<div class="preview-wrap" id="previewWrap">
<img id="preview" src="" alt="Preview">
<div class="file-info">
<span class="name" id="fileName"></span>
<span id="fileSize"></span>
</div>
</div>

<button class="btn btn-convert" id="convertBtn" disabled>&#9889; Convert to WebP</button>

<div class="status" id="status"></div>

<div class="result-wrap" id="resultWrap">
<span id="resultUrl"></span>
</div>

<button class="btn btn-copy" id="copyBtn" style="display:none"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy</button>
</div>

<script>
(function(){
var fileInput = document.getElementById('fileInput');
var uploadZone = document.getElementById('uploadZone');
var previewWrap = document.getElementById('previewWrap');
var preview = document.getElementById('preview');
var fileName = document.getElementById('fileName');
var fileSize = document.getElementById('fileSize');
var convertBtn = document.getElementById('convertBtn');
var statusEl = document.getElementById('status');
var resultWrap = document.getElementById('resultWrap');
var resultUrl = document.getElementById('resultUrl');
var copyBtn = document.getElementById('copyBtn');

var selectedFile = null;
var convertedUrl = '';

fileInput.addEventListener('change', function() {
var file = fileInput.files[0];
if (!file) return;
selectedFile = file;
var reader = new FileReader();
reader.onload = function(e) {
preview.src = e.target.result;
previewWrap.classList.add('visible');
fileName.textContent = file.name;
fileSize.textContent = formatSize(file.size);
convertBtn.disabled = false;
statusEl.textContent = '';
statusEl.className = 'status';
resultWrap.classList.remove('visible');
copyBtn.style.display = 'none';
};
reader.readAsDataURL(file);
});

uploadZone.addEventListener('dragover', function(e) {
e.preventDefault();
uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', function() {
uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', function(e) {
e.preventDefault();
uploadZone.classList.remove('drag-over');
var files = e.dataTransfer.files;
if (files.length) {
fileInput.files = files;
fileInput.dispatchEvent(new Event('change'));
}
});

convertBtn.addEventListener('click', function() {
if (!selectedFile) return;
convertBtn.disabled = true;
convertBtn.innerHTML = '<span class="spinner"></span> Converting...';
statusEl.textContent = 'Converting to WebP...';
statusEl.className = 'status';

var formData = new FormData();
formData.append('image', selectedFile);

fetch('upload.php', {
method: 'POST',
body: formData
})
.then(function(r) { return r.json(); })
.then(function(res) {
convertBtn.disabled = false;
convertBtn.innerHTML = '&#9889; Convert to WebP';
if (res.success) {
convertedUrl = res.url;
resultUrl.textContent = convertedUrl;
resultWrap.classList.add('visible');
copyBtn.style.display = 'flex';
statusEl.textContent = 'Conversion successful!';
statusEl.className = 'status success';
} else {
statusEl.textContent = res.error || 'Conversion failed';
statusEl.className = 'status error';
}
})
.catch(function() {
convertBtn.disabled = false;
convertBtn.innerHTML = '&#9889; Convert to WebP';
statusEl.textContent = 'Network error. Please try again.';
statusEl.className = 'status error';
});
});

copyBtn.addEventListener('click', function() {
if (!convertedUrl) return;
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(convertedUrl).then(function() {
copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
copyBtn.classList.add('copied');
setTimeout(function() {
copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
copyBtn.classList.remove('copied');
}, 2000);
});
} else {
fallbackCopy(convertedUrl);
}
});

function fallbackCopy(text) {
var ta = document.createElement('textarea');
ta.value = text;
ta.style.position = 'fixed';
ta.style.opacity = '0';
document.body.appendChild(ta);
ta.select();
try { document.execCommand('copy'); copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!'; } catch(e) {}
document.body.removeChild(ta);
}

function formatSize(bytes) {
if (bytes < 1024) return bytes + ' B';
if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
return (bytes / 1048576).toFixed(1) + ' MB';
}

})();
</script>
</body>
</html>
