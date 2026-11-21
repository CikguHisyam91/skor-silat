// Ujian hujung-ke-hujung: 5 tab dalam SATU pelayar (Ketua, TV, Juri 1-3) ke satu hos,
// sama seperti pengguna menguji di satu laptop. Perlu firebase-tiruan.js berjalan
// dan www/ disediakan dengan: bash sedia-www.sh <repo> <www> ya
// Guna: NODE_PATH=$(npm root -g) node uji-aliran.js
const { chromium } = require('playwright');
(async () => {
  await fetch('http://127.0.0.1:8771/silat.json', { method:'PUT', body:'null' }); // kosongkan DB
  const b = await chromium.launch(); const ctx = await b.newContext(); const errs = [];
  const buka = async u => { const p = await ctx.newPage(); p.on('pageerror', e => errs.push(u + ': ' + e.message)); p.on('dialog', d => d.accept()); await p.goto('http://localhost:8765/' + u); return p; };
  const kp = await buka('ketua.html'), tv = await buka('tv.html');
  const j = [null, await buka('juri.html?j=1'), await buka('juri.html?j=2'), await buka('juri.html?j=3')];
  await kp.waitForTimeout(5000);
  const semak = (nama, ok, info) => console.log((ok ? 'LULUS ' : 'GAGAL ') + nama + (info !== undefined ? ' -> ' + info : ''));
  semak('KP bersambung', (await kp.textContent('#connTxt')) === 'Bersambung', await kp.textContent('#connTxt'));
  semak('3 kerusi juri hijau', (await kp.evaluate(() => document.querySelectorAll('#kerusiBox span.on').length)) === 3);
  // Undi sebelum Mula: tidak dikira
  await j[1].click('[data-undi="merah|kaki"]'); await j[2].click('[data-undi="merah|kaki"]'); await kp.waitForTimeout(1500);
  semak('Undi sebelum Mula tidak dikira', (await kp.evaluate(() => state.skorMerah)) === 0);
  await kp.click('#btnMula');
  await j[1].click('[data-undi="merah|tangan"]'); await j[2].click('[data-undi="merah|tangan"]'); await kp.waitForTimeout(1500);
  semak('2/3 juri: Merah +1 di KP & TV', (await kp.evaluate(() => state.skorMerah)) === 1 && (await tv.textContent('#skM')) === '1');
  await j[3].click('[data-undi="biru|kaki"]'); await kp.waitForTimeout(4500);
  semak('1/3 juri: tiada markah', (await kp.evaluate(() => state.skorBiru)) === 0);
  await kp.click('[data-huk="biru|-1"]'); await kp.waitForTimeout(800);
  semak('Bulatan hukuman di TV', (await tv.textContent('#hukB')).includes('1'));
  await kp.evaluate(() => { modalJenis = 'jatuhan'; mohonBantahan(); }); await kp.waitForTimeout(1200);
  await j[1].click('[data-bvote="merah"]'); await j[3].click('[data-bvote="merah"]'); await kp.waitForTimeout(1500);
  semak('Bantahan jatuhan sah: Merah +3 auto', (await kp.evaluate(() => state.skorMerah)) === 4);
  await kp.click('[data-undo-jat="merah"]'); await kp.waitForTimeout(500);
  semak('Undo jatuhan', (await kp.evaluate(() => state.skorMerah)) === 1);
  await kp.waitForTimeout(4000); // bantahan tutup sendiri selepas 4 saat
  await kp.click('[data-win="merah"]'); await kp.waitForTimeout(1200);
  semak('Pemenang di juri', (await j[1].textContent('#tPemenang')).includes('Merah'));
  semak('Tiada ralat JavaScript', errs.length === 0, errs.join(' | '));
  await b.close();
})();
