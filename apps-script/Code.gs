/* ไฟล์นี้สร้างอัตโนมัติจาก js/core.js + apps-script/adapter.gs.js — อย่าแก้ไขโดยตรง */

/* =====================================================================
 * core.js — ตรรกะหลักของระบบ "คนดีศรีท่าหลวง (ทำดีมีเกียรติ)"
 * ไฟล์นี้ใช้ร่วมกันทั้งฝั่งเว็บ (โหมดสาธิต) และ Google Apps Script (Code.gs)
 * ถ้าแก้ไขไฟล์นี้ ให้รัน  node tools/build-gs.mjs  เพื่อสร้าง Code.gs ใหม่
 * ===================================================================== */
var TLD = (function () {
  'use strict';

  var COLLEGE = 'วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์';
  var APP_NAME = 'คนดีศรีท่าหลวง';
  var APP_SLOGAN = 'ทำดีมีเกียรติ';

  // หมวดหมู่ความดีและค่าคะแนน (5 ด้าน) — icon = ชื่อไอคอน SVG ใน app.js
  var CATEGORIES = [
    { id: 'fame',       name: 'สร้างชื่อเสียงและคุณประโยชน์แก่สถาบัน', short: 'สร้างชื่อเสียง',     points: 3, icon: 'trophy', color: '#C28411' },
    { id: 'honest',     name: 'ความซื่อสัตย์สุจริต (เก็บของได้ส่งคืน)', short: 'ซื่อสัตย์สุจริต',    points: 2, icon: 'gem',    color: '#22396F' },
    { id: 'volunteer',  name: 'จิตอาสาพัฒนาวิทยาลัยและชุมชน',        short: 'จิตอาสา',          points: 2, icon: 'sprout', color: '#1E7F48' },
    { id: 'grateful',   name: 'ความกตัญญูและช่วยเหลือผู้อื่น',          short: 'กตัญญู/ช่วยเหลือ',   points: 1, icon: 'heart',  color: '#8B1E24' },
    { id: 'discipline', name: 'รักษาระเบียบวินัยและสิ่งแวดล้อม',        short: 'วินัย/สิ่งแวดล้อม',  points: 1, icon: 'leaf',   color: '#2F7FA3' }
  ];

  // แผนกวิชาเริ่มต้น (ผู้ดูแลระบบเพิ่ม/แก้ไขได้ในเมนู ตั้งค่าระบบ)
  var DEFAULT_DEPTS = [
    'ช่างยนต์', 'ช่างกลโรงงาน', 'ช่างเชื่อมโลหะ', 'ช่างไฟฟ้ากำลัง', 'ช่างอิเล็กทรอนิกส์',
    'ช่างก่อสร้าง', 'เมคคาทรอนิกส์และหุ่นยนต์', 'การบัญชี', 'เทคโนโลยีธุรกิจดิจิทัล'
  ];
  var DEPTS = DEFAULT_DEPTS.slice();

  var LEVELS = ['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'];

  // เกณฑ์เหรียญเริ่มต้น (ปรับได้ในเมนู ตั้งค่าระบบ)
  var DEFAULT_MINS = { bronze: 40, silver: 60, gold: 80 };
  var MEDALS = [
    { key: 'bronze', code: 'B', name: 'เหรียญทองแดง', full: 'ระดับเหรียญทองแดง', min: 40, title: 'ผู้มีความประพฤติดี มีจิตอาสา' },
    { key: 'silver', code: 'S', name: 'เหรียญเงิน',   full: 'ระดับเหรียญเงิน',   min: 60, title: 'แบบอย่างที่ดีด้านคุณธรรมจริยธรรม' },
    { key: 'gold',   code: 'G', name: 'เหรียญทอง',    full: 'ระดับเหรียญทอง (คนดีศรีท่าหลวง)', min: 80, title: 'สุดยอดเยาวชนต้นแบบ ทำดีมีเกียรติ' }
  ];

  // ค่าเริ่มต้นของเกียรติบัตร (แก้ไขได้ในเมนู ตั้งค่าระบบ > เกียรติบัตร)
  var DEFAULT_CERT = {
    template: 'classic',
    title: 'เกียรติบัตร',
    subtitle: 'โครงการคนดีศรีท่าหลวง “ทำดีมีเกียรติ”',
    intro: 'ขอมอบเกียรติบัตรฉบับนี้ไว้เพื่อแสดงว่า',
    body: 'นักเรียน/นักศึกษาระดับชั้น {level} แผนกวิชา{dept}',
    achievement: 'ได้รับรางวัล {medal}',
    reason: 'สะสมแต้มความดีครบ {min} แต้ม เป็น “{title}”',
    blessing: 'ขอให้มีความสุข ความเจริญ และเป็นแบบอย่างที่ดีสืบไป',
    directorName: '',
    directorTitle: 'ผู้อำนวยการวิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์',
    signature: '',
    showQr: true
  };
  var CERT_FIELDS = Object.keys(DEFAULT_CERT);
  var TEMPLATES = [
    { id: 'classic', name: 'คลาสสิก ทอง-แดง' },
    { id: 'royal',   name: 'ราชพฤกษ์ น้ำเงิน-ทอง' },
    { id: 'modern',  name: 'โมเดิร์น แถบสี' },
    { id: 'thai',    name: 'ลายไทยประยุกต์' }
  ];

  var ROLES = { student: 'นักเรียน/นักศึกษา', teacher: 'ครูที่ปรึกษา/ครูผู้สอน', admin: 'ผู้ดูแลระบบ/ผู้บริหาร' };
  var STATUS = { pending: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', returned: 'ส่งกลับแก้ไข' };

  // โครงสร้างตาราง (ชื่อคอลัมน์ใน Google Sheets)
  var SCHEMA = {
    users: ['id', 'name', 'role', 'dept', 'level', 'advisorId', 'passHash', 'active', 'createdAt', 'qrVer', 'portfolio'],
    deeds: ['id', 'studentId', 'studentName', 'dept', 'level', 'date', 'category', 'points', 'detail', 'impact',
            'learned', 'imageUrl', 'status', 'recordedById', 'recordedByName', 'reviewNote', 'reviewedBy',
            'createdAt', 'updatedAt'],
    settings: ['id', 'value', 'updatedAt']
  };

  /* ---------------- SHA-256 (pure JS ใช้ได้ทั้งเบราว์เซอร์และ Apps Script) ---------------- */
  var K256 = (function () {
    var k = [], n = 2, found = 0;
    function isPrime(x) { for (var i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; }
    while (found < 64) { if (isPrime(n)) { k[found++] = (Math.pow(n, 1 / 3) % 1) * 4294967296 | 0; } n++; }
    return k;
  })();
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
  function sha256(msg) {
    var s = unescape(encodeURIComponent(String(msg)));
    var l = s.length, words = [], i;
    for (i = 0; i < l; i++) words[i >> 2] |= (s.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    words[l >> 2] |= 0x80 << (24 - (l % 4) * 8);
    var total = (((l + 8) >> 6) + 1) * 16;
    for (i = 0; i < total; i++) words[i] = words[i] | 0;
    words[total - 1] = l * 8;
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    for (var j = 0; j < total; j += 16) {
      var W = words.slice(j, j + 16);
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (var t = 0; t < 64; t++) {
        if (t >= 16) {
          var w15 = W[t - 15], w2 = W[t - 2];
          W[t] = (W[t - 16] + (rotr(w15, 7) ^ rotr(w15, 18) ^ (w15 >>> 3)) + W[t - 7] +
                  (rotr(w2, 17) ^ rotr(w2, 19) ^ (w2 >>> 10))) | 0;
        }
        var t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K256[t] + W[t]) | 0;
        var t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = '';
    for (i = 0; i < 8; i++) out += ('00000000' + (H[i] >>> 0).toString(16)).slice(-8);
    return out;
  }

  /* ---------------- ฟังก์ชันช่วยทั่วไป ---------------- */
  function catById(id) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].id === id) return CATEGORIES[i]; return null; }
  function medalByKey(k) { for (var i = 0; i < MEDALS.length; i++) if (MEDALS[i].key === k || MEDALS[i].code === k) return MEDALS[i]; return null; }
  function medalOf(points) { var m = null; for (var i = 0; i < MEDALS.length; i++) if (points >= MEDALS[i].min) m = MEDALS[i]; return m; }
  function nextMedal(points) { for (var i = 0; i < MEDALS.length; i++) if (points < MEDALS[i].min) return MEDALS[i]; return null; }
  function unlockedMedals(points) { return MEDALS.filter(function (m) { return points >= m.min; }); }
  function hashPassword(id, pw) { return sha256('tldee|' + String(id) + '|' + String(pw)); }
  function sign(secret, s) { return sha256(secret + '|' + s).slice(0, 8).toUpperCase(); }
  function certCode(secret, studentId, medalKey) {
    var m = medalByKey(medalKey);
    return 'TLC-CERT-' + m.code + '-' + studentId + '-' + sign(secret, 'CERT|' + m.code + '|' + studentId);
  }
  function portCode(secret, studentId, ymd) {
    return 'TLC-PORT-' + studentId + '-' + ymd + '-' + sign(secret, 'PORT|' + studentId + '|' + ymd);
  }
  function qrSig(secret, id, ver) { return sha256(secret + '|QR|' + String(id).toLowerCase() + '|' + (ver || '0')).slice(0, 12); }
  function ymdNow() { var d = new Date(); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function newId(prefix) { return prefix + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 46656).toString(36).toUpperCase(); }
  function str(v, max) { v = (v === null || v === undefined) ? '' : String(v).trim(); return max ? v.slice(0, max) : v; }

  // นำการตั้งค่า (แผนกวิชา / เกณฑ์เหรียญ) มาใช้กับตัวแปรส่วนกลาง
  function applySettings(s) {
    s = s || {};
    var d = (s.depts && s.depts.length) ? s.depts : DEFAULT_DEPTS;
    DEPTS.splice.apply(DEPTS, [0, DEPTS.length].concat(d));
    var mins = s.medals || DEFAULT_MINS;
    MEDALS.forEach(function (m) { m.min = Number(mins[m.key]) || DEFAULT_MINS[m.key]; });
  }
  function certSettings(s) {
    var c = {}, src = (s && s.cert) || {};
    CERT_FIELDS.forEach(function (k) { c[k] = src[k] !== undefined ? src[k] : DEFAULT_CERT[k]; });
    return c;
  }

  /* =====================================================================
   * createApi(db, env)
   *  db  : { rows(table), insert(table,obj), update(table,id,patch), version(), bump(), [bulk(table,inserts,patches)] }
   *  env : { secret(), saveImage(dataUrl, name) -> url }
   * ===================================================================== */
  function createApi(db, env) {
    var SETTINGS = {};
    function nowIso() { return new Date().toISOString(); }
    function fail(msg) { var e = new Error(msg); e.isApi = true; throw e; }
    function users() { return db.rows('users'); }
    function deeds() { return db.rows('deeds'); }
    function findUser(id) {
      id = str(id).toLowerCase();
      var list = users();
      for (var i = 0; i < list.length; i++) if (String(list[i].id).toLowerCase() === id) return list[i];
      return null;
    }
    function findDeed(id) { var l = deeds(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
    function isActive(u) { return String(u.active) !== '0' && String(u.active).toLowerCase() !== 'false'; }

    function loadSettings() {
      var s = {};
      (db.rows('settings') || []).forEach(function (r) { try { s[r.id] = JSON.parse(r.value); } catch (e) {} });
      SETTINGS = s;
      applySettings(s);
      return s;
    }
    function setSetting(key, value) {
      var rows = db.rows('settings'), v = JSON.stringify(value), t = nowIso();
      for (var i = 0; i < rows.length; i++) if (rows[i].id === key) { db.update('settings', key, { value: v, updatedAt: t }); SETTINGS[key] = value; return; }
      db.insert('settings', { id: key, value: v, updatedAt: t });
      SETTINGS[key] = value;
    }
    function bulk(table, inserts, patches) {
      if (db.bulk) return db.bulk(table, inserts, patches);
      Object.keys(patches).forEach(function (id) { db.update(table, id, patches[id]); });
      inserts.forEach(function (o) { db.insert(table, o); });
    }

    function makeToken(u) {
      var exp = Date.now() + 7 * 864e5;
      var body = encodeURIComponent(u.id) + '~' + exp;
      return body + '~' + sha256(env.secret() + '|tok|' + body).slice(0, 40);
    }
    function auth(p, roles) {
      var parts = str(p.token).split('~');
      if (parts.length !== 3) fail('กรุณาเข้าสู่ระบบ');
      var body = parts[0] + '~' + parts[1];
      if (sha256(env.secret() + '|tok|' + body).slice(0, 40) !== parts[2]) fail('เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
      if (Number(parts[1]) < Date.now()) fail('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
      var u = findUser(decodeURIComponent(parts[0]));
      if (!u || !isActive(u)) fail('ไม่พบบัญชีผู้ใช้หรือบัญชีถูกระงับ');
      if (roles && roles.indexOf(u.role) < 0) fail('คุณไม่มีสิทธิ์ใช้งานส่วนนี้');
      return u;
    }
    function publicUser(u) {
      return { id: u.id, name: u.name, role: u.role, dept: u.dept, level: u.level, advisorId: u.advisorId, active: isActive(u) };
    }
    function pointsMap() {
      var m = {};
      deeds().forEach(function (d) { if (d.status === 'approved') m[d.studentId] = (m[d.studentId] || 0) + Number(d.points || 0); });
      return m;
    }
    function countMap() {
      var m = {};
      deeds().forEach(function (d) { if (d.status === 'approved') m[d.studentId] = (m[d.studentId] || 0) + 1; });
      return m;
    }
    function teacherNames() {
      var m = {};
      users().forEach(function (u) { if (u.role !== 'student') m[u.id] = u.name; });
      return m;
    }
    function studentView(u, pts, cnt, tnames) {
      var p = pts[u.id] || 0, md = medalOf(p), nx = nextMedal(p);
      return {
        id: u.id, name: u.name, dept: u.dept, level: u.level, advisorId: u.advisorId,
        advisorName: (tnames && tnames[u.advisorId]) || '', points: p, count: (cnt && cnt[u.id]) || 0,
        medal: md ? md.key : '', next: nx ? nx.key : '', need: nx ? nx.min - p : 0
      };
    }
    function students() {
      var pts = pointsMap(), cnt = countMap(), tn = teacherNames();
      return users().filter(function (u) { return u.role === 'student' && isActive(u); })
        .map(function (u) { return studentView(u, pts, cnt, tn); });
    }
    function feedItem(d) {
      return {
        id: d.id, studentId: d.studentId, studentName: d.studentName, dept: d.dept, level: d.level, date: d.date,
        category: d.category, points: Number(d.points || 0), detail: d.detail, impact: d.impact, learned: d.learned,
        imageUrl: d.imageUrl, status: d.status, recordedByName: d.recordedByName, reviewNote: d.reviewNote,
        reviewedBy: d.reviewedBy, createdAt: d.createdAt, updatedAt: d.updatedAt
      };
    }
    function byNewest(a, b) {
      var x = (b.date || '') + (b.updatedAt || ''), y = (a.date || '') + (a.updatedAt || '');
      return x < y ? -1 : x > y ? 1 : 0;
    }
    function aggregate(list) {
      var dept = {}, cat = {};
      DEPTS.forEach(function (n) { dept[n] = { count: 0, points: 0 }; });
      CATEGORIES.forEach(function (c) { cat[c.id] = { count: 0, points: 0 }; });
      list.forEach(function (d) {
        if (!dept[d.dept]) dept[d.dept] = { count: 0, points: 0 };
        dept[d.dept].count++; dept[d.dept].points += Number(d.points || 0);
        if (cat[d.category]) { cat[d.category].count++; cat[d.category].points += Number(d.points || 0); }
      });
      return { dept: dept, cat: cat };
    }
    function certCounts(studs) {
      var c = { bronze: 0, silver: 0, gold: 0, total: 0 };
      studs.forEach(function (s) { unlockedMedals(s.points).forEach(function (m) { c[m.key]++; c.total++; }); });
      return c;
    }
    function validDate(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s); }
    function validId(id) { return /^[0-9A-Za-z\-_.]{2,20}$/.test(id); }
    function resolveAdvisor(v) {
      v = str(v);
      if (!v) return '';
      var t = findUser(v);
      if (t && t.role !== 'student') return t.id;
      var list = users();
      for (var i = 0; i < list.length; i++) if (list[i].role !== 'student' && str(list[i].name) === v) return list[i].id;
      return null;
    }
    function qrItem(u) { return { id: u.id, name: u.name, dept: u.dept, level: u.level, sig: qrSig(env.secret(), u.id, u.qrVer) }; }

    var H = {
      version: function () { return { version: db.version() }; },

      config: function () {
        return {
          teachers: users().filter(function (u) { return u.role === 'teacher' && isActive(u); })
            .map(function (u) { return { id: u.id, name: u.name, dept: u.dept }; }),
          depts: DEPTS.slice(),
          medals: { bronze: medalByKey('bronze').min, silver: medalByKey('silver').min, gold: medalByKey('gold').min },
          cert: certSettings(SETTINGS)
        };
      },

      saveSettings: function (p) {
        auth(p, ['admin']);
        if (p.depts) {
          var seen = {}, list = [];
          p.depts.forEach(function (d) { d = str(d, 80); if (d && !seen[d]) { seen[d] = 1; list.push(d); } });
          if (!list.length) fail('ต้องมีแผนกวิชาอย่างน้อย 1 แผนก');
          setSetting('depts', list);
        }
        if (p.medals) {
          var b = Math.round(Number(p.medals.bronze)), s = Math.round(Number(p.medals.silver)), g = Math.round(Number(p.medals.gold));
          if (!(b > 0 && s > b && g > s)) fail('เกณฑ์แต้มต้องเรียงจากน้อยไปมาก: ทองแดง < เงิน < ทอง');
          setSetting('medals', { bronze: b, silver: s, gold: g });
        }
        if (p.cert) {
          var cur = certSettings(SETTINGS), c = {};
          CERT_FIELDS.forEach(function (k) {
            var v = p.cert[k] !== undefined ? p.cert[k] : cur[k];
            c[k] = k === 'showQr' ? (v === true || v === 'true' || v === '1') : str(v, k === 'signature' ? 300000 : 400);
          });
          if (!TEMPLATES.some(function (t) { return t.id === c.template; })) c.template = 'classic';
          if (c.signature.indexOf('data:image') === 0) c.signature = env.saveImage(c.signature, 'signature_' + Date.now());
          setSetting('cert', c);
        }
        db.bump();
        loadSettings();
        return H.config();
      },

      register: function (p) {
        var id = str(p.id, 20), name = str(p.name, 120), pw = String(p.password || '');
        if (!validId(id)) fail('รหัสนักศึกษาต้องเป็นตัวเลข/อักษรอังกฤษ 2–20 ตัว');
        if (name.length < 3) fail('กรุณากรอกชื่อ-นามสกุล');
        if (pw.length < 4) fail('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        if (DEPTS.indexOf(p.dept) < 0) fail('กรุณาเลือกแผนกวิชา');
        if (LEVELS.indexOf(p.level) < 0) fail('กรุณาเลือกระดับชั้น');
        if (findUser(id)) fail('รหัสนี้ลงทะเบียนแล้ว หากลืมรหัสผ่านโปรดติดต่อครูที่ปรึกษา');
        var u = { id: id, name: name, role: 'student', dept: p.dept, level: p.level, advisorId: str(p.advisorId, 20),
                  passHash: hashPassword(id, pw), active: '1', createdAt: nowIso(), qrVer: '0' };
        db.insert('users', u); db.bump();
        return { token: makeToken(u), user: publicUser(u) };
      },

      login: function (p) {
        var u = findUser(p.id);
        if (!u || u.passHash !== hashPassword(u.id, String(p.password || ''))) fail('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        if (!isActive(u)) fail('บัญชีนี้ถูกระงับการใช้งาน');
        return { token: makeToken(u), user: publicUser(u) };
      },

      qrLogin: function (p) {
        var u = findUser(p.id);
        if (!u || u.role !== 'student' || qrSig(env.secret(), u.id, u.qrVer) !== str(p.sig).toLowerCase()) fail('QR Code ไม่ถูกต้องหรือถูกยกเลิกแล้ว');
        if (!isActive(u)) fail('บัญชีนี้ถูกระงับการใช้งาน');
        return { token: makeToken(u), user: publicUser(u) };
      },

      qrCodes: function (p) {
        var u = auth(p);
        if (u.role === 'student') return [qrItem(u)];
        var ids = p.ids ? p.ids.map(function (x) { return String(x).toLowerCase(); }) : null;
        return users().filter(function (s) {
          return s.role === 'student' && isActive(s) && (!ids || ids.indexOf(String(s.id).toLowerCase()) >= 0);
        }).map(qrItem);
      },

      resetQr: function (p) {
        auth(p, ['admin']);
        var s = findUser(p.id);
        if (!s || s.role !== 'student') fail('ไม่พบนักศึกษา');
        db.update('users', s.id, { qrVer: String(Number(s.qrVer || 0) + 1) });
        db.bump();
        return qrItem(findUser(s.id));
      },

      me: function (p) {
        var u = auth(p);
        var out = publicUser(u);
        if (u.role === 'student') {
          var v = studentView(u, pointsMap(), countMap(), teacherNames());
          out.points = v.points; out.medal = v.medal; out.advisorName = v.advisorName;
        }
        return out;
      },

      changePassword: function (p) {
        var u = auth(p);
        if (u.passHash !== hashPassword(u.id, String(p.oldPassword || ''))) fail('รหัสผ่านเดิมไม่ถูกต้อง');
        if (String(p.newPassword || '').length < 4) fail('รหัสผ่านใหม่ต้องมีอย่างน้อย 4 ตัวอักษร');
        db.update('users', u.id, { passHash: hashPassword(u.id, p.newPassword) });
        return { done: true };
      },

      publicStats: function () {
        var approved = deeds().filter(function (d) { return d.status === 'approved'; });
        var studs = students();
        var participants = {};
        approved.forEach(function (d) { participants[d.studentId] = 1; });
        var total = 0; approved.forEach(function (d) { total += Number(d.points || 0); });
        var top = studs.filter(function (s) { return s.points > 0; })
          .sort(function (a, b) { return b.points - a.points || b.count - a.count; }).slice(0, 5)
          .map(function (s) { return { id: s.id, name: s.name, dept: s.dept, level: s.level, points: s.points, count: s.count, medal: s.medal }; });
        var agg = aggregate(approved);
        // จัดอันดับแผนกวิชา: แต้มรวม / จำนวนครั้ง / ผู้เข้าร่วม / จำนวนเหรียญ
        var rank = {};
        Object.keys(agg.dept).forEach(function (n) { if (n) rank[n] = { name: n, points: agg.dept[n].points, count: agg.dept[n].count, people: 0, members: 0, medals: 0 }; });
        studs.forEach(function (s) {
          var r = rank[s.dept]; if (!r) return;
          r.members++; if (s.count) r.people++; r.medals += unlockedMedals(s.points).length;
        });
        var deptRank = Object.keys(rank).map(function (k) { return rank[k]; })
          .sort(function (a, b) { return b.points - a.points || b.count - a.count || (a.name < b.name ? -1 : 1); });
        return {
          totals: { approved: approved.length, points: total, participants: Object.keys(participants).length, certs: certCounts(studs) },
          top: top,
          feed: approved.slice().sort(byNewest).slice(0, 6).map(function (d) {
            var f = feedItem(d); delete f.reviewNote; delete f.studentId; delete f.impact; delete f.learned; return f;
          }),
          deptRank: deptRank,
          dept: agg.dept, cat: agg.cat
        };
      },

      verify: function (p) {
        var code = str(p.code).toUpperCase().replace(/\s+/g, '');
        var parts = code.split('-');
        if (parts.length < 5 || parts[0] !== 'TLC') return { valid: false, code: code };
        var secret = env.secret();
        if (parts[1] === 'CERT') {
          var stu = findUser(parts.slice(3, -1).join('-')), m = medalByKey(parts[2]);
          if (!stu || !m || certCode(secret, stu.id, m.key).toUpperCase() !== code) return { valid: false, code: code };
          var pts = pointsMap()[stu.id] || 0;
          return { valid: pts >= m.min, revoked: pts < m.min, type: 'cert', code: code, name: stu.name, dept: stu.dept,
                   level: stu.level, medal: m.key, points: pts };
        }
        if (parts[1] === 'PORT') {
          var ymd = parts[parts.length - 2], st2 = findUser(parts.slice(2, -2).join('-'));
          if (!st2 || portCode(secret, st2.id, ymd).toUpperCase() !== code) return { valid: false, code: code };
          var pts2 = pointsMap()[st2.id] || 0, md = medalOf(pts2);
          return { valid: true, type: 'port', code: code, name: st2.name, dept: st2.dept, level: st2.level,
                   points: pts2, medal: md ? md.key : '', count: countMap()[st2.id] || 0,
                   issued: ymd.slice(0, 4) + '-' + ymd.slice(4, 6) + '-' + ymd.slice(6, 8) };
        }
        return { valid: false, code: code };
      },

      myDeeds: function (p) {
        var u = auth(p, ['student']);
        var list = deeds().filter(function (d) { return d.studentId === u.id; }).sort(byNewest).map(feedItem);
        var v = studentView(u, pointsMap(), countMap(), teacherNames());
        return { student: v, deeds: list };
      },

      submitDeed: function (p) {
        var u = auth(p, ['student']);
        var c = catById(p.category);
        if (!c) fail('กรุณาเลือกหมวดหมู่ความดี');
        if (!validDate(p.date)) fail('กรุณาระบุวันที่ทำความดี');
        var detail = str(p.detail, 2000);
        if (detail.length < 5) fail('กรุณาอธิบายรายละเอียดการทำความดี');
        var img = '';
        if (p.image && String(p.image).indexOf('data:image') === 0) img = env.saveImage(p.image, u.id + '_' + Date.now());
        var t = nowIso();
        if (p.editId) {
          var d = findDeed(p.editId);
          if (!d || d.studentId !== u.id) fail('ไม่พบรายการที่ต้องการแก้ไข');
          if (d.status === 'approved') fail('รายการนี้อนุมัติแล้ว ไม่สามารถแก้ไขได้');
          var patch = { date: p.date, category: c.id, points: c.points, detail: detail, impact: str(p.impact, 1000),
                        learned: str(p.learned, 1000), status: 'pending', updatedAt: t };
          if (img) patch.imageUrl = img;
          db.update('deeds', d.id, patch); db.bump();
          return { id: d.id };
        }
        var rec = {
          id: newId('D'), studentId: u.id, studentName: u.name, dept: u.dept, level: u.level, date: p.date,
          category: c.id, points: c.points, detail: detail, impact: str(p.impact, 1000), learned: str(p.learned, 1000),
          imageUrl: img, status: 'pending', recordedById: '', recordedByName: '', reviewNote: '', reviewedBy: '',
          createdAt: t, updatedAt: t
        };
        db.insert('deeds', rec); db.bump();
        return { id: rec.id };
      },

      students: function (p) {
        var u = auth(p, ['teacher', 'admin']);
        var list = students();
        if (p.mine) list = list.filter(function (s) { return s.advisorId === u.id; });
        return list.sort(function (a, b) { return b.points - a.points || String(a.id).localeCompare(String(b.id)); });
      },

      award: function (p) {
        var t = auth(p, ['teacher', 'admin']);
        var s = findUser(p.studentId);
        if (!s || s.role !== 'student') fail('ไม่พบนักศึกษา');
        var c = catById(p.category);
        if (!c) fail('กรุณาเลือกหมวดหมู่ความดี');
        var detail = str(p.detail, 2000);
        if (detail.length < 5) fail('กรุณากรอกพฤติกรรมที่พบเห็น');
        var date = validDate(p.date) ? p.date : new Date().toISOString().slice(0, 10);
        var before = pointsMap()[s.id] || 0;
        var img = '';
        if (p.image && String(p.image).indexOf('data:image') === 0) img = env.saveImage(p.image, s.id + '_' + Date.now());
        var now = nowIso();
        db.insert('deeds', {
          id: newId('D'), studentId: s.id, studentName: s.name, dept: s.dept, level: s.level, date: date,
          category: c.id, points: c.points, detail: detail, impact: str(p.impact, 1000), learned: '', imageUrl: img,
          status: 'approved', recordedById: t.id, recordedByName: t.name, reviewNote: '', reviewedBy: t.name,
          createdAt: now, updatedAt: now
        });
        db.bump();
        var after = before + c.points, mb = medalOf(before), ma = medalOf(after);
        return { before: before, after: after, medal: ma ? ma.key : '', unlocked: (ma && (!mb || mb.key !== ma.key)) ? ma.key : '' };
      },

      allDeeds: function (p) {
        auth(p, ['admin']);
        return deeds().slice().sort(byNewest).map(feedItem);
      },

      review: function (p) {
        var a = auth(p, ['admin']);
        var d = findDeed(p.id);
        if (!d) fail('ไม่พบรายการ');
        if (['approved', 'returned', 'pending'].indexOf(p.status) < 0) fail('สถานะไม่ถูกต้อง');
        if (p.status === 'returned' && str(p.note).length < 2) fail('กรุณาระบุเหตุผลที่ส่งกลับแก้ไข');
        var before = pointsMap()[d.studentId] || 0;
        db.update('deeds', d.id, { status: p.status, reviewNote: str(p.note, 500), reviewedBy: a.name, updatedAt: nowIso() });
        db.bump();
        var after = pointsMap()[d.studentId] || 0, mb = medalOf(before), ma = medalOf(after);
        return { unlocked: (ma && (!mb || mb.key !== ma.key) && after > before) ? ma.key : '', studentName: d.studentName };
      },

      adminStats: function (p) {
        auth(p, ['admin']);
        var all = deeds(), approved = all.filter(function (d) { return d.status === 'approved'; });
        var studs = students(), part = {};
        approved.forEach(function (d) { part[d.studentId] = 1; });
        var agg = aggregate(approved);
        return {
          kpi: {
            total: all.length, approved: approved.length,
            pending: all.filter(function (d) { return d.status === 'pending'; }).length,
            returned: all.filter(function (d) { return d.status === 'returned'; }).length,
            participants: Object.keys(part).length, students: studs.length, certs: certCounts(studs)
          },
          dept: agg.dept, cat: agg.cat
        };
      },

      users: function (p) {
        auth(p, ['admin']);
        return users().map(publicUser);
      },

      saveUser: function (p) {
        auth(p, ['admin']);
        var id = str(p.id, 20);
        if (!validId(id)) fail('รหัสผู้ใช้ต้องเป็นตัวเลข/อักษรอังกฤษ 2–20 ตัว');
        if (!ROLES[p.role]) fail('กรุณาเลือกบทบาท');
        var ex = findUser(id);
        var data = { name: str(p.name, 120), role: p.role, dept: str(p.dept, 80), level: str(p.level, 20),
                     advisorId: str(p.advisorId, 20), active: p.active === false || p.active === '0' ? '0' : '1' };
        if (!data.name) fail('กรุณากรอกชื่อ');
        if (p.password) {
          if (String(p.password).length < 4) fail('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
          data.passHash = hashPassword(ex ? ex.id : id, p.password);
        }
        if (ex) {
          if (p.isNew) fail('รหัสผู้ใช้นี้มีอยู่แล้ว');
          db.update('users', ex.id, data);
        } else {
          if (!data.passHash) fail('กรุณากำหนดรหัสผ่าน');
          data.id = id; data.createdAt = nowIso(); data.qrVer = '0';
          db.insert('users', data);
        }
        db.bump();
        return { done: true };
      },

      // นำเข้ารายชื่อนักเรียน/ครู ทีละหลายคน  rows: [{id,name,dept,level,advisor,password}]
      importUsers: function (p) {
        auth(p, ['admin']);
        var role = p.role === 'teacher' ? 'teacher' : 'student';
        var rows = p.rows || [];
        if (rows.length > 1000) fail('นำเข้าได้ครั้งละไม่เกิน 1,000 รายการ');
        var inserts = [], patches = {}, errors = [], added = 0, updated = 0, newDepts = [], seen = {}, now = nowIso();
        rows.forEach(function (r, i) {
          var id = str(r.id, 20), name = str(r.name, 120), dept = str(r.dept, 80), level = str(r.level, 20);
          var line = (r.line || i + 1);
          if (!validId(id)) return errors.push({ line: line, msg: 'รหัส "' + id + '" ไม่ถูกต้อง' });
          if (seen[id.toLowerCase()]) return errors.push({ line: line, msg: 'รหัส ' + id + ' ซ้ำในไฟล์' });
          seen[id.toLowerCase()] = 1;
          if (name.length < 2) return errors.push({ line: line, msg: 'ไม่มีชื่อ-สกุล' });
          if (level && LEVELS.indexOf(level) < 0) return errors.push({ line: line, msg: 'ระดับชั้น "' + level + '" ไม่ถูกต้อง (ใช้ ปวช.1–ปวส.2)' });
          if (role === 'student' && !level) return errors.push({ line: line, msg: 'ไม่ได้ระบุระดับชั้น' });
          var adv = resolveAdvisor(r.advisor);
          if (adv === null) return errors.push({ line: line, msg: 'ไม่พบครูที่ปรึกษา "' + r.advisor + '"' });
          if (dept && DEPTS.indexOf(dept) < 0 && newDepts.indexOf(dept) < 0) newDepts.push(dept);
          var ex = findUser(id);
          if (ex) {
            if (ex.role !== role) return errors.push({ line: line, msg: 'รหัส ' + id + ' เป็นบัญชีบทบาทอื่นอยู่แล้ว' });
            var patch = { name: name, dept: dept || ex.dept, level: level || ex.level, advisorId: adv || ex.advisorId, active: '1' };
            if (r.password) patch.passHash = hashPassword(ex.id, r.password);
            patches[ex.id] = patch; updated++;
          } else {
            inserts.push({ id: id, name: name, role: role, dept: dept, level: role === 'student' ? level : '', advisorId: role === 'student' ? (adv || '') : '',
              passHash: hashPassword(id, str(r.password) || id), active: '1', createdAt: now, qrVer: '0' });
            added++;
          }
        });
        if (newDepts.length) setSetting('depts', DEPTS.concat(newDepts));
        if (inserts.length || Object.keys(patches).length) bulk('users', inserts, patches);
        db.bump();
        loadSettings();
        return { added: added, updated: updated, errors: errors, newDepts: newDepts };
      },

      studentReport: function (p) {
        var u = auth(p);
        var sid = u.role === 'student' ? u.id : str(p.studentId);
        var s = findUser(sid);
        if (!s || s.role !== 'student') fail('ไม่พบนักศึกษา');
        var v = studentView(s, pointsMap(), countMap(), teacherNames());
        var secret = env.secret(), ymd = ymdNow();
        return {
          student: v,
          deeds: deeds().filter(function (d) { return d.studentId === s.id && d.status === 'approved'; })
            .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; }).map(feedItem),
          certs: unlockedMedals(v.points).map(function (m) { return { medal: m.key, code: certCode(secret, s.id, m.key) }; }),
          portfolioCode: portCode(secret, s.id, ymd),
          portfolio: portfolioOf(s)
        };
      },

      // นักศึกษาออกแบบธีม E-Portfolio ของตนเอง
      savePortfolio: function (p) {
        var u = auth(p, ['student']);
        var t = p.theme || {}, old = portfolioOf(u);
        var out = {
          layout: PF_LAYOUTS.indexOf(t.layout) >= 0 ? t.layout : 'classic',
          color: /^#[0-9a-fA-F]{6}$/.test(str(t.color)) ? str(t.color) : '#8B1E24',
          accent: /^#[0-9a-fA-F]{6}$/.test(str(t.accent)) ? str(t.accent) : '#D99B26',
          font: t.font === 'sarabun' ? 'sarabun' : 'kanit',
          title: str(t.title, 80),
          about: str(t.about, 400),
          goal: str(t.goal, 160),
          showChart: t.showChart !== false, showSign: t.showSign !== false, showPhoto: t.showPhoto !== false,
          photo: old.photo || ''
        };
        if (t.photo === '') out.photo = '';
        else if (t.photo && String(t.photo).indexOf('data:image') === 0) {
          if (String(t.photo).length > 700000) fail('รูปภาพมีขนาดใหญ่เกินไป');
          out.photo = env.saveImage(t.photo, 'profile_' + u.id + '_' + Date.now());
        }
        db.update('users', u.id, { portfolio: JSON.stringify(out) });
        return out;
      }
    };

    var PF_LAYOUTS = ['classic', 'modern', 'timeline', 'minimal'];
    function portfolioOf(u) { try { return JSON.parse(u.portfolio || '{}') || {}; } catch (e) { return {}; } }

    var WRITES = ['register', 'changePassword', 'submitDeed', 'award', 'review', 'saveUser', 'saveSettings', 'importUsers', 'resetQr', 'savePortfolio'];

    function handle(p) {
      p = p || {};
      var fn = H[p.action];
      if (!fn) return { ok: false, error: 'ไม่รู้จักคำสั่ง: ' + p.action };
      try {
        loadSettings();
        var data = fn(p);
        return { ok: true, data: data, version: db.version() };
      } catch (e) {
        return { ok: false, error: e.isApi ? e.message : 'เกิดข้อผิดพลาดของระบบ: ' + (e && e.message) };
      }
    }
    return { handle: handle, isWrite: function (a) { return WRITES.indexOf(a) >= 0; } };
  }

  return {
    COLLEGE: COLLEGE, APP_NAME: APP_NAME, APP_SLOGAN: APP_SLOGAN, CATEGORIES: CATEGORIES, DEPTS: DEPTS,
    LEVELS: LEVELS, MEDALS: MEDALS, ROLES: ROLES, STATUS: STATUS, SCHEMA: SCHEMA, TEMPLATES: TEMPLATES,
    DEFAULT_CERT: DEFAULT_CERT, sha256: sha256, hashPassword: hashPassword, catById: catById, medalByKey: medalByKey,
    medalOf: medalOf, nextMedal: nextMedal, unlockedMedals: unlockedMedals, applySettings: applySettings,
    certSettings: certSettings, createApi: createApi, newId: newId
  };
})();



/* =====================================================================
 * ส่วนเชื่อมต่อ Google Sheets / Google Drive (Google Apps Script)
 * วิธีติดตั้ง: ดู README.md หัวข้อ "เชื่อมต่อ Google Sheets"
 * ===================================================================== */

var SHEET_NAMES = { users: 'Users', deeds: 'Deeds', settings: 'Settings' };

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
  } else if (!sheet_.checked[table]) {
    var colsNow = TLD.SCHEMA[table];                        // เพิ่มคอลัมน์ใหม่อัตโนมัติเมื่อระบบอัปเดต
    if (sh.getLastColumn() < colsNow.length) {
      sh.getRange(1, 1, 1, colsNow.length).setValues([colsNow])
        .setFontWeight('bold').setBackground('#14244B').setFontColor('#FFFFFF');
      sh.getRange('A:Z').setNumberFormat('@');
    }
  }
  sheet_.checked[table] = true;
  return sh;
}
sheet_.checked = {};

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
// เขียนหลายแถวพร้อมกัน (ใช้ตอนนำเข้ารายชื่อ) — เร็วกว่าการเขียนทีละแถวมาก
SheetDB.prototype.bulk = function (table, inserts, patches) {
  var list = this.rows(table), cols = TLD.SCHEMA[table], sh = sheet_(table);
  list.forEach(function (o) { var p = patches[o.id]; if (p) for (var k in p) o[k] = p[k]; });
  var start = list.length ? list[list.length - 1]._row + 1 : 2;
  inserts.forEach(function (o, i) { o._row = start + i; list.push(o); });
  var toRow = function (o) { return cols.map(function (c) { return o[c] === undefined || o[c] === null ? '' : String(o[c]); }); };
  var changed = list.filter(function (o) { return patches[o.id]; });
  changed.forEach(function (o) { sh.getRange(o._row, 1, 1, cols.length).setValues([toRow(o)]); });
  if (inserts.length) sh.getRange(start, 1, inserts.length, cols.length).setNumberFormat('@').setValues(inserts.map(toRow));
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
  var blob = Utilities.newBlob(Utilities.base64Decode(m[2]), m[1], name + (m[1] === 'image/png' ? '.png' : '.jpg'));
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

// ติดตั้งอัตโนมัติเมื่อมีการเรียกใช้ครั้งแรก (กรณีไม่ได้กด Run setup เอง)
function ensureReady_() {
  if (props_().getProperty('READY')) return;
  setup();
}

function run_(payload) {
  ensureReady_();
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
  ensureReady_();
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
  sheet_('users'); sheet_('deeds'); sheet_('settings');
  secret_(); folder_();
  var db = new SheetDB();
  var hasAdmin = db.rows('users').some(function (u) { return u.role === 'admin'; });
  if (!hasAdmin) {
    db.insert('users', { id: 'admin', name: 'ผู้ดูแลระบบ', role: 'admin', dept: '', level: '', advisorId: '',
      passHash: TLD.hashPassword('admin', 'admin1234'), active: '1', createdAt: new Date().toISOString(), qrVer: '0' });
  }
  var first = ss && ss.getSheetByName('Sheet1') || ss && ss.getSheetByName('ชีต1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) ss.deleteSheet(first);
  db.bump();
  props_().setProperty('READY', '1');
  Logger.log('ติดตั้งเรียบร้อย ✔  ผู้ดูแลระบบ: admin / admin1234 (กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ)');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('คนดีศรีท่าหลวง')
    .addItem('ติดตั้ง/ตรวจสอบระบบ (setup)', 'setup')
    .addToUi();
}
