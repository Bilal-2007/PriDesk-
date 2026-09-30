<div align="center">

  # 🚀 PriDesk
  ### Smart Academic Planner & Real-Time Deadline Tracker

  *Atur tumpukan deadline tanpa panik. Tahu kapan harus fokus, kapan bisa santai.*

  [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](#)
  [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)

  [![Version](https://img.shields.io/badge/version-3.0-blue?style=for-the-badge)](#)
  [![Status](https://img.shields.io/badge/status-active-success?style=for-the-badge)](#)
  [![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)](#)

  **[🐛 Report Bug](https://github.com/Bilal-2007/PriDesk-/issues) · [✨ Request Feature](https://github.com/Bilal-2007/PriDesk-/issues)**

</div>

---

## 📌 Tentang PriDesk

**PriDesk** adalah aplikasi perencana akademik & manajemen tugas kuliah berbasis web yang dirancang **khusus untuk mahasiswa**.

Berbeda dengan to-do list biasa yang pakai **prioritas manual**, PriDesk menghitung status urgensi tugas secara **otomatis & real-time** berdasarkan jarak waktu deadline ke waktu sekarang.

> 💡 **Filosofi:** Kamu nggak perlu mikir "tugas ini prioritas apa?" — PriDesk yang kasih tau.

Dibuat untuk mengatasi **workload overload** (tumpukan deadline yang mepet), biar kamu bisa ngatur waktu pengerjaan & waktu santai dengan lebih terstruktur.

---

## ✨ Fitur Unggulan

<table>
<tr>
<td width="50%">

### ⏱️ Real-Time Dynamic Status
Status & warna tugas dihitung otomatis dengan presisi **tanggal + jam + menit**:
- 🔴 **TERLAMBAT** — Deadline udah lewat
- 🟠 **HARI INI** — Deadline hari ini & belum lewat
- 🟡 **MULAI DEKAT** — Sisa 1–7 hari
- 🟢 **MASIH LAMA** — Masih > 7 hari

</td>
<td width="50%">

### ⚡ Auto-Update Tanpa Reload
Pengecekan waktu jalan di background — indikator warna tugas otomatis update tanpa perlu refresh halaman.

### 📚 Pengelompokan Per Mata Kuliah
Auto-mapping tugas berdasarkan mata kuliah + statistik progress-nya.

</td>
</tr>
<tr>
<td width="50%">

### 📸 Lampiran Foto
Tambah foto/gambar pada tugas. Otomatis **dikompres** (max 800×800, quality 70%) biar hemat storage. Bisa dilihat **fullscreen** dengan tombol download.

### 📅 Kalender Interaktif
Visualisasi jadwal bulanan dengan titik warna sesuai tingkat urgensi deadline.

</td>
<td width="50%">

### 🔍 Search & Filter Pintar
Cari cepat pakai keyword + filter status deadline dinamis.

### 💾 Data Lokal & Backup
Semua data tersimpan aman di browser (`localStorage`) — plus fitur **Export / Import JSON**.

</td>
</tr>
<tr>
<td width="50%">

### 🎬 Animasi Selesai + Undo
Klik centang → animasi card slide out + toast dengan tombol **"Batalkan"** (5 detik undo).

### 🎨 Premium UI/UX
Desain modern, animasi halus, fully responsive (mobile & desktop).

</td>
<td width="50%">

### 🌙 Mode Per-Mata-Kuliah
Dropdown pintar untuk pilih mata kuliah atau kegiatan — bisa **nambah custom** yang tersimpan otomatis.

### 📱 Mobile-First Design
Sidebar mobile dengan animasi X, hamburger di kanan, semua tombol touch-friendly.

</td>
</tr>
</table>

---

## 📸 Preview Aplikasi

<div align="center">

| Dashboard | Kalender | Semua Tugas |
|:---------:|:--------:|:-----------:|
| ![Dashboard](#) | ![Kalender](#) | ![Semua Tugas](#) |

| Hari Ini | Terlambat | Selesai |
|:--------:|:---------:|:-------:|
| ![Hari Ini](#) | ![Terlambat](#) | ![Selesai](#) |

> 💡 *Screenshot akan ditambahkan di update berikutnya.*

</div>

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|:-----:|:----------|
| **Frontend** | HTML5, Vanilla JavaScript (ES6+) |
| **Styling** | Custom CSS + Tailwind CSS |
| **Plugin** | Flatpickr (Datetime Picker) |
| **Font** | Plus Jakarta Sans |
| **Storage** | Browser `localStorage` API |
| **Icon** | Inline SVG |
| **Image Compression** | HTML5 Canvas API |

---

## 📖 Cara Menjalankan

### 🔧 Prasyarat
- Browser modern (Chrome, Firefox, Edge, Safari)
- **Visual Studio Code** + ekstensi **Live Server** *(direkomendasikan)*

### 🚀 Langkah Instalasi

**1. Clone Repository**
```bash
git clone https://github.com/Bilal-2007/PriDesk-.git
cd PriDesk-
