#!/usr/bin/env node
/* =====================================================================
 * อัปโหลดโปรเจกต์ขึ้น GitHub อัตโนมัติ (ไม่ต้องติดตั้ง git)
 *   node tools/github-sync.mjs           -> ซิงก์ครั้งเดียว
 *   node tools/github-sync.mjs --watch   -> เฝ้าดูไฟล์ แก้ไขเมื่อไรอัปโหลดทันที
 * ใช้ token จาก GitHub CLI (gh auth login) หรือ env GITHUB_TOKEN
 * ตั้งค่าได้ที่ tools/sync.config.json
 * ===================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildGs } from './build-gs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CFG_FILE = path.join(ROOT, 'tools', 'sync.config.json');
const cfg = Object.assign({
  owner: '', repo: 'TLDee', branch: 'main', private: false, pages: true,
  description: 'ระบบคนดีศรีท่าหลวง (ทำดีมีเกียรติ) วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
  ignore: ['.git', 'node_modules', '.claude', '.vscode', 'Thumbs.db', 'desktop.ini', '.DS_Store']
}, fs.existsSync(CFG_FILE) ? JSON.parse(fs.readFileSync(CFG_FILE, 'utf8')) : {});

const token = process.env.GITHUB_TOKEN || (() => {
  try { return execSync('gh auth token', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { console.error('✖ ไม่พบ token: กรุณารัน  gh auth login  หรือกำหนด GITHUB_TOKEN'); process.exit(1); }
})();

const log = (...a) => console.log(`[${new Date().toLocaleTimeString('th-TH')}]`, ...a);

async function gh(method, url, body, okStatuses = []) {
  const res = await fetch(url.startsWith('http') ? url : 'https://api.github.com' + url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'tldee-sync'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok && !okStatuses.includes(res.status)) {
    const t = await res.text();
    throw new Error(`${method} ${url} -> ${res.status} ${t.slice(0, 300)}`);
  }
  if (res.status === 204) return { status: 204 };
  const j = await res.json().catch(() => ({}));
  return Object.assign(j, { __status: res.status });
}

function ignored(rel) {
  const parts = rel.split('/');
  return parts.some(p => cfg.ignore.includes(p) || p.startsWith('~$')) || /\.(tmp|log)$/i.test(rel);
}
function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, e.name), rel = path.relative(ROOT, abs).split(path.sep).join('/');
    if (ignored(rel)) continue;
    if (e.isDirectory()) walk(abs, out); else if (e.isFile()) out.push(rel);
  }
  return out;
}
const blobSha = buf => crypto.createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

let owner = cfg.owner;
async function ensureRepo() {
  if (!owner) owner = (await gh('GET', '/user')).login;
  const r = await gh('GET', `/repos/${owner}/${cfg.repo}`, null, [404]);
  if (r.__status === 404) {
    log(`สร้าง repository ใหม่ ${owner}/${cfg.repo} ...`);
    await gh('POST', '/user/repos', { name: cfg.repo, description: cfg.description, private: cfg.private, auto_init: true, homepage: '' });
    for (let i = 0; i < 10; i++) {
      const ref = await gh('GET', `/repos/${owner}/${cfg.repo}/git/ref/heads/${cfg.branch}`, null, [404, 409]);
      if (ref.object) break;
      await new Promise(r2 => setTimeout(r2, 1500));
    }
  }
}

async function ensurePages() {
  if (!cfg.pages) return;
  const p = await gh('GET', `/repos/${owner}/${cfg.repo}/pages`, null, [404]);
  if (p.__status === 404) {
    await gh('POST', `/repos/${owner}/${cfg.repo}/pages`, { source: { branch: cfg.branch, path: '/' } }, [409, 422]);
    log('เปิดใช้งาน GitHub Pages แล้ว');
  }
  log(`🌐 เว็บไซต์: https://${owner.toLowerCase()}.github.io/${cfg.repo}/`);
}

async function sync() {
  try { buildGs(); } catch (e) { log('⚠ build Code.gs ไม่สำเร็จ:', e.message); }
  const ref = await gh('GET', `/repos/${owner}/${cfg.repo}/git/ref/heads/${cfg.branch}`);
  const headSha = ref.object.sha;
  const head = await gh('GET', `/repos/${owner}/${cfg.repo}/git/commits/${headSha}`);
  const tree = await gh('GET', `/repos/${owner}/${cfg.repo}/git/trees/${head.tree.sha}?recursive=1`);
  const remote = new Map(tree.tree.filter(t => t.type === 'blob').map(t => [t.path, t.sha]));

  const local = walk(ROOT);
  const changes = [];
  for (const rel of local) {
    const buf = fs.readFileSync(path.join(ROOT, rel));
    if (remote.get(rel) === blobSha(buf)) continue;
    const blob = await gh('POST', `/repos/${owner}/${cfg.repo}/git/blobs`, { content: buf.toString('base64'), encoding: 'base64' });
    changes.push({ path: rel, mode: '100644', type: 'blob', sha: blob.sha });
  }
  const localSet = new Set(local);
  for (const rel of remote.keys()) {
    if (!localSet.has(rel) && !ignored(rel)) changes.push({ path: rel, mode: '100644', type: 'blob', sha: null });
  }
  if (!changes.length) { log('✔ ไม่มีการเปลี่ยนแปลง'); return 0; }

  const newTree = await gh('POST', `/repos/${owner}/${cfg.repo}/git/trees`, { base_tree: head.tree.sha, tree: changes });
  const names = changes.map(c => (c.sha === null ? '-' : '') + c.path);
  const commit = await gh('POST', `/repos/${owner}/${cfg.repo}/git/commits`, {
    message: `อัปเดตอัตโนมัติ ${new Date().toLocaleString('th-TH')} (${changes.length} ไฟล์)\n\n${names.join('\n')}`,
    tree: newTree.sha, parents: [headSha]
  });
  await gh('PATCH', `/repos/${owner}/${cfg.repo}/git/refs/heads/${cfg.branch}`, { sha: commit.sha });
  log(`⬆ อัปโหลด ${changes.length} ไฟล์: ${names.slice(0, 8).join(', ')}${names.length > 8 ? ' ...' : ''}`);
  return changes.length;
}

let running = false, again = false, timer = null;
async function runSync() {
  if (running) { again = true; return; }
  running = true;
  try { await sync(); } catch (e) { log('✖ ซิงก์ไม่สำเร็จ:', e.message); }
  running = false;
  if (again) { again = false; runSync(); }
}

await ensureRepo();
await runSync();
await ensurePages().catch(e => log('⚠ ตั้งค่า Pages ไม่สำเร็จ:', e.message));

if (process.argv.includes('--watch')) {
  log('👀 กำลังเฝ้าดูการแก้ไขไฟล์... (กด Ctrl+C เพื่อหยุด)');
  fs.watch(ROOT, { recursive: true }, (_ev, file) => {
    if (!file) return;
    const rel = file.split(path.sep).join('/');
    if (ignored(rel) || rel === 'apps-script/Code.gs') return;
    clearTimeout(timer);
    timer = setTimeout(runSync, 2500);
  });
}
