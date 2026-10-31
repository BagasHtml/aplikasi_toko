# DESIGN.md, Toko Listrik

Arah visual untuk katalog marketplace barang harian dengan checkout transfer atau QRIS.

## Identitas

- Nama kerja: **BelanjaKu**. Ganti dengan nama final pemilik toko bila perlu.
- Isi: katalog barang harian (ponsel, motor, elektronik, rumah tangga), keranjang, dan checkout.
- Audiens: pembeli rumahan di Indonesia yang ingin melihat harga dan sisa stok dengan jelas sebelum membayar.
- Kepribadian: tenang, jujur, seperti nota kertas di meja toko yang terang. Bukan startup, bukan neon.

## Mood

Krem hangat, hijau tua, satu aksen kunyit. Padat informasi, tanpa dekorasi yang tidak menjelaskan apa pun.

## Palet

| Token | Nilai | Alasan |
| --- | --- | --- |
| `paper` | `#F7F2E7` | Dasar krem, mengurangi silau dan memberi kesan kertas nota |
| `surface` | `#FFFCF5` | Kartu dan panel naik satu tingkat dari kertas |
| `ink` | `#17251E` | Teks utama, hijau yang hampir hitam, lebih hangat dari hitam murni |
| `green` | `#1E4B38` | Warna utama untuk aksi dan status tersedia |
| `green-soft` | `#DDE7DD` | Latar status stok aman, turunan dari hijau utama |
| `turmeric` | `#D99A1C` | Satu aksen, hanya untuk momen kunci (harga dan tombol buat pesanan) |
| `clay` | `#B4442F` | Satu-satunya warna bahaya, untuk stok habis dan error |
| `line` | `#D8CEB8` | Garis pemisah dan tepi, senada kertas |
| `muted` | `#5F6B62` | Teks sekunder, tetap lolos kontras AA di atas kertas |

Neutral (paper, surface, ink, line, muted) tidak dihitung sebagai warna inti. Inti aktif: hijau, kunyit, clay. Total 3 inti + 1 aksen.

## Tipografi

- Display dan judul: **Fraunces Variable**. Alasan: serif dengan karakter cetak, memberi rasa nota toko dan memisahkan judul dari teks antarmuka.
- Teks antarmuka: **Plus Jakarta Sans Variable**. Alasan: dirancang untuk identitas kota Jakarta, cocok untuk konteks Indonesia, dan tetap jernih di ukuran kecil.
- Angka harga memakai `font-variant-numeric: tabular-nums` supaya kolom harga rata dan mudah dibandingkan.
- Tidak ada heading monospace dan tidak ada label uppercase ber-tracking lebar.

## Dials

**ENERGY 2 / RHYTHM 2 / MOTION 1**

- ENERGY 2: satu fokus jelas per layar, judul tegas, permukaan tenang.
- RHYTHM 2: grid katalog seragam karena memang katalog, halaman detail dan checkout memecah pola dengan dua kolom asimetris.
- MOTION 1: hanya hover, focus, transisi drawer dan dialog. Tidak ada animasi berulang.

## Motif identitas

**Nota.** Garis putus-putus, angka tabular, dan tepi bergerigi kecil pada panel ringkasan. Alasan: nota adalah artefak asli sebuah toko dan membawa informasi harga serta stok, bukan hiasan.

## Ikon

Set ikon garis buatan sendiri, stroke 2px, sudut tegas. Alasan: jumlah ikon sedikit (keranjang, tambah, kurang, tutup, cari, panah), dan set campuran ini menghindari tampilan pustaka ikon bawaan. Setiap glyph memetakan ke kontrol yang benar-benar ada.

## Aset

- Ilustrasi produk adalah placeholder garis, diberi label "ilustrasi" di media. Bukan foto dan tidak menyamar sebagai foto.
- Katalog memakai ilustrasi garis dan data dari database toko.
- QRIS dirender dari payload pesanan dan diberi label "QRIS".

## Keputusan dan alasan

- Kartu produk memakai bidang krem dengan ilustrasi garis, bukan foto produk.
- Grid 3/2/1 kolom: mengikuti kepadatan katalog, bukan template landing page.
- Panel ringkasan bergaya nota: pembeli perlu memeriksa ulang harga dan jumlah sebelum membayar.
- Tombol utama hijau, tombol buat pesanan kunyit: satu aksen di momen yang tidak bisa diulang.
- Status stok selalu berupa teks ("Sisa 12", "Habis"), bukan hanya warna, supaya tetap terbaca tanpa membedakan warna.
- Tidak ada testimoni, logo klien, atau angka statistik karangan.
