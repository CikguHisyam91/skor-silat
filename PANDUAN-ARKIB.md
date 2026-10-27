# 📊 Panduan Arkib Keputusan ke Google Sheets

Setiap kali Ketua menekan butang **🏆 Menang**, keputusan perlawanan itu akan disimpan **kekal** dalam Google Sheet anda.
Skor langsung (TV, fon juri) masih menggunakan Firebase seperti biasa. Arkib ini hanya simpanan rekod.

Masa diperlukan: lebih kurang **10 minit**, sekali sahaja.

---

## Langkah 1: Cipta Google Sheet baharu
1. Buka **sheets.google.com** dan klik **+ Kosong (Blank)**.
2. Namakan fail, contohnya **Arkib Keputusan Silat 2026**.

## Langkah 2: Tampal kod Apps Script
1. Dalam Sheet tadi, klik menu **Extensions (Sambungan) → Apps Script**.
2. Satu tab baharu akan terbuka. Anda akan nampak fail **Code.gs** yang ada sedikit kod.
3. **Padam semua** kod di situ.
4. Buka fail [`appscript/Code.gs`](appscript/Code.gs) dalam repo GitHub ini, tekan ikon **salin (copy)**, kemudian **tampal** ke dalam Apps Script.
5. Tekan ikon **💾 Simpan**.

## Langkah 3: Jalankan `setup` (sekali sahaja)
1. Di bahagian atas editor, pada kotak pilihan fungsi, pilih **setup**.
2. Tekan **▶ Run (Jalankan)**.
3. Google akan minta kebenaran:
   - Klik **Review permissions** dan pilih akaun Google anda.
   - Jika keluar amaran "Google hasn't verified this app", klik **Advanced → Go to (nama projek) (unsafe)**. Ini selamat kerana kod ini milik anda sendiri.
   - Klik **Allow**.
4. Kembali ke Google Sheet. Dua tab baharu akan wujud:
   - **KEPUTUSAN**: satu baris bagi setiap perlawanan.
   - **RINGKASAN**: jumlah kemenangan ikut pasukan (dikira automatik).

## Langkah 4: Deploy sebagai Web App
1. Dalam Apps Script, klik butang biru **Deploy → New deployment**.
2. Klik ikon ⚙️ di sebelah "Select type", kemudian pilih **Web app**.
3. Isi tetapan berikut:
   - **Execute as:** `Me` (akaun anda)
   - **Who has access:** `Anyone`
4. Klik **Deploy**.
5. **Salin URL Web App.** URL ini bermula dengan `https://script.google.com/macros/s/...` dan berakhir dengan **`/exec`**.

## Langkah 5: Sambungkan ke skrin Ketua
1. Buka skrin **Ketua Pertandingan**.
2. Klik **📋 Jadual & Telegram**, kemudian skrol ke bawah ke bahagian **📊 Arkib Google Sheets**.
3. Tampal URL tadi ke dalam kotak **URL Web App**.
4. Tekan **🔌 Uji Sambungan**. Mesti keluar mesej **✓ Sambungan berjaya**.
5. URL disimpan dalam laptop Ketua ini sahaja. Jika tukar laptop atau pelayar, tampal semula URL tersebut.

---

## Cara ia berfungsi
- **Perlawanan selesai:** Ketua tekan 🏆 Menang, dan satu baris masuk ke tab KEPUTUSAN.
- **Pemenang ditukar** (contohnya selepas bantahan): baris yang **sama** dikemas kini. Tiada baris berganda.
- **Internet putus:** keputusan disimpan dalam laptop dulu. Di penjuru atas skrin Ketua akan tertulis **⏳ Menunggu internet (n)**. Sistem cuba hantar semula setiap 30 saat secara automatik.
- **Berjaya dihantar:** di penjuru atas tertulis **📊 Diarkib**.
- **URL dibiarkan kosong:** sistem skor berfungsi seperti biasa tanpa arkib.

## ⚠️ AMARAN: Bila kemas kini kod Code.gs
Jika anda tampal kod Code.gs versi baharu pada masa akan datang:

1. Tampal kod baharu, kemudian tekan **💾 Simpan**.
2. Klik **Deploy → Manage deployments**.
3. Klik ikon **✏️ pensel (Edit)**.
4. Pada **Version**, pilih **New version**.
5. Klik **Deploy**.

**JANGAN tekan "New deployment".** Jika anda tekan New deployment, URL `/exec` akan bertukar dan skrin Ketua tidak lagi dapat menghantar keputusan. Jika tertekan juga, salin URL baharu dan tampal semula di skrin Ketua (Langkah 5).

---

## 🧪 Mod Simulasi vs 🏆 Kejohanan Sebenar
Pilih mod di panel tengah skrin Ketua, pada bahagian **Mod kejohanan**. Mod semasa dipaparkan di penjuru atas skrin.

| | 🧪 Simulasi | 🏆 Kejohanan Sebenar |
|---|---|---|
| Rekod ke Google Sheets | Tidak | Ya |
| Makluman Telegram | Tidak | Ya |
| Skor langsung TV & juri | Ya | Ya |

Gunakan **Simulasi** untuk latihan atau taklimat juri, supaya Sheet dan kumpulan Telegram tidak dipenuhi data ujian.

## ⏭ Sambung Kejohanan (contoh: hari kedua, mula dari perlawanan 51)
1. Buka **📋 Jadual & Telegram** dan pastikan jadual penuh sudah ditampal.
2. Tekan **⏭ Sambung Kejohanan**, kemudian sahkan **nama kejohanan**. Nama mesti sama seperti hari pertama, contohnya `MSSD-2026`.
3. Sistem semak perlawanan yang sudah selesai, dalam laptop ini **dan** dalam Google Sheet. Kemudian sistem terus muatkan perlawanan pertama yang **belum** selesai.
   Ini berfungsi walaupun anda guna laptop lain, kerana senarai diambil dari Google Sheet.
4. Dalam pratonton jadual, perlawanan yang sudah selesai bertanda ✅.

## 🆕 Mula Kejohanan Baharu
Tekan **🆕 Mula Kejohanan Baharu** dan beri nama, contohnya `MSSD-2026`. Senarai "selesai" bermula semula dari kosong.
Rekod kejohanan lama **kekal** dalam Sheet. Lajur **Kejohanan** membezakan setiap kejohanan.

## ⚠️ Akaun sekolah (moe-dl.edu.my)
Semasa Deploy, pada **Who has access**, pilih **Anyone** (bukan "Anyone within moe-dl.edu.my").
Jika pilih yang dalam domain sahaja, skrin Ketua mungkin gagal menghantar keputusan. Tekan **🔌 Uji Sambungan** untuk pastikan.
