/* =========================================================
 *  ARKIB KEPUTUSAN — Sistem Skor Silat Tanding
 *  Simpan rekod keputusan setiap perlawanan ke Google Sheets.
 *  Skor langsung kekal di Firebase; fail ini hanya untuk arkib.
 *
 *  Cara pasang: lihat PANDUAN-ARKIB.md dalam repo.
 * ========================================================= */

var TAB_KEPUTUSAN = 'KEPUTUSAN';
var TAB_RINGKASAN = 'RINGKASAN';

var PENGEPALA = [
  'Cap Masa', 'ID Perlawanan', 'No Perlawanan', 'Kategori', 'Kelas',
  'Nama Merah', 'Pasukan Merah', 'Skor Merah',
  'Nama Biru', 'Pasukan Biru', 'Skor Biru',
  'Pemenang', 'Nama Pemenang', 'Pasukan Pemenang', 'Babak Tamat', 'Log Markah', 'Kejohanan'
];

/* ---------- Ujian sambungan ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'senarai') {
    // Senarai No Perlawanan yang telah selesai bagi satu kejohanan (untuk "Sambung Kejohanan")
    var sh = pastikanTab_(), akhir = sh.getLastRow(), selesai = [];
    if (akhir > 1) {
      var d = sh.getRange(2, 1, akhir - 1, PENGEPALA.length).getDisplayValues();
      for (var i = 0; i < d.length; i++) {
        if (!p.kej || d[i][16] === String(p.kej)) selesai.push(d[i][2]);
      }
    }
    return jawab_({ ok: true, selesai: selesai });
  }
  return jawab_({ ok: true, mesej: 'Arkib Keputusan Silat aktif.' });
}

/* ---------- Terima keputusan dari skrin Ketua ---------- */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!d.pid) return jawab_({ ok: false, mesej: 'ID perlawanan (pid) tiada.' });

    var sh = pastikanTab_();
    var pemenang = String(d.pemenang || '').toUpperCase();
    var merahMenang = pemenang === 'MERAH';
    var baris = [
      new Date(),
      String(d.pid),
      String(d.noPerlawanan || ''),
      d.kategori || '',
      d.kelas || '',
      d.namaMerah || '',
      d.pasukanMerah || '',
      Number(d.skorMerah) || 0,
      d.namaBiru || '',
      d.pasukanBiru || '',
      Number(d.skorBiru) || 0,
      pemenang,
      merahMenang ? (d.namaMerah || '') : (d.namaBiru || ''),
      merahMenang ? (d.pasukanMerah || '') : (d.pasukanBiru || ''),
      String(d.babak || '') + (d.jumlahBabak ? ' / ' + d.jumlahBabak : ''),
      String(d.log || ''),
      String(d.kejohanan || '')
    ];

    // Elak pendua: jika pid sudah wujud, kemas kini baris yang sama
    var akhir = sh.getLastRow();
    var noBaris = 0;
    if (akhir > 1) {
      var pids = sh.getRange(2, 2, akhir - 1, 1).getDisplayValues();
      for (var i = 0; i < pids.length; i++) {
        if (pids[i][0] === String(d.pid)) { noBaris = i + 2; break; }
      }
    }
    if (noBaris) {
      sh.getRange(noBaris, 1, 1, baris.length).setValues([baris]);
    } else {
      sh.appendRow(baris);
      noBaris = sh.getLastRow();
    }
    sh.getRange(noBaris, 3).setNumberFormat('@'); // No Perlawanan sebagai teks
    return jawab_({ ok: true, baris: noBaris, dikemaskini: noBaris !== akhir + 1 });
  } catch (err) {
    return jawab_({ ok: false, mesej: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* ---------- Jalankan SEKALI selepas tampal kod ---------- */
function setup() {
  var sh = pastikanTab_();
  var ss = sh.getParent();

  sh.getRange(1, 1, 1, PENGEPALA.length).setValues([PENGEPALA])
    .setFontWeight('bold').setBackground('#0a0e15').setFontColor('#f1c232')
    .setHorizontalAlignment('center').setVerticalAlignment('middle');
  sh.setFrozenRows(1);
  sh.setRowHeight(1, 32);
  sh.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm:ss');
  sh.getRange('C:C').setNumberFormat('@');
  sh.getRange('H:H').setHorizontalAlignment('center').setBackground('#fde7e9');
  sh.getRange('K:K').setHorizontalAlignment('center').setBackground('#e6eeff');
  sh.getRange('L:L').setHorizontalAlignment('center').setFontWeight('bold');
  sh.getRange('P:P').setWrap(true);
  var lebar = [140, 110, 90, 130, 110, 160, 140, 80, 160, 140, 80, 90, 160, 140, 90, 420, 130];
  for (var i = 0; i < lebar.length; i++) sh.setColumnWidth(i + 1, lebar[i]);
  sh.getRange('B:B').setFontColor('#888888');

  // Tab RINGKASAN: kiraan menang ikut pasukan (formula QUERY, auto kemas kini)
  var rg = ss.getSheetByName(TAB_RINGKASAN) || ss.insertSheet(TAB_RINGKASAN);
  rg.clear();
  rg.getRange('A1').setValue('RINGKASAN KEMENANGAN IKUT PASUKAN')
    .setFontWeight('bold').setFontSize(14).setFontColor('#f1c232').setBackground('#0a0e15');
  rg.getRange('A1:B1').merge();
  rg.getRange('A3').setFormula(
    '=IFERROR(QUERY(' + TAB_KEPUTUSAN + '!N2:N,' +
    '"select N, count(N) where N is not null and N <> \'\' group by N order by count(N) desc label N \'Pasukan\', count(N) \'Bil. Menang\'",0),' +
    '"Belum ada keputusan")'
  );
  rg.getRange('A3:B3').setFontWeight('bold').setBackground('#f1c232');
  rg.getRange('D3').setValue('Jumlah perlawanan diarkib').setFontWeight('bold');
  rg.getRange('D4').setFormula('=COUNTA(' + TAB_KEPUTUSAN + '!B2:B)');
  rg.setColumnWidth(1, 220); rg.setColumnWidth(2, 110); rg.setColumnWidth(4, 200);
  rg.setFrozenRows(3);

  SpreadsheetApp.getActive().toast('Tab KEPUTUSAN & RINGKASAN siap.', 'Arkib Silat', 5);
}

/* ---------- Pembantu ---------- */
function pastikanTab_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(TAB_KEPUTUSAN);
  if (!sh) {
    sh = ss.insertSheet(TAB_KEPUTUSAN, 0);
    sh.getRange(1, 1, 1, PENGEPALA.length).setValues([PENGEPALA]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

function jawab_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
