---
name: skor-silat
description: Use when working on the Sistem Skor Silat Tanding (repo CikguHisyam91/skor-silat) — ketua.html, juri.html, tv.html, index.html, appscript/Code.gs — or when the user (Cikgu Hisyam, a non-coder teacher writing in Bahasa Melayu) reports problems like "Menyambung…" stuck, points not entering, TV papan skor not updating, Firebase gagal sambung, bantahan/undian, hukuman, undo, arkib Google Sheets, Telegram, jadual perlawanan, or asks for a demo video of the system.
---

# Sistem Skor Silat Tanding

## Pengguna & cara berkomunikasi
- Cikgu Hisyam, guru, **bukan pengatur cara**. Balas dalam **Bahasa Melayu Malaysia**, ringkas, langkah bernombor, tanpa jargon.
- Mahu sistem **100% percuma** (GitHub Pages, Firebase Spark, Google Sheets/Apps Script, Telegram bot).
- Bila diminta "tunjuk contoh dulu": hasilkan **gambar skrin** (Playwright) dan hantar dengan SendUserFile **sebelum** ubah sistem.
- Selepas setiap perubahan: push ke `main`, kemudian beritahu "tunggu 1–2 minit, tekan **Ctrl + F5**" pada skrin yang terlibat.
- Langkah yang pengguna mesti buat sendiri (Firebase Rules, Apps Script **Deploy → Manage deployments → Edit → New version**, JANGAN "New deployment") mesti dinyatakan jelas.

## Seni bina
| Fail | Peranan |
|---|---|
| `ketua.html` | Skrin Ketua Pertandingan (KP). **Satu-satunya penulis `/state`** dan enjin padanan 2/3 juri. |
| `juri.html?j=1..3` | Fon juri: butang Tangan(+1)/Kaki(+2) setiap sudut, undian bantahan. |
| `tv.html` | Papan skor penonton, **sentiasa mod malam**. Banner "mohon bersedia", bulatan hukuman. |
| `index.html` | Halaman utama + kad QR kerusi juri. |
| `appscript/Code.gs` | Arkib keputusan ke Google Sheets (`doPost` upsert ikut `pid`, `doGet?action=senarai&kej=`). |

Hosting: GitHub Pages dari cabang `main`. Tiada CI. Sesi Claude lain juga pernah push ke repo ini (contoh: sambungan "Sistem Kejohanan", `PANDUAN-KEJOHANAN.md`) — sentiasa `git pull` dahulu dan jangan rosakkan kerja mereka.

## Firebase (REST + SSE, tanpa SDK)
`DB_URL = https://skor-silatolahraga-default-rtdb.asia-southeast1.firebasedatabase.app`, `ROOT = /silat`.

| Laluan | Isi |
|---|---|
| `/state` | Objek perlawanan (lihat `stateBaru()` dalam ketua.html) |
| `/votes/<id>` | Undi juri `{juri, sesi, pid, sisi, poin, t}` — KP padam selepas proses |
| `/bantahanUndi/j1..j3` | `{bid, sesi, jawapan:"merah"|"biru"|"tiada"}` |
| `/kerusi/j1..j3` | `{sesi, at}` — sesi terkini memiliki kerusi |
| `/log`, `/jadual`, `/clock/*` | Log KP, jadual perlawanan, penyegerakan jam |

Medan penting `state`: `pid, noPerlawanan, namaMerah/Biru, pasukanMerah/Biru, kategori, kelas, skorMerah/Biru, babak, jumlahBabak, masaSet, masaBaki, masaJalan, masaTamat, pemenang, bantahan{id,jenis,undian,keputusan,keputusanMasa}, hukMerah/hukBiru[{id,nilai,tolak}], jatMerah/jatBiru[{id,oleh}], kiraan{merah,biru:{tangan,kaki}}, modSkor("23"|"terus"), ticker, tvNotis, flash`.

## Peraturan logik (jangan dipecahkan)
- **2/3 juri**: undi sama `sisi|poin` daripada 2 juri berbeza dalam `WINDOW_MS` (3 s) → poin, dikira sekali (`lastMatch`). Mod `terus` = 1 tekanan terus masuk.
- **Undi hanya dikira bila `state.masaJalan`**. Sebelum Mula / selepas Henti → log `🧪 Ujian Jn …` sahaja (untuk uji fon juri).
- **Bantahan**: KP pilih jenis sahaja (Jatuhan/Pelanggaran). Juri pilih Merah/Biru/Tiada. ≥2 sama → keputusan; 3 berbeza → `tiada_keputusan`. Jatuhan sah → **+3 automatik**; pelanggaran sah → KP pilih tahap hukuman. Tutup sendiri 4 s selepas keputusan.
- **Hukuman** simpan `tolak` sebenar (markah tak bawah 0); undo pulangkan `tolak`. Butang ↩ pada setiap butang hukuman dan Jatuhan.
- **Mod kejohanan** (localStorage `modKej`): `simulasi` = tiada Telegram/arkib; `sebenar` = rekod.
- Tetapan peranti (token Telegram, URL arkib, tema) disimpan dalam **localStorage** laptop KP sahaja.

## Perangkap yang pernah berlaku
| Gejala | Punca | Pembetulan yang sudah dibuat |
|---|---|---|
| KP tersekat "Menyambung…" bila semua skrin dibuka dalam satu pelayar | **Had 6 sambungan HTTP/1.1 per hos** dalam Chrome; setiap EventSource makan satu | Setiap skrin guna **satu** `fbListen("")` pada akar `/silat`. Jangan tambah EventSource baharu. |
| Permintaan tergantung tanpa ralat | `fetch` tiada had masa | `fbReq` guna AbortController 10 s → `TAMAT_MASA` → cuba semula 5 s |
| Firebase menolak (401/403) selepas ~30 hari | Rules "test mode" tamat | Rules: `{"rules":{"silat":{".read":true,".write":true}}}` |
| Hantar ke Apps Script gagal CORS | Apps Script tiada CORS untuk POST | POST `mode:"no-cors"`, `text/plain`; gilir `arkibGilir` dalam localStorage, cuba semula 30 s. Akaun moe-dl.edu.my: akses mesti **Anyone**. |
| Panel tengah/sudut KP perlu skrol | Skrin laptop rendah | `muatkanKonsol()` guna CSS `zoom` untuk muatkan `.kotak-isi` |
| Jam lambat bila tab KP tersembunyi | `setInterval` di-throttle | Masa dikira dari `Date.now()` (`mulaT`, `mulaBaki`) |

## Gaya UI
Neumorphism, font **Urbanist**, `text-transform:uppercase`, tema `data-tema="siang|malam"` pada `<html>` (TV sentiasa malam). Merah `--merah`, Biru `--biru`, hukuman ringan oren `--amaran`, berat merah. Pembolehubah `--timbul`, `--tenggelam` untuk bayang. Semua teks UI dalam BM.

## Cara menguji (WAJIB sebelum push)
1. Semak sintaks setiap fail yang diubah: ekstrak `<script>` terakhir → `node --check`.
2. Ujian hujung-ke-hujung dengan Firebase tiruan (tidak menyentuh Firebase sebenar):
```bash
S=.claude/skills/skor-silat/scripts; W=<scratchpad>/www
bash $S/sedia-www.sh "$PWD" $W ya          # "ya" = semua skrin satu hos (meniru satu laptop)
node $S/firebase-tiruan.js $W &             # halaman di http://localhost:8765/
NODE_PATH=$(npm root -g) node $S/uji-aliran.js   # 10 semakan LULUS/GAGAL
pkill -f firebase-tiruan.js
```
3. Untuk tangkapan skrin cepat tanpa pelayan, buka `file://.../ketua.html` dalam Playwright (Firebase akan gagal, tetapi fungsi tempatan seperti `hukuman()`, `beriMata()` boleh dipanggil melalui `page.evaluate`). Hilangkan toast dengan `document.getElementById('toast').classList.remove('show')`.
4. Kemaskini `uji-aliran.js` jika aliran berubah.

## Video demo aliran (bila pengguna minta "video simulasi")
Jalankan `sedia-www.sh` **tanpa** `ya` (port berasingan per skrin), buat `studio.html` 1280×720 dengan iframe KP (kiri atas, skala ~0.458 dari 1440×690), TV (kiri bawah) dan 3 juri (kanan, 400×816 skala 0.48) serta kotak kapsyen. Pandu dengan Playwright (`recordVideo` 1280×720), klik butang sebenar dalam `frame`, `window.confirm = () => true` dalam frame KP, tetapkan `localStorage` arkibUrl `""` dan tema. Tukar ke MP4: `ffmpeg -i in.webm -vf scale=1280:720,fps=30 -c:v libx264 -crf 20 -pix_fmt yuv420p -movflags +faststart out.mp4`. Percepat masa akhir dengan `mulaBaki`/`mulaT`, dan beritahu pengguna ia dipercepatkan.

## Repo berkaitan pengguna
`CikguHisyam91/PUapp` (portal jurulatih/ahli, Apps Script + GitHub Pages; Pages dari cabang `main`, cabang lalai `claude/upbeat-meitner-9adm99` — push ke kedua-duanya), `CikguHisyam91/silatapp`.
