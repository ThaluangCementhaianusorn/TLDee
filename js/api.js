/* ชั้นติดต่อข้อมูล: Google Apps Script (ออนไลน์) หรือ LocalStorage (โหมดสาธิต) */
(function () {
  'use strict';
  var KEY = 'tldee_demo_db_v1';

  function LocalDB() {
    var raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    this.data = raw || { users: [], deeds: [], version: '0', secret: TLD.sha256(Math.random() + '|' + Date.now()) };
    if (!raw) this.seed();
  }
  LocalDB.prototype.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(this.data)); }
    catch (e) { throw Object.assign(new Error('พื้นที่เก็บข้อมูลในเครื่องเต็ม (โหมดสาธิต) — ลองใช้รูปที่เล็กลง'), { isApi: true }); }
  };
  LocalDB.prototype.rows = function (t) { return this.data[t]; };
  LocalDB.prototype.insert = function (t, o) { this.data[t].push(o); this.save(); };
  LocalDB.prototype.update = function (t, id, patch) {
    var l = this.data[t];
    for (var i = 0; i < l.length; i++) if (String(l[i].id) === String(id)) { Object.assign(l[i], patch); break; }
    this.save();
  };
  LocalDB.prototype.version = function () { return this.data.version; };
  LocalDB.prototype.bump = function () { this.data.version = String(Date.now()); this.save(); };
  LocalDB.prototype.seed = function () {
    var now = new Date().toISOString(), self = this;
    function user(id, name, role, dept, level, adv, pw) {
      self.data.users.push({ id: id, name: name, role: role, dept: dept || '', level: level || '', advisorId: adv || '',
        passHash: TLD.hashPassword(id, pw), active: '1', createdAt: now });
    }
    user('admin', 'ผู้ดูแลระบบ', 'admin', '', '', '', 'admin1234');
    user('T001', 'ครูสมศรี ใจดี', 'teacher', 'ช่างยนต์', '', '', '1234');
    user('T002', 'ครูประเสริฐ มีธรรม', 'teacher', 'การบัญชี', '', '', '1234');
    var S = [
      ['66001', 'นายธนากร ศรีสุข', 'ช่างยนต์', 'ปวช.3', 'T001'], ['66002', 'นางสาวพิมพ์ชนก ใจงาม', 'การบัญชี', 'ปวช.2', 'T002'],
      ['66003', 'นายภานุวัฒน์ แก้วกล้า', 'ช่างไฟฟ้ากำลัง', 'ปวส.1', 'T001'], ['66004', 'นางสาวกนกวรรณ ทองดี', 'เทคโนโลยีธุรกิจดิจิทัล', 'ปวช.1', 'T002'],
      ['66005', 'นายวีรพล สายบุญ', 'ช่างเชื่อมโลหะ', 'ปวส.2', 'T001'], ['66006', 'นางสาวอรอุมา บุญมา', 'ช่างอิเล็กทรอนิกส์', 'ปวช.2', 'T002']
    ];
    S.forEach(function (s) { user(s[0], s[1], 'student', s[2], s[3], s[4], '1234'); });
    var acts = [
      ['66001', 'volunteer', 'ร่วมกิจกรรมทาสีอาคารเรียนและทำความสะอาดโรงอาหาร'], ['66001', 'fame', 'ได้รับรางวัลเหรียญทองการแข่งขันทักษะงานยานยนต์ระดับภาค'],
      ['66001', 'honest', 'เก็บกระเป๋าสตางค์ได้บริเวณลานจอดรถ นำส่งคืนเจ้าของ'], ['66001', 'fame', 'ตัวแทนวิทยาลัยแข่งขันทักษะระดับชาติ'],
      ['66001', 'volunteer', 'ซ่อมรถจักรยานยนต์ให้ชาวบ้านฟรีในโครงการ Fix it Center'], ['66001', 'grateful', 'ช่วยครูขนอุปกรณ์การเรียน'],
      ['66002', 'honest', 'เก็บโทรศัพท์มือถือได้ส่งคืนงานกิจกรรม'], ['66002', 'volunteer', 'จิตอาสาสอนการบัญชีครัวเรือนให้ชุมชน'],
      ['66002', 'fame', 'รางวัลชนะเลิศการประกวดบัญชีระดับจังหวัด'], ['66002', 'grateful', 'ดูแลผู้สูงอายุในวันผู้สูงอายุ'],
      ['66003', 'volunteer', 'ตรวจเช็คระบบไฟฟ้าวัดในชุมชน'], ['66003', 'discipline', 'ร่วมคัดแยกขยะในวิทยาลัย'],
      ['66003', 'honest', 'เก็บเงินได้ 500 บาท ส่งคืนฝ่ายกิจการ'], ['66005', 'volunteer', 'ปรับปรุงซ่อมแซมโต๊ะเก้าอี้ในโรงเรียนประถม'],
      ['66004', 'discipline', 'แต่งกายถูกระเบียบตลอดภาคเรียน'], ['66006', 'grateful', 'ช่วยเพื่อนทบทวนบทเรียน']
    ];
    var users = {};
    this.data.users.forEach(function (u) { users[u.id] = u; });
    acts.forEach(function (a, i) {
      var s = users[a[0]], c = TLD.catById(a[1]);
      var d = new Date(Date.now() - (acts.length - i) * 86400000 * 2).toISOString();
      self.data.deeds.push({ id: 'DEMO' + i, studentId: s.id, studentName: s.name, dept: s.dept, level: s.level,
        date: d.slice(0, 10), category: c.id, points: c.points, detail: a[2], impact: '', learned: '', imageUrl: '',
        status: 'approved', recordedById: i % 3 === 0 ? s.advisorId : '', recordedByName: i % 3 === 0 ? users[s.advisorId].name : '',
        reviewNote: '', reviewedBy: 'ผู้ดูแลระบบ', createdAt: d, updatedAt: d });
    });
    this.data.deeds.push({ id: 'DEMOP', studentId: '66004', studentName: users['66004'].name, dept: users['66004'].dept,
      level: users['66004'].level, date: now.slice(0, 10), category: 'volunteer', points: 2,
      detail: 'ช่วยจัดสถานที่งานวันไหว้ครู', impact: 'งานเสร็จทันเวลา', learned: 'การทำงานเป็นทีม', imageUrl: '',
      status: 'pending', recordedById: '', recordedByName: '', reviewNote: '', reviewedBy: '', createdAt: now, updatedAt: now });
    this.data.version = String(Date.now());
    this.save();
  };

  var remote = !!(window.CONFIG && CONFIG.API_URL);
  var local = null;
  // โหมดสาธิต: ซิงก์ข้อมูลระหว่างแท็บแบบเรียลไทม์
  window.addEventListener('storage', function (e) { if (e.key === KEY) local = null; });
  function localApi() {
    if (!local) {
      var db = new LocalDB();
      local = TLD.createApi(db, { secret: function () { return db.data.secret; }, saveImage: function (d) { return d; } });
    }
    return local;
  }

  window.API = {
    remote: remote,
    token: '',
    call: function (action, payload) {
      var body = Object.assign({}, payload || {}, { action: action, token: API.token });
      if (!remote) {
        return new Promise(function (resolve, reject) {
          setTimeout(function () {
            var r = localApi().handle(body);
            if (r.ok) resolve(r.data); else reject(new Error(r.error));
          }, 120);
        });
      }
      return fetch(CONFIG.API_URL, {
        method: 'POST', redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(body)
      }).then(function (res) {
        if (!res.ok) throw new Error('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ (' + res.status + ')');
        return res.json();
      }, function () {
        throw new Error('ไม่สามารถเชื่อมต่ออินเทอร์เน็ต/เซิร์ฟเวอร์ได้');
      }).then(function (r) {
        if (!r.ok) throw new Error(r.error || 'เกิดข้อผิดพลาด');
        return r.data;
      });
    },
    resetDemo: function () { try { localStorage.removeItem(KEY); } catch (e) {} local = null; }
  };
})();
