# Logic Flow Activity V3

Dokumen ini menjadi acuan perilaku Activity pada prototype. Activity gratis dan
berbeda dari Service: Service tetap berbayar, hanya untuk Host, dan fee 30%.

## 1. Akses dan pembuatan

- Satu-satunya jalur membuat activity: **You tab → My Activities → Create Activity**.
- Tombol Host dashboard adalah **Create Service**.
- Guest yang membuat activity diarahkan ke login. User login dengan KYC belum
  approved melihat sheet **Verify your identity first**. KYC approved masuk ke form.
- Form Create Activity terdiri dari 7 step:
  1. Category dan subcategory.
  2. Title (maks. 120 karakter) dan description (maks. 500 karakter).
  3. Foto (minimal 3).
  4. Activities (1–5 item).
  5. Lokasi.
  6. Schedule dan sessions; sesi tidak boleh overlap atau dimulai di masa lalu.
  7. Minimum dan maximum participants. Maximum dapat dimatikan; tanpa maximum,
     activity tidak pernah berstatus Fully Booked.
- Tidak ada step harga, pembayaran, PIN, promo, fee, ataupun draft. Keluar dari
  form menampilkan **Leave without saving?**.
- Setelah konfirmasi step terakhir, activity berstatus **In review**.

## 2. Status dan grup

`Submit → In review → (Approve → Live / Reject → Rejected)`

- Activity aktif sejak admin approve sampai waktu selesai sesi terakhir. Status
  kemudian menjadi **Ended**.
- Activity **In review** atau **Rejected** belum memiliki grup dan dapat dihapus
  tanpa dialog grup.
- Saat admin approve, grup activity dibuat otomatis. Owner menjadi admin grup;
  nama memakai prefix `Activity:` dan bio menghubungkan grup ke activity.
- Saat owner menerima request, peserta otomatis masuk ke grup. Request pending
  atau rejected tidak menambahkan peserta.

## 3. Request to Join

- Detail activity dapat dibuka dari Discover > Activities, Search, atau Media viewer.
- Detail menampilkan **Free · owner approves**. Tidak ada pembayaran.
- Peserta memilih sesi dan jumlah orang; jumlah tidak boleh melebihi sisa slot sesi.
- Request langsung dikirim ke owner dan CTA menjadi **Request Sent**.
- CTA dinonaktifkan bila activity Fully Booked, berada di negara lain, atau request
  sudah dikirim. Pelamar pending dapat menarik request.
- Join memerlukan login. KYC gate pada flow ini hanya berlaku untuk pembuatan
  activity; KYC gate pembuatan tidak ditampilkan saat peserta meminta bergabung.

## 4. My Activities dan edit

- My Activities menampilkan activity yang dibuat dan request yang dikirim.
- Applicant list owner memiliki tab **New Request**, **Accepted**, dan **Rejected**.
- Request pending ikut dihitung ke batas maximum participants. Reject tidak
  memerlukan refund karena activity gratis.
- Peserta accepted tidak dapat dikeluarkan owner dari grup.
- Edit terkunci selama schedule aktif jika activity sudah memiliki peserta
  accepted. Perubahan yang disimpan dikirim kembali ke review admin.

## 5. Grup, keluar, unlist, dan delete

- Selama schedule aktif, member tidak dapat keluar/batal ikut; owner tidak dapat
  keluar, menghapus, unlist, atau list again. Aksi terkunci tampil redup dan
  menampilkan alasan saat ditekan.
- Setelah sesi terakhir selesai, member boleh keluar. Owner boleh keluar; admin
  berpindah ke member yang paling lama bergabung. Jika owner anggota terakhir,
  grup dibubarkan.
- Unlist tidak menghapus atau memutus grup; grup tetap aktif dan terhubung.
- Delete hanya tersedia di luar schedule aktif:
  - Tanpa grup: konfirmasi hapus biasa.
  - Dengan grup: **Delete activity and group**, **Delete activity, keep the group**,
    atau **Cancel**.
  - Jika grup dipertahankan, prefix dan link activity dihapus dan pesan sistem
    menjelaskan bahwa grup menjadi grup biasa.

## 6. Navigasi dan penamaan

- Tab Discover menampilkan **Hosts / Activities / Cashback**; key internal tidak
  berubah.
- Bottom navigation dan judul chat menggunakan **Hosts**.
- Review setelah selesai tetap mengikuti aturan yang sudah ada.