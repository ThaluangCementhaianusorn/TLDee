// เชื่อมต่อ Google Sheets อัตโนมัติ (ใช้ Google clasp)
// 1) สร้าง Google Sheets + Apps Script ผูกกัน (ครั้งแรก)  2) อัปโหลด Code.gs  3) Deploy เป็นเว็บแอป
// 4) ใส่ API_URL ใน js/config.js  5) อัปโหลดขึ้น GitHub
// ใช้งาน: node tools/connect-sheets.mjs        (รันซ้ำได้ทุกครั้งที่แก้โค้ด จะอัปเดต deployment เดิม URL ไม่เปลี่ยน)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { buildGs } from './build-gs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gasDir = path.join(root, '.gas');
const infoFile = path.join(gasDir, 'info.json');
const CLASP = '@google/clasp@2.4.2';
const TITLE = 'คนดีศรีท่าหลวง-ฐานข้อมูล';

function clasp(args, { inherit = false } = {}) {
  const r = spawnSync('npx', ['-y', CLASP, ...args], {
    cwd: gasDir, shell: true, encoding: 'utf8', stdio: inherit ? 'inherit' : 'pipe'
  });
  const out = (r.stdout || '') + (r.stderr || '');
  if (!inherit) process.stdout.write(out);
  if (r.status !== 0) {
    if (/Apps Script API|usersettings/i.test(out)) {
      console.error('\n>> ต้องเปิด Google Apps Script API ก่อน: https://script.google.com/home/usersettings  (เปิดเป็น On) แล้วรันใหม่');
    }
    throw new Error('clasp ' + args[0] + ' ไม่สำเร็จ');
  }
  return out;
}

const step = (n, t) => console.log(`\n[${n}/5] ${t}`);
fs.mkdirSync(gasDir, { recursive: true });
const info = fs.existsSync(infoFile) ? JSON.parse(fs.readFileSync(infoFile, 'utf8')) : {};
const save = () => fs.writeFileSync(infoFile, JSON.stringify(info, null, 2));

// 0) ล็อกอิน Google
if (!fs.existsSync(path.join(os.homedir(), '.clasprc.json'))) {
  console.log('เข้าสู่ระบบบัญชี Google (เบราว์เซอร์จะเปิดขึ้นมา)...');
  clasp(['login'], { inherit: true });
}

// 1) สร้าง Sheet + Script
step(1, 'Google Sheets + Apps Script');
if (!fs.existsSync(path.join(gasDir, '.clasp.json'))) {
  const out = clasp(['create', '--type', 'sheets', '--title', `"${TITLE}"`, '--rootDir', '.']);
  const sheet = out.match(/https:\/\/drive\.google\.com\/open\?id=[\w-]+/) || out.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/[\w-]+/);
  if (sheet) info.sheetUrl = sheet[0];
  save();
} else console.log('มีอยู่แล้ว — ใช้ชุดเดิม');
const scriptId = JSON.parse(fs.readFileSync(path.join(gasDir, '.clasp.json'), 'utf8')).scriptId;
info.editorUrl = `https://script.google.com/d/${scriptId}/edit`;

// 2) อัปโหลดโค้ด
step(2, 'อัปโหลด Code.gs');
buildGs();
for (const f of fs.readdirSync(gasDir)) if (/\.(gs|js)$/.test(f)) fs.unlinkSync(path.join(gasDir, f));
fs.copyFileSync(path.join(root, 'apps-script/Code.gs'), path.join(gasDir, 'Code.gs'));
fs.writeFileSync(path.join(gasDir, 'appsscript.json'), JSON.stringify({
  timeZone: 'Asia/Bangkok',
  exceptionLogging: 'STACKDRIVER',
  runtimeVersion: 'V8',
  webapp: { executeAs: 'USER_DEPLOYING', access: 'ANYONE_ANONYMOUS' }
}, null, 2));
clasp(['push', '--force']);

// 3) Deploy เว็บแอป (อัปเดต deployment เดิมเพื่อให้ URL คงที่)
step(3, 'Deploy เว็บแอป');
const desc = '"TLDee ' + new Date().toISOString().slice(0, 16) + '"';
const out = info.deploymentId
  ? clasp(['deploy', '--deploymentId', info.deploymentId, '--description', desc])
  : clasp(['deploy', '--description', desc]);
const m = out.match(/-\s*(AKfyc[\w-]+)\s*@/);
if (m) info.deploymentId = m[1];
if (!info.deploymentId) throw new Error('ไม่พบ deployment ID ในผลลัพธ์ของ clasp');
info.apiUrl = `https://script.google.com/macros/s/${info.deploymentId}/exec`;
save();

// 4) ใส่ API_URL
step(4, 'ตั้งค่า js/config.js');
const cfgPath = path.join(root, 'js/config.js');
const cfg = fs.readFileSync(cfgPath, 'utf8');
const next = cfg.replace(/API_URL:\s*'[^']*'/, `API_URL: '${info.apiUrl}'`);
if (next !== cfg) fs.writeFileSync(cfgPath, next, 'utf8');
console.log('API_URL =', info.apiUrl);

// 5) GitHub
step(5, 'อัปโหลดขึ้น GitHub');
spawnSync(process.execPath, [path.join(root, 'tools/github-sync.mjs')], { cwd: root, stdio: 'inherit' });

console.log(`
==================== เสร็จแล้ว ====================
Google Sheets : ${info.sheetUrl || '(ดูใน Google Drive ชื่อ ' + TITLE + ')'}
Apps Script   : ${info.editorUrl}
API URL       : ${info.apiUrl}

ขั้นตอนสุดท้าย (ทำครั้งเดียว): ให้สิทธิ์ระบบเข้าถึง Sheets/Drive
  1. เปิดลิงก์ Apps Script ด้านบน
  2. เลือกฟังก์ชัน "setup" แล้วกด "เรียกใช้ (Run)"
  3. กด "ตรวจสอบสิทธิ์" → เลือกบัญชี → ขั้นสูง → ไปที่โปรเจกต์ → อนุญาต
  แล้วเปิดเว็บไซต์ เข้าสู่ระบบด้วย admin / admin1234
===================================================`);
