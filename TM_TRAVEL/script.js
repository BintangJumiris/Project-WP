/* =========================================================================
   NusaTravel — Script global
   ====================================================================== */

/* ------------------------------------------------------------------------
   A.  FORM PEMESANAN (halaman publik - index.html & form-pemesanan.html)
   --------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const formPemesanan = document.getElementById('formPemesanan');
    const bayarSection = document.getElementById('pembayaran');
    const tiketSection = document.getElementById('tiket');

    // Mengambil destinasi dari URL jika ada (untuk tombol 'Pesan Sekarang' di kartu)
    const urlParams = new URLSearchParams(window.location.search);
    const destinasiFromUrl = urlParams.get('destinasi');
    if (destinasiFromUrl && document.getElementById('destinasiPilihan')) {
        document.getElementById('destinasiPilihan').value = destinasiFromUrl;
    }

    // Fungsi untuk memperbarui pilihan destinasi pada form pemesanan
    function updateDestinasiOptions() {
        const destinasiSelect = document.getElementById('destinasiPilihan');
        if (destinasiSelect) {
            destinasiSelect.innerHTML = '<option value="">Pilih Destinasi</option>'; // Reset options
            const destinasiData = JSON.parse(localStorage.getItem('destinasi')) || [];
            destinasiData.forEach(d => {
                const option = document.createElement('option');
                option.value = d.nama.toLowerCase().replace(/\s/g, '');
                option.textContent = d.nama;
                destinasiSelect.appendChild(option);
            });
            // Setel ulang nilai dari URL jika ada setelah opsi dimuat
            if (destinasiFromUrl) {
                destinasiSelect.value = destinasiFromUrl;
            }
        }
    }

    // Panggil fungsi ini saat DOMContentLoaded untuk mengisi daftar destinasi
    updateDestinasiOptions();

    if (formPemesanan) {
        formPemesanan.addEventListener('submit', e => {
            e.preventDefault();
            const destinasi = document.getElementById('destinasiPilihan').value;
            const jumlahTiket = parseInt(document.getElementById('jumlahTiket').value);
            const namaLengkap = document.getElementById('namaLengkap').value;
            const email = document.getElementById('email').value;

            // Dapatkan harga destinasi dari localStorage
            const destinasiData = JSON.parse(localStorage.getItem('destinasi')) || [];
            const selectedDestinasi = destinasiData.find(d => d.nama.toLowerCase().replace(/\s/g, '') === destinasi.toLowerCase().replace(/\s/g, ''));
            const hargaPerTiket = selectedDestinasi ? parseFloat(selectedDestinasi.harga) : 0;

            const totalHarga = hargaPerTiket * jumlahTiket;

            // Simpan data pemesanan ke localStorage
            const pemesanan = JSON.parse(localStorage.getItem('pemesanan')) || [];
            const newPemesanan = {
                id: Date.now(), // ID unik berdasarkan timestamp
                namaCustomer: namaLengkap,
                emailCustomer: email,
                destinasi: destinasi,
                jumlahTiket: jumlahTiket,
                hargaPerTiket: hargaPerTiket,
                totalHarga: totalHarga,
                status: 'pending', // Default status: pending
                tanggalPesan: new Date().toLocaleString()
            };
            pemesanan.push(newPemesanan);
            localStorage.setItem('pemesanan', JSON.stringify(pemesanan));

            alert(`Pemesanan Anda untuk ${jumlahTiket} tiket ke ${destinasi} dengan total Rp${totalHarga.toLocaleString()} telah dibuat. Mohon lanjutkan pembayaran.`);

            formPemesanan.classList.add('hidden');
            if (bayarSection) bayarSection.classList.remove('hidden');

            // Opsional: tampilkan ringkasan di halaman pembayaran
            // document.getElementById('detailPemesananPembayaran').innerText = `Destinasi: ${destinasi}, Jumlah: ${jumlahTiket}, Total: Rp${totalHarga.toLocaleString()}`;
        });
    }

    /* -- Proteksi dashboard admin -- */
    if (location.pathname.endsWith('admin-dashboard.html')) {
        if (!sessionStorage.getItem('isAdmin')) {
            location.href = '../admin-login.html'; // Sesuaikan path jika admin-login.html di root
        } else {
            // Inisialisasi dashboard saat halaman dimuat
            renderDashboardCards();
            // Default tampilkan dashboard section
            showSection('dashboard-section', document.querySelector('.sidebar-menu a.active'));
        }
    }
});

/* konfirmasi pembayaran publik */
function konfirmasiPembayaran() {
    document.getElementById('pembayaran')?.classList.add('hidden');
    document.getElementById('tiket')?.classList.remove('hidden');
}

/* ------------------------------------------------------------------------
   B.  NAVBAR MOBILE (halaman publik)
   --------------------------------------------------------------------- */
function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

/* ------------------------------------------------------------------------
   C.  LOGIN ADMIN
   --------------------------------------------------------------------- */
function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername')?.value.trim();
    const pass = document.getElementById('adminPassword')?.value.trim();
    /* kredensial default */
    if (user === 'admin' && pass === 'admin123') {
        sessionStorage.setItem('isAdmin', 'true');
        window.location.href = 'admin-dashboard.html';
    } else {
        alert('Username atau password salah!');
    }
}

/* ------------------------------------------------------------------------
   D.  DASHBOARD NAVIGATION
   --------------------------------------------------------------------- */
/**
 * Menampilkan section sesuai id & menandai link aktif.
 * @param {string} sectionId  id dari <section>
 * @param {HTMLElement} link  anchor yang diklik
 */
function showSection(sectionId, link) {
    /* 1. tampil/sembunyi section */
    document.querySelectorAll('.content-section')
        .forEach(sec => sec.classList.toggle('hidden', sec.id !== sectionId));

    /* 2. highlight link aktif */
    document.querySelectorAll('.sidebar-menu a')
        .forEach(a => a.classList.toggle('active', a === link));

    // Update dashboard cards if navigating to dashboard
    if (sectionId === 'dashboard-section') {
        renderDashboardCards();
    }
}

/* ------------------------------------------------------------------------
   E.  LOGOUT ADMIN
   --------------------------------------------------------------------- */
function adminLogout() {
    sessionStorage.removeItem('isAdmin');
    location.href = '../index.html'; // Sesuaikan path jika index.html di root
}

/* ------------------------------------------------------------------------
   F.  MANAJEMEN DESTINASI (Admin Dashboard)
   --------------------------------------------------------------------- */

// Fungsi untuk mendapatkan destinasi dari localStorage
function getDestinasi() {
    const destinasi = localStorage.getItem('destinasi');
    return destinasi ? JSON.parse(destinasi) : [];
}

// Fungsi untuk menyimpan destinasi ke localStorage
function saveDestinasi(destinasiArray) {
    localStorage.setItem('destinasi', JSON.stringify(destinasiArray));
}

// Fungsi untuk merender tabel destinasi
function renderDestinasiTable() {
    const destinasiTableBody = document.querySelector('#destinasi-table tbody');
    if (!destinasiTableBody) return;

    destinasiTableBody.innerHTML = ''; // Kosongkan tabel
    const destinasiData = getDestinasi();

    if (destinasiData.length === 0) {
        destinasiTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada destinasi.</td></tr>';
        return;
    }

    destinasiData.forEach(dest => {
        const row = destinasiTableBody.insertRow();
        row.innerHTML = `
            <td>${dest.id}</td>
            <td>${dest.nama}</td>
            <td>Rp${parseFloat(dest.harga).toLocaleString('id-ID')}</td>
            <td><img src="${dest.gambar || 'https://via.placeholder.com/50'}" alt="${dest.nama}" width="50" height="50" style="object-fit: cover; border-radius: 5px;"></td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editDestinasi(${dest.id})"><i class="fas fa-edit"></i> Edit</button>
                <button class="delete-btn" onclick="deleteDestinasi(${dest.id})"><i class="fas fa-trash-alt"></i> Hapus</button>
            </td>
        `;
    });
}

// Fungsi untuk menambah/mengedit destinasi
document.addEventListener('DOMContentLoaded', () => {
    const destinasiForm = document.getElementById('destinasi-form');
    if (destinasiForm) {
        destinasiForm.addEventListener('submit', e => {
            e.preventDefault();
            const id = document.getElementById('destinasiId').value;
            const nama = document.getElementById('destinasiNama').value;
            const harga = document.getElementById('destinasiHarga').value;
            const gambar = document.getElementById('destinasiGambar').value;

            let destinasiData = getDestinasi();

            if (id) {
                // Edit destinasi
                destinasiData = destinasiData.map(d =>
                    d.id == id ? { ...d, nama, harga, gambar } : d
                );
                alert('Destinasi berhasil diperbarui!');
            } else {
                // Tambah destinasi baru
                const newId = destinasiData.length > 0 ? Math.max(...destinasiData.map(d => d.id)) + 1 : 1;
                const newDestinasi = { id: newId, nama, harga, gambar };
                destinasiData.push(newDestinasi);
                alert('Destinasi berhasil ditambahkan!');
            }

            saveDestinasi(destinasiData);
            renderDestinasiTable(); // Render ulang tabel
            destinasiForm.reset(); // Reset form
            document.getElementById('destinasiId').value = ''; // Hapus ID yang disimpan
            document.getElementById('destinasiSubmitBtn').textContent = 'Tambah Destinasi'; // Ubah teks tombol kembali
            // Perbarui juga destinasi di halaman publik (jika index.html sedang terbuka)
            if (typeof updateDestinasiOptions === 'function') {
                updateDestinasiOptions();
            }
        });
    }
});


// Fungsi untuk mengisi form saat edit
function editDestinasi(id) {
    const destinasiData = getDestinasi();
    const destToEdit = destinasiData.find(d => d.id === id);

    if (destToEdit) {
        document.getElementById('destinasiId').value = destToEdit.id;
        document.getElementById('destinasiNama').value = destToEdit.nama;
        document.getElementById('destinasiHarga').value = destToEdit.harga;
        document.getElementById('destinasiGambar').value = destToEdit.gambar;
        document.getElementById('destinasiSubmitBtn').textContent = 'Update Destinasi';
        // Gulir ke atas ke formulir
        document.getElementById('destinasi-form').scrollIntoView({ behavior: 'smooth' });
    }
}

// Fungsi untuk menghapus destinasi
function deleteDestinasi(id) {
    if (confirm('Apakah Anda yakin ingin menghapus destinasi ini?')) {
        let destinasiData = getDestinasi();
        destinasiData = destinasiData.filter(d => d.id !== id);
        saveDestinasi(destinasiData);
        renderDestinasiTable();
        alert('Destinasi berhasil dihapus!');
        // Perbarui juga destinasi di halaman publik (jika index.html sedang terbuka)
        if (typeof updateDestinasiOptions === 'function') {
            updateDestinasiOptions();
        }
    }
}


/* ------------------------------------------------------------------------
   G.  MANAJEMEN PEMESANAN (Admin Dashboard)
   --------------------------------------------------------------------- */

// Fungsi untuk mendapatkan pemesanan dari localStorage
function getPemesanan() {
    const pemesanan = localStorage.getItem('pemesanan');
    return pemesanan ? JSON.parse(pemesanan) : [];
}

// Fungsi untuk menyimpan pemesanan ke localStorage
function savePemesanan(pemesananArray) {
    localStorage.setItem('pemesanan', JSON.stringify(pemesananArray));
}

// Fungsi untuk merender tabel pemesanan
function renderPemesananTable() {
    const pemesananTableBody = document.querySelector('#pemesanan-table tbody');
    if (!pemesananTableBody) return;

    pemesananTableBody.innerHTML = ''; // Kosongkan tabel
    const pemesananData = getPemesanan();

    if (pemesananData.length === 0) {
        pemesananTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">Belum ada pemesanan.</td></tr>';
        return;
    }

    pemesananData.forEach(pesan => {
        const row = pemesananTableBody.insertRow();
        const statusClass = pesan.status === 'verified' ? 'status-verified' : 'status-pending';
        const actionButton = pesan.status === 'pending' ?
            `<button class="verify-btn" onclick="verifyPemesanan(${pesan.id})"><i class="fas fa-check-circle"></i> Verifikasi</button>` :
            '<button class="verify-btn" disabled style="background-color: #cccccc;"><i class="fas fa-check-circle"></i> Terverifikasi</button>';

        row.innerHTML = `
            <td>${pesan.id}</td>
            <td>${pesan.namaCustomer}</td>
            <td>${pesan.emailCustomer}</td>
            <td>${pesan.destinasi}</td>
            <td>${pesan.jumlahTiket}</td>
            <td>Rp${parseFloat(pesan.totalHarga).toLocaleString('id-ID')}</td>
            <td class="${statusClass}">${pesan.status.toUpperCase()}</td>
            <td>${pesan.tanggalPesan}</td>
            <td class="action-buttons">
                ${actionButton}
                <button class="delete-btn" onclick="deletePemesanan(${pesan.id})"><i class="fas fa-trash-alt"></i> Hapus</button>
            </td>
        `;
    });
}

// Fungsi untuk memverifikasi pemesanan
function verifyPemesanan(id) {
    if (confirm('Apakah Anda yakin ingin memverifikasi pembayaran ini?')) {
        let pemesananData = getPemesanan();
        pemesananData = pemesananData.map(p =>
            p.id === id ? { ...p, status: 'verified' } : p
        );
        savePemesanan(pemesananData);
        renderPemesananTable();
        renderDashboardCards(); // Perbarui kartu dashboard setelah verifikasi
        alert('Pemesanan berhasil diverifikasi!');
    }
}

// Fungsi untuk menghapus pemesanan
function deletePemesanan(id) {
    if (confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) {
        let pemesananData = getPemesanan();
        pemesananData = pemesananData.filter(p => p.id !== id);
        savePemesanan(pemesananData);
        renderPemesananTable();
        renderDashboardCards(); // Perbarui kartu dashboard setelah penghapusan
        alert('Pemesanan berhasil dihapus!');
    }
}

/* ------------------------------------------------------------------------
   H.  MEDIA MANAGEMENT (Admin Dashboard)
   --------------------------------------------------------------------- */

// Data gambar yang disimpan di localStorage
function getMedia() {
    const media = localStorage.getItem('mediaGallery');
    return media ? JSON.parse(media) : [];
}

function saveMedia(mediaArray) {
    localStorage.setItem('mediaGallery', JSON.stringify(mediaArray));
}

// Fungsi untuk mengunggah dan menampilkan media (gambar)
function uploadMedia() {
    const input = document.getElementById('media-upload-input');
    const files = input.files;
    if (files.length === 0) {
        alert('Pilih setidaknya satu gambar untuk diunggah.');
        return;
    }

    let mediaData = getMedia();

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newImage = {
                id: Date.now() + Math.random(), // Unique ID
                src: e.target.result, // Data URL
                name: file.name
            };
            mediaData.push(newImage);
            saveMedia(mediaData);
            renderMediaGallery();
        };
        reader.readAsDataURL(file); // Convert file to Data URL
    });

    input.value = ''; // Clear the input after upload
    alert('Gambar berhasil diunggah!');
}

// Fungsi untuk merender galeri media
function renderMediaGallery() {
    const galleryContainer = document.getElementById('media-gallery');
    if (!galleryContainer) return;

    galleryContainer.innerHTML = '';
    const mediaData = getMedia();

    if (mediaData.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; width: 100%;">Belum ada media yang diunggah.</p>';
        return;
    }

    mediaData.forEach(item => {
        const mediaItemDiv = document.createElement('div');
        mediaItemDiv.classList.add('media-item');
        mediaItemDiv.innerHTML = `
            <img src="${item.src}" alt="${item.name}" onclick="openModal('${item.src}', '${item.name}', ${item.id})">
            <p style="font-size: 0.9em; margin-bottom: 5px; word-break: break-all;">${item.name}</p>
            <button onclick="deleteMedia(${item.id})"><i class="fas fa-trash-alt"></i> Hapus</button>
        `;
        galleryContainer.appendChild(mediaItemDiv);
    });
}

// Modal functions for media
let currentModalImageId = null;

function openModal(src, name, id) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalImageName = document.getElementById('modalImageName');

    modalImage.src = src;
    modalImageName.textContent = name;
    currentModalImageId = id; // Store the ID of the image currently in the modal
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('imageModal').style.display = 'none';
    currentModalImageId = null;
}

function deleteImageFromModal() {
    if (currentModalImageId !== null) {
        deleteMedia(currentModalImageId);
        closeModal();
    }
}


// Fungsi untuk menghapus media
function deleteMedia(id) {
    if (confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
        let mediaData = getMedia();
        mediaData = mediaData.filter(item => item.id !== id);
        saveMedia(mediaData);
        renderMediaGallery();
        alert('Gambar berhasil dihapus!');
    }
}


/* ------------------------------------------------------------------------
   I.  DASHBOARD CARD DATA (Admin Dashboard)
   --------------------------------------------------------------------- */

function renderDashboardCards() {
    const pemesananData = getPemesanan();
    const destinasiData = getDestinasi();

    const totalPemesanan = pemesananData.length;
    const pemesananPending = pemesananData.filter(p => p.status === 'pending').length;
    const destinasiAktif = destinasiData.length; // Anggap semua destinasi adalah aktif untuk saat ini
    const destinasiNonaktif = 0; // Anda bisa menambahkan status 'non-aktif' di objek destinasi jika diperlukan

    document.getElementById('total-pemesanan').textContent = totalPemesanan;
    document.getElementById('pemesanan-pending').textContent = pemesananPending;
    document.getElementById('destinasi-aktif').textContent = destinasiAktif;
    document.getElementById('destinasi-nonaktif').textContent = destinasiNonaktif;
}

// Inisialisasi data awal jika belum ada di localStorage (opsional, untuk demo)
function initializeDummyData() {
    if (!localStorage.getItem('destinasi')) {
        const dummyDestinasi = [
            { id: 1, nama: 'Bali', harga: 1500000, gambar: '../assets/images/bali.png' },
            { id: 2, nama: 'Yogyakarta', harga: 1200000, gambar: '../assets/images/yogyakarta.png' },
            { id: 3, nama: 'Raja Ampat', harga: 3200000, gambar: '../assets/images/rajaampat.png.jpg' },
            { id: 4, nama: 'Lombok', harga: 1800000, gambar: '../assets/images/lombok.png' },
            { id: 5, nama: 'Labuan Bajo', harga: 2500000, gambar: '../assets/images/labuanbajo.png' },
            { id: 6, nama: 'Danau Toba', harga: 2800000, gambar: '../assets/images/Danautoba.png' }
        ];
        saveDestinasi(dummyDestinasi);
    }

    if (!localStorage.getItem('pemesanan')) {
        const dummyPemesanan = [
            { id: 1678886400000, namaCustomer: 'Budi Santoso', emailCustomer: 'budi@example.com', destinasi: 'bali', jumlahTiket: 2, hargaPerTiket: 1500000, totalHarga: 3000000, status: 'pending', tanggalPesan: '12/07/2025, 10:00:00 PM' },
            { id: 1678886500000, namaCustomer: 'Siti Aminah', emailCustomer: 'siti@example.com', destinasi: 'yogyakarta', jumlahTiket: 1, hargaPerTiket: 1200000, totalHarga: 1200000, status: 'verified', tanggalPesan: '11/07/2025, 09:30:00 AM' }
        ];
        savePemesanan(dummyPemesanan);
    }
}

// Panggil inisialisasi data dummy saat DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeDummyData);