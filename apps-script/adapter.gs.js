/* =====================================================================
 * ส่วนเชื่อมต่อ Google Sheets / Google Drive (Google Apps Script)
 * วิธีติดตั้ง: ดู README.md หัวข้อ "เชื่อมต่อ Google Sheets"
 * ===================================================================== */

var SHEET_NAMES = { users: 'Users', deeds: 'Deeds' };

function props_() { return PropertiesService.getScriptProperties(); }

function ss_() {
  var id = props_().getProperty('SHEET_ID');
  return id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(table) {
  var ss = ss_();
  var sh = ss.getSheetByName(SHEET_NAMES[table]);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAMES[table]);
    var cols = TLD.SCHEMA[table];
    sh.getRange('A:Z').setNumberFormat('@');               // เก็บทุกค่าเป็นข้อความ (กันเลขศูนย์นำหน้าหาย)
    sh.getRange(1, 1, 1, cols.length).setValues([cols])
      .setFontWeight('bold').setBackground('#14244B').setFontColor('#FFFFFF');
    sh.setFrozenRows(1);
  }
  return sh;
}

/* ---------- ฐานข้อมูลบน Google Sheets ---------- */
function SheetDB() { this.cache = {}; }
SheetDB.prototype.rows = function (table) {
  if (this.cache[table]) return this.cache[table];
  var sh = sheet_(table), cols = TLD.SCHEMA[table];
  var last = sh.getLastRow();
  var values = last > 1 ? sh.getRange(2, 1, last - 1, cols.length).getDisplayValues() : [];
  var out = [];
  for (var r = 0; r < values.length; r++) {
    if (!values[r][0]) continue;
    var o = { _row: r + 2 };
    for (var c = 0; c < cols.length; c++) o[cols[c]] = values[r][c];
    out.push(o);
  }
  this.cache[table] = out;
  return out;
};
SheetDB.prototype.insert = function (table, obj) {
  var sh = sheet_(table), cols = TLD.SCHEMA[table];
  var row = cols.map(function (c) { return obj[c] === undefined || obj[c] === null ? '' : String(obj[c]); });
  var at = sh.getLastRow() + 1;
  sh.getRange(at, 1, 1, cols.length).setNumberFormat('@').setValues([row]);
  if (this.cache[table]) { obj._row = at; this.cache[table].push(obj); }
};
SheetDB.prototype.update = function (table, id, patch) {
  var list = this.rows(table), cols = TLD.SCHEMA[table];
  for (var i = 0; i < list.length; i++) {
    if (String(list[i].id) === String(id)) {
      for (var k in patch) list[i][k] = patch[k];
      var row = cols.map(function (c) { return list[i][c] === undefined || list[i][c] === null ? '' : String(list[i][c]); });
      sheet_(table).getRange(list[i]._row, 1, 1, cols.length).setValues([row]);
      return;
    }
  }
};
SheetDB.prototype.version = function () { return props_().getProperty('VERSION') || '0'; };
SheetDB.prototype.bump = function () { props_().setProperty('VERSION', String(Date.now())); };

function secret_() {
  var s = props_().getProperty('SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props_().setProperty('SECRET', s); }
  return s;
}

function folder_() {
  var id = props_().getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder('คนดีศรีท่าหลวง - รูปหลักฐาน');
  props_().setProperty('FOLDER_ID', f.getId());
  return f;
}

function saveImage_(dataUrl, name) {
  var m = String(dataUrl).match(/^data:(image\/[a-z+]+);base64,(.+)$/);
  if (!m) return '';
  var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name + '.jpg');
  var file = folder_().createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
  return 'https://lh3.googleusercontent.com/d/' + file.getId();
}

function api_() {
  return TLD.createApi(new SheetDB(), { secret: secret_, saveImage: saveImage_ });
}

function respond_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function run_(payload) {
  var api = api_();
  if (api.isWrite(payload.action)) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(25000)) return { ok: false, error: 'ระบบมีผู้ใช้งานพร้อมกันจำนวนมาก กรุณาลองใหม่อีกครั้ง' };
    try { return api.handle(payload); } finally { lock.releaseLock(); }
  }
  return api.handle(payload);
}

/* ---------- Web App endpoints ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action) return respond_(run_(p));
  return respond_({ ok: true, data: { app: TLD.APP_NAME, status: 'API พร้อมใช้งาน', version: props_().getProperty('VERSION') } });
}

function doPost(e) {
  var payload = {};
  try { payload = JSON.parse(e.postData.contents); } catch (err) { return respond_({ ok: false, error: 'ข้อมูลไม่ถูกต้อง' }); }
  return respond_(run_(payload));
}

/* ---------- ติดตั้งครั้งแรก: เลือกฟังก์ชัน setup แล้วกด Run ---------- */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) props_().setProperty('SHEET_ID', ss.getId());
  sheet_('users'); sheet_('deeds');
  secret_(); folder_();
  var db = new SheetDB();
  var hasAdmin = db.rows('users').some(function (u) { return u.role === 'admin'; });
  if (!hasAdmin) {
    db.insert('users', { id: 'admin', name: 'ผู้ดูแลระบบ', role: 'admin', dept: '', level: '', advisorId: '',
      passHash: TLD.hashPassword('admin', 'admin1234'), active: '1', createdAt: new Date().toISOString() });
  }
  var first = ss && ss.getSheetByName('Sheet1') || ss && ss.getSheetByName('ชีต1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) ss.deleteSheet(first);
  db.bump();
  Logger.log('ติดตั้งเรียบร้อย ✔  ผู้ดูแลระบบ: admin / admin1234 (กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ)');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('คนดีศรีท่าหลวง')
    .addItem('ติดตั้ง/ตรวจสอบระบบ (setup)', 'setup')
    .addToUi();
}
