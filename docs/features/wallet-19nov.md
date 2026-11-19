# Wallet refresh 19 Nov

Status **Prototype review**  
Sumber desain **Design_update_19nov**, 19 November 2026

## Redesign dari HTML boss

Prototype menggunakan layout, ilustrasi, warna, logo, dan ikon dari `Design_update_19nov/youapp-wallet-screens/index.html`. Buka **YouPage** dengan **KYC Approved** dan **Wallet Active** untuk mencoba desain. **Free** menampilkan banner SVIP seperti di referensi.

| Poin | Layar yang diperbarui | Yang bisa dicoba |
| --- | --- | --- |
| 0 | You Page | YouWallet Balance, swipe ke Booking Balance, sembunyikan saldo, referral, transaksi terakhir, lalu profil dengan chip minat. |
| 1 dan 1b | Scan to Pay, Pay, Pay with, approval, Paid, Receipt, dan Connect a wallet | QR nominal bebas atau tetap, pilih sumber dana, konfirmasi wallet eksternal, quote kedaluwarsa, pending, gagal, retry, dan buka ulang receipt dari History. |
| 2 sampai 2c | Top up, kartu, stablecoin, My money dan Connect a wallet | Pilih mata uang dan metode, cek fee, konfirmasi top up demo, lihat saldo per mata uang dan filter per wallet. Versi tanpa wallet eksternal punya ajakan Connect a wallet. |
| 3 | Choose your plan | Bandingkan Free, VIP, dan SVIP. Periode VIP membuka checkout. SVIP mengikuti alur pengajuan yang sudah ada. |
| 4 | Rewards dan Invite friends | Lihat kondisi kosong atau berisi, filter referral dan cashback, cek teman yang belum verifikasi, buka QR, dan bagikan link. |
| 5 | Settings | Buka Transactions, Connected wallets, PIN, Limits, referral dan Coupons. Pilihan preferensi dan waitlist berfungsi di sesi demo. |

Nama profil, transaksi, mata uang, saldo, dan statistik referral mengikuti akun serta skenario prototype. Harga VIP tahunan tetap RM120 sesuai checkout yang sudah ada. Ringgit YouApp Wallet memakai aturan PIN yang sudah ada. Booking Balance tampil sebagai kartu terpisah dan tidak dihitung dalam My money.

**Your profile** mengikuti urutan dan jarak dari HTML referensi. Nama, username, dan minat mengikuti Edit Profile. **Send**, **Receive**, dan **Pay Bills** ada di detail YouApp Wallet melalui My money. **My Activities** ada di Discover → Activities → Manage Activity.

**Top up** memakai judul dan urutan dari referensi. Pilihan mata uang tampil satu baris dan bisa digeser tanpa scrollbar yang terlihat. Catatan tujuan dana berada di bawah area scroll dan menampilkan mata uang yang dipilih. Fee tetap terlihat di setiap metode.

**My money** mempertahankan urutan saldo, wallet, mata uang, dan transaksi dari referensi. Filter wallet bisa digeser dalam satu baris tanpa scrollbar terlihat. Saat wallet dipilih, judul saldo menyebut nama wallet. Grafik ikut tersembunyi saat saldo disembunyikan. Recent menampilkan ikon transaksi dan status yang sesuai.

**Detail mata uang** menampilkan saldo dalam mata uang yang dipilih, estimasi RM, dan subtotal per wallet. Daftar menawarkan ikon token dan membedakan kuantitas token dari estimasi RM. Ketuk token untuk membuka wallet pemiliknya.

**Choose your plan** mempertahankan ilustrasi, tab, dan urutan manfaat dari referensi. Kartu menyesuaikan lebar layar agar empat manfaat, syarat, dan tombol tetap bisa dibaca. Label **Current** mengikuti tier akun. VIP tahunan ditampilkan sebagai RM120 sesuai checkout prototype.

Wallet provider, quote, top up, dan pembayaran berjalan dengan data demo. QR stablecoin diberi label demo. Withdraw to bank dan Back up wallet membuka informasi flow. Preferensi yang diubah berlaku di sesi prototype. Penanganan izin native dan koneksi gateway perlu QA di iOS dan Android.

**QA Chrome** mencakup entry point YouPage, hide balance, Booking Balance, satu dan beberapa wallet, koneksi MetaMask dan OKX, QR bebas dan tetap, debit internal dan eksternal, refresh quote, pending dan retry, top up kartu, pilihan stablecoin, receipt dari Settings, VIP checkout, filter Rewards dan referral, serta perubahan preferensi dan waitlist. QA viewport 375 px memeriksa akses QR referral, My money, serta pemilihan mata uang dan keypad top up. Kontrol prototype berada di luar layar Wallet pada viewport mobile.

Perbandingan Chrome pada tier Free memeriksa ukuran avatar, radius kartu, jarak chip, dan urutan profil terhadap HTML referensi. QA juga memeriksa banner di Free dan SVIP, perubahan nama setelah Save Changes, akses aksi wallet, dan teks verifikasi pada viewport 320 px.

Audit ulang HTML memperbaiki posisi bottom sheet **Pay with** dan memulihkan **Top up to use** dengan mata uang yang dipilih langsung terisi. Deretan wallet dan filter teman tetap pada posisi swipe saat pilihan berubah. Histori referral menampilkan inisial saja. Settings merangkum jumlah wallet saat lebih dari dua provider terhubung.

## Batch 1

Batch pertama mempercepat akses ke Scan to Pay dan menyamakan nominal dari Pay sampai History. Catatan di bawah mencatat desain dan pengujian batch tersebut sebelum layar diganti oleh redesign HTML di atas.

- **You Page** menempatkan saldo, Scan to Pay, Top Up, dan Rewards di atas referral dan aktivitas. Saldo YouApp Wallet di sini adalah saldo MYRT yang tersedia untuk pembayaran. View Wallets membuka daftar wallet, dan Booking Balance tersedia di Wallet and Activities.
- **Scan to Pay** memakai aturan tier dan PIN yang sudah ada. QR dengan nominal tetap tidak menyediakan keypad. Layar Pay memisahkan nominal penerima, fee, rebate jika berlaku, dan total debit.
- **Paid, Receipt, dan History** memakai record yang sama. Skenario pending menahan saldo sampai status diperbarui. Skenario gagal melepaskan saldo pembayaran dan memberi jalan untuk mencoba lagi. Saldo top up yang sudah masuk tetap tersedia.

## Acceptance criteria

| ID | Aksi | Hasil yang diharapkan |
| --- | --- | --- |
| AC-01 | Buka YouPage, pakai Hide Balance, lalu buka Booking Balance | Scan to Pay dominan. Nominal pada YouPage tersembunyi. Booking Balance terpisah dari saldo pembayaran. |
| AC-02 | Pilih QR bebas, masukkan RM25 pada tier Free, dan bayar | Penerima mendapat RM25.00, fee RM1.50, serta total debit RM26.50 pada Pay dan Receipt. History membuka reference yang sama. |
| AC-03 | Pilih QR nominal tetap, lalu tekan Back | Nominal tetap tidak dapat diedit. Back kembali ke scanner tanpa membuat transaksi. |
| AC-04 | Bayar dari skenario Pending Next Attempt, lalu Check Payment Status | Status sebelum penyelesaian adalah Pending. Setelah diselesaikan, reference tetap sama dan saldo hanya berubah sekali. |
| AC-05 | Bayar dari skenario Fail Next Attempt, lalu Try Again | Upaya gagal tidak didebit. Review mempertahankan penerima dan nominal. Pembayaran berikutnya membuat record sukses tersendiri. |
| AC-06 | Bayar dengan saldo rendah atau nominal yang membutuhkan PIN | Top Up & Pay menutup kekurangan saldo. PIN salah menampilkan feedback dan dapat dicoba ulang. |

## Keputusan untuk batch berikutnya

- Konfirmasi definisi saldo gabungan dan sumber debit per transaksi, aset yang didukung, masa berlaku quote, serta network fee pada external wallet.
- Konfirmasi metode top up per mata uang dan negara serta aturan settlement.
- Kunci harga SVIP dan effective limit di plan, settings, dan pembayaran sebelum handoff.

## Cakupan verifikasi

- **Lolos di Chrome desktop dan viewport 375 px.** AC-01 sampai AC-06 dijalankan melalui klik di prototype, termasuk PIN salah lalu berhasil, QR personal, gambar QR yang tidak valid, dan membuka receipt yang sama lewat History di YouPage maupun Settings.
- **Simulasi.** Scanner, top up, dan settlement pada alur ini disimulasikan. Record pembayaran berada di sesi prototype.
- **Belum diuji pada build native.** Kamera, PIN native, kontrak transaksi, idempotency di backend, dan lifecycle aplikasi saat kembali dari gateway perlu diverifikasi di iOS dan Android.
