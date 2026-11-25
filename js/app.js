/* =====================================================================
 * app.js — Single-Page Application "คนดีศรีท่าหลวง (ทำดีมีเกียรติ)"
 * ===================================================================== */
(function () {
  'use strict';

  /* ---------------- Utilities ---------------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var ic = UI.ic, esc = UI.esc;
  function num(n) { return Number(n || 0).toLocaleString('th-TH'); }
  function thDate(ymd, long) {
    if (!ymd) return '-';
    var d = new Date(String(ymd).length <= 10 ? ymd + 'T00:00:00' : ymd);
    if (isNaN(d)) return esc(ymd);
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: long ? 'long' : 'short', year: 'numeric' });
  }
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function opts(list, sel, ph) {
    return (ph !== undefined ? '<option value="">' + esc(ph) + '</option>' : '') +
      list.map(function (o) {
        var v = typeof o === 'object' ? o.v : o, t = typeof o === 'object' ? o.t : o;
        return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(t) + '</option>';
      }).join('');
  }
  function cat(id) { return TLD.catById(id) || { id: id, name: id || '-', short: id || '-', icon: 'star', points: 0, color: '#777' }; }
  function medalInfo(k) { return TLD.medalByKey(k); }
  function medalIcon(k, cls) { return UI.medalSvg(medalInfo(k) ? medalInfo(k).key : '', cls); }
  function medalTag(k) {
    var m = medalInfo(k);
    return '<span class="medal-tag ' + (m ? m.key : 'none') + '">' + (m ? ic('award') + esc(m.name) : 'ยังไม่มีเหรียญ') + '</span>';
  }
  function statusTag(s) {
    var i = { pending: 'clock', approved: 'check', returned: 'undo' }[s] || 'info';
    return '<span class="st ' + esc(s) + '">' + ic(i) + esc(TLD.STATUS[s] || s) + '</span>';
  }
  function catIcon(id, cls) { var c = cat(id); return '<span class="cicon ' + (cls || '') + '" style="--c:' + c.color + '">' + ic(c.icon) + '</span>'; }
  function catTag(id) { var c = cat(id); return '<span class="tag" style="--c:' + c.color + '">' + ic(c.icon) + esc(c.short) + '</span>'; }
  function imgOrIcon(d) {
    return d.imageUrl ? '<img src="' + esc(d.imageUrl) + '" alt="รูปหลักฐาน" loading="lazy" referrerpolicy="no-referrer">' : catIcon(d.category, 'xl');
  }
  function skel(n) { var s = ''; for (var i = 0; i < (n || 3); i++) s += '<div class="skel"></div>'; return '<div class="grid g3">' + s + '</div>'; }
  function empty(msg, icon) { return '<div class="empty"><span class="big">' + ic(icon || 'inbox') + '</span>' + esc(msg) + '</div>'; }
  function loadScript(src) {
    return new Promise(function (res, rej) {
      if ($('script[src="' + src + '"]')) return res();
      var s = document.createElement('script'); s.src = src; s.onload = res;
      s.onerror = function () { rej(new Error('โหลดไลบรารีไม่สำเร็จ ตรวจสอบอินเทอร์เน็ต')); };
      document.head.appendChild(s);
    });
  }
  function siteBase() { return location.origin + location.pathname; }
  function qrLoginUrl(q) { return siteBase() + '#/q/' + encodeURIComponent(q.id) + '/' + q.sig; }

  function toast(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast ' + (type || '');
    t.innerHTML = ic(type === 'ok' ? 'check' : type === 'bad' ? 'alert' : 'info') + '<span></span>';
    t.lastChild.textContent = msg;
    $('#toast').appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 3400);
    setTimeout(function () { t.remove(); }, 3800);
  }

  function modal(title, body, onMount, onClose, wide) {
    var bg = document.createElement('div');
    bg.className = 'modal-bg';
    bg.innerHTML = '<div class="modal' + (wide ? ' wide' : '') + '" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="modal-h"><h3>' + esc(title) + '</h3><button class="modal-x" aria-label="ปิด">' + ic('x') + '</button></div>' +
      '<div class="modal-b">' + body + '</div></div>';
    var closed = false;
    function close() { if (closed) return; closed = true; bg.remove(); document.removeEventListener('keydown', onKey); if (onClose) onClose(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    bg.addEventListener('click', function (e) { if (e.target === bg) close(); });
    $('.modal-x', bg).onclick = close;
    document.addEventListener('keydown', onKey);
    $('#modalRoot').appendChild(bg);
    $('.modal-x', bg).focus();
    if (onMount) onMount($('.modal-b', bg), close);
    return close;
  }
  function showImage(url) { modal('รูปหลักฐาน', '<img class="modal-img" src="' + esc(url) + '" alt="รูปหลักฐาน" referrerpolicy="no-referrer">'); }

  function busy(btn, on) {
    if (!btn) return;
    if (on) { btn.dataset.html = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span> กำลังดำเนินการ...'; }
    else { btn.disabled = false; if (btn.dataset.html) btn.innerHTML = btn.dataset.html; }
  }

  function confetti() {
    var colors = ['#D99B26', '#8B1E24', '#14244B', '#F2C66B', '#2E7D4F'];
    for (var i = 0; i < 70; i++) {
      var s = document.createElement('i');
      s.className = 'confetti';
      s.style.left = Math.random() * 100 + 'vw';
      s.style.background = colors[i % colors.length];
      s.style.animationDuration = (2.2 + Math.random() * 2) + 's';
      s.style.animationDelay = Math.random() * .7 + 's';
      s.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      document.body.appendChild(s);
      setTimeout(function (el) { el.remove(); }.bind(null, s), 5200);
    }
  }
  function celebrate(name, medalKey) {
    var m = medalInfo(medalKey);
    if (!m) return;
    confetti();
    modal('ยินดีด้วย! ปลดล็อกเหรียญรางวัลใหม่',
      '<div class="celebrate"><div class="seal-pop">' + UI.sealSvg(m.key) + '</div><h2>' + esc(name) + '</h2>' +
      '<p style="font-size:1.25rem">ได้รับเกียรติบัตร <b>' + esc(m.full) + '</b><br><span class="muted">' + esc(m.title) + '</span></p></div>');
  }

  // ย่อขนาดรูปก่อนอัปโหลด (keepPng = รักษาพื้นหลังโปร่งใส เช่น ลายเซ็น)
  function compressImage(file, maxSize, keepPng) {
    return new Promise(function (resolve, reject) {
      if (!file || !/^image\//.test(file.type)) return reject(new Error('กรุณาเลือกไฟล์รูปภาพ'));
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('อ่านไฟล์ไม่สำเร็จ')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('ไฟล์รูปไม่รองรับ')); };
        img.onload = function () {
          var s = Math.min(1, maxSize / Math.max(img.width, img.height));
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
          var ctx = c.getContext('2d');
          if (!keepPng) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); }
          ctx.drawImage(img, 0, 0, c.width, c.height);
          resolve(keepPng ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', API.remote ? 0.82 : 0.6));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function bindUpload(root, state) {
    var inp = $('input[type=file]', root), prev = $('.prev', root);
    inp.addEventListener('change', function () {
      var f = inp.files[0];
      if (!f) return;
      prev.innerHTML = '<span class="muted">กำลังเตรียมรูป...</span>';
      compressImage(f, API.remote ? 1280 : 800).then(function (d) {
        state.image = d;
        prev.innerHTML = '<img src="' + d + '" alt="ตัวอย่างรูปหลักฐาน">';
      }, function (e) { state.image = ''; prev.innerHTML = ''; toast(e.message, 'bad'); });
    });
  }
  function uploadField(label) {
    return '<div class="field"><span class="label">' + esc(label) + '</span><label class="upload">' +
      '<input type="file" accept="image/*"><span class="up-ic">' + ic('camera') + '</span><b>แตะเพื่อถ่ายรูปหรือเลือกรูปภาพ</b>' +
      '<span class="muted">รองรับ JPG, PNG — ระบบจะย่อขนาดให้อัตโนมัติ</span><div class="prev"></div></label></div>';
  }
  function catPicker(name, sel) {
    return '<div class="cat-pick" role="radiogroup">' + TLD.CATEGORIES.map(function (c) {
      var id = name + '_' + c.id;
      return '<div class="cat-opt"><input type="radio" name="' + name + '" id="' + id + '" value="' + c.id + '"' + (sel === c.id ? ' checked' : '') + ' required>' +
        '<label for="' + id + '">' + catIcon(c.id) + '<span class="cn">' + esc(c.name) + '</span><span class="cp">+' + c.points + '</span></label></div>';
    }).join('') + '</div>';
  }
  function pwField(name, label, auto) {
    return '<div class="field"><label for="f_' + name + '">' + esc(label) + '</label><div class="pw-wrap">' +
      '<input class="input" id="f_' + name + '" name="' + name + '" type="password" autocomplete="' + (auto || 'current-password') + '" required>' +
      '<button type="button" class="pw-toggle" aria-label="แสดงรหัสผ่าน">' + ic('eye') + '</button></div></div>';
  }
  function bindPw(root) {
    $$('.pw-toggle', root).forEach(function (b) {
      b.onclick = function () { var i = b.previousElementSibling; i.type = i.type === 'password' ? 'text' : 'password'; };
    });
  }
  function formData(form) {
    var o = {};
    new FormData(form).forEach(function (v, k) { o[k] = typeof v === 'string' ? v.trim() : v; });
    return o;
  }
  function statCard(icon, cls, n, label, sub) {
    return '<div class="card stat"><span class="ico ' + cls + '">' + ic(icon) + '</span><div><div class="num">' + n + '</div><div class="lbl">' + esc(label) + '</div>' +
      (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div></div>';
  }
  function certSub(c) {
    return '<span class="medal-tag gold">ทอง ' + c.gold + '</span><span class="medal-tag silver">เงิน ' + c.silver + '</span><span class="medal-tag bronze">ทองแดง ' + c.bronze + '</span>';
  }

  /* ---------------- QR Scanner (กล้อง) ---------------- */
  function scanQR(title, onText) {
    var stream = null, timer = null, stopped = false;
    function stop() {
      stopped = true; clearTimeout(timer);
      if (stream) stream.getTracks().forEach(function (t) { t.stop(); });
    }
    var close = modal(title, '<div class="scan-box"><video playsinline muted></video><div class="scan-frame"></div></div>' +
      '<p class="center muted" id="scanMsg" style="margin-top:12px">กำลังเปิดกล้อง... หันกล้องไปที่ QR Code</p>', function (body, cl) {
      var video = $('video', body), msg = $('#scanMsg', body);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { msg.textContent = 'อุปกรณ์นี้ไม่รองรับการใช้กล้องผ่านเว็บ — ใช้แอปกล้องสแกน QR แทนได้'; return; }
      var detectorP = ('BarcodeDetector' in window)
        ? Promise.resolve(new window.BarcodeDetector({ formats: ['qr_code'] }))
        : loadScript('https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js').then(function () { return null; });
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (s) {
        if (stopped) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
        stream = s; video.srcObject = s; video.play();
        msg.textContent = 'หันกล้องไปที่ QR Code ให้อยู่ในกรอบ';
        return detectorP.then(function (det) {
          var canvas = document.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true });
          function found(text) { stop(); cl(); onText(text); }
          function tick() {
            if (stopped) return;
            if (video.readyState >= 2) {
              if (det) {
                det.detect(video).then(function (r) { if (r && r[0]) found(r[0].rawValue); else timer = setTimeout(tick, 220); },
                  function () { timer = setTimeout(tick, 400); });
                return;
              }
              canvas.width = video.videoWidth; canvas.height = video.videoHeight;
              ctx.drawImage(video, 0, 0);
              var r = window.jsQR && jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
              if (r && r.data) return found(r.data);
            }
            timer = setTimeout(tick, 220);
          }
          tick();
        });
      }).catch(function (e) {
        msg.textContent = /Permission|NotAllowed/i.test(e && e.name) ? 'ไม่ได้รับอนุญาตให้ใช้กล้อง กรุณาอนุญาตในเบราว์เซอร์' : 'เปิดกล้องไม่สำเร็จ: ' + (e.message || e);
      });
    }, stop);
    return close;
  }
  function parseQrLogin(text) {
    var m = String(text).match(/#\/q\/([^\/\s?#]+)\/([0-9a-fA-F]{12})/);
    return m ? { id: decodeURIComponent(m[1]), sig: m[2].toLowerCase() } : null;
  }

  /* ---------------- Session & config ---------------- */
  var S = { user: null, version: null, view: null, cfg: { teachers: [], cert: TLD.certSettings({}) } };
  function loadSession() {
    try {
      var s = JSON.parse(localStorage.getItem('tldee_session') || 'null');
      if (s && s.token) { API.token = s.token; S.user = s.user; }
    } catch (e) {}
  }
  function saveSession(token, user) {
    API.token = token; S.user = user;
    try { localStorage.setItem('tldee_session', JSON.stringify({ token: token, user: user })); } catch (e) {}
  }
  function logout(silent) {
    API.token = ''; S.user = null;
    try { localStorage.removeItem('tldee_session'); } catch (e) {}
    if (!silent) toast('ออกจากระบบแล้ว');
    location.hash = '#/';
  }
  function applyCfg(c) {
    S.cfg = c;
    TLD.applySettings({ depts: c.depts, medals: c.medals });
  }
  function loadConfig() { return API.call('config').then(applyCfg).catch(function () {}); }
  function homeOf(role) { return role === 'admin' ? '#/admin' : role === 'teacher' ? '#/teacher' : '#/student'; }
  function handleErr(e) {
    var m = (e && e.message) || 'เกิดข้อผิดพลาด';
    toast(m, 'bad');
    if (/เข้าสู่ระบบ|เซสชัน|ระงับ/.test(m) && S.user) logout(true);
  }

  /* ---------------- Navigation ---------------- */
  function renderNav(name) {
    var u = S.user, links = [['', 'home', 'หน้าแรก'], ['verify', 'shield', 'ตรวจสอบเกียรติบัตร']];
    if (u && u.role === 'student') links.push(['student', 'pen', 'พื้นที่ของฉัน']);
    if (u && (u.role === 'teacher' || u.role === 'admin')) links.push(['teacher', 'award', 'มอบแต้มความดี']);
    if (u && u.role === 'admin') links.push(['admin', 'chart', 'ผู้ดูแลระบบ']);
    var html = links.map(function (l) {
      return '<a href="#/' + l[0] + '" class="' + (name === l[0] ? 'active' : '') + '">' + ic(l[1]) + l[2] + '</a>';
    }).join('');
    if (u) {
      html += '<a href="#/account" class="' + (name === 'account' ? 'active' : '') + '">' + ic('user') + esc(u.name.split(' ')[0]) + '</a>' +
        '<button type="button" id="logoutBtn">' + ic('logout') + 'ออกจากระบบ</button>';
    } else {
      html += '<a href="#/login" class="nav-cta">' + ic('login') + 'เข้าสู่ระบบ</a>';
    }
    $('#nav').innerHTML = html;
    var lb = $('#logoutBtn');
    if (lb) lb.onclick = function () { logout(); };
  }
  function closeMenu() { $('#nav').classList.remove('open'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }
  $('#menuBtn').onclick = function () {
    var o = $('#nav').classList.toggle('open');
    this.setAttribute('aria-expanded', o ? 'true' : 'false');
  };

  /* ===================================================================
   * VIEW: หน้าแรก / ทำเนียบคนดีศรีท่าหลวง
   * =================================================================== */
  var Home = {
    dept: '',
    render: function (el) {
      var u = S.user;
      el.innerHTML =
        '<section class="hero">' +
        '<img class="hero-logo" src="assets/logo-512.png" alt="ตราวิทยาลัย">' +
        '<div><h1>คนดีศรีท่าหลวง</h1><div class="slogan">“ทำดีมีเกียรติ”</div>' +
        '<p>ระบบจัดเก็บผลงานผู้เรียนด้านคุณธรรม จริยธรรม และจิตอาสา วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์ — ร่วมบันทึกและยกย่องความดี สะสมแต้ม รับเกียรติบัตร</p>' +
        '<div class="row">' +
        (u ? '<a class="btn btn-gold" href="' + homeOf(u.role) + '">' + ic(u.role === 'student' ? 'pen' : 'award') + (u.role === 'student' ? 'รายงานการทำความดี' : 'เข้าสู่หน้าทำงาน') + '</a>'
           : '<a class="btn btn-gold" href="#/login">' + ic('login') + 'เข้าสู่ระบบ</a><button class="btn btn-light" id="hScan">' + ic('scan') + 'สแกน QR เข้าสู่ระบบ</button>') +
        '<a class="btn btn-light" href="#/verify">' + ic('shield') + 'ตรวจสอบเกียรติบัตร</a></div></div></section>' +

        '<section class="section"><div id="hStats">' + skel(4) + '</div></section>' +

        '<section class="section split">' +
        '<div class="card"><div class="section-head"><h2>ยอดนักทำความดี Top 5</h2></div><div id="hTop">' + skel(1) + '</div></div>' +
        '<div class="card"><div class="section-head"><h2>เกณฑ์คะแนนและเกียรติบัตร</h2></div>' +
        '<div class="grid g2"><div><h3>หมวดหมู่ความดี</h3><ul class="criteria">' +
        TLD.CATEGORIES.map(function (c) { return '<li>' + catIcon(c.id) + '<span style="flex:1">' + esc(c.name) + '</span><span class="pts">+' + c.points + '</span></li>'; }).join('') +
        '</ul></div><div><h3>ระดับเกียรติบัตร (ปวช.1 – ปวส.2)</h3><ul class="criteria">' +
        TLD.MEDALS.map(function (m) { return '<li>' + medalIcon(m.key) + '<span><b>' + esc(m.name) + ' · ' + m.min + ' แต้ม</b><span class="muted">' + esc(m.title) + '</span></span></li>'; }).join('') +
        '</ul></div></div></div></section>' +

        '<section class="section"><div class="section-head"><h2>เรื่องราวความดีล่าสุด</h2></div>' +
        '<div class="chips" id="hDept"></div><div id="hFeed" style="margin-top:16px">' + skel(3) + '</div></section>';
      var hs = $('#hScan');
      if (hs) hs.onclick = function () { Login.scan(); };
      this.chips();
      this.refresh();
    },
    chips: function () {
      var self = this;
      $('#hDept').innerHTML = [''].concat(TLD.DEPTS).map(function (d) {
        return '<button class="chip' + (self.dept === d ? ' on' : '') + '" data-d="' + esc(d) + '">' + (d ? esc(d) : 'ทุกแผนกวิชา') + '</button>';
      }).join('');
      $$('#hDept .chip').forEach(function (b) {
        b.onclick = function () { self.dept = b.dataset.d; self.chips(); self.feed(); };
      });
    },
    refresh: function () {
      var self = this;
      return API.call('publicStats').then(function (d) { self.data = d; self.paint(); }).catch(handleErr);
    },
    paint: function () {
      var d = this.data, t = d.totals;
      if (!$('#hStats')) return;
      $('#hStats').innerHTML = '<div class="grid g4">' +
        statCard('check', 'ico-ok', num(t.approved), 'ความดีที่รับรองแล้ว (ครั้ง)') +
        statCard('star', 'ico-gold', num(t.points), 'แต้มความดีสะสมรวม') +
        statCard('users', 'ico-navy', num(t.participants), 'เยาวชนจิตอาสาที่เข้าร่วม (คน)') +
        statCard('award', 'ico-maroon', num(t.certs.total), 'เกียรติบัตรที่ออกทั้งหมด', certSub(t.certs)) + '</div>';
      $('#hTop').innerHTML = d.top.length ? '<ol class="leader">' + d.top.map(function (s, i) {
        return '<li><span class="rank">' + (i + 1) + '</span><span class="who"><b>' + esc(s.name) + '</b><small>' + esc(s.dept) + ' · ' + esc(s.level) + '</small></span>' +
          medalIcon(s.medal) + '<span class="pts">' + s.points + ' <small>แต้ม</small></span></li>';
      }).join('') + '</ol>' : empty('ยังไม่มีข้อมูลการจัดอันดับ', 'trophy');
      this.feed();
    },
    feed: function () {
      if (!this.data || !$('#hFeed')) return;
      var dept = this.dept;
      var list = this.data.feed.filter(function (f) { return !dept || f.dept === dept; });
      $('#hFeed').innerHTML = list.length ? '<div class="feed">' + list.map(deedCard).join('') + '</div>' : empty('ยังไม่มีเรื่องราวความดีในแผนกนี้', 'sprout');
      $$('#hFeed [data-img]').forEach(function (b) { b.onclick = function () { showImage(b.dataset.img); }; });
    }
  };
  function deedCard(d) {
    return '<article class="deed">' +
      (d.imageUrl ? '<button class="pic" data-img="' + esc(d.imageUrl) + '" aria-label="ดูรูปขนาดใหญ่">' + imgOrIcon(d) + '</button>' : '<div class="pic nopic" style="--c:' + cat(d.category).color + '">' + imgOrIcon(d) + '</div>') +
      '<div class="body"><div class="row" style="gap:8px">' + catTag(d.category) + '<span class="tag pts-tag">+' + d.points + ' แต้ม</span></div>' +
      '<div class="name">' + esc(d.studentName) + '</div><div class="meta">' + esc(d.dept) + ' · ' + esc(d.level) + ' · ' + thDate(d.date) + '</div>' +
      '<div class="txt">' + esc(d.detail) + '</div>' +
      (d.recordedByName ? '<div class="meta">' + ic('award') + ' บันทึกโดย ' + esc(d.recordedByName) + '</div>' : '') + '</div></article>';
  }

  /* ===================================================================
   * VIEW: ตรวจสอบเกียรติบัตร
   * =================================================================== */
  var Verify = {
    render: function (el, args) {
      var code = decodeURIComponent(args[0] || '');
      el.innerHTML = '<div class="auth-wrap" style="max-width:760px"><div class="card">' +
        '<div class="auth-head"><img src="assets/logo-192.png" alt=""><h2>ตรวจสอบความถูกต้องของเอกสาร</h2>' +
        '<p class="muted">กรอกรหัสเกียรติบัตร (TLC-CERT-...) หรือรหัสระเบียนประวัติ (TLC-PORT-...) หรือสแกน QR Code บนเอกสาร</p></div>' +
        '<form id="vForm" class="row"><input class="input" name="code" style="flex:1;min-width:240px" placeholder="เช่น TLC-CERT-G-66001-XXXXXXXX" value="' + esc(code) + '" required aria-label="รหัสเอกสาร">' +
        '<button class="btn btn-primary">' + ic('search') + 'ตรวจสอบ</button><button type="button" class="btn btn-ghost" id="vScan">' + ic('scan') + 'สแกน</button></form><div id="vRes"></div></div></div>';
      $('#vForm').onsubmit = function (e) {
        e.preventDefault();
        var c = this.code.value.trim();
        if (c) location.hash = '#/verify/' + encodeURIComponent(c);
      };
      $('#vScan').onclick = function () {
        scanQR('สแกน QR Code บนเอกสาร', function (t) {
          var m = String(t).match(/#\/verify\/([^\s?#]+)/);
          var c = m ? decodeURIComponent(m[1]) : String(t).trim();
          location.hash = '#/verify/' + encodeURIComponent(c);
        });
      };
      if (code) this.check(code);
    },
    check: function (code) {
      $('#vRes').innerHTML = '<div class="skel" style="margin-top:18px"></div>';
      API.call('verify', { code: code }).then(function (r) {
        var box = $('#vRes');
        if (!box) return;
        if (!r.valid) {
          box.innerHTML = '<div class="verify-res bad"><span class="ic-big">' + ic('alert') + '</span><div><h3 style="color:var(--bad)">' +
            (r.revoked ? 'เอกสารนี้ไม่มีผลแล้ว' : 'ไม่พบเอกสารในระบบ') + '</h3><p>รหัส <b>' + esc(r.code) + '</b> ' +
            (r.revoked ? 'ไม่ตรงกับคะแนนสะสมปัจจุบันของผู้เรียน' : 'ไม่ได้ออกจากระบบคนดีศรีท่าหลวง หรือรหัสไม่ถูกต้อง') + '</p></div></div>';
          return;
        }
        var m = medalInfo(r.medal);
        box.innerHTML = '<div class="verify-res ok"><span class="ic-big">' + ic('shield') + '</span><div style="flex:1"><h3 style="color:var(--ok)">เอกสารถูกต้อง ออกจากระบบจริง</h3>' +
          '<dl class="kv"><dt>ประเภท</dt><dd>' + (r.type === 'cert' ? 'เกียรติบัตร' : 'ระเบียนประวัติการทำความดี (E-Portfolio)') + '</dd>' +
          '<dt>ชื่อ-สกุล</dt><dd>' + esc(r.name) + '</dd><dt>แผนกวิชา</dt><dd>' + esc(r.dept) + '</dd><dt>ระดับชั้น</dt><dd>' + esc(r.level) + '</dd>' +
          (r.type === 'cert' ? '<dt>ระดับเกียรติบัตร</dt><dd>' + esc(m ? m.full : '-') + '</dd>' : '<dt>เหรียญปัจจุบัน</dt><dd>' + (m ? esc(m.name) : 'ยังไม่มี') + '</dd><dt>จำนวนความดี</dt><dd>' + r.count + ' รายการ</dd><dt>วันที่ออกเอกสาร</dt><dd>' + thDate(r.issued, true) + '</dd>') +
          '<dt>แต้มสะสมปัจจุบัน</dt><dd>' + r.points + ' แต้ม</dd><dt>รหัสเอกสาร</dt><dd style="word-break:break-all">' + esc(r.code) + '</dd></dl></div>' +
          (m ? '<div class="verify-seal">' + UI.sealSvg(m.key) + '</div>' : '') + '</div>';
      }).catch(handleErr);
    }
  };

  /* ===================================================================
   * VIEW: เข้าสู่ระบบ / QR / สมัครสมาชิก
   * =================================================================== */
  var Login = {
    render: function (el) {
      if (S.user) { location.hash = homeOf(S.user.role); return; }
      el.innerHTML = '<div class="auth-wrap"><div class="card"><div class="auth-head"><img src="assets/logo-192.png" alt="">' +
        '<h2>เข้าสู่ระบบ</h2><p class="muted">นักเรียน/นักศึกษาสแกน QR Code บนบัตร หรือใช้รหัสผ่าน</p></div>' +
        '<button class="btn btn-gold btn-block btn-lg" id="lScan">' + ic('scan') + 'สแกน QR Code เข้าสู่ระบบ</button>' +
        '<div class="divider"><span>หรือ</span></div>' +
        (!API.remote ? '<div class="demo-hint">' + ic('flask') + ' <b>บัญชีทดลอง (โหมดสาธิต)</b><br>' +
          '<button data-u="66001" data-p="1234">นักศึกษา 66001</button><button data-u="T001" data-p="1234">ครู T001</button>' +
          '<button data-u="admin" data-p="admin1234">ผู้ดูแล admin</button></div>' : '') +
        '<form id="lForm"><div class="field"><label for="f_id">รหัสนักศึกษา / รหัสผู้ใช้</label>' +
        '<input class="input" id="f_id" name="id" autocomplete="username" required></div>' +
        pwField('password', 'รหัสผ่าน') +
        '<button class="btn btn-primary btn-block">' + ic('login') + 'เข้าสู่ระบบ</button></form>' +
        '<p class="center" style="margin-top:18px">ยังไม่มีบัญชี? <a href="#/register"><b>สมัครสมาชิก (นักเรียน/นักศึกษา)</b></a></p></div></div>';
      bindPw(el);
      $('#lScan').onclick = function () { Login.scan(); };
      $$('.demo-hint button', el).forEach(function (b) {
        b.onclick = function () { $('#f_id').value = b.dataset.u; $('#f_password').value = b.dataset.p; };
      });
      $('#lForm').onsubmit = function (e) {
        e.preventDefault();
        var btn = $('button.btn', this), f = formData(this);
        busy(btn, true);
        API.call('login', f).then(function (r) {
          saveSession(r.token, r.user);
          toast('ยินดีต้อนรับ ' + r.user.name, 'ok');
          location.hash = homeOf(r.user.role);
        }).catch(function (e2) { busy(btn, false); handleErr(e2); });
      };
    },
    scan: function () {
      scanQR('สแกน QR Code เข้าสู่ระบบ', function (t) {
        var q = parseQrLogin(t);
        if (!q) return toast('QR Code นี้ไม่ใช่บัตรเข้าสู่ระบบของนักศึกษา', 'bad');
        location.hash = '#/q/' + encodeURIComponent(q.id) + '/' + q.sig;
      });
    }
  };

  var QrLogin = {
    render: function (el, args) {
      el.innerHTML = '<div class="auth-wrap"><div class="card center"><img src="assets/logo-192.png" alt="" width="110"><h2>กำลังเข้าสู่ระบบด้วย QR Code</h2><div class="skel" style="height:60px"></div></div></div>';
      API.call('qrLogin', { id: decodeURIComponent(args[0] || ''), sig: args[1] || '' }).then(function (r) {
        saveSession(r.token, r.user);
        toast('ยินดีต้อนรับ ' + r.user.name, 'ok');
        location.replace(siteBase() + '#/student');
      }).catch(function (e) {
        el.innerHTML = '<div class="auth-wrap"><div class="card center"><span class="ic-big bad">' + ic('alert') + '</span><h2>เข้าสู่ระบบไม่สำเร็จ</h2><p>' + esc(e.message) +
          '</p><p class="muted">หาก QR Code ถูกยกเลิก โปรดติดต่อครูที่ปรึกษาเพื่อรับบัตรใหม่</p><a class="btn btn-primary" href="#/login">' + ic('login') + 'ไปหน้าเข้าสู่ระบบ</a></div></div>';
      });
    }
  };

  var Register = {
    render: function (el) {
      if (S.user) { location.hash = homeOf(S.user.role); return; }
      el.innerHTML = '<div class="auth-wrap" style="max-width:720px"><div class="card"><div class="auth-head"><img src="assets/logo-192.png" alt="">' +
        '<h2>สมัครสมาชิก</h2><p class="muted">สำหรับนักเรียน/นักศึกษา วิทยาลัยเทคนิคท่าหลวงซิเมนต์ไทยอนุสรณ์</p></div>' +
        '<form id="rForm"><div class="grid g2">' +
        '<div class="field"><label for="r_id">รหัสนักศึกษา</label><input class="input" id="r_id" name="id" inputmode="numeric" autocomplete="username" required></div>' +
        '<div class="field"><label for="r_name">ชื่อ-นามสกุล</label><input class="input" id="r_name" name="name" placeholder="เช่น นายสมชาย ใจดี" required></div>' +
        '<div class="field"><label for="r_dept">แผนกวิชา</label><select class="input" id="r_dept" name="dept" required>' + opts(TLD.DEPTS, '', '— เลือกแผนกวิชา —') + '</select></div>' +
        '<div class="field"><label for="r_level">ระดับชั้น</label><select class="input" id="r_level" name="level" required>' + opts(TLD.LEVELS, '', '— เลือกระดับชั้น —') + '</select></div>' +
        '</div><div class="field"><label for="r_adv">ครูที่ปรึกษา</label><select class="input" id="r_adv" name="advisorId">' +
        opts((S.cfg.teachers || []).map(function (t) { return { v: t.id, t: t.name + (t.dept ? ' (' + t.dept + ')' : '') }; }), '', '— ไม่ระบุ —') + '</select></div>' +
        '<div class="grid g2">' + pwField('password', 'ตั้งรหัสผ่าน (อย่างน้อย 4 ตัว)', 'new-password') + pwField('password2', 'ยืนยันรหัสผ่าน', 'new-password') + '</div>' +
        '<button class="btn btn-primary btn-block">' + ic('user') + 'สมัครสมาชิก</button></form>' +
        '<p class="center" style="margin-top:18px">มีบัญชีแล้ว? <a href="#/login"><b>เข้าสู่ระบบ</b></a></p></div></div>';
      bindPw(el);
      $('#rForm').onsubmit = function (e) {
        e.preventDefault();
        var f = formData(this), btn = $('button.btn', this);
        if (f.password !== f.password2) return toast('รหัสผ่านทั้งสองช่องไม่ตรงกัน', 'bad');
        busy(btn, true);
        API.call('register', f).then(function (r) {
          saveSession(r.token, r.user);
          toast('สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!', 'ok');
          location.hash = '#/student';
        }).catch(function (e2) { busy(btn, false); handleErr(e2); });
      };
    }
  };

  /* ===================================================================
   * VIEW: นักเรียน/นักศึกษา
   * =================================================================== */
  var Student = {
    roles: ['student'],
    edit: null,
    render: function (el) {
      var u = S.user, self = this;
      this.edit = null; this.form = { image: '' };
      el.innerHTML = '<div id="sProg" class="card progress-card"><div class="skel" style="opacity:.2"></div></div>' +
        '<div class="section"><div class="tabs" role="tablist">' +
        '<button class="on" data-t="form">' + ic('pen') + 'รายงานความดี</button><button data-t="hist">' + ic('list') + 'ประวัติของฉัน <span class="badge" id="sCnt">0</span></button>' +
        '<button data-t="cert">' + ic('award') + 'เกียรติบัตร / E-Portfolio</button><button data-t="qr">' + ic('qr') + 'บัตร QR ของฉัน</button></div>' +
        '<div data-p="form" class="card"><div id="sEditBar"></div><h2>แบบฟอร์มรายงานการทำความดี</h2>' +
        '<form id="sForm"><div class="grid g4 ro">' +
        roField('รหัสนักศึกษา', u.id) + roField('ชื่อ-นามสกุล', u.name) + roField('แผนกวิชา', u.dept) + roField('ระดับชั้น', u.level) + '</div>' +
        '<div class="field" style="max-width:320px"><label for="s_date">วันที่ทำความดี</label><input class="input" type="date" id="s_date" name="date" max="' + today() + '" value="' + today() + '" required></div>' +
        '<div class="field"><span class="label">หมวดหมู่ความดี</span>' + catPicker('category') + '</div>' +
        '<div class="field"><label for="s_detail">รายละเอียดการทำความดี</label><textarea class="input" id="s_detail" name="detail" placeholder="ทำอะไร ที่ไหน กับใคร" required></textarea></div>' +
        '<div class="grid g2"><div class="field"><label for="s_impact">ผลกระทบเชิงบวกต่อสังคม</label><textarea class="input" id="s_impact" name="impact"></textarea></div>' +
        '<div class="field"><label for="s_learned">สิ่งที่ได้เรียนรู้</label><textarea class="input" id="s_learned" name="learned"></textarea></div></div>' +
        '<div id="sUp">' + uploadField('แนบรูปภาพหลักฐาน') + '</div>' +
        '<button class="btn btn-primary btn-block" id="sSubmit">' + ic('upload') + 'ส่งรายงานการทำความดี</button></form></div>' +
        '<div data-p="hist" class="card hide"><h2>ประวัติการรายงานและสถานะ</h2><div id="sHist">' + skel(1) + '</div></div>' +
        '<div data-p="cert" class="card hide"><h2>เกียรติบัตรและระเบียนประวัติความดี</h2><div id="sCert"></div></div>' +
        '<div data-p="qr" class="card hide"><h2>บัตร QR Code ประจำตัว</h2><div id="sQr">' + skel(1) + '</div></div></div>';
      $$('.tabs button', el).forEach(function (b) { b.onclick = function () { self.tab(b.dataset.t); }; });
      bindUpload($('#sUp'), this.form);
      $('#sForm').onsubmit = function (e) { e.preventDefault(); self.submit(this); };
      this.refresh();
    },
    tab: function (t) {
      $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
      $$('[data-p]').forEach(function (p) { p.classList.toggle('hide', p.dataset.p !== t); });
      if (t === 'qr') this.qr();
    },
    qr: function () {
      API.call('qrCodes').then(function (l) {
        var q = l[0], box = $('#sQr');
        if (!box) return;
        box.innerHTML = '<div class="qr-me"><div class="qrbox big" id="myQr"></div><div><h3>' + esc(q.name) + '</h3><p class="muted">รหัส ' + esc(q.id) + ' · ' + esc(q.dept) + ' · ' + esc(q.level) + '</p>' +
          '<p>ใช้ QR Code นี้สแกนเพื่อเข้าสู่ระบบได้ทันทีโดยไม่ต้องพิมพ์รหัสผ่าน</p><p class="note-warn">' + ic('alert') + ' เก็บรักษาบัตรไว้เป็นความลับ ไม่ควรแชร์ให้ผู้อื่น</p>' +
          '<button class="btn btn-primary" id="myQrPrint">' + ic('printer') + 'พิมพ์บัตร QR</button></div></div>';
        new QRCode($('#myQr'), { text: qrLoginUrl(q), width: 240, height: 240, correctLevel: QRCode.CorrectLevel.M });
        $('#myQrPrint').onclick = function () { Printer.qrCards(l); };
      }).catch(handleErr);
    },
    submit: function (form) {
      var self = this, f = formData(form), btn = $('#sSubmit');
      if (!f.category) return toast('กรุณาเลือกหมวดหมู่ความดี', 'bad');
      f.image = this.form.image;
      if (this.edit) f.editId = this.edit;
      busy(btn, true);
      API.call('submitDeed', f).then(function () {
        busy(btn, false);
        toast(self.edit ? 'ส่งรายงานที่แก้ไขแล้ว รอการตรวจสอบ' : 'ส่งรายงานเรียบร้อย รอผู้ดูแลตรวจสอบ', 'ok');
        form.reset(); $('#s_date').value = today();
        self.form.image = ''; $('#sUp .prev').innerHTML = '';
        self.setEdit(null);
        self.refresh().then(function () { self.tab('hist'); });
      }).catch(function (e) { busy(btn, false); handleErr(e); });
    },
    setEdit: function (d) {
      this.edit = d ? d.id : null;
      $('#sEditBar').innerHTML = d ? '<div class="item warnbox"><div class="main">' + ic('pen') + ' <b>กำลังแก้ไขรายการที่ถูกส่งกลับ</b>' +
        (d.reviewNote ? '<div class="muted">หมายเหตุจากผู้ตรวจ: ' + esc(d.reviewNote) + '</div>' : '') + '</div><button class="btn btn-ghost btn-sm" id="sCancelEdit">ยกเลิก</button></div>' : '';
      $('#sSubmit').innerHTML = ic('upload') + (d ? 'ส่งรายงานที่แก้ไขแล้ว' : 'ส่งรายงานการทำความดี');
      var self = this;
      if (d) {
        var form = $('#sForm');
        form.date.value = d.date; form.detail.value = d.detail || ''; form.impact.value = d.impact || ''; form.learned.value = d.learned || '';
        var r = $('#category_' + d.category); if (r) r.checked = true;
        $('#sCancelEdit').onclick = function () { form.reset(); $('#s_date').value = today(); self.setEdit(null); };
        this.tab('form');
        window.scrollTo({ top: $('#sForm').getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
      }
    },
    refresh: function () {
      var self = this;
      return API.call('myDeeds').then(function (r) { self.data = r; self.paint(); }).catch(handleErr);
    },
    paint: function () {
      var r = this.data, s = r.student, self = this;
      if (!$('#sProg')) return;
      $('#sProg').innerHTML = progressHtml(s, 'สวัสดี ' + s.name);
      $('#sCnt').textContent = r.deeds.length;
      $('#sHist').innerHTML = r.deeds.length ? '<div class="list">' + r.deeds.map(function (d) {
        return '<div class="item">' + (d.imageUrl ? '<button class="thumb" data-img="' + esc(d.imageUrl) + '" aria-label="ดูรูป">' + imgOrIcon(d) + '</button>' : '<div class="thumb">' + catIcon(d.category, 'lg') + '</div>') +
          '<div class="main"><div class="row" style="gap:8px">' + statusTag(d.status) + catTag(d.category) + '<span class="tag pts-tag">+' + d.points + '</span></div>' +
          '<div style="margin-top:6px">' + esc(d.detail) + '</div><div class="muted meta-row">' + ic('calendar') + thDate(d.date) +
          (d.recordedByName ? ' · ' + ic('award') + 'ครูผู้บันทึก: <b>' + esc(d.recordedByName) + '</b>' : '') + '</div>' +
          (d.status === 'returned' ? '<div class="note">' + ic('undo') + ' ส่งกลับแก้ไข: ' + esc(d.reviewNote || '-') + '</div>' : '') + '</div>' +
          (d.status !== 'approved' && !d.recordedByName ? '<button class="btn btn-ghost btn-sm" data-edit="' + esc(d.id) + '">' + ic('pen') + 'แก้ไข</button>' : '') + '</div>';
      }).join('') + '</div>' : empty('ยังไม่มีรายการ เริ่มรายงานการทำความดีครั้งแรกได้เลย!', 'sprout');
      $$('#sHist [data-img]').forEach(function (b) { b.onclick = function () { showImage(b.dataset.img); }; });
      $$('#sHist [data-edit]').forEach(function (b) {
        b.onclick = function () { self.setEdit(r.deeds.filter(function (d) { return d.id === b.dataset.edit; })[0]); };
      });
      $('#sCert').innerHTML = certButtons(s);
      bindCertButtons($('#sCert'), s.id);
    }
  };
  function roField(l, v) { return '<div class="field"><span class="label">' + esc(l) + '</span><input class="input" value="' + esc(v) + '" readonly aria-label="' + esc(l) + '"></div>'; }
  function progressHtml(s, title) {
    var max = TLD.MEDALS[TLD.MEDALS.length - 1].min, pct = Math.min(100, s.points / max * 100);
    var m = medalInfo(s.medal), nx = medalInfo(s.next);
    return '<div class="pc-top">' + medalIcon(s.medal, 'lg') + '<div style="flex:1;min-width:220px"><h2 style="margin:0">' + esc(title) + '</h2>' +
      '<div style="opacity:.9">' + esc(s.dept) + ' · ' + esc(s.level) + (s.advisorName ? ' · ครูที่ปรึกษา ' + esc(s.advisorName) : '') + '</div>' +
      '<div style="margin-top:6px">' + medalTag(s.medal) + '</div></div>' +
      '<div class="center"><div class="pc-pts">' + s.points + '</div><div>แต้มสะสม</div></div></div>' +
      '<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + s.points + '"><div class="fill" style="width:' + pct + '%"></div>' +
      TLD.MEDALS.map(function (md) {
        return '<span class="mk' + (s.points >= md.min ? '' : ' lock') + '" style="left:' + (md.min / max * 100) + '%">' + UI.medalSvg(md.key) + '<small>' + md.min + ' แต้ม</small></span>';
      }).join('') + '</div>' +
      '<div class="pc-msg">' + ic(nx ? 'target' : 'sparkles') + (nx ? ' อีก <b>' + s.need + ' แต้ม</b> จะปลดล็อก <b>' + esc(nx.full) + '</b>' : ' ยอดเยี่ยม! ได้รับเหรียญทอง “คนดีศรีท่าหลวง” แล้ว') + '</div>';
  }
  function certButtons(s) {
    return '<div class="grid g3">' + TLD.MEDALS.map(function (m) {
      var ok = s.points >= m.min;
      return '<div class="card center medal-card' + (ok ? '' : ' locked') + '"><div class="seal-sm">' + UI.sealSvg(m.key) + '</div><h3>' + esc(m.full) + '</h3>' +
        '<p class="muted">' + m.min + ' แต้ม · ' + esc(m.title) + '</p>' +
        (ok ? '<button class="btn btn-gold btn-block" data-cert="' + m.key + '">' + ic('printer') + 'พิมพ์เกียรติบัตร</button>' : '<button class="btn btn-ghost btn-block" disabled>' + ic('lock') + 'อีก ' + (m.min - s.points) + ' แต้ม</button>') + '</div>';
    }).join('') + '</div><div class="card flat" style="margin-top:20px"><div class="row"><span class="ico ico-navy">' + ic('book') + '</span>' +
      '<div style="flex:1;min-width:220px"><h3 style="margin:0">ระเบียนประวัติการทำความดีและจิตอาสา (Good Deeds E-Portfolio)</h3><p class="muted" style="margin:0">รวมทุกรายการที่อนุมัติแล้ว พร้อม QR Code ตรวจสอบ ใช้ประกอบการสมัครเรียนต่อ/สมัครงาน</p></div>' +
      '<button class="btn btn-primary" data-port="1"' + (s.count ? '' : ' disabled') + '>' + ic('printer') + 'พิมพ์ E-Portfolio (PDF)</button></div></div>';
  }
  function bindCertButtons(root, sid) {
    $$('[data-cert]', root).forEach(function (b) { b.onclick = function () { Printer.cert(sid, b.dataset.cert, b); }; });
    $$('[data-port]', root).forEach(function (b) { b.onclick = function () { Printer.portfolio(sid, b); }; });
  }

  /* ===================================================================
   * VIEW: ครู
   * =================================================================== */
  var Teacher = {
    roles: ['teacher', 'admin'],
    render: function (el) {
      var self = this;
      this.sel = null; this.mine = S.user.role === 'teacher'; this.q = ''; this.form = { image: '' };
      el.innerHTML = '<div class="section-head"><h2>บันทึกและมอบแต้มความดี</h2><span class="muted">แต้มที่ครูบันทึกจะได้รับการอนุมัติทันที</span></div>' +
        '<div class="split"><div class="card"><h3>1) เลือกนักเรียน/นักศึกษา</h3>' +
        '<div class="row" style="margin-bottom:10px;flex-wrap:nowrap"><input class="input" id="tQ" placeholder="ค้นหาชื่อหรือรหัสนักศึกษา" aria-label="ค้นหานักศึกษา" style="flex:1">' +
        '<button class="btn btn-gold" id="tScan" title="สแกน QR บัตรนักศึกษา">' + ic('scan') + '<span class="hide-sm">สแกน</span></button></div>' +
        '<label class="check" style="margin-bottom:10px"><input type="checkbox" id="tMine"' + (this.mine ? ' checked' : '') + '> แสดงเฉพาะนักศึกษาในที่ปรึกษาของฉัน</label>' +
        '<div class="stu-list" id="tList">' + skel(1) + '</div></div>' +
        '<div class="card"><h3>2) บันทึกพฤติกรรมความดี</h3><div id="tStatus"><div class="empty"><span class="big">' + ic('arrowLeft') + '</span>เลือกนักศึกษาจากรายชื่อ หรือสแกน QR บัตรนักศึกษา</div></div>' +
        '<form id="tForm" class="hide"><div class="field" style="max-width:300px"><label for="t_date">วันที่พบเห็น</label><input class="input" type="date" id="t_date" name="date" max="' + today() + '" value="' + today() + '"></div>' +
        '<div class="field"><span class="label">หมวดหมู่ความดี</span>' + catPicker('tcat') + '</div>' +
        '<div class="field"><label for="t_detail">พฤติกรรมที่พบเห็น</label><textarea class="input" id="t_detail" name="detail" required placeholder="อธิบายพฤติกรรมความดีที่พบเห็น"></textarea></div>' +
        '<div id="tUp">' + uploadField('รูปภาพประกอบ (ถ้ามี)') + '</div>' +
        '<div id="tPreview"></div><button class="btn btn-primary btn-block" id="tSubmit">' + ic('check') + 'บันทึกและมอบแต้มทันที</button></form></div></div>' +
        '<section class="section card"><div class="section-head"><h2>สรุปเหรียญรางวัลนักศึกษา</h2><button class="btn btn-ghost btn-sm" id="tCards">' + ic('qr') + 'พิมพ์บัตร QR (ตามตัวกรอง)</button></div>' +
        '<div class="filters"><input class="input" id="sumQ" placeholder="ค้นหาชื่อ/รหัส" aria-label="ค้นหา">' +
        '<select class="input" id="sumDept" aria-label="แผนกวิชา">' + opts(TLD.DEPTS, '', 'ทุกแผนกวิชา') + '</select>' +
        '<select class="input" id="sumLevel" aria-label="ระดับชั้น">' + opts(TLD.LEVELS, '', 'ทุกระดับชั้น') + '</select>' +
        '<select class="input" id="sumMedal" aria-label="เหรียญ">' + opts(TLD.MEDALS.map(function (m) { return { v: m.key, t: m.name }; }).concat([{ v: 'none', t: 'ยังไม่มีเหรียญ' }]), '', 'ทุกระดับเหรียญ') + '</select></div>' +
        '<div id="tSum">' + skel(1) + '</div></section>';
      $('#tQ').oninput = function () { self.q = this.value.trim().toLowerCase(); self.list(); };
      $('#tMine').onchange = function () { self.mine = this.checked; self.list(); self.summary(); };
      $('#tScan').onclick = function () {
        scanQR('สแกน QR บัตรนักศึกษา', function (t) {
          var q = parseQrLogin(t), id = q ? q.id : String(t).trim();
          var s = (self.students || []).filter(function (x) { return String(x.id).toLowerCase() === id.toLowerCase(); })[0];
          if (!s) return toast('ไม่พบนักศึกษารหัส ' + id, 'bad');
          self.sel = s.id; self.mine = false; $('#tMine').checked = false; self.list(); self.status();
          $('#tStatus').scrollIntoView({ behavior: 'smooth', block: 'start' });
          toast('เลือก ' + s.name + ' แล้ว', 'ok');
        });
      };
      ['sumQ', 'sumDept', 'sumLevel', 'sumMedal'].forEach(function (id) { $('#' + id).oninput = function () { self.summary(); }; });
      $$('input[name=tcat]').forEach(function (r) { r.onchange = function () { self.preview(); }; });
      $('#tCards').onclick = function () {
        var ids = self.sumList().map(function (s) { return s.id; });
        if (!ids.length) return toast('ไม่มีนักศึกษาตามตัวกรอง', 'bad');
        var b = this; busy(b, true);
        API.call('qrCodes', { ids: ids }).then(function (l) { busy(b, false); Printer.qrCards(l); }).catch(function (e) { busy(b, false); handleErr(e); });
      };
      bindUpload($('#tUp'), this.form);
      $('#tForm').onsubmit = function (e) { e.preventDefault(); self.submit(this); };
      this.refresh();
    },
    refresh: function () {
      var self = this;
      return API.call('students').then(function (list) { self.students = list; self.list(); self.status(); self.summary(); }).catch(handleErr);
    },
    filtered: function () {
      var q = this.q, mine = this.mine, me = S.user.id;
      return (this.students || []).filter(function (s) {
        if (mine && s.advisorId !== me) return false;
        return !q || String(s.id).toLowerCase().indexOf(q) >= 0 || String(s.name).toLowerCase().indexOf(q) >= 0;
      });
    },
    list: function () {
      var self = this, list = this.filtered();
      if (!$('#tList')) return;
      $('#tList').innerHTML = list.length ? list.slice(0, 200).map(function (s) {
        return '<button class="stu' + (self.sel === s.id ? ' on' : '') + '" data-id="' + esc(s.id) + '">' + medalIcon(s.medal) +
          '<span class="who"><b>' + esc(s.name) + '</b><small>' + esc(s.id) + ' · ' + esc(s.dept) + ' · ' + esc(s.level) + '</small></span>' +
          '<span class="pts">' + s.points + '</span></button>';
      }).join('') : empty(this.mine ? 'ไม่พบนักศึกษาในที่ปรึกษา (ลองยกเลิกตัวกรอง)' : 'ไม่พบนักศึกษา', 'search');
      $$('#tList .stu').forEach(function (b) {
        b.onclick = function () {
          self.sel = b.dataset.id; self.list(); self.status();
          if (window.innerWidth < 960) $('#tStatus').scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      });
    },
    current: function () { var id = this.sel; return (this.students || []).filter(function (s) { return s.id === id; })[0]; },
    status: function () {
      var s = this.current();
      if (!$('#tStatus')) return;
      $('#tForm').classList.toggle('hide', !s);
      if (!s) return;
      $('#tStatus').innerHTML = '<div class="card progress-card" style="margin-bottom:18px">' + progressHtml(s, s.name) + '</div>';
      this.preview();
    },
    preview: function () {
      var s = this.current(), r = $('input[name=tcat]:checked');
      if (!s || !$('#tPreview')) return;
      if (!r) { $('#tPreview').innerHTML = ''; return; }
      var c = cat(r.value), after = s.points + c.points, mb = TLD.medalOf(s.points), ma = TLD.medalOf(after);
      var unlock = ma && (!mb || mb.key !== ma.key);
      $('#tPreview').innerHTML = '<div class="item' + (unlock ? ' goldbox' : '') + '" style="margin-bottom:16px">' +
        '<div class="main">หลังบันทึก: <b>' + s.points + ' → ' + after + ' แต้ม</b>' +
        (unlock ? '<br>' + ic('sparkles') + ' <b>นักศึกษาจะปลดล็อก ' + esc(ma.full) + '</b>' : '') + '</div></div>';
    },
    submit: function (form) {
      var self = this, s = this.current(), r = $('input[name=tcat]:checked'), btn = $('#tSubmit');
      if (!s) return toast('กรุณาเลือกนักศึกษา', 'bad');
      if (!r) return toast('กรุณาเลือกหมวดหมู่ความดี', 'bad');
      busy(btn, true);
      API.call('award', { studentId: s.id, category: r.value, detail: form.detail.value, date: form.date.value, image: this.form.image })
        .then(function (res) {
          busy(btn, false);
          toast('มอบ +' + cat(r.value).points + ' แต้มให้ ' + s.name + ' เรียบร้อย', 'ok');
          form.reset(); $('#t_date').value = today(); self.form.image = ''; $('#tUp .prev').innerHTML = '';
          if (res.unlocked) celebrate(s.name, res.unlocked);
          self.refresh();
        }).catch(function (e) { busy(btn, false); handleErr(e); });
    },
    sumList: function () {
      var q = $('#sumQ').value.trim().toLowerCase(), dp = $('#sumDept').value, lv = $('#sumLevel').value, md = $('#sumMedal').value;
      var mine = this.mine, me = S.user.id;
      return (this.students || []).filter(function (s) {
        if (mine && s.advisorId !== me) return false;
        if (dp && s.dept !== dp) return false;
        if (lv && s.level !== lv) return false;
        if (md && (md === 'none' ? s.medal : s.medal !== md)) return false;
        return !q || String(s.id).toLowerCase().indexOf(q) >= 0 || String(s.name).toLowerCase().indexOf(q) >= 0;
      });
    },
    summary: function () {
      if (!$('#tSum')) return;
      var list = this.sumList(), mine = this.mine;
      $('#tSum').innerHTML = list.length ? '<div class="table-wrap"><table class="tbl cards"><thead><tr><th>รหัส</th><th>ชื่อ-สกุล</th><th>แผนก</th><th>ชั้น</th><th>รายการ</th><th>แต้ม</th><th>เหรียญ</th><th>พิมพ์</th></tr></thead><tbody>' +
        list.map(function (s) {
          return '<tr><td data-l="รหัส">' + esc(s.id) + '</td><td data-l="ชื่อ"><b>' + esc(s.name) + '</b></td><td data-l="แผนก">' + esc(s.dept) + '</td><td data-l="ชั้น">' + esc(s.level) + '</td>' +
            '<td data-l="รายการ" class="num">' + s.count + '</td><td data-l="แต้ม" class="num">' + s.points + '</td><td data-l="เหรียญ">' + medalTag(s.medal) + '</td>' +
            '<td class="act"><div class="row" style="gap:6px;justify-content:flex-end">' +
            (s.medal ? '<button class="btn btn-gold btn-sm" data-cert="' + s.medal + '" data-sid="' + esc(s.id) + '">' + ic('award') + 'เกียรติบัตร</button>' : '') +
            (s.count ? '<button class="btn btn-ghost btn-sm" data-port="1" data-sid="' + esc(s.id) + '">' + ic('book') + 'Portfolio</button>' : '') + '</div></td></tr>';
        }).join('') + '</tbody></table></div><p class="muted" style="margin-top:8px">ทั้งหมด ' + list.length + ' คน' + (mine ? ' (เฉพาะในที่ปรึกษา)' : '') + '</p>'
        : empty('ไม่พบข้อมูลตามเงื่อนไข', 'search');
      $$('#tSum [data-cert]').forEach(function (b) { b.onclick = function () { Printer.cert(b.dataset.sid, b.dataset.cert, b); }; });
      $$('#tSum [data-port]').forEach(function (b) { b.onclick = function () { Printer.portfolio(b.dataset.sid, b); }; });
    }
  };

  /* ===================================================================
   * VIEW: ผู้ดูแลระบบ / ผู้บริหาร
   * =================================================================== */
  var Admin = {
    roles: ['admin'],
    tabName: 'review',
    charts: {},
    render: function (el) {
      var self = this;
      el.innerHTML = '<div class="tabs" role="tablist">' +
        '<button data-t="review">' + ic('search') + 'ตรวจสอบหลักฐาน <span class="badge" id="aPend">0</span></button>' +
        '<button data-t="dash">' + ic('chart') + 'แดชบอร์ดผู้บริหาร</button><button data-t="users">' + ic('users') + 'ครูและนักเรียน</button>' +
        '<button data-t="settings">' + ic('settings') + 'ตั้งค่าระบบ</button></div>' +
        '<div data-p="review"><div class="card"><div class="section-head"><h2>ตรวจสอบหลักฐานการทำความดี</h2>' +
        '<div class="row"><button class="btn btn-ghost btn-sm" id="aCsv">' + ic('download') + 'ส่งออก Excel (CSV)</button><button class="btn btn-ghost btn-sm" id="aPdf">' + ic('printer') + 'รายงาน PDF</button></div></div>' +
        '<div class="filters"><input class="input" id="fQ" placeholder="รหัส/ชื่อนักศึกษา" aria-label="ค้นหา">' +
        '<select class="input" id="fDept" aria-label="แผนกวิชา">' + opts(TLD.DEPTS, '', 'ทุกแผนกวิชา') + '</select>' +
        '<select class="input" id="fCat" aria-label="หมวดหมู่">' + opts(TLD.CATEGORIES.map(function (c) { return { v: c.id, t: c.short }; }), '', 'ทุกหมวดหมู่') + '</select>' +
        '<select class="input" id="fSt" aria-label="สถานะ">' + opts(Object.keys(TLD.STATUS).map(function (k) { return { v: k, t: TLD.STATUS[k] }; }), 'pending', 'ทุกสถานะ') + '</select></div>' +
        '<div id="aTable">' + skel(1) + '</div></div></div>' +
        '<div data-p="dash" class="hide"><div id="aKpi">' + skel(4) + '</div>' +
        '<div class="section split wide-l"><div class="card"><h3>ผลงานความดีแยกตามแผนกวิชา</h3><div class="chart-box"><canvas id="cDept"></canvas></div></div>' +
        '<div class="card"><h3>สัดส่วนตามหมวดหมู่คุณธรรม</h3><div class="chart-box"><canvas id="cCat"></canvas></div></div></div>' +
        '<div class="section card"><h3>สรุปรายแผนกวิชา</h3><div id="aDeptTbl"></div></div></div>' +
        '<div data-p="users" class="hide"><div class="card"><div class="section-head"><h2>ครูที่ปรึกษาและนักเรียน/นักศึกษา</h2>' +
        '<div class="row"><button class="btn btn-primary btn-sm" id="uAddT">' + ic('plus') + 'เพิ่มครูที่ปรึกษา</button>' +
        '<button class="btn btn-gold btn-sm" id="uImport">' + ic('sheet') + 'นำเข้ารายชื่อ (Excel/CSV)</button>' +
        '<button class="btn btn-ghost btn-sm" id="uAdd">' + ic('user') + 'เพิ่มผู้ใช้</button></div></div>' +
        '<div class="filters"><input class="input" id="uQ" placeholder="รหัส/ชื่อ" aria-label="ค้นหาผู้ใช้">' +
        '<select class="input" id="uRole" aria-label="บทบาท">' + opts(Object.keys(TLD.ROLES).map(function (k) { return { v: k, t: TLD.ROLES[k] }; }), '', 'ทุกบทบาท') + '</select>' +
        '<select class="input" id="uDept" aria-label="แผนก">' + opts(TLD.DEPTS, '', 'ทุกแผนกวิชา') + '</select>' +
        '<button class="btn btn-ghost" id="uCards">' + ic('qr') + 'พิมพ์บัตร QR นักศึกษา</button></div><div id="uTable">' + skel(1) + '</div></div></div>' +
        '<div data-p="settings" class="hide" id="aSettings"></div>';
      $$('.tabs button', el).forEach(function (b) { b.onclick = function () { self.tab(b.dataset.t); }; });
      ['fQ', 'fDept', 'fCat', 'fSt'].forEach(function (id) { $('#' + id).oninput = function () { self.table(); }; });
      ['uQ', 'uRole', 'uDept'].forEach(function (id) { $('#' + id).oninput = function () { self.userTable(); }; });
      $('#aCsv').onclick = function () { self.csv(); };
      $('#aPdf').onclick = function () { self.report(); };
      $('#uAdd').onclick = function () { self.userForm(null, 'student'); };
      $('#uAddT').onclick = function () { self.userForm(null, 'teacher'); };
      $('#uImport').onclick = function () { Importer.open(function () { self.refresh(); }); };
      $('#uCards').onclick = function () {
        var ids = self.userList().filter(function (u) { return u.role === 'student'; }).map(function (u) { return u.id; });
        if (!ids.length) return toast('ไม่มีนักศึกษาตามตัวกรอง', 'bad');
        var b = this; busy(b, true);
        API.call('qrCodes', { ids: ids }).then(function (l) { busy(b, false); Printer.qrCards(l); }).catch(function (e) { busy(b, false); handleErr(e); });
      };
      this.tab(this.tabName);
    },
    tab: function (t) {
      this.tabName = t;
      $$('.tabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.t === t); });
      $$('[data-p]').forEach(function (p) { p.classList.toggle('hide', p.dataset.p !== t); });
      if (t === 'settings') Settings.render($('#aSettings'));
      this.refresh();
    },
    refresh: function () {
      var self = this;
      var jobs = [API.call('allDeeds').then(function (d) { self.deeds = d; self.table(); })];
      if (this.tabName === 'dash') jobs.push(API.call('adminStats').then(function (s) { self.stats = s; self.dash(); }));
      if (this.tabName === 'users') jobs.push(API.call('users').then(function (u) { self.users = u; self.userTable(); }));
      return Promise.all(jobs).catch(handleErr);
    },
    filtered: function () {
      var q = ($('#fQ').value || '').trim().toLowerCase(), dp = $('#fDept').value, c = $('#fCat').value, st = $('#fSt').value;
      return (this.deeds || []).filter(function (d) {
        if (dp && d.dept !== dp) return false;
        if (c && d.category !== c) return false;
        if (st && d.status !== st) return false;
        return !q || String(d.studentId).toLowerCase().indexOf(q) >= 0 || String(d.studentName).toLowerCase().indexOf(q) >= 0;
      });
    },
    table: function () {
      var self = this;
      if (!$('#aTable')) return;
      $('#aPend').textContent = (this.deeds || []).filter(function (d) { return d.status === 'pending'; }).length;
      var list = this.filtered();
      $('#aTable').innerHTML = list.length ? '<div class="table-wrap"><table class="tbl cards"><thead><tr><th>วันที่</th><th>นักศึกษา</th><th>แผนก/ชั้น</th><th>หมวดหมู่</th><th>รายละเอียด</th><th>แต้ม</th><th>สถานะ</th><th></th></tr></thead><tbody>' +
        list.slice(0, 500).map(function (d) {
          return '<tr><td data-l="วันที่">' + thDate(d.date) + '</td><td data-l="นักศึกษา"><b>' + esc(d.studentName) + '</b><br><small class="muted">' + esc(d.studentId) + '</small></td>' +
            '<td data-l="แผนก/ชั้น">' + esc(d.dept) + '<br><small class="muted">' + esc(d.level) + '</small></td><td data-l="หมวดหมู่">' + catTag(d.category) + '</td>' +
            '<td data-l="รายละเอียด" class="clip">' + esc(d.detail) + '</td><td data-l="แต้ม" class="num">+' + d.points + '</td><td data-l="สถานะ">' + statusTag(d.status) + '</td>' +
            '<td class="act"><button class="btn ' + (d.status === 'pending' ? 'btn-primary' : 'btn-ghost') + ' btn-sm" data-id="' + esc(d.id) + '">' + ic(d.status === 'pending' ? 'search' : 'eye') + (d.status === 'pending' ? 'ตรวจสอบ' : 'ดู') + '</button></td></tr>';
        }).join('') + '</tbody></table></div><p class="muted" style="margin-top:8px">แสดง ' + Math.min(500, list.length) + ' จาก ' + list.length + ' รายการ</p>'
        : empty($('#fSt').value === 'pending' ? 'ไม่มีรายการรอตรวจสอบ' : 'ไม่พบรายการตามเงื่อนไข', 'inbox');
      $$('#aTable [data-id]').forEach(function (b) { b.onclick = function () { self.reviewModal(b.dataset.id); }; });
    },
    reviewModal: function (id) {
      var self = this, d = (this.deeds || []).filter(function (x) { return x.id === id; })[0];
      if (!d) return;
      modal('ตรวจสอบหลักฐานการทำความดี',
        (d.imageUrl ? '<img class="modal-img" src="' + esc(d.imageUrl) + '" alt="รูปหลักฐาน" referrerpolicy="no-referrer" style="margin-bottom:16px">' : '<div class="empty noimg"><span class="big">' + ic('image') + '</span>ไม่มีรูปภาพแนบ</div>') +
        '<div class="row" style="gap:8px;margin-bottom:10px">' + statusTag(d.status) + catTag(d.category) + '<span class="tag pts-tag">+' + d.points + ' แต้ม</span></div>' +
        '<dl class="kv"><dt>นักศึกษา</dt><dd>' + esc(d.studentName) + ' (' + esc(d.studentId) + ')</dd><dt>แผนก/ชั้น</dt><dd>' + esc(d.dept) + ' · ' + esc(d.level) + '</dd>' +
        '<dt>วันที่</dt><dd>' + thDate(d.date, true) + '</dd><dt>รายละเอียด</dt><dd style="white-space:pre-wrap">' + esc(d.detail) + '</dd>' +
        (d.impact ? '<dt>ผลกระทบเชิงบวก</dt><dd style="white-space:pre-wrap">' + esc(d.impact) + '</dd>' : '') +
        (d.learned ? '<dt>สิ่งที่ได้เรียนรู้</dt><dd style="white-space:pre-wrap">' + esc(d.learned) + '</dd>' : '') +
        (d.recordedByName ? '<dt>ครูผู้บันทึก</dt><dd>' + esc(d.recordedByName) + '</dd>' : '') +
        (d.reviewedBy ? '<dt>ผู้ตรวจล่าสุด</dt><dd>' + esc(d.reviewedBy) + '</dd>' : '') + '</dl>' +
        '<div class="field" style="margin-top:16px"><label for="rvNote">หมายเหตุ / เหตุผลที่ส่งกลับแก้ไข</label><textarea class="input" id="rvNote">' + esc(d.reviewNote || '') + '</textarea></div>' +
        '<div class="grid g2"><button class="btn btn-ok" data-s="approved">' + ic('check') + 'อนุมัติ</button><button class="btn btn-bad" data-s="returned">' + ic('undo') + 'ส่งกลับแก้ไข / ไม่อนุมัติ</button></div>',
        function (body, close) {
          $$('[data-s]', body).forEach(function (b) {
            b.onclick = function () {
              busy(b, true);
              API.call('review', { id: d.id, status: b.dataset.s, note: $('#rvNote', body).value }).then(function (r) {
                close();
                toast(b.dataset.s === 'approved' ? 'อนุมัติเรียบร้อย' : 'ส่งกลับให้นักศึกษาแก้ไขแล้ว', 'ok');
                if (r.unlocked) celebrate(r.studentName, r.unlocked);
                self.refresh();
              }).catch(function (e) { busy(b, false); handleErr(e); });
            };
          });
        });
    },
    dash: function () {
      var s = this.stats, k = s.kpi;
      if (!$('#aKpi')) return;
      $('#aKpi').innerHTML = '<div class="grid g4">' +
        statCard('list', 'ico-navy', num(k.total), 'การทำความดีทั้งหมด', '<span class="st pending">รอ ' + k.pending + '</span><span class="st returned">ส่งกลับ ' + k.returned + '</span>') +
        statCard('check', 'ico-ok', num(k.approved), 'ความดีที่อนุมัติแล้ว') +
        statCard('users', 'ico-gold', num(k.participants), 'นักศึกษาที่เข้าร่วม (ไม่ซ้ำ)', '<span class="muted">จากสมาชิก ' + num(k.students) + ' คน</span>') +
        statCard('award', 'ico-maroon', num(k.certs.total), 'เกียรติบัตรแยกตามระดับ', certSub(k.certs)) + '</div>';
      var depts = Object.keys(s.dept);
      $('#aDeptTbl').innerHTML = '<div class="table-wrap"><table class="tbl cards"><thead><tr><th>แผนกวิชา</th><th>จำนวนความดี (ครั้ง)</th><th>แต้มรวม</th></tr></thead><tbody>' +
        depts.map(function (d) { return '<tr><td data-l="แผนก"><b>' + esc(d) + '</b></td><td data-l="ครั้ง" class="num">' + s.dept[d].count + '</td><td data-l="แต้ม" class="num">' + s.dept[d].points + '</td></tr>'; }).join('') + '</tbody></table></div>';
      if (!window.Chart) return;
      Chart.defaults.font.family = 'Sarabun, Kanit, sans-serif';
      Chart.defaults.font.size = 15;
      Chart.defaults.color = '#3A4256';
      var c1 = { labels: depts, datasets: [
        { label: 'จำนวนครั้ง', data: depts.map(function (d) { return s.dept[d].count; }), backgroundColor: '#14244B', borderRadius: 8 },
        { label: 'แต้มรวม', data: depts.map(function (d) { return s.dept[d].points; }), backgroundColor: '#D99B26', borderRadius: 8 }] };
      var c2 = { labels: TLD.CATEGORIES.map(function (c) { return c.short; }), datasets: [{
        data: TLD.CATEGORIES.map(function (c) { return s.cat[c.id].count; }), backgroundColor: TLD.CATEGORIES.map(function (c) { return c.color; }),
        borderColor: '#fff', borderWidth: 3 }] };
      if (this.charts.dept && this.charts.dept.canvas === $('#cDept')) {
        this.charts.dept.data = c1; this.charts.dept.update(); this.charts.cat.data = c2; this.charts.cat.update();
        return;
      }
      var narrow = window.innerWidth < 700;
      this.charts.dept = new Chart($('#cDept'), { type: 'bar', data: c1, options: { maintainAspectRatio: false, indexAxis: narrow ? 'y' : 'x',
        plugins: { legend: { position: 'bottom' } }, scales: { x: { ticks: { autoSkip: false, maxRotation: 60 } }, y: { beginAtZero: true, ticks: { precision: 0 } } } } });
      this.charts.cat = new Chart($('#cCat'), { type: 'doughnut', data: c2, options: { maintainAspectRatio: false, cutout: '58%',
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 16, padding: 14 } } } } });
    },
    csv: function () {
      var list = this.filtered();
      var head = ['รหัสรายการ', 'วันที่', 'รหัสนักศึกษา', 'ชื่อ-สกุล', 'แผนกวิชา', 'ระดับชั้น', 'หมวดหมู่', 'แต้ม', 'รายละเอียด', 'ผลกระทบเชิงบวก', 'สิ่งที่ได้เรียนรู้', 'สถานะ', 'ครูผู้บันทึก', 'ผู้ตรวจ', 'หมายเหตุ', 'รูปภาพ'];
      var rows = list.map(function (d) {
        return [d.id, d.date, d.studentId, d.studentName, d.dept, d.level, cat(d.category).name, d.points, d.detail, d.impact, d.learned,
          TLD.STATUS[d.status], d.recordedByName, d.reviewedBy, d.reviewNote, String(d.imageUrl || '').indexOf('data:') === 0 ? '(รูปในเครื่อง)' : d.imageUrl];
      });
      downloadCsv([head].concat(rows), 'คนดีศรีท่าหลวง_รายงาน_' + today() + '.csv');
      toast('ดาวน์โหลดไฟล์ ' + list.length + ' รายการแล้ว', 'ok');
    },
    report: function () {
      var list = this.filtered();
      API.call('adminStats').then(function (s) { Printer.adminReport(s, list); }).catch(handleErr);
    },
    userList: function () {
      var q = $('#uQ').value.trim().toLowerCase(), r = $('#uRole').value, dp = $('#uDept').value;
      return (this.users || []).filter(function (u) {
        if (r && u.role !== r) return false;
        if (dp && u.dept !== dp) return false;
        return !q || String(u.id).toLowerCase().indexOf(q) >= 0 || String(u.name).toLowerCase().indexOf(q) >= 0;
      });
    },
    userTable: function () {
      var self = this;
      if (!$('#uTable')) return;
      var adv = {};
      (this.users || []).forEach(function (u) { if (u.role === 'student' && u.advisorId) adv[u.advisorId] = (adv[u.advisorId] || 0) + 1; });
      var names = {};
      (this.users || []).forEach(function (u) { names[u.id] = u.name; });
      var list = this.userList();
      $('#uTable').innerHTML = '<div class="table-wrap"><table class="tbl cards"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>บทบาท</th><th>แผนก/ชั้น</th><th>ครูที่ปรึกษา / ในที่ปรึกษา</th><th>สถานะ</th><th></th></tr></thead><tbody>' +
        list.slice(0, 600).map(function (u) {
          return '<tr><td data-l="รหัส">' + esc(u.id) + '</td><td data-l="ชื่อ"><b>' + esc(u.name) + '</b></td><td data-l="บทบาท">' + esc(TLD.ROLES[u.role] || u.role) + '</td>' +
            '<td data-l="แผนก/ชั้น">' + esc(u.dept || '-') + (u.level ? ' · ' + esc(u.level) : '') + '</td>' +
            '<td data-l="ที่ปรึกษา">' + (u.role === 'student' ? esc(names[u.advisorId] || '-') : u.role === 'teacher' ? '<b>' + (adv[u.id] || 0) + '</b> คน' : '-') + '</td>' +
            '<td data-l="สถานะ">' + (u.active ? '<span class="st approved">ใช้งาน</span>' : '<span class="st returned">ระงับ</span>') + '</td>' +
            '<td class="act"><div class="row" style="gap:6px;justify-content:flex-end">' +
            (u.role === 'student' ? '<button class="btn btn-ghost btn-sm" data-qr="' + esc(u.id) + '" title="QR Code">' + ic('qr') + 'QR</button>' : '') +
            '<button class="btn btn-ghost btn-sm" data-u="' + esc(u.id) + '">' + ic('pen') + 'แก้ไข</button></div></td></tr>';
        }).join('') + '</tbody></table></div><p class="muted" style="margin-top:8px">ทั้งหมด ' + list.length + ' บัญชี</p>';
      $$('#uTable [data-u]').forEach(function (b) {
        b.onclick = function () { self.userForm((self.users || []).filter(function (u) { return u.id === b.dataset.u; })[0]); };
      });
      $$('#uTable [data-qr]').forEach(function (b) { b.onclick = function () { self.qrModal(b.dataset.qr); }; });
    },
    qrModal: function (id) {
      API.call('qrCodes', { ids: [id] }).then(function (l) {
        var q = l[0];
        if (!q) return;
        modal('QR Code เข้าสู่ระบบ: ' + q.name, '<div class="qr-me"><div class="qrbox big" id="mQr"></div><div><h3>' + esc(q.name) + '</h3><p class="muted">' + esc(q.id) + ' · ' + esc(q.dept) + ' · ' + esc(q.level) + '</p>' +
          '<div class="row"><button class="btn btn-primary btn-sm" id="mQrPrint">' + ic('printer') + 'พิมพ์บัตร</button>' +
          '<button class="btn btn-bad btn-sm" id="mQrReset">' + ic('refresh') + 'ยกเลิก QR เดิม/ออกใหม่</button></div>' +
          '<p class="muted" style="margin-top:10px;font-size:.92rem">ใช้เมื่อบัตรหาย: QR เดิมจะใช้งานไม่ได้ทันที</p></div></div>', function (body, close) {
          new QRCode($('#mQr', body), { text: qrLoginUrl(q), width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
          $('#mQrPrint', body).onclick = function () { Printer.qrCards([q]); };
          $('#mQrReset', body).onclick = function () {
            if (!confirm('ยกเลิก QR Code เดิมของ ' + q.name + ' และออกใหม่?')) return;
            API.call('resetQr', { id: q.id }).then(function () { close(); toast('ออก QR Code ใหม่แล้ว', 'ok'); Admin.qrModal(q.id); }).catch(handleErr);
          };
        });
      }).catch(handleErr);
    },
    userForm: function (u, role) {
      var self = this, isNew = !u;
      u = u || { role: role || 'teacher', active: true };
      var teachers = (this.users || []).filter(function (x) { return x.role === 'teacher'; }).map(function (t) { return { v: t.id, t: t.name }; });
      modal(isNew ? (u.role === 'teacher' ? 'เพิ่มครูที่ปรึกษา' : 'เพิ่มผู้ใช้งาน') : 'แก้ไขผู้ใช้งาน',
        '<form id="uForm"><div class="grid g2"><div class="field"><label>รหัสผู้ใช้</label><input class="input" name="id" value="' + esc(u.id || '') + '"' + (isNew ? '' : ' readonly') + ' required></div>' +
        '<div class="field"><label>ชื่อ-นามสกุล</label><input class="input" name="name" value="' + esc(u.name || '') + '" required></div>' +
        '<div class="field"><label>บทบาท</label><select class="input" name="role" id="ufRole">' + opts(Object.keys(TLD.ROLES).map(function (k) { return { v: k, t: TLD.ROLES[k] }; }), u.role) + '</select></div>' +
        '<div class="field"><label>แผนกวิชา</label><select class="input" name="dept">' + opts(TLD.DEPTS, u.dept, '— ไม่ระบุ —') + '</select></div>' +
        '<div class="field stu-only"><label>ระดับชั้น</label><select class="input" name="level">' + opts(TLD.LEVELS, u.level, '— ไม่ระบุ —') + '</select></div>' +
        '<div class="field stu-only"><label>ครูที่ปรึกษา</label><select class="input" name="advisorId">' + opts(teachers, u.advisorId, '— ไม่ระบุ —') + '</select></div></div>' +
        '<div class="field"><label>' + (isNew ? 'รหัสผ่าน' : 'ตั้งรหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)') + '</label><input class="input" name="password" type="text" autocomplete="off"' + (isNew ? ' required' : '') + '></div>' +
        '<label class="check" style="margin-bottom:16px"><input type="checkbox" name="active"' + (u.active ? ' checked' : '') + '> เปิดใช้งานบัญชี</label>' +
        '<button class="btn btn-primary btn-block">' + ic('save') + 'บันทึก</button></form>',
        function (body, close) {
          var roleSel = $('#ufRole', body);
          var sync = function () { $$('.stu-only', body).forEach(function (x) { x.classList.toggle('hide', roleSel.value !== 'student'); }); };
          roleSel.onchange = sync; sync();
          $('#uForm', body).onsubmit = function (e) {
            e.preventDefault();
            var f = formData(this), btn = $('button.btn', this);
            f.active = this.active.checked ? '1' : '0'; f.isNew = isNew;
            busy(btn, true);
            API.call('saveUser', f).then(function () {
              close(); toast('บันทึกผู้ใช้เรียบร้อย', 'ok');
              loadConfig();
              API.call('users').then(function (us) { self.users = us; self.userTable(); });
            }).catch(function (e2) { busy(btn, false); handleErr(e2); });
          };
        });
    }
  };
  function downloadCsv(rows, filename) {
    var csv = '﻿' + rows.map(function (r) {
      return r.map(function (v) { v = String(v === undefined || v === null ? '' : v); return /[",\n\r]/.test(v) || /^[=+\-@]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(',');
    }).join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------------- นำเข้ารายชื่อ (Excel / CSV) ---------------- */
  var Importer = {
    open: function (done) {
      var self = this;
      this.rows = [];
      modal('นำเข้ารายชื่อจาก Excel / CSV',
        '<div class="steps"><div class="field"><span class="label">1) นำเข้าเป็น</span><div class="seg">' +
        '<label><input type="radio" name="imRole" value="student" checked><span>' + ic('grad') + 'นักเรียน/นักศึกษา</span></label>' +
        '<label><input type="radio" name="imRole" value="teacher"><span>' + ic('users') + 'ครูที่ปรึกษา</span></label></div></div>' +
        '<div class="field"><span class="label">2) เตรียมไฟล์ตามแบบฟอร์ม</span><div class="hint" id="imCols"></div>' +
        '<div><button type="button" class="btn btn-ghost btn-sm" id="imTpl">' + ic('download') + 'ดาวน์โหลดแบบฟอร์ม</button></div></div>' +
        '<div class="field"><span class="label">3) เลือกไฟล์ (.xlsx, .xls, .csv) หรือวางข้อมูลที่คัดลอกจาก Excel</span>' +
        '<label class="upload"><input type="file" id="imFile" accept=".xlsx,.xls,.csv,text/csv"><span class="up-ic">' + ic('sheet') + '</span><b>แตะเพื่อเลือกไฟล์</b></label>' +
        '<textarea class="input" id="imPaste" placeholder="หรือวางข้อมูลจาก Excel ที่นี่ (คัดลอกทั้งตาราง)" style="margin-top:10px;min-height:90px"></textarea></div>' +
        '<div id="imPrev"></div><button class="btn btn-primary btn-block" id="imGo" disabled>' + ic('upload') + 'นำเข้าข้อมูล</button></div>',
        function (body, close) {
          function role() { return $('input[name=imRole]:checked', body).value; }
          function cols() {
            $('#imCols', body).innerHTML = role() === 'student'
              ? 'คอลัมน์: <b>รหัสนักศึกษา</b> | <b>ชื่อ-นามสกุล</b> | <b>แผนกวิชา</b> | <b>ระดับชั้น</b> (ปวช.1–ปวส.2) | ครูที่ปรึกษา (รหัสหรือชื่อครู) | รหัสผ่าน (เว้นว่าง = ใช้รหัสนักศึกษา)'
              : 'คอลัมน์: <b>รหัสครู</b> | <b>ชื่อ-นามสกุล</b> | แผนกวิชา | (เว้นว่าง) | (เว้นว่าง) | รหัสผ่าน (เว้นว่าง = ใช้รหัสครู)';
          }
          $$('input[name=imRole]', body).forEach(function (r) { r.onchange = function () { cols(); self.preview(body); }; });
          cols();
          $('#imTpl', body).onclick = function () {
            if (role() === 'student') downloadCsv([['รหัสนักศึกษา', 'ชื่อ-นามสกุล', 'แผนกวิชา', 'ระดับชั้น', 'ครูที่ปรึกษา', 'รหัสผ่าน'],
              ['67001', 'นายตัวอย่าง ใจดี', TLD.DEPTS[0] || '', 'ปวช.1', 'T001', '']], 'แบบฟอร์มนำเข้านักศึกษา.csv');
            else downloadCsv([['รหัสครู', 'ชื่อ-นามสกุล', 'แผนกวิชา', '', '', 'รหัสผ่าน'], ['T101', 'ครูตัวอย่าง มีสุข', TLD.DEPTS[0] || '', '', '', '']], 'แบบฟอร์มนำเข้าครู.csv');
          };
          $('#imFile', body).onchange = function () {
            var f = this.files[0];
            if (!f) return;
            self.readFile(f).then(function (m) { self.rows = self.parse(m); self.preview(body); }).catch(handleErr);
          };
          $('#imPaste', body).oninput = function () { self.rows = self.parse(self.csvParse(this.value)); self.preview(body); };
          $('#imGo', body).onclick = function () { self.run(body, role(), function () { if (done) done(); }); };
        }, null, true);
    },
    readFile: function (f) {
      var self = this;
      if (/\.csv$/i.test(f.name) || f.type === 'text/csv') {
        return f.text().then(function (t) { return self.csvParse(t.replace(/^﻿/, '')); });
      }
      return loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js').then(function () {
        return f.arrayBuffer();
      }).then(function (buf) {
        var wb = XLSX.read(buf, { type: 'array' });
        return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
      });
    },
    csvParse: function (text) {
      var delim = text.indexOf('\t') >= 0 ? '\t' : ',';
      var rows = [], row = [], cell = '', q = false;
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (q) {
          if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
          else if (ch === '"') q = false;
          else cell += ch;
        } else if (ch === '"') q = true;
        else if (ch === delim) { row.push(cell); cell = ''; }
        else if (ch === '\n' || ch === '\r') {
          if (ch === '\r' && text[i + 1] === '\n') i++;
          row.push(cell); rows.push(row); row = []; cell = '';
        } else cell += ch;
      }
      if (cell || row.length) { row.push(cell); rows.push(row); }
      return rows;
    },
    normLevel: function (v) {
      var m = String(v || '').replace(/\s/g, '').match(/(ปวช|ปวส)\.?([1-3])/);
      return m ? m[1] + '.' + m[2] : String(v || '').trim();
    },
    parse: function (matrix) {
      var self = this, out = [];
      matrix.forEach(function (r, i) {
        r = (r || []).map(function (c) { return String(c === null || c === undefined ? '' : c).trim(); });
        if (!r.some(Boolean)) return;
        if (!out.length && !/^[0-9A-Za-z\-_.]{2,20}$/.test(r[0])) return; // แถวหัวตาราง
        out.push({ line: i + 1, id: r[0], name: r[1] || '', dept: r[2] || '', level: self.normLevel(r[3]), advisor: r[4] || '', password: r[5] || '' });
      });
      return out;
    },
    preview: function (body) {
      var rows = this.rows || [], box = $('#imPrev', body);
      $('#imGo', body).disabled = !rows.length;
      if (!rows.length) { box.innerHTML = ''; return; }
      box.innerHTML = '<div class="item okbox" style="margin-bottom:12px"><div class="main">' + ic('check') + ' พบข้อมูล <b>' + rows.length + '</b> รายการ (แสดง 8 รายการแรก)</div></div>' +
        '<div class="table-wrap" style="margin-bottom:16px"><table class="tbl"><thead><tr><th>รหัส</th><th>ชื่อ-สกุล</th><th>แผนก</th><th>ชั้น</th><th>ครูที่ปรึกษา</th></tr></thead><tbody>' +
        rows.slice(0, 8).map(function (r) { return '<tr><td>' + esc(r.id) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.dept) + '</td><td>' + esc(r.level) + '</td><td>' + esc(r.advisor) + '</td></tr>'; }).join('') +
        '</tbody></table></div>';
    },
    run: function (body, role, done) {
      var rows = this.rows.slice(), btn = $('#imGo', body), total = { added: 0, updated: 0, errors: [], newDepts: [] }, CH = 300;
      busy(btn, true);
      var chain = Promise.resolve();
      for (var i = 0; i < rows.length; i += CH) {
        (function (part) {
          chain = chain.then(function () {
            return API.call('importUsers', { role: role, rows: part }).then(function (r) {
              total.added += r.added; total.updated += r.updated;
              total.errors = total.errors.concat(r.errors); total.newDepts = total.newDepts.concat(r.newDepts);
            });
          });
        })(rows.slice(i, i + CH));
      }
      chain.then(function () {
        busy(btn, false);
        loadConfig();
        $('#imPrev', body).innerHTML = '<div class="item okbox"><div class="main">' + ic('check') + ' เพิ่มใหม่ <b>' + total.added + '</b> · ปรับปรุง <b>' + total.updated + '</b> รายการ' +
          (total.newDepts.length ? '<br>เพิ่มแผนกวิชาใหม่: ' + esc(total.newDepts.join(', ')) : '') + '</div></div>' +
          (total.errors.length ? '<div class="item warnbox" style="margin-top:10px"><div class="main"><b>' + ic('alert') + ' ข้ามไป ' + total.errors.length + ' รายการ</b><ul class="errlist">' +
            total.errors.slice(0, 30).map(function (e) { return '<li>แถว ' + e.line + ': ' + esc(e.msg) + '</li>'; }).join('') + '</ul></div></div>' : '');
        btn.disabled = true;
        toast('นำเข้าข้อมูลเรียบร้อย', 'ok');
        done();
      }).catch(function (e) { busy(btn, false); handleErr(e); });
    }
  };

  /* ---------------- ตั้งค่าระบบ: แผนกวิชา / เกณฑ์เหรียญ / เกียรติบัตร ---------------- */
  var Settings = {
    render: function (el) {
      var self = this, c = S.cfg, cert = Object.assign({}, c.cert);
      this.cert = cert;
      el.innerHTML =
        '<div class="split"><div class="card"><div class="section-head"><h2>แผนกวิชา</h2></div>' +
        '<div id="deptList" class="dept-list"></div>' +
        '<div class="row" style="flex-wrap:nowrap;margin-top:10px"><input class="input" id="deptNew" placeholder="ชื่อแผนกวิชาใหม่" style="flex:1"><button class="btn btn-ghost" id="deptAdd">' + ic('plus') + 'เพิ่ม</button></div>' +
        '<button class="btn btn-primary btn-block" id="deptSave" style="margin-top:14px">' + ic('save') + 'บันทึกแผนกวิชา</button></div>' +
        '<div class="card"><div class="section-head"><h2>เกณฑ์แต้มเหรียญรางวัล</h2></div>' +
        '<div class="grid g3">' + TLD.MEDALS.map(function (m) {
          return '<div class="field center">' + UI.medalSvg(m.key, 'lg') + '<label for="mm_' + m.key + '">' + esc(m.name) + '</label>' +
            '<input class="input center big-num" type="number" min="1" id="mm_' + m.key + '" value="' + m.min + '"><span class="hint">แต้ม</span></div>';
        }).join('') + '</div><button class="btn btn-primary btn-block" id="medalSave">' + ic('save') + 'บันทึกเกณฑ์แต้ม</button></div></div>' +

        '<section class="section card"><div class="section-head"><h2>เกียรติบัตร</h2><div class="row">' +
        '<button class="btn btn-ghost btn-sm" id="certTest">' + ic('printer') + 'ทดลองพิมพ์</button>' +
        '<button class="btn btn-primary btn-sm" id="certSave">' + ic('save') + 'บันทึกการตั้งค่าเกียรติบัตร</button></div></div>' +
        '<div class="cert-editor"><div class="ce-form">' +
        '<div class="field"><span class="label">' + ic('palette') + ' เทมเพลต</span><div class="tpl-pick">' + TLD.TEMPLATES.map(function (t) {
          return '<label class="tpl"><input type="radio" name="tpl" value="' + t.id + '"' + (cert.template === t.id ? ' checked' : '') + '><span class="tpl-thumb tt-' + t.id + '"><i></i></span><span>' + esc(t.name) + '</span></label>';
        }).join('') + '</div></div>' +
        tf('title', 'หัวเรื่อง') + tf('subtitle', 'ชื่อโครงการ') + tf('intro', 'ข้อความนำ') + tf('body', 'ข้อความระดับชั้น/แผนก') +
        tf('achievement', 'ข้อความรางวัล') + tf('reason', 'ข้อความเหตุผล') + tf('blessing', 'คำอวยพร') +
        '<p class="hint">ใช้ตัวแปร: {level} ระดับชั้น · {dept} แผนกวิชา · {medal} ระดับเหรียญ · {min} แต้มที่ครบ · {title} ฉายา</p>' +
        '<h3 style="margin-top:20px">' + ic('sign') + ' ผู้ลงนาม (ผู้อำนวยการ)</h3>' +
        tf('directorName', 'ชื่อ-นามสกุล ผู้อำนวยการ') + tf('directorTitle', 'ตำแหน่ง') +
        '<div class="field"><span class="label">ลายมือชื่ออัตโนมัติ (ไฟล์ PNG พื้นหลังโปร่งใสจะสวยที่สุด)</span>' +
        '<div class="sig-box"><div id="sigPrev" class="sig-prev"></div><div class="row">' +
        '<label class="btn btn-ghost btn-sm">' + ic('upload') + 'อัปโหลดลายเซ็น<input type="file" id="sigFile" accept="image/*" hidden></label>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="sigDraw">' + ic('pen') + 'เซ็นบนหน้าจอ</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="sigDel">' + ic('trash') + 'ลบ</button></div></div></div>' +
        '<label class="check"><input type="checkbox" id="ceQr"' + (cert.showQr ? ' checked' : '') + '> แสดง QR Code ตรวจสอบบนเกียรติบัตร</label>' +
        '</div><div class="ce-prev"><div class="label" style="margin-bottom:8px">ตัวอย่าง (อัปเดตทันที)</div>' +
        '<div class="seg small" id="pvMedal">' + TLD.MEDALS.map(function (m, i) { return '<label><input type="radio" name="pvm" value="' + m.key + '"' + (i === 2 ? ' checked' : '') + '><span>' + esc(m.name) + '</span></label>'; }).join('') + '</div>' +
        '<div class="cert-preview" id="certPrev"></div></div></div></section>';

      function tf(k, label) { return '<div class="field"><label for="ce_' + k + '">' + esc(label) + '</label><input class="input" id="ce_' + k + '" data-k="' + k + '" value="' + esc(cert[k]) + '"></div>'; }

      this.depts = TLD.DEPTS.slice();
      this.deptList();
      $('#deptAdd').onclick = function () {
        var v = $('#deptNew').value.trim();
        if (!v) return;
        if (self.depts.indexOf(v) >= 0) return toast('มีแผนกนี้แล้ว', 'bad');
        self.depts.push(v); $('#deptNew').value = ''; self.deptList();
      };
      $('#deptNew').onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); $('#deptAdd').click(); } };
      $('#deptSave').onclick = function () {
        var b = this; busy(b, true);
        API.call('saveSettings', { depts: self.depts }).then(function (c2) { busy(b, false); applyCfg(c2); toast('บันทึกแผนกวิชาแล้ว', 'ok'); }).catch(function (e) { busy(b, false); handleErr(e); });
      };
      $('#medalSave').onclick = function () {
        var b = this; busy(b, true);
        API.call('saveSettings', { medals: { bronze: $('#mm_bronze').value, silver: $('#mm_silver').value, gold: $('#mm_gold').value } })
          .then(function (c2) { busy(b, false); applyCfg(c2); toast('บันทึกเกณฑ์แต้มแล้ว', 'ok'); self.preview(); }).catch(function (e) { busy(b, false); handleErr(e); });
      };
      $$('[data-k]', el).forEach(function (i) { i.oninput = function () { cert[i.dataset.k] = i.value; self.preview(); }; });
      $$('input[name=tpl]', el).forEach(function (r) { r.onchange = function () { cert.template = r.value; self.preview(); }; });
      $$('input[name=pvm]', el).forEach(function (r) { r.onchange = function () { self.preview(); }; });
      $('#ceQr').onchange = function () { cert.showQr = this.checked; self.preview(); };
      $('#sigFile').onchange = function () {
        var f = this.files[0]; if (!f) return;
        compressImage(f, 700, true).then(function (d) { cert.signature = d; self.sigPrev(); self.preview(); }, function (e) { toast(e.message, 'bad'); });
      };
      $('#sigDraw').onclick = function () { self.drawSig(); };
      $('#sigDel').onclick = function () { cert.signature = ''; self.sigPrev(); self.preview(); };
      $('#certSave').onclick = function () {
        var b = this; busy(b, true);
        API.call('saveSettings', { cert: cert }).then(function (c2) { busy(b, false); applyCfg(c2); self.cert = Object.assign(cert, c2.cert); toast('บันทึกการตั้งค่าเกียรติบัตรแล้ว', 'ok'); })
          .catch(function (e) { busy(b, false); handleErr(e); });
      };
      $('#certTest').onclick = function () {
        var mk = $('input[name=pvm]:checked').value;
        Printer.printCert(cert, { name: 'นายตัวอย่าง คนดีศรีท่าหลวง', level: 'ปวช.3', dept: TLD.DEPTS[0] || '', medal: mk, code: 'TLC-CERT-TEST' });
      };
      this.sigPrev();
      this.preview();
      if (!this.onResize) { this.onResize = function () { Settings.scale(); }; window.addEventListener('resize', this.onResize); }
    },
    deptList: function () {
      var self = this;
      $('#deptList').innerHTML = this.depts.map(function (d, i) {
        return '<div class="dept-row"><span class="ico-sm">' + ic('building') + '</span><input class="input" value="' + esc(d) + '" data-i="' + i + '" aria-label="ชื่อแผนก">' +
          '<button class="btn btn-ghost btn-sm" data-del="' + i + '" aria-label="ลบ">' + ic('trash') + '</button></div>';
      }).join('');
      $$('#deptList [data-i]').forEach(function (inp) { inp.oninput = function () { self.depts[+inp.dataset.i] = inp.value.trim(); }; });
      $$('#deptList [data-del]').forEach(function (b) {
        b.onclick = function () { self.depts.splice(+b.dataset.del, 1); self.deptList(); };
      });
    },
    sigPrev: function () {
      $('#sigPrev').innerHTML = this.cert.signature ? '<img src="' + esc(this.cert.signature) + '" alt="ลายเซ็น" referrerpolicy="no-referrer">' : '<span class="muted">ยังไม่มีลายเซ็น</span>';
    },
    drawSig: function () {
      var self = this;
      modal('เซ็นชื่อบนหน้าจอ', '<canvas id="sigPad" class="sig-pad" width="900" height="300"></canvas><p class="hint">ใช้นิ้วหรือเมาส์เซ็นชื่อในกรอบ</p>' +
        '<div class="grid g2"><button class="btn btn-ghost" id="padClear">' + ic('refresh') + 'ล้าง</button><button class="btn btn-primary" id="padOk">' + ic('check') + 'ใช้ลายเซ็นนี้</button></div>',
        function (body, close) {
          var cv = $('#sigPad', body), ctx = cv.getContext('2d'), drawing = false, used = false;
          ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#0B1F5C';
          function pos(e) { var r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * cv.width / r.width, y: (e.clientY - r.top) * cv.height / r.height }; }
          cv.onpointerdown = function (e) { drawing = true; used = true; cv.setPointerCapture(e.pointerId); var p = pos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
          cv.onpointermove = function (e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); };
          cv.onpointerup = cv.onpointercancel = function () { drawing = false; };
          $('#padClear', body).onclick = function () { ctx.clearRect(0, 0, cv.width, cv.height); used = false; };
          $('#padOk', body).onclick = function () {
            if (!used) return toast('กรุณาเซ็นชื่อก่อน', 'bad');
            self.cert.signature = cv.toDataURL('image/png'); self.sigPrev(); self.preview(); close();
          };
        });
    },
    preview: function () {
      var box = $('#certPrev');
      if (!box) return;
      var mk = ($('input[name=pvm]:checked') || {}).value || 'gold';
      box.innerHTML = '<div class="cert-scale">' + UI.certHtml(this.cert, { name: 'นายตัวอย่าง คนดีศรีท่าหลวง', level: 'ปวช.3', dept: TLD.DEPTS[0] || '', medal: mk, code: 'TLC-CERT-G-00000-PREVIEW', dateText: thDate(today(), true) }, 'pvQr') + '</div>';
      if (this.cert.showQr && $('#pvQr')) Printer.qr($('#pvQr'), 'TLC-CERT-G-00000-PREVIEW');
      this.scale();
    },
    scale: function () {
      var box = $('#certPrev'), sc = box && $('.cert-scale', box);
      if (!sc) return;
      var cert = $('.cert', sc), w = box.clientWidth, s = w / cert.offsetWidth;
      sc.style.transform = 'scale(' + s + ')';
      box.style.height = (cert.offsetHeight * s) + 'px';
    }
  };

  /* ===================================================================
   * VIEW: บัญชีของฉัน
   * =================================================================== */
  var Account = {
    roles: ['student', 'teacher', 'admin'],
    render: function (el) {
      var u = S.user;
      el.innerHTML = '<div class="auth-wrap"><div class="card"><div class="auth-head"><span class="ic-big">' + ic('user') + '</span><h2>' + esc(u.name) + '</h2>' +
        '<p class="muted">' + esc(TLD.ROLES[u.role]) + ' · รหัส ' + esc(u.id) + (u.dept ? ' · ' + esc(u.dept) : '') + '</p></div>' +
        '<h3>' + ic('key') + ' เปลี่ยนรหัสผ่าน</h3><form id="pForm">' + pwField('oldPassword', 'รหัสผ่านเดิม') + pwField('newPassword', 'รหัสผ่านใหม่', 'new-password') +
        pwField('newPassword2', 'ยืนยันรหัสผ่านใหม่', 'new-password') + '<button class="btn btn-primary btn-block">' + ic('save') + 'บันทึกรหัสผ่านใหม่</button></form>' +
        (!API.remote ? '<hr class="hr"><button class="btn btn-ghost btn-block" id="resetDemo">' + ic('refresh') + 'ล้างข้อมูลโหมดสาธิต</button>' : '') + '</div></div>';
      bindPw(el);
      $('#pForm').onsubmit = function (e) {
        e.preventDefault();
        var f = formData(this), btn = $('button.btn', this), form = this;
        if (f.newPassword !== f.newPassword2) return toast('รหัสผ่านใหม่ไม่ตรงกัน', 'bad');
        busy(btn, true);
        API.call('changePassword', f).then(function () { busy(btn, false); form.reset(); toast('เปลี่ยนรหัสผ่านเรียบร้อย', 'ok'); })
          .catch(function (e2) { busy(btn, false); handleErr(e2); });
      };
      var rd = $('#resetDemo');
      if (rd) rd.onclick = function () {
        if (!confirm('ล้างข้อมูลทดลองทั้งหมดในเครื่องนี้?')) return;
        API.resetDemo(); logout(true); toast('ล้างข้อมูลสาธิตแล้ว', 'ok'); loadConfig();
      };
    }
  };

  /* ===================================================================
   * การพิมพ์: เกียรติบัตร / E-Portfolio / บัตร QR / รายงานผู้บริหาร
   * =================================================================== */
  var Printer = {
    verifyUrl: function (code) { return siteBase() + '#/verify/' + encodeURIComponent(code); },
    qr: function (el, code, url) {
      if (!el) return;
      if (window.QRCode) new QRCode(el, { text: url || this.verifyUrl(code), width: 256, height: 256, correctLevel: QRCode.CorrectLevel.M });
    },
    go: function (html, orientation, after) {
      var area = $('#printArea');
      area.innerHTML = html;
      $('#pageStyle').textContent = '@page { size: A4 ' + orientation + '; margin: 0; }';
      if (after) after(area);
      document.body.classList.add('printing');
      var wait = $$('img', area).map(function (i) {
        return i.complete ? Promise.resolve() : new Promise(function (r) { i.onload = i.onerror = r; });
      });
      if (document.fonts && document.fonts.ready) wait.push(document.fonts.ready);
      var done = function () { document.body.classList.remove('printing'); window.removeEventListener('afterprint', done); };
      window.addEventListener('afterprint', done);
      Promise.all(wait).then(function () {
        setTimeout(function () { window.print(); setTimeout(done, 1500); }, 450);
      });
    },
    head: function (title, sub) {
      return '<div class="ph"><img src="assets/logo-192.png" alt=""><div><h1>' + esc(title) + '</h1><p>' + esc(TLD.COLLEGE) + '</p>' + (sub ? '<p style="color:#555">' + esc(sub) + '</p>' : '') + '</div></div>';
    },
    printCert: function (cfg, d) {
      var self = this;
      d.dateText = thDate(today(), true);
      this.go(UI.certHtml(cfg, d, 'pQr'), 'landscape', function (a) { if (cfg.showQr) self.qr($('#pQr', a), d.code); });
    },
    cert: function (sid, medalKey, btn) {
      var self = this;
      busy(btn, true);
      API.call('studentReport', { studentId: sid }).then(function (r) {
        busy(btn, false);
        var c = r.certs.filter(function (x) { return x.medal === medalKey; })[0];
        if (!c) return toast('ยังไม่ผ่านเกณฑ์เกียรติบัตรระดับนี้', 'bad');
        var s = r.student;
        self.printCert(S.cfg.cert, { name: s.name, level: s.level, dept: s.dept, medal: medalKey, code: c.code });
      }).catch(function (e) { busy(btn, false); handleErr(e); });
    },
    portfolio: function (sid, btn) {
      var self = this;
      busy(btn, true);
      API.call('studentReport', { studentId: sid }).then(function (r) {
        busy(btn, false);
        var s = r.student, m = medalInfo(s.medal), MAX = 20, cfg = S.cfg.cert;
        var rows = r.deeds.slice(-MAX);
        var html = '<div class="paper">' + self.head('ระเบียนประวัติการทำความดีและจิตอาสา', 'Good Deeds E-Portfolio · โครงการคนดีศรีท่าหลวง (ทำดีมีเกียรติ)') +
          '<div class="info"><dl class="kv"><dt>ชื่อ-สกุล</dt><dd>' + esc(s.name) + '</dd><dt>รหัสนักศึกษา</dt><dd>' + esc(s.id) + '</dd>' +
          '<dt>แผนกวิชา</dt><dd>' + esc(s.dept) + '</dd><dt>ระดับชั้น</dt><dd>' + esc(s.level) + '</dd><dt>ครูที่ปรึกษา</dt><dd>' + esc(s.advisorName || '-') + '</dd></dl>' +
          '<div class="center"><div class="qrbox" id="pQr"></div><div style="font-size:8pt">' + esc(r.portfolioCode) + '</div></div></div>' +
          '<div class="sum"><div><b>' + r.deeds.length + '</b>รายการความดี</div><div><b>' + s.points + '</b>แต้มสะสม</div><div><b>' + (m ? esc(m.name) : '-') + '</b>ระดับเกียรติบัตร</div></div>' +
          '<h2>รายการการทำความดีที่ได้รับการรับรอง</h2><table><thead><tr><th style="width:8%">ลำดับ</th><th style="width:15%">วันที่</th><th style="width:20%">หมวดหมู่</th><th>รายละเอียด</th><th style="width:7%">แต้ม</th><th style="width:17%">ผู้รับรอง</th></tr></thead><tbody>' +
          rows.map(function (d, i) {
            var t = String(d.detail || ''); if (t.length > 100) t = t.slice(0, 98) + '…';
            return '<tr><td>' + (r.deeds.length - rows.length + i + 1) + '</td><td>' + thDate(d.date) + '</td><td>' + esc(cat(d.category).short) + '</td><td>' + esc(t) + '</td><td>' + d.points + '</td><td>' + esc(d.recordedByName || d.reviewedBy || '-') + '</td></tr>';
          }).join('') + '</tbody></table>' +
          (r.deeds.length > MAX ? '<p style="font-size:9pt;color:#555">* แสดง ' + MAX + ' รายการล่าสุด จากทั้งหมด ' + r.deeds.length + ' รายการ</p>' : '') +
          '<div class="p-sign">' + (cfg.signature ? '<img src="' + esc(cfg.signature) + '" alt="" referrerpolicy="no-referrer">' : '<div style="height:14mm"></div>') +
          '<div class="sig-line"></div>(' + esc(cfg.directorName || '.......................................') + ')<br>' + esc(cfg.directorTitle) + '</div>' +
          '<div class="foot"><span>ออกโดยระบบคนดีศรีท่าหลวง เมื่อ ' + thDate(today(), true) + '</span><span>ตรวจสอบความถูกต้องได้โดยสแกน QR Code</span></div></div>';
        self.go(html, 'portrait', function (a) { self.qr($('#pQr', a), r.portfolioCode); });
      }).catch(function (e) { busy(btn, false); handleErr(e); });
    },
    qrCards: function (list) {
      var self = this, per = 10, pages = [];
      for (var i = 0; i < list.length; i += per) pages.push(list.slice(i, i + per));
      var html = pages.map(function (pg, pi) {
        return '<div class="card-page">' + pg.map(function (q, j) {
          return '<div class="idc"><div class="idc-h"><img src="assets/logo-192.png" alt=""><div><b>คนดีศรีท่าหลวง</b><span>' + esc(TLD.COLLEGE) + '</span></div></div>' +
            '<div class="idc-b"><div class="idc-info"><div class="idc-name">' + esc(q.name) + '</div><div>รหัส <b>' + esc(q.id) + '</b></div><div>' + esc(q.dept) + '</div><div>' + esc(q.level) + '</div>' +
            '<div class="idc-hint">สแกนเพื่อเข้าสู่ระบบ</div></div><div class="qrbox" id="qc_' + pi + '_' + j + '"></div></div></div>';
        }).join('') + '</div>';
      }).join('');
      this.go(html, 'portrait', function (a) {
        pages.forEach(function (pg, pi) { pg.forEach(function (q, j) { self.qr($('#qc_' + pi + '_' + j, a), null, qrLoginUrl(q)); }); });
      });
    },
    adminReport: function (s, list) {
      var k = s.kpi;
      var html = '<div class="paper">' + this.head('รายงานสรุปผลโครงการคนดีศรีท่าหลวง (ทำดีมีเกียรติ)', 'ข้อมูล ณ วันที่ ' + thDate(today(), true)) +
        '<div class="sum"><div><b>' + k.total + '</b>ความดีทั้งหมด</div><div><b>' + k.approved + '</b>อนุมัติแล้ว</div><div><b>' + k.participants + '</b>นักศึกษาเข้าร่วม</div><div><b>' + k.certs.total + '</b>เกียรติบัตร</div></div>' +
        '<p>เกียรติบัตร: เหรียญทอง ' + k.certs.gold + ' · เหรียญเงิน ' + k.certs.silver + ' · เหรียญทองแดง ' + k.certs.bronze + ' | รอตรวจสอบ ' + k.pending + ' · ส่งกลับแก้ไข ' + k.returned + '</p>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm"><div><h2>แยกตามแผนกวิชา</h2><table><thead><tr><th>แผนกวิชา</th><th>ครั้ง</th><th>แต้ม</th></tr></thead><tbody>' +
        Object.keys(s.dept).map(function (d) { return '<tr><td>' + esc(d) + '</td><td>' + s.dept[d].count + '</td><td>' + s.dept[d].points + '</td></tr>'; }).join('') +
        '</tbody></table></div><div><h2>แยกตามหมวดหมู่</h2><table><thead><tr><th>หมวดหมู่</th><th>ครั้ง</th><th>แต้ม</th></tr></thead><tbody>' +
        TLD.CATEGORIES.map(function (c) { return '<tr><td>' + esc(c.short) + '</td><td>' + s.cat[c.id].count + '</td><td>' + s.cat[c.id].points + '</td></tr>'; }).join('') +
        '</tbody></table></div></div><h2>รายการตามตัวกรอง (' + list.length + ' รายการ' + (list.length > 25 ? ', แสดง 25 รายการแรก' : '') + ')</h2>' +
        '<table><thead><tr><th>วันที่</th><th>นักศึกษา</th><th>แผนก</th><th>หมวดหมู่</th><th>แต้ม</th><th>สถานะ</th></tr></thead><tbody>' +
        list.slice(0, 25).map(function (d) { return '<tr><td>' + thDate(d.date) + '</td><td>' + esc(d.studentName) + '</td><td>' + esc(d.dept) + '</td><td>' + esc(cat(d.category).short) + '</td><td>' + d.points + '</td><td>' + esc(TLD.STATUS[d.status]) + '</td></tr>'; }).join('') +
        '</tbody></table><div class="foot"><span>ระบบคนดีศรีท่าหลวง · ' + esc(TLD.COLLEGE) + '</span><span>ลงชื่อ ........................................ ผู้รายงาน</span></div></div>';
      this.go(html, 'portrait');
    }
  };

  /* ---------------- Router ---------------- */
  var routes = { '': Home, verify: Verify, login: Login, q: QrLogin, register: Register, student: Student, teacher: Teacher, admin: Admin, account: Account };
  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var name = routes.hasOwnProperty(parts[0]) ? parts[0] : '';
    var V = routes[name];
    if (V.roles) {
      if (!S.user) { toast('กรุณาเข้าสู่ระบบก่อน'); location.hash = '#/login'; return; }
      if (V.roles.indexOf(S.user.role) < 0) { location.hash = homeOf(S.user.role); return; }
    }
    closeMenu();
    renderNav(name);
    S.view = V;
    var el = $('#app');
    el.innerHTML = '';
    V.render(el, parts.slice(1));
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', route);

  /* ---------------- Real-time sync ---------------- */
  var polling = false;
  function setLive(ok) {
    var l = $('#live');
    l.classList.toggle('off', !ok);
    l.title = ok ? 'เชื่อมต่อแล้ว อัปเดตล่าสุด ' + new Date().toLocaleTimeString('th-TH') : 'ขาดการเชื่อมต่อ';
    $('span', l).textContent = ok ? 'เรียลไทม์' : 'ออฟไลน์';
  }
  function poll() {
    if (document.hidden || polling) return;
    polling = true;
    API.call('version').then(function (r) {
      setLive(true);
      if (S.version && r.version !== S.version) {
        loadConfig().then(function () { if (S.view && S.view.refresh) S.view.refresh(); });
      }
      S.version = r.version;
    }).catch(function () { setLive(false); }).then(function () { polling = false; });
  }
  setInterval(poll, Math.max(5, CONFIG.REFRESH_SECONDS || 10) * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) poll(); });
  window.addEventListener('online', poll);
  window.addEventListener('offline', function () { setLive(false); });

  /* ---------------- Boot ---------------- */
  loadSession();
  $('#menuBtn').innerHTML = ic('menu');
  if (!API.remote) {
    $('#demoBar').innerHTML = ic('flask') + ' <b>โหมดสาธิต</b> — ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น (ยังไม่ได้เชื่อม Google Sheets)';
  }
  if (S.user) {
    API.call('me').then(function (u) { S.user = u; saveSession(API.token, u); renderNav(location.hash.replace(/^#\/?/, '').split('/')[0]); })
      .catch(function (e) { if (/เข้าสู่ระบบ|เซสชัน|ระงับ|ไม่พบบัญชี/.test(e.message)) logout(true); });
  }
  loadConfig().then(function () { route(); poll(); });
})();
