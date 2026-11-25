// รวม js/core.js + apps-script/adapter.gs.js -> apps-script/Code.gs (ไฟล์เดียวสำหรับวางใน Google Apps Script)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function buildGs() {
  const core = fs.readFileSync(path.join(root, 'js/core.js'), 'utf8')
    .replace(/\nif \(typeof module[^\n]*\n?/, '\n');
  const adapter = fs.readFileSync(path.join(root, 'apps-script/adapter.gs.js'), 'utf8');
  const out = `/* ไฟล์นี้สร้างอัตโนมัติจาก js/core.js + apps-script/adapter.gs.js — อย่าแก้ไขโดยตรง */\n\n${core}\n\n${adapter}`;
  const dest = path.join(root, 'apps-script/Code.gs');
  const prev = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
  if (prev !== out) fs.writeFileSync(dest, out, 'utf8');
  return dest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('สร้างไฟล์แล้ว:', buildGs());
}
