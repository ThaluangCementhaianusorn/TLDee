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

  // หมวดหมู่ความดีและค่าคะแนน (5 ด้าน)
  var CATEGORIES = [
    { id: 'fame',       name: 'สร้างชื่อเสียงและคุณประโยชน์แก่สถาบัน', short: 'สร้างชื่อเสียง', points: 3, icon: '🏆', color: '#D99B26' },
    { id: 'honest',     name: 'ความซื่อสัตย์สุจริต (เก็บของได้ส่งคืน)', short: 'ซื่อสัตย์สุจริต', points: 2, icon: '🤝', color: '#14244B' },
    { id: 'volunteer',  name: 'จิตอาสาพัฒนาวิทยาลัยและชุมชน',        short: 'จิตอาสา',        points: 2, icon: '🌱', color: '#2E7D4F' },
    { id: 'grateful',   name: 'ความกตัญญูและช่วยเหลือผู้อื่น',          short: 'กตัญญู/ช่วยเหลือ', points: 1, icon: '💗', color: '#8B1E24' },
    { id: 'discipline', name: 'รักษาระเบียบวินัยและสิ่งแวดล้อม',        short: 'วินัย/สิ่งแวดล้อม', points: 1, icon: '♻️', color: '#3A7CA5' }
  ];

  // แผนกวิชา 9 แผนก (แก้ไขชื่อได้ตามจริงของวิทยาลัย)
  var DEPTS = [
    'ช่างยนต์', 'ช่างกลโรงงาน', 'ช่างเชื่อมโลหะ', 'ช่างไฟฟ้ากำลัง', 'ช่างอิเล็กทรอนิกส์',
    'ช่างก่อสร้าง', 'เมคคาทรอนิกส์และหุ่นยนต์', 'การบัญชี', 'เทคโนโลยีธุรกิจดิจิทัล'
  ];

  var LEVELS = ['ปวช.1', 'ปวช.2', 'ปวช.3', 'ปวส.1', 'ปวส.2'];

  var MEDALS = [
    { key: 'bronze', code: 'B', name: 'เหรียญทองแดง', full: 'ระดับเหรียญทองแดง', min: 5,  title: 'ผู้มีความประพฤติดี มีจิตอาสา' },
    { key: 'silver', code: 'S', name: 'เหรียญเงิน',   full: 'ระดับเหรียญเงิน',   min: 10, title: 'แบบอย่างที่ดีด้านคุณธรรมจริยธรรม' },
    { key: 'gold',   code: 'G', name: 'เหรียญทอง',    full: 'ระดับเหรียญทอง (คนดีศรีท่าหลวง)', min: 15, title: 'สุดยอดเยาวชนต้นแบบ ทำดีมีเกียรติ' }
  ];

  var ROLES = { student: 'นักเรียน/นักศึกษา', teacher: 'ครูที่ปรึกษา/ครูผู้สอน', admin: 'ผู้ดูแลระบบ/ผู้บริหาร' };
  var STATUS = { pending: 'รอตรวจสอบ', approved: 'อนุมัติแล้ว', returned: 'ส่งกลับแก้ไข' };

  // โครงสร้างตาราง (ชื่อคอลัมน์ใน Google Sheets)
  var SCHEMA = {
    users: ['id', 'name', 'role', 'dept', 'level', 'advisorId', 'passHash', 'active', 'createdAt'],
    deeds: ['id', 'studentId', 'studentName', 'dept', 'level', 'date', 'category', 'points', 'detail', 'impact',
            'learned', 'imageUrl', 'status', 'recordedById', 'recordedByName', 'reviewNote', 'reviewedBy',
            'createdAt', 'updatedAt']
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
  function ymdNow() { var d = new Date(); return d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2); }
  function newId(prefix) { return prefix + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 46656).toString(36).toUpperCase(); }
  function str(v, max) { v = (v === null || v === undefined) ? '' : String(v).trim(); return max ? v.slice(0, max) : v; }

  /* =====================================================================
   * createApi(db, env)
   *  db  : { rows(table), insert(table,obj), update(table,id,patch), version(), bump() }
   *  env : { secret(), saveImage(dataUrl, name) -> url }
   * ===================================================================== */
  function createApi(db, env) {
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

    var H = {
      version: function () { return { version: db.version() }; },

      config: function () {
        return {
          teachers: users().filter(function (u) { return u.role === 'teacher' && isActive(u); })
            .map(function (u) { return { id: u.id, name: u.name, dept: u.dept }; })
        };
      },

      register: function (p) {
        var id = str(p.id, 20), name = str(p.name, 120), pw = String(p.password || '');
        if (!/^[0-9A-Za-z\-_.]{3,20}$/.test(id)) fail('รหัสนักศึกษาต้องเป็นตัวเลข/อักษรอังกฤษ 3–20 ตัว');
        if (name.length < 3) fail('กรุณากรอกชื่อ-นามสกุล');
        if (pw.length < 4) fail('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร');
        if (DEPTS.indexOf(p.dept) < 0) fail('กรุณาเลือกแผนกวิชา');
        if (LEVELS.indexOf(p.level) < 0) fail('กรุณาเลือกระดับชั้น');
        if (findUser(id)) fail('รหัสนี้ลงทะเบียนแล้ว หากลืมรหัสผ่านโปรดติดต่อครูที่ปรึกษา');
        var u = { id: id, name: name, role: 'student', dept: p.dept, level: p.level, advisorId: str(p.advisorId, 20),
                  passHash: hashPassword(id, pw), active: '1', createdAt: nowIso() };
        db.insert('users', u); db.bump();
        return { token: makeToken(u), user: publicUser(u) };
      },

      login: function (p) {
        var u = findUser(p.id);
        if (!u || u.passHash !== hashPassword(u.id, String(p.password || ''))) fail('รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        if (!isActive(u)) fail('บัญชีนี้ถูกระงับการใช้งาน');
        return { token: makeToken(u), user: publicUser(u) };
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
        return {
          totals: { approved: approved.length, points: total, participants: Object.keys(participants).length, certs: certCounts(studs) },
          top: top,
          feed: approved.slice().sort(byNewest).slice(0, 60).map(function (d) {
            var f = feedItem(d); delete f.reviewNote; delete f.studentId; return f;
          }),
          dept: agg.dept, cat: agg.cat
        };
      },

      verify: function (p) {
        var code = str(p.code).toUpperCase().replace(/\s+/g, '');
        var parts = code.split('-');
        if (parts.length < 5 || parts[0] !== 'TLC') return { valid: false, code: code };
        var secret = env.secret();
        var all = users();
        function findCaseless(id) { id = id.toLowerCase(); for (var i = 0; i < all.length; i++) if (String(all[i].id).toLowerCase() === id) return all[i]; return null; }
        if (parts[1] === 'CERT') {
          var mcode = parts[2], sid = parts.slice(3, -1).join('-');
          var stu = findCaseless(sid), m = medalByKey(mcode);
          if (!stu || !m || certCode(secret, stu.id, m.key).toUpperCase() !== code) return { valid: false, code: code };
          var pts = pointsMap()[stu.id] || 0;
          return { valid: pts >= m.min, revoked: pts < m.min, type: 'cert', code: code, name: stu.name, dept: stu.dept,
                   level: stu.level, medal: m.key, points: pts };
        }
        if (parts[1] === 'PORT') {
          var ymd = parts[parts.length - 2], sid2 = parts.slice(2, -2).join('-');
          var st2 = findCaseless(sid2);
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
        if (!/^[0-9A-Za-z\-_.]{3,20}$/.test(id)) fail('รหัสผู้ใช้ต้องเป็นตัวเลข/อักษรอังกฤษ 3–20 ตัว');
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
          data.id = id; data.createdAt = nowIso();
          db.insert('users', data);
        }
        db.bump();
        return { done: true };
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
          portfolioCode: portCode(secret, s.id, ymd)
        };
      }
    };

    var WRITES = ['register', 'changePassword', 'submitDeed', 'award', 'review', 'saveUser'];

    function handle(p) {
      p = p || {};
      var fn = H[p.action];
      if (!fn) return { ok: false, error: 'ไม่รู้จักคำสั่ง: ' + p.action };
      try {
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
    LEVELS: LEVELS, MEDALS: MEDALS, ROLES: ROLES, STATUS: STATUS, SCHEMA: SCHEMA,
    sha256: sha256, hashPassword: hashPassword, catById: catById, medalByKey: medalByKey, medalOf: medalOf,
    nextMedal: nextMedal, unlockedMedals: unlockedMedals, createApi: createApi, newId: newId
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = TLD;
