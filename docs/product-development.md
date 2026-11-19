# YouApp Product Development Baseline

Panduan untuk mengubah ide dari boss, client, dan stakeholder menjadi keputusan produk dan desain yang siap dibangun di iOS dan Android. Setiap fitur perlu menjawab empat pertanyaan. Masalah apa yang diselesaikan, apa yang sudah disepakati, apa yang developer bangun, dan bagaimana QA memverifikasinya?

## Peran dan cara mengambil keputusan

| Peran | Skillset | Tanggung jawab |
| --- | --- | --- |
| Senior Product Manager | Discovery, analisis bukti, prioritas, stakeholder alignment, business rules | Menilai peluang, menetapkan scope dan ukuran keberhasilan, serta mendokumentasikan keputusan. |
| Senior UI/UX Designer | User flow, interaction design, design system, accessibility, prototyping dan usability testing | Merancang alur, state dan recovery, serta mendefinisikan perilaku lintas platform. |
| Engineering reviewer | Feasibility iOS/Android, API, data, estimasi | Memeriksa dependensi dan batasan platform sebelum handoff. |
| QA reviewer | Skenario, pengujian interaksi dan regresi | Memverifikasi acceptance criteria dan mencatat hasil per lingkungan. |

PM dan Designer bisa dijalankan oleh orang yang sama. Tunjuk satu decision owner per fitur. Jika masukan stakeholder bertentangan, PM mencatat pilihan, bukti, trade-off, dan rekomendasi. Decision owner memutuskan, lalu keputusan, tanggal, dan alasannya dicatat di spec.

## Dari ide sampai release

| Tahap | Yang dikerjakan | Hasil sebelum lanjut |
| --- | --- | --- |
| Intake | Simpan sumber masukan, permintaan asli, user terdampak, masalah yang dialami, dan alasan waktunya. Catat solusi yang diusulkan sebagai hipotesis. | Brief singkat dan decision owner teridentifikasi. |
| Validasi dan prioritas | Periksa user feedback, data, observasi, atau kebutuhan bisnis. Nilai dampak, keyakinan terhadap bukti, effort, dan risiko. Jika buktinya kurang, pilih cara termurah untuk menguji asumsi utama. | Keputusan lanjut, perlu validasi, tunda, atau tutup, dengan alasan. |
| Definisi | Sepakati tujuan, ukuran keberhasilan, scope MVP, batas scope, rules dan permissions. Review dependensi API/data dan perbedaan iOS/Android dengan engineering. | Scope disepakati. Pertanyaan terbuka punya owner dan dampak yang jelas. |
| Desain dan prototype | Pakai komponen YouApp. Rancang alur utama dan state relevan seperti loading, empty, offline, error, retry, dan izin ditolak. Tentukan Back, cancel, dan resume. | Flow dan state bisa dicoba. Perbedaan platform dan simulasi prototype tercatat. |
| QA prototype | Uji dari entry point normal. Jalankan acceptance criteria, aksi yang terdampak, recovery, dan regresi terkait. Catat platform atau browser, build/revisi, langkah, dan hasil. | Hasil **Pass**, **Fail**, atau **Belum diuji** dengan bukti dan isu yang masih terbuka. |
| Handoff dan verifikasi build | Serahkan spec, desain, prototype, acceptance criteria, dan dependensi. Setelah implementasi, ulangi skenario pada build iOS dan Android. | Status **Ready for Dev** dan **Ready for Release** ditetapkan berdasarkan kriteria di bawah. |

### Ready for Dev

- Scope dan keputusan inti disetujui. Isu yang menghalangi implementasi sudah diselesaikan.
- Spec, flow, state, business rules, permissions, dan acceptance criteria dapat ditemukan dari satu halaman.
- Engineering sudah meninjau perilaku iOS/Android, dependensi, serta kontrak data dan API yang relevan.
- Alur yang dapat dijalankan di prototype sudah diuji. Simulasi dan skenario yang harus diuji pada build native tercatat.

### Ready for Release

- Acceptance criteria dan regresi yang relevan diperiksa pada build iOS dan Android, dengan hasil per platform.
- Isu yang menghalangi rilis sudah selesai. Isu lain yang diterima dicatat bersama decision owner dan dampaknya.

## Skill pendukung

| Skill | Kapan dipakai | Cara pakai di YouApp |
| --- | --- | --- |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Review visual setelah arah UX disepakati. | Ambil prinsip hierarki, konsistensi, dan polish. Terapkan hanya yang relevan dengan UI mobile dan design system YouApp. |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Membandingkan pola interaksi dan review desain sebelum QA. | Periksa states, usability dan accessibility. Evaluasi rekomendasinya dengan konteks user dan komponen yang sudah ada. |
| [Graphify](https://github.com/Graphify-Labs/graphify) | Memetakan dampak perubahan lintas route, dokumen, dan file prototype. | Mulai dari code-only untuk pemetaan kode. Verifikasi hubungan yang penting langsung di sumber. |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Merangkum update, triage, atau catatan keputusan singkat. | Pertahankan konteks, aturan, dan expected result yang diperlukan di spec, QA evidence, dan handoff. |

Gunakan skill sesuai kebutuhan per tahap. Temuan skill menjadi masukan untuk review. Decision owner menyetujui perubahan scope atau rules, dan QA memverifikasi perilaku yang dihasilkan.

### Setup skill untuk checkout baru

Ikuti [panduan instalasi skill](../SKILLS.md) untuk versi yang dipin, langkah instalasi, dan cara verifikasi dari root repo.

## Satu konteks untuk tim dan agent

- [AGENTS.md](../AGENTS.md) adalah pintu masuk untuk memahami cara kerja repo.
- Gunakan [template fitur](features/_template.md) untuk spec baru, atau tautkan PRD yang sudah ada dari spec bila masih berlaku. Simpan perubahan keputusan di spec yang sama.
- Spec yang sudah disetujui menjadi acuan perilaku dan scope. Desain serta prototype memperjelas tampilannya dan cara berinteraksi. [Design system](../design-system/README.md) menjadi acuan komponen dan token.
- [Claude artifact baseline](../ARTIFACT_BASELINE.md) menyimpan benchmark historis dan pembagian route prototype. Jika spec, desain, dan prototype berbeda, decision owner mengonfirmasi perilaku yang berlaku sebelum handoff.

## Pilot pertama

Gunakan **Group Chat / YouApp Products**. Mulai dengan memetakan alur member dan admin, permissions, teks/media/voice, serta voice call, video call, dan call history. Konfirmasi scope bersama decision owner. Tandai fungsi yang disimulasikan di prototype dan pindahkan verifikasi native ke daftar QA iOS/Android.

Skenario regresi pertama adalah voice note. Buka grup lewat daftar chat, scroll ke voice note di tengah riwayat, lalu play, pause, dan resume. Posisi chat tetap pada pesan yang sedang dilihat. Catat hasil per lingkungan. Gunakan hasil pilot untuk menyederhanakan baseline sebelum diterapkan ke fitur berikutnya.
