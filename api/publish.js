/**
 * RS Machinery — Vercel serverless API for the admin panel.
 *
 *   POST /api/publish  { repo, branch, message, files: [{path, json}] }
 *     Commits all files in ONE git tree (atomic catalog update).
 *     Env var required: GITHUB_MACHINERY_PAT (contents read+write, this repo only).
 *
 *   GET /api/proxy?path=/repos/o/r/contents/data/products.json
 *     Read-only passthrough so the admin can load the catalog without
 *     exposing the PAT to the browser.
 *
 * Deploy: Vercel → New project → import repo → add env GITHUB_MACHINERY_PAT.
 * Admin Connection field: https://<your-app>.vercel.app/api
 */
const API = 'https://api.github.com';

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.end(JSON.stringify(body));
}

function ghHeaders(token, extra) {
  return Object.assign({
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'rsmachinery-admin',
  }, extra || {});
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => { data += c; if (data.length > 5e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

/** Commit several files in a single commit using the Git Data API. */
async function commitMultiple(token, repo, branch, message, files) {
  // 1. current branch head
  const headRes = await fetch(`${API}/repos/${repo}/branches/${encodeURIComponent(branch)}`, { headers: ghHeaders(token) });
  if (!headRes.ok) throw Object.assign(new Error(`branch "${branch}" not found (${headRes.status})`), { status: headRes.status });
  const head = await headRes.json();
  const baseSha = head.commit.commit.tree.sha;

  // 2. build a tree that only touches the given paths
  const treeItems = [];
  for (const f of files) {
    const content = typeof f.json === 'string' ? f.json : JSON.stringify(f.json, null, 2) + '\n';
    const blobRes = await fetch(`${API}/repos/${repo}/git/blobs`, {
      method: 'POST',
      headers: ghHeaders(token, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ content, encoding: 'utf-8' }),
    });
    if (!blobRes.ok) throw new Error(`blob create failed for ${f.path} (${blobRes.status})`);
    const blob = await blobRes.json();
    treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const treeRes = await fetch(`${API}/repos/${repo}/git/trees`, {
    method: 'POST',
    headers: ghHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ base_tree: baseSha, tree: treeItems }),
  });
  if (!treeRes.ok) throw new Error('tree create failed (' + treeRes.status + ')');
  const tree = await treeRes.json();

  // 3. commit + 4. move branch ref
  const commitRes = await fetch(`${API}/repos/${repo}/git/commits`, {
    method: 'POST',
    headers: ghHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ message, tree: tree.sha, parents: [head.commit.sha] }),
  });
  if (!commitRes.ok) throw new Error('commit create failed (' + commitRes.status + ')');
  const commit = await commitRes.json();

  const refRes = await fetch(`${API}/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    headers: ghHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  if (!refRes.ok) throw new Error('ref update failed (' + refRes.status + ')');

  return { sha: commit.sha, html_url: commit.html_url, files: files.map((f) => f.path) };
}

module.exports = async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') return json(res, 204, {});

  const token = process.env.GITHUB_MACHINERY_PAT;
  if (!token) return json(res, 500, { error: 'GITHUB_MACHINERY_PAT env var is not set on the server.' });

  // GET /api/proxy?path=/repos/...  (read-only passthrough)
  if (req.method === 'GET' && req.url.startsWith('/api/proxy')) {
    const u = new URL(req.url, 'http://x');
    const path = u.searchParams.get('path') || '';
    if (!/^\/repos\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/(contents|branches)\//.test(path)) {
      return json(res, 400, { error: 'path must be /repos/<owner>/<repo>/contents/... or /branches/...' });
    }
    const ghRes = await fetch(API + path, { headers: ghHeaders(token) });
    const body = await ghRes.text();
    res.statusCode = ghRes.status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.end(body);
  }

  // POST /api/publish
  if (req.method === 'POST' && req.url.startsWith('/api/publish')) {
    let payload;
    try { payload = await readBody(req); }
    catch (e) { return json(res, 400, { error: 'invalid JSON body' }); }

    const repo = String(payload.repo || '').trim();
    const branch = String(payload.branch || 'main').trim();
    const message = String(payload.message || 'admin: catalog update').slice(0, 200);
    const files = Array.isArray(payload.files) ? payload.files : [];

    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) return json(res, 400, { error: 'invalid repo' });
    if (files.length === 0) return json(res, 400, { error: 'no files to commit' });
    for (const f of files) {
      if (!/^[\w./-]+$/.test(f.path) || f.path.includes('..')) return json(res, 400, { error: 'invalid path: ' + f.path });
      if (typeof f.json === 'undefined') return json(res, 400, { error: 'missing json for ' + f.path });
    }

    try {
      const result = await commitMultiple(token, repo, branch, message, files);
      return json(res, 200, { ok: true, via: 'proxy', commit: result });
    } catch (e) {
      return json(res, e.status || 502, { error: e.message || 'GitHub API error' });
    }
  }

  return json(res, 404, { error: 'not found' });
};
