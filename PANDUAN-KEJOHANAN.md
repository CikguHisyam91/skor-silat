# 🏟️ Sambung Skrin Ketua ke Sistem Pengurusan Kejohanan

Dengan sambungan ini, Ketua **tidak perlu taip jadual** dan **tidak perlu key in keputusan** dua kali.

- 📥 Jadual (ikut nombor Jadual Induk) diambil terus dari Sistem Kejohanan.
- 📤 Selepas tekan **🏆 Menang**, Ketua **wajib pilih jenis kemenangan** (MA, MM, MT, UD, WMP). Keputusan terus masuk ke Carta, Jadual Induk, Pingat dan Carta Langsung.

## Persediaan (sekali sahaja)
1. Dalam Apps Script Sistem Kejohanan, buka `Admin.gs` dan tukar `KETUA_PIN` kepada PIN pilihan anda. Simpan, kemudian **Deploy → Manage deployments → ✏️ Edit → New version**.
2. Buka skrin **Ketua**, kemudian klik **📋 Jadual & Telegram**.
3. Di bahagian **🏟️ Sistem Kejohanan**:
   - URL Web App sudah diisi (URL Sistem Kejohanan).
   - Masukkan **PIN Ketua**.
   - Pilih **Gelanggang** dan **Jumlah gelanggang** (1 atau 2).
4. Tekan **🔌 Uji Sambungan**. Mesti keluar **✓ Sambungan & PIN Ketua sah**.
5. Tekan **📥 Ambil Jadual**.

## Semasa kejohanan
- Pilih perlawanan ikut nombor seperti biasa (▶ Muat / ⏭ Sambung / Perlawanan Baharu).
- Tekan **🏆 Menang**, pilih **jenis kemenangan**, semak skor, kemudian tekan **✅ Hantar Keputusan**.
- Jadual dikemas kini automatik selepas setiap keputusan, jadi pemenang terus naik ke pusingan seterusnya.
- Penunjuk di bahagian atas skrin:
  - **🏟️ Kejohanan ✓**: keputusan berjaya dihantar.
  - **⏳ Kejohanan (n)**: menunggu internet. Sistem cuba hantar semula setiap 30 saat.
- Jika pemenang ditukar (contohnya selepas bantahan), tekan Menang sekali lagi dan hantar semula. Keputusan lama diganti.
- **Mod Simulasi** tidak menghantar apa-apa ke Sistem Kejohanan.

## Dua gelanggang
Tetapkan **Jumlah: 2 gelanggang**. Laptop Gelanggang 1 mendapat perlawanan bernombor ganjil (#1, #3, #5…), manakala laptop Gelanggang 2 mendapat nombor genap.

## Keselamatan
PIN Ketua hanya boleh **baca jadual** dan **simpan keputusan**. Ia tidak boleh mengundi, memadam atau mengubah tetapan.
