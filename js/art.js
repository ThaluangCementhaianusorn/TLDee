/* =====================================================================
 * art.js — ไอคอนภาพแบบสมจริง (3D / ไล่เฉด / แสงเงา) สำหรับหมวดหมู่ความดีและการ์ดสถิติ
 * ใช้: UI.art('trophy')  — ถ้าไม่มีภาพ จะใช้ไอคอนเส้นแทน
 * ===================================================================== */
(function () {
  'use strict';

  function lin(id, stops, x2, y2) {
    return '<linearGradient id="' + id + '" x1="0" y1="0" x2="' + (x2 || 0) + '" y2="' + (y2 === undefined ? 1 : y2) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</linearGradient>';
  }
  function rad(id, stops, cx, cy, r) {
    return '<radialGradient id="' + id + '" cx="' + (cx || .5) + '" cy="' + (cy || .5) + '" r="' + (r || .5) + '">' +
      stops.map(function (s) { return '<stop offset="' + s[0] + '" stop-color="' + s[1] + '"' + (s[2] !== undefined ? ' stop-opacity="' + s[2] + '"' : '') + '/>'; }).join('') + '</radialGradient>';
  }

  var DEFS =
    lin('aGoldV', [[0, '#FFF3C2'], [.35, '#F6CC56'], [.7, '#D79A1C'], [1, '#8F5E07']]) +
    lin('aGoldH', [[0, '#8F5E07'], [.22, '#E0A92B'], [.42, '#FFF4C4'], [.6, '#F2C14E'], [.85, '#B97F0E'], [1, '#7A4F05']], 1, 0) +
    lin('aWood', [[0, '#A8323A'], [1, '#4E0F13']]) +
    lin('aRedH', [[0, '#C0202E'], [.5, '#8B1E24'], [1, '#5C0E14']], 1, 0) +
    lin('aNavyH', [[0, '#2C4A9A'], [.5, '#14244B'], [1, '#0B1530']], 1, 0) +
    rad('aRed', [[0, '#FF9A9A'], [.45, '#E8343F'], [1, '#97101C']], .35, .3, .75) +
    lin('aLeaf', [[0, '#C6EE7A'], [.5, '#5DB534'], [1, '#2C7A1C']], 1, 1) +
    lin('aLeaf2', [[0, '#9BDB55'], [.55, '#43A02A'], [1, '#1F6315']], 0, 1) +
    lin('aSoil', [[0, '#9A6634'], [1, '#4E3016']]) +
    rad('aWater', [[0, '#E6F7FF'], [.5, '#6EC3F5'], [1, '#1F78C8']], .35, .35, .7) +
    rad('aGreenB', [[0, '#8EF0BC'], [.5, '#22A862'], [1, '#0D6337']], .35, .3, .75) +
    rad('aNavyS', [[0, '#9DB2EE'], [.5, '#2E4C9E'], [1, '#14244B']], .35, .3, .75) +
    rad('aMaroonS', [[0, '#F29A9F'], [.5, '#B12E37'], [1, '#6B1218']], .35, .3, .75) +
    rad('aGoldS', [[0, '#FFF7D1'], [.45, '#F3C247'], [1, '#A06C08']], .38, .32, .7) +
    lin('aBlueSh', [[0, '#6A9BEA'], [.5, '#2A55B3'], [1, '#14244B']]) +
    lin('aWarn', [[0, '#FFB067'], [.5, '#F0682C'], [1, '#B8321A']]) +
    lin('aPaper', [[0, '#FFFFFF'], [1, '#E6EAF2']]) +
    lin('aCream', [[0, '#FFFDF5'], [1, '#EDE3CB']]) +
    lin('aShine', [[0, '#FFFFFF', .75], [1, '#FFFFFF', 0]]) +
    rad('aShadow', [[0, '#14244B', .35], [1, '#14244B', 0]]);

  var SH = function (cx, cy, rx) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="3.2" fill="url(#aShadow)"/>'; };
  var STAR5 = function (cx, cy, R, r) {
    var p = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      p.push((cx + rr * Math.cos(a)).toFixed(2) + ',' + (cy + rr * Math.sin(a)).toFixed(2));
    }
    return p.join(' ');
  };

  var A = {
    // สร้างชื่อเสียง — ถ้วยรางวัลทองคำ
    trophy: SH(32, 59, 17) +
      '<path d="M19 15C8 15 8 31 22 31" fill="none" stroke="url(#aGoldV)" stroke-width="4.2" stroke-linecap="round"/>' +
      '<path d="M45 15C56 15 56 31 42 31" fill="none" stroke="url(#aGoldV)" stroke-width="4.2" stroke-linecap="round"/>' +
      '<path d="M16.5 9h31v8.5C47.5 29 40.5 36 32 36S16.5 29 16.5 17.5z" fill="url(#aGoldH)"/>' +
      '<ellipse cx="32" cy="9" rx="15.5" ry="3.2" fill="#FFF0B3" stroke="#C48A12" stroke-width="1"/>' +
      '<ellipse cx="32" cy="9.4" rx="12.5" ry="2" fill="#B57E0F" opacity=".55"/>' +
      '<polygon points="' + STAR5(32, 21, 6.2, 2.6) + '" fill="#FFF7D6" opacity=".92"/>' +
      '<path d="M21 13c.2 8 2.3 14 6.5 18.5C21.5 29 19.5 22 19.5 13z" fill="#fff" opacity=".45"/>' +
      '<path d="M28.5 35.5h7l-.8 7h-5.4z" fill="url(#aGoldH)"/>' +
      '<ellipse cx="32" cy="43" rx="8.5" ry="2.6" fill="url(#aGoldV)"/>' +
      '<path d="M20 46.5h24l2.5 9.5h-29z" fill="url(#aWood)"/>' +
      '<path d="M20 46.5h24l.5 2h-25z" fill="#fff" opacity=".2"/>' +
      '<rect x="26" y="49.5" width="12" height="3.6" rx="1" fill="url(#aGoldH)"/>',

    // ซื่อสัตย์ — อัญมณีเจียระไน
    gem: SH(32, 59, 15) +
      '<polygon points="22,10 32,10 27,22" fill="#CDEEFF"/><polygon points="32,10 42,10 37,22" fill="#9AD6FF"/>' +
      '<polygon points="13,22 22,10 27,22" fill="#7CC4F5"/><polygon points="27,22 32,10 37,22" fill="#EEF9FF"/>' +
      '<polygon points="37,22 42,10 51,22" fill="#4FA3E8"/>' +
      '<polygon points="13,22 27,22 32,55" fill="#3E8FD8"/><polygon points="27,22 37,22 32,55" fill="#78BEF2"/>' +
      '<polygon points="37,22 51,22 32,55" fill="#1D5FA8"/>' +
      '<polygon points="13,22 22,10 42,10 51,22 32,55" fill="none" stroke="#0E3D7A" stroke-width="1.1" stroke-linejoin="round" opacity=".55"/>' +
      '<path d="M22 22h-5l9 14z" fill="#fff" opacity=".35"/>' +
      '<polygon points="' + STAR5(49, 9, 5, 1.2) + '" fill="#fff"/><polygon points="' + STAR5(15, 13, 3, .8) + '" fill="#fff" opacity=".8"/>',

    // จิตอาสา — ต้นกล้าในมือ (ต้นอ่อนบนดิน)
    sprout: SH(32, 59, 21) +
      '<path d="M9 50c6-7 40-7 46 0v3c-6 6-40 6-46 0z" fill="url(#aSoil)"/>' +
      '<path d="M12 49.5c8-5 32-5 40 0" fill="none" stroke="#C08A52" stroke-width="1.4" opacity=".7"/>' +
      '<path d="M32 49c0-7-1.2-13 0-23" fill="none" stroke="#3E8E2A" stroke-width="3.2" stroke-linecap="round"/>' +
      '<path d="M32 36C21 38 11 31 9 18c12-2.5 21 4 23 18z" fill="url(#aLeaf)"/>' +
      '<path d="M31 35C25 30 18 25 11 20" fill="none" stroke="#EAF8C9" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>' +
      '<path d="M32 28c3.5-12 13.5-18.5 24-16.5C55 24 45 31 32 28z" fill="url(#aLeaf2)"/>' +
      '<path d="M33 27c6-5 13-10 21-14" fill="none" stroke="#DDF5B5" stroke-width="1.2" opacity=".8" stroke-linecap="round"/>' +
      '<path d="M13 21c3 6 8 10 14 12" fill="none" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/>' +
      '<path d="M48 36c0 0-4 5-4 7.5a4 4 0 0 0 8 0C52 41 48 36 48 36z" fill="url(#aWater)"/>' +
      '<ellipse cx="46.6" cy="42" rx="1.1" ry="1.6" fill="#fff" opacity=".85"/>',

    // กตัญญู/ช่วยเหลือ — หัวใจแก้วสีแดง
    heart: SH(32, 59, 17) +
      '<path d="M32 55C14 43 6 34 6 23 6 15 12 9 19.5 9 25 9 29.5 12 32 17 34.5 12 39 9 44.5 9 52 9 58 15 58 23 58 34 50 43 32 55z" fill="url(#aRed)"/>' +
      '<path d="M32 55C14 43 6 34 6 23" fill="none" stroke="#6B0A14" stroke-width="1" opacity=".35"/>' +
      '<ellipse cx="18.5" cy="19.5" rx="7" ry="4.2" transform="rotate(-32 18.5 19.5)" fill="url(#aShine)"/>' +
      '<circle cx="45" cy="17" r="2" fill="#fff" opacity=".55"/>' +
      '<path d="M44 44c5-4 9-9 11-14" fill="none" stroke="#fff" stroke-width="1.6" opacity=".25" stroke-linecap="round"/>',

    // วินัย/สิ่งแวดล้อม — ใบไม้กับหยดน้ำ
    leaf: SH(32, 59, 18) +
      '<path d="M11 53C11 27 29 9 55 9c0 26-17 44-44 44z" fill="url(#aLeaf)"/>' +
      '<path d="M11 53C11 27 29 9 55 9" fill="none" stroke="#2C7A1C" stroke-width="1" opacity=".5"/>' +
      '<path d="M12 52L49 15" fill="none" stroke="#F2FBDF" stroke-width="2" stroke-linecap="round" opacity=".85"/>' +
      '<path d="M22 42l-3-11M29 35l-2-12M36 28l-1-10M24 40l11 2M31 33l11 2M38 26l9 1" fill="none" stroke="#E4F6C4" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>' +
      '<path d="M17 40C19 28 27 18 40 13" fill="none" stroke="#fff" stroke-width="2.4" opacity=".3" stroke-linecap="round"/>' +
      '<path d="M48 38s-5 6-5 9.2a5 5 0 0 0 10 0C53 44 48 38 48 38z" fill="url(#aWater)"/>' +
      '<ellipse cx="46.3" cy="46" rx="1.3" ry="2" fill="#fff" opacity=".85"/>',

    // ผ่านการรับรอง — เหรียญเช็กสีเขียว
    check: SH(32, 59, 16) +
      '<circle cx="32" cy="30" r="23" fill="url(#aGreenB)"/>' +
      '<circle cx="32" cy="30" r="18.5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".4"/>' +
      '<path d="M21.5 30.5l7 7 14-15" fill="none" stroke="#0A4D2A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity=".25" transform="translate(0 1.5)"/>' +
      '<path d="M21.5 30.5l7 7 14-15" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<ellipse cx="26" cy="15" rx="11" ry="5" fill="url(#aShine)" opacity=".7"/>',

    // แต้มสะสม — ดาวทองคำ
    star: SH(32, 59, 16) +
      '<polygon points="' + STAR5(32, 31, 26, 11) + '" fill="url(#aGoldV)" stroke="#A8740F" stroke-width="1.2" stroke-linejoin="round"/>' +
      '<polygon points="32,5 32,31 42.5,26.6" fill="#fff" opacity=".28"/>' +
      '<polygon points="32,31 47.3,52 41.7,37" fill="#7A4F05" opacity=".22"/>' +
      '<polygon points="32,31 16.7,52 32,43.5" fill="#7A4F05" opacity=".12"/>' +
      '<polygon points="32,31 6.7,22.9 22.3,37" fill="#fff" opacity=".18"/>' +
      '<polygon points="' + STAR5(44, 13, 3.4, 1) + '" fill="#fff"/>',

    // ผู้เข้าร่วม — กลุ่มคน
    users: SH(30, 59, 22) +
      '<circle cx="43" cy="20" r="8.5" fill="url(#aMaroonS)"/>' +
      '<path d="M28 50c0-11 6.5-17 15-17s15 6 15 17z" fill="url(#aRedH)"/>' +
      '<circle cx="24" cy="23" r="10.5" fill="url(#aNavyS)"/>' +
      '<path d="M6 56c0-13 8-20 18-20s18 7 18 20z" fill="url(#aNavyH)"/>' +
      '<path d="M10 52c1-7 5-11.5 10-13" fill="none" stroke="#fff" stroke-width="2" opacity=".25" stroke-linecap="round"/>' +
      '<ellipse cx="20.5" cy="18.5" rx="4" ry="2.6" fill="#fff" opacity=".4"/>',

    user: SH(32, 59, 18) +
      '<circle cx="32" cy="21" r="12" fill="url(#aNavyS)"/>' +
      '<path d="M12 56c0-14 9-21 20-21s20 7 20 21z" fill="url(#aNavyH)"/>' +
      '<ellipse cx="27.5" cy="15.5" rx="4.6" ry="3" fill="#fff" opacity=".4"/>',

    // เกียรติบัตร — เหรียญทองริบบิ้น
    award: SH(32, 60, 14) +
      '<path d="M18 3h11l6 18H24z" fill="url(#aRedH)"/><path d="M46 3H35l-6 18h11z" fill="url(#aNavyH)"/>' +
      '<circle cx="32" cy="38" r="19" fill="#9A6508"/><circle cx="32" cy="38" r="17" fill="url(#aGoldS)"/>' +
      '<circle cx="32" cy="38" r="12.5" fill="none" stroke="#FFF4C4" stroke-width="1.3" opacity=".7"/>' +
      '<polygon points="' + STAR5(32, 38.5, 9, 3.8) + '" fill="#FFF7D6" stroke="#B57E0F" stroke-width=".8"/>' +
      '<ellipse cx="25" cy="29" rx="6" ry="3.4" transform="rotate(-30 25 29)" fill="url(#aShine)" opacity=".7"/>',

    // รายการ — คลิปบอร์ด
    list: SH(32, 60, 17) +
      '<rect x="12" y="8" width="40" height="50" rx="5" fill="url(#aNavyH)"/>' +
      '<rect x="16" y="13" width="32" height="41" rx="2.5" fill="url(#aPaper)"/>' +
      '<path d="M24 5h16a2 2 0 0 1 2 2v6H22V7a2 2 0 0 1 2-2z" fill="url(#aGoldV)" stroke="#A8740F" stroke-width=".8"/>' +
      '<circle cx="21.5" cy="24" r="2.2" fill="#22A862"/><circle cx="21.5" cy="33" r="2.2" fill="#22A862"/><circle cx="21.5" cy="42" r="2.2" fill="#D99B26"/>' +
      '<path d="M27 24h15M27 33h15M27 42h11" stroke="#9AA6BD" stroke-width="2.6" stroke-linecap="round"/>',

    // ตรวจสอบ — โล่ป้องกัน
    shield: SH(32, 60, 16) +
      '<path d="M32 3 9 11v16c0 14 10 25 23 30 13-5 23-16 23-30V11z" fill="url(#aGoldV)"/>' +
      '<path d="M32 7 13 13.7V27c0 11.7 8.2 21 19 25.5C42.8 48 51 38.7 51 27V13.7z" fill="url(#aBlueSh)"/>' +
      '<path d="M32 7v45.5C21.2 48 13 38.7 13 27V13.7z" fill="#fff" opacity=".12"/>' +
      '<path d="M22.5 29l6.5 6.5L42 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',

    alert: SH(32, 59, 18) +
      '<path d="M28.2 8.5a4.4 4.4 0 0 1 7.6 0l21 36.5A4.4 4.4 0 0 1 53 51.6H11a4.4 4.4 0 0 1-3.8-6.6z" fill="url(#aWarn)"/>' +
      '<path d="M32 21v14" stroke="#fff" stroke-width="5.5" stroke-linecap="round"/><circle cx="32" cy="43.5" r="3.2" fill="#fff"/>' +
      '<path d="M27 13 14 36" stroke="#fff" stroke-width="2" opacity=".3" stroke-linecap="round"/>',

    // E-Portfolio — หนังสือ
    book: SH(32, 59, 22) +
      '<path d="M6 14c9-3 18-2 26 3 8-5 17-6 26-3v38c-9-3-18-2-26 3-8-5-17-6-26-3z" fill="url(#aRedH)"/>' +
      '<path d="M9 12c8-2.5 16-1.5 23 3v36c-7-4.5-15-5.5-23-3z" fill="url(#aCream)"/>' +
      '<path d="M55 12c-8-2.5-16-1.5-23 3v36c7-4.5 15-5.5 23-3z" fill="url(#aPaper)"/>' +
      '<path d="M14 21c4-1 9-.5 13 1.5M14 28c4-1 9-.5 13 1.5M14 35c4-1 9-.5 13 1.5M37 22.5c4-2 9-2.5 13-1.5M37 29.5c4-2 9-2.5 13-1.5" stroke="#B9AE93" stroke-width="1.6" stroke-linecap="round" fill="none"/>' +
      '<path d="M43 12.5v14l3-2.4 3 2.4V12" fill="#D99B26"/>'
  };

  function art(name, cls) {
    if (!A[name]) return UI.ic(name, cls);
    return '<svg class="art ' + (cls || '') + '" viewBox="0 0 64 64" aria-hidden="true">' + A[name] + '</svg>';
  }

  // ใส่ gradient ไว้ที่เดียว (ทุกไอคอนอ้างอิงร่วมกัน)
  function inject() {
    if (document.getElementById('artDefs')) return;
    var d = document.createElement('div');
    d.innerHTML = '<svg id="artDefs" width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true" focusable="false"><defs>' + DEFS + '</defs></svg>';
    document.body.insertBefore(d.firstChild, document.body.firstChild);
  }
  if (document.body) inject(); else document.addEventListener('DOMContentLoaded', inject);

  UI.art = art;
  UI.hasArt = function (n) { return !!A[n]; };
})();
