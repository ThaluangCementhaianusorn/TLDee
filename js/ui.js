/* =====================================================================
 * ui.js — ไอคอน SVG, เหรียญรางวัล, ตราประทับ และแม่แบบเกียรติบัตร
 * ===================================================================== */
(function () {
  'use strict';

  /* ---------------- ไอคอนเส้น (Line icons) ---------------- */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>',
    shield: '<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z"/><path d="m13.5 6.5 4 4"/>',
    award: '<circle cx="12" cy="9" r="6"/><path d="M8.5 14 7 22l5-3 5 3-1.5-8"/>',
    chart: '<path d="M4 20V11M10 20V5M16 20v-6M21 20H3"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14c2.2.6 3.5 2.8 3.5 6"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/>',
    login: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4"/><path d="M12 13v4M9 21h6M10 17h4l.5 4h-5z"/>',
    gem: '<path d="M6 3h12l3 6-9 12L3 9l3-6z"/><path d="M3 9h18M12 21 8 9l4-6 4 6-4 12"/>',
    sprout: '<path d="M12 21v-9"/><path d="M12 12c0-4-3-7-8-7 0 4 3 7 8 7z"/><path d="M12 10c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z"/>',
    heart: '<path d="M12 20s-8-4.7-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 15.3 12 20 12 20z"/>',
    leaf: '<path d="M20 4C10 4 4 9 4 15c0 2 .7 3.5 1.5 4.5"/><path d="M20 4c0 9-5 15-12 15-1 0-1.8-.2-2.5-.5"/><path d="M4 20c3-5 7-8 11-10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>',
    upload: '<path d="M12 16V5M7 10l5-5 5 5M4 20h16"/>',
    printer: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    camera: '<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20v.01M17 17h4v4h-4z"/>',
    scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16"/>',
    settings: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2V5z"/><path d="M4 19a2 2 0 0 0 2 2h14v-3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    save: '<path d="M5 3h11l5 5v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M7 3v5h8M7 21v-7h10v7"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/>',
    sheet: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8l-5-5z"/><path d="M14 3v5h5M8 12h8M8 16h8M12 12v8"/>',
    sparkles: '<path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8L12 3z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>',
    alert: '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17v.01"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/><path d="M10 11v6M14 11v6"/>',
    sign: '<path d="M3 17c3-3 5-1 4 1s2 2 4-1 3-3 4-1 2 1 3 0"/><path d="M3 21h18"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 2-1.5H17a4 4 0 0 0 4-4C21 6.8 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
    arrowLeft: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    inbox: '<path d="M3 13h5l1.5 3h5L16 13h5"/><path d="M5 5h14l2 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6l2-8z"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1 1 0 0 0 .9 1.5h13.2a1 1 0 0 0 .9-1.5L14 9V3"/><path d="M7 15h10"/>',
    idcard: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.8 16c.6-1.5 1.8-2.3 3.2-2.3s2.6.8 3.2 2.3M15 10h3M15 13h3"/>',
    grad: '<path d="M2 9l10-5 10 5-10 5L2 9z"/><path d="M6 11v5c2 2 10 2 12 0v-5M22 9v6"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/>'
  };
  function ic(name, cls) {
    return '<svg class="ic ' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (P[name] || P.star) + '</svg>';
  }

  /* ---------------- เหรียญรางวัล ---------------- */
  var MC = {
    bronze: { base: '#C27B47', dark: '#8A4F25', light: '#FFF1E2' },
    silver: { base: '#98A3B1', dark: '#626D7C', light: '#FFFFFF' },
    gold:   { base: '#E2B13C', dark: '#A8740F', light: '#FFF8E1' },
    none:   { base: '#D3D7DE', dark: '#B4BAC4', light: '#FFFFFF' }
  };
  var STAR = 'M24 27L25.76 31.57L30.66 31.84L26.85 34.93L28.11 39.66L24 37L19.89 39.66L21.15 34.93L17.34 31.84L22.24 31.57Z';
  function medalSvg(key, cls) {
    var c = MC[key] || MC.none;
    return '<svg class="medal ' + (cls || '') + '" viewBox="0 0 48 56" aria-hidden="true">' +
      '<path d="M13 1h9l6 15h-9z" fill="' + (key ? '#8B1E24' : '#C9CED6') + '"/><path d="M35 1h-9l-6 15h9z" fill="' + (key ? '#14244B' : '#B9BFC8') + '"/>' +
      '<circle cx="24" cy="34" r="19" fill="' + c.dark + '"/><circle cx="24" cy="34" r="16.5" fill="' + c.base + '"/>' +
      '<circle cx="24" cy="34" r="12.5" fill="none" stroke="' + c.light + '" stroke-opacity=".55" stroke-width="1.2"/>' +
      '<path d="' + STAR + '" transform="translate(24 34) scale(1.25) translate(-24 -34)" fill="' + c.light + '"/>' +
      '<path d="M12 27a14 14 0 0 1 10-8" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
  }

  // ตราประทับเหรียญบนเกียรติบัตร
  var sealN = 0;
  function sealSvg(key) {
    var c = MC[key] || MC.gold, m = TLD.medalByKey(key), uid = 'seal' + (++sealN) + Date.now().toString(36);
    var pts = [];
    for (var i = 0; i < 64; i++) {
      var a = Math.PI * 2 * i / 64 - Math.PI / 2, r = i % 2 ? 72 : 80;
      pts.push((100 + r * Math.cos(a)).toFixed(1) + ',' + (100 + r * Math.sin(a)).toFixed(1));
    }
    var short = m ? m.name.replace('เหรียญ', '') : '';
    return '<svg viewBox="0 0 200 252" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<path d="M70 150 46 246l27-18 16 22 17-94z" fill="#8B1E24"/><path d="M130 150l24 96-27-18-16 22-17-94z" fill="#14244B"/>' +
      '<path d="M70 150 46 246l27-18" fill="none" stroke="#D99B26" stroke-width="2"/><path d="M130 150l24 96-27-18" fill="none" stroke="#D99B26" stroke-width="2"/>' +
      '<polygon points="' + pts.join(' ') + '" fill="' + c.base + '"/>' +
      '<circle cx="100" cy="100" r="67" fill="' + c.dark + '"/><circle cx="100" cy="100" r="62" fill="' + c.base + '"/>' +
      '<circle cx="100" cy="100" r="41" fill="none" stroke="' + c.light + '" stroke-width="1.6"/>' +
      '<defs><path id="' + uid + '" d="M100,100 m-51,0 a51,51 0 1,1 102,0 a51,51 0 1,1 -102,0"/></defs>' +
      '<text font-family="Kanit,sans-serif" font-size="11" font-weight="600" fill="' + c.light + '">' +
      '<textPath href="#' + uid + '" textLength="316" lengthAdjust="spacing">' + esc(sealText()) + '</textPath></text>' +
      '<path d="' + STAR + '" transform="translate(100 86) scale(2.5) translate(-24 -34)" fill="' + c.light + '"/>' +
      '<text x="100" y="127" text-anchor="middle" font-family="Kanit,sans-serif" font-size="19" font-weight="700" fill="' + c.light + '">' + short + '</text>' +
      '<path d="M52 72a58 58 0 0 1 40-30" stroke="#fff" stroke-opacity=".35" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  }

  function corner(pos) {
    return '<svg class="corner ' + pos + '" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-linecap="round">' +
      '<path d="M4 96V34C4 17 17 4 34 4h62" stroke-width="2.6"/><path d="M13 96V38c0-14 11-25 25-25h58" stroke-width="1"/>' +
      '<path d="M22 60c0-22 16-38 38-38" stroke-width="1"/><path d="M30 30c8 4 12 10 12 18-8 0-14-4-18-12M30 30c4 8 4 16-2 22M30 30c8-4 16-4 22 2" stroke-width="1.4"/>' +
      '</g><circle cx="30" cy="30" r="4" fill="currentColor"/><circle cx="96" cy="4" r="2.5" fill="currentColor"/><circle cx="4" cy="96" r="2.5" fill="currentColor"/></svg>';
  }

  /* ---------------- เกียรติบัตร ---------------- */
  function esc(v) {
    return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fill(t, d) {
    return esc(t).replace(/\{(\w+)\}/g, function (m, k) { return d[k] !== undefined ? '<b>' + esc(d[k]) + '</b>' : m; });
  }
  // cfg = การตั้งค่าเกียรติบัตร, d = {name, level, dept, medal(key), code, dateText}
  function certHtml(cfg, d, qrId) {
    var m = TLD.medalByKey(d.medal) || TLD.MEDALS[0];
    var dir = cfg.directorName || (window.CONFIG && CONFIG.DIRECTOR_NAME) || '';
    var vars = { name: d.name, level: d.level, dept: d.dept, medal: m.full, min: m.min, title: m.title, year: d.year || (TLD.YEAR && TLD.YEAR.current) || '' };
    var corners = cfg.template === 'modern' || cfg.template === 'thai' ? '' : corner('tl') + corner('tr') + corner('bl') + corner('br');
    return '<div class="cert t-' + esc(cfg.template) + ' m-' + m.key + '">' + corners +
      '<img class="wm" src="' + esc(logo(true)) + '" alt="" referrerpolicy="no-referrer">' +
      '<div class="cert-in">' +
      '<img class="logo" src="' + esc(logo(true)) + '" alt="" referrerpolicy="no-referrer">' +
      '<div class="college">' + esc(TLD.COLLEGE) + '</div>' +
      '<div class="ctitle">' + esc(cfg.title) + '</div>' +
      '<div class="csub">' + esc(cfg.subtitle) + '</div>' +
      '<div class="cintro">' + esc(cfg.intro) + '</div>' +
      '<div class="cname">' + esc(d.name) + '</div>' +
      '<div class="cbody">' + fill(cfg.body, vars) + '</div>' +
      '<div class="cach">' + fill(cfg.achievement, vars) + '</div>' +
      '<div class="creason">' + fill(cfg.reason, vars) + '</div>' +
      '<div class="cbless">' + esc(cfg.blessing) + '</div>' +
      '<div class="cdate">' + (vars.year ? 'ประจำปีการศึกษา ' + esc(vars.year) + ' · ' : '') + 'ให้ไว้ ณ วันที่ ' + esc(d.dateText) + '</div>' +
      '<div class="sigs"><div class="sig">' +
      (cfg.signature ? '<img class="sig-img" src="' + esc(cfg.signature) + '" alt="ลายมือชื่อ" referrerpolicy="no-referrer">' : '<div class="sig-space"></div>') +
      '<div class="sig-line"></div><div class="sig-name">(' + esc(dir || '.......................................................') + ')</div>' +
      '<div class="sig-title">' + esc(cfg.directorTitle) + '</div></div></div>' +
      '</div><div class="seal">' + sealSvg(m.key) + '</div>' +
      (cfg.showQr && d.code ? '<div class="qr"><div class="qrbox" id="' + qrId + '"></div><div class="qrcode-txt">' + esc(d.code) + '</div><div>สแกนตรวจสอบเอกสาร</div></div>' : '') +
      '</div>';
  }

  // โลโก้สถานศึกษา (อัปโหลดได้ในหน้าตั้งค่า) / ข้อความรอบตราประทับ
  function logo(big) { return (TLD.BRAND && TLD.BRAND.logo) || (big ? 'assets/logo-512.png' : 'assets/logo-192.png'); }
  function sealText() { var b = TLD.BRAND || {}; return '★ ' + (b.appName || '') + ' ★ ' + (b.slogan || '') + ' ★ ' + (b.appName || '') + ' ★ ' + (b.slogan || ''); }
  window.UI = { logo: logo, ic: ic, medalSvg: medalSvg, sealSvg: sealSvg, certHtml: certHtml, esc: esc, MC: MC };
})();
