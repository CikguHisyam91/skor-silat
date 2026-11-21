// Pelayan Firebase Realtime Database TIRUAN (REST + SSE) untuk menguji Sistem Skor Silat
// tanpa menyentuh Firebase sebenar. Menyajikan juga fail HTML dari folder www/.
// Guna: node firebase-tiruan.js <folder-www>
//   - Port 8765 : sajikan halaman (http://localhost:8765/ketua.html, ...)
//   - Port 8771-8773, 8780, 8781 : pangkalan data yang sama (port berasingan untuk
//     elak had 6 sambungan pelayar per hos semasa rakaman banyak iframe).
const http = require('http'), fs = require('fs'), path = require('path');
const WWW = path.resolve(process.argv[2] || 'www');
let db = {};
const listeners = [];
const parts = p => p.split('/').filter(Boolean);
function get(p){ let c = db; for(const k of parts(p)){ if(c == null || typeof c !== 'object') return null; c = c[k]; } return c === undefined ? null : c; }
function sv(v){ if(v && typeof v === 'object'){ if(v['.sv'] === 'timestamp') return Date.now(); const o = Array.isArray(v) ? [] : {}; for(const k in v) o[k] = sv(v[k]); return o; } return v; }
function set(p, v){
  const ps = parts(p); if(!ps.length){ db = v || {}; return; }
  let c = db; for(let i = 0; i < ps.length - 1; i++){ if(c[ps[i]] == null || typeof c[ps[i]] !== 'object') c[ps[i]] = {}; c = c[ps[i]]; }
  if(v === null) delete c[ps[ps.length - 1]]; else c[ps[ps.length - 1]] = v;
}
function notify(){
  for(const l of listeners){
    const d = JSON.stringify(get(l.p));
    if(d !== l.last){ l.last = d; l.res.write('event: put\ndata: ' + JSON.stringify({ path:'/', data:JSON.parse(d) }) + '\n\n'); }
  }
}
const handler = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Access-Control-Allow-Headers', '*'); res.setHeader('Access-Control-Allow-Methods', '*');
  if(req.method === 'OPTIONS'){ res.end(); return; }
  const u = new URL(req.url, 'http://x');
  if(u.pathname.endsWith('.json')){
    const p = u.pathname.slice(0, -5);
    if(req.method === 'GET' && (req.headers.accept || '').includes('text/event-stream')){
      res.writeHead(200, { 'Content-Type':'text/event-stream', 'Cache-Control':'no-cache', 'Connection':'keep-alive' });
      const l = { p, res, last:JSON.stringify(get(p)) }; listeners.push(l);
      res.write('event: put\ndata: ' + JSON.stringify({ path:'/', data:get(p) }) + '\n\n');
      const ka = setInterval(() => res.write('event: keep-alive\ndata: null\n\n'), 15000);
      req.on('close', () => { clearInterval(ka); listeners.splice(listeners.indexOf(l), 1); });
      return;
    }
    let body = ''; req.on('data', c => body += c); req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      if(req.method === 'GET'){ res.end(JSON.stringify(get(p))); return; }
      if(req.method === 'PUT'){ const v = sv(JSON.parse(body || 'null')); set(p, v); res.end(JSON.stringify(v)); notify(); return; }
      if(req.method === 'DELETE'){ set(p, null); res.end('null'); notify(); return; }
      res.end('null');
    });
    return;
  }
  const f = path.join(WWW, u.pathname === '/' ? 'index.html' : u.pathname);
  fs.readFile(f, (e, d) => {
    if(e){ res.writeHead(404); res.end(); return; }
    res.setHeader('Content-Type', f.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain'); res.end(d);
  });
};
[8765, 8771, 8772, 8773, 8780, 8781].forEach(pt => http.createServer(handler).listen(pt));
console.log('Firebase tiruan sedia. Halaman: http://localhost:8765/');
