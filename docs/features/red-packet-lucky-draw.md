# Red Packet · Lucky draw

Status **Prototype review**  
Sumber **Cing, 19 November 2026**, meneruskan permintaan Florence

## Aturan produk

- Lucky draw adalah pilihan pertama dan otomatis aktif saat membuka form baru. Sender menetapkan budget mulai dari 1.00 MYRT tanpa mengisi jumlah orang. Batas budget mengikuti saldo MYRT serta limit transaksi dan bulanan yang sudah ada.
- Satu orang mendapat satu undian per red packet. Nominal baru dihitung saat dibuka. Semua link, QR, dan chat card dari packet yang sama memakai satu budget.
- Hadiah default berupa nominal utuh 1–10 MYRT dengan peluang 10% masing-masing. Saat sisa budget lebih kecil dari nominal maksimum, hanya hadiah yang bisa dibayar yang ikut undian. Bobot relatif hadiah yang memenuhi syarat tetap dipakai.
- Budget ditahan saat sender mengonfirmasi. Sisa yang belum dibayarkan kembali tepat sekali saat packet dibatalkan atau kedaluwarsa. Jika sisa turun di bawah minimum hadiah 1 MYRT, packet ditutup dan sisa langsung dikembalikan. Tidak ada biaya.
- **Luckiest** menandai klaim terbesar sejauh ini. Jika nominal tertinggi sama, klaim lebih awal mendapat badge.
- Random dan Equal split tetap memakai jumlah orang. Ketiga mode mendukung Never expires, preset, dan Custom dalam jam atau hari.

## Prototype dan QA

Buka **Red Packet → Create → Lucky draw**. Untuk sisi penerima, buka **Lucky draw from Lara** atau kartu **Try your luck!** di chat Lara. Gunakan skenario KYC Approved dan Wallet Active.

| Skenario | Hasil Chrome |
| --- | --- |
| Kirim Lucky draw 100 MYRT dengan Custom 2 jam | Lolos. Form tanpa jumlah orang, durasi terlihat di PIN dan tersimpan, saldo MYRT berkurang 100. |
| Buka form baru dan klaim kartu Lara dengan hasil acak terendah | Lolos. Lucky draw aktif di posisi pertama. Hasil terendah 1 MYRT dan membuka ulang kartu tidak menambah kredit. |
| Undian dengan hadiah dan undian yang menghabiskan budget | Lolos. Saldo, sisa budget, jumlah yang membuka, dan Luckiest diperbarui. |
| Hasil positif di batas minimum dan sisa budget di bawah 1 MYRT | Lolos. Hadiah minimal 1 MYRT dan sisa yang terlalu kecil dikembalikan sekali. |
| Batalkan sebelum klaim dan kedaluwarsa setelah sebagian dibayar | Lolos. Refund sesuai sisa budget dan render ulang tidak mengulang refund. |
| Equal split 5 MYRT × 6 dan Random 5 MYRT untuk 6 orang | Lolos. Equal split membagi 30 MYRT dan validasi Random menolak jumlah tersebut. |
| Viewport 375 px | Lolos. Ketiga pilihan bisa ditekan dan Lucky draw tidak menampilkan jumlah orang. |
| Stepper ringkas di desktop, 375 px, dan 320 px | Lolos. Plus dan minus punya target 44 px. Input manual dan pesan validasi tetap bisa dipakai. |
| Publish rate custom dan buka ulang browser | Lolos. Editor menolak total 101%, menampilkan rata-rata 1,25 MYRT untuk rate 75% pada 1 MYRT dan 25% pada 2 MYRT, lalu menyimpan versi baru. |
| Buat packet sebelum dan sesudah perubahan rate | Lolos. Packet pertama tetap memakai versi 1 dan maksimum 10 MYRT. Packet kedua memakai versi 2 dan maksimum 2 MYRT. |
| Sisa 4,20 MYRT dan dua permintaan buka berurutan cepat | Lolos. Hasil tertinggi yang tersedia 4 MYRT, akun mendapat satu pembayaran, dan packet menutup dengan sisa 0,20 MYRT. |

## Distribusi hadiah dan admin panel

Feedback YY melalui Cing, 19 November 2026. Dengan rate default, budget 100 MYRT dan 10 pembukaan, rata-rata hadiah 5.50 MYRT per pembukaan. Ekspektasi payout 55 MYRT. Peluang kesepuluh pembukaan mendapat 10 MYRT adalah `0.1^10`, atau 1 dari 10 miliar. Jumlah orang tetap terbuka selama budget cukup dan packet aktif.

Di panel prototype, buka **Quick scenario → Lucky draw rates**. Admin bisa mengatur nominal maksimum dan peluang tiap nominal, cek rata-rata hadiah, lalu pilih **Publish rates**. Total peluang harus 100% dan tabel harus mencakup hadiah 1 MYRT. Panel menampilkan riwayat versi. Browser menyimpan rate yang dipublikasikan, dan packet menyimpan versi beserta tabelnya saat dibuat.

## Keputusan untuk handoff

- Minimum hadiah sudah ditetapkan 1 MYRT. Distribusi default dan rate manual tersedia di prototype untuk review sebelum handoff.
- Engine produksi perlu menyimpan klaim unik per akun dan memproses cek expiry, undian, pengurangan budget, kredit, dan refund di server. Prototype menyimpan data dalam sesi browser dan memproses expiry saat paket atau saldo diperiksa. Build iOS dan Android belum diuji.
