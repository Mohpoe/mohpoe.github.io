/**
 * FUNGSI UTAMA YANG DIGUNAKAN DI SEMUA HALAMAN
 */

// Konfigurasi
const APP_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwVkwFp-dl9btraUXC8ugAFuAEeODAtDSYVoAsIuJH-wHxD-kuI8HMw-Fuf2g2RqLT2/exec'; // Ganti dengan URL Web App Anda

// Inisialisasi Dark/Light Mode
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
}

// Toggle Dark/Light Mode
function setupThemeToggle() {
    const themeToggles = document.querySelectorAll('#themeToggle'); // Gunakan querySelectorAll

    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            // Update ikon tombol
            toggle.innerHTML = newTheme === 'dark' ? '🌞' : '🌓';
        });
    });
}

// Inisialisasi tema saat load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);

    // Update ikon tombol sesuai tema awal
    const themeToggles = document.querySelectorAll('#themeToggle');
    themeToggles.forEach(toggle => {
        toggle.innerHTML = savedTheme === 'dark' ? '🌞' : '🌓';
    });

    setupThemeToggle();
});

// Fungsi toggle loading
function showLoading() {
    document.getElementById('loadingIndicator').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loadingIndicator').style.display = 'none';
}

// Format Tanggal untuk Tampilan
function formatDate(dateString) {
    if (!dateString) return '-';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Tampilkan Notifikasi
function showAlert(message, type = 'success', duration = 3000) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1000';
    alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), duration);
}

/**
 * FUNGSI KHUSUS UNTUK HALAMAN INDEX.HTML (Daftar Siswa)
 */
if (document.getElementById('formSiswa')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadSiswa();

        // Submit form tambah siswa
        document.getElementById('formSiswa').addEventListener('submit', (e) => {
            e.preventDefault();
            showLoading();
            const nis = document.getElementById('nis').value;
            const nama = document.getElementById('nama').value;

            fetch(APP_SCRIPT_URL, {
                method: 'POST',
                body: new URLSearchParams({ action: 'addSiswa', nis, nama })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showAlert(data.error, 'danger');
                    } else {
                        showAlert('Siswa berhasil ditambahkan!');
                        document.getElementById('formSiswa').reset();
                        loadSiswa();
                    }
                })
                .catch(error => showAlert('Error: ' + error.message, 'danger'))
                .finally(() => hideLoading());
        });
    });

    // Load daftar siswa
    function loadSiswa() {
        showLoading();

        fetch(`${APP_SCRIPT_URL}?action=getSiswa`)
            .then(response => response.json())
            .then(data => {
                const tabelBody = document.querySelector('#tabelSiswa tbody');
                tabelBody.innerHTML = '';

                data.forEach(siswa => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
          <td>${siswa[0]}</td>
          <td>${siswa[1]}</td>
          <td>
            <button class="btn btn-sm btn-danger delete-btn" 
                    data-nis="${siswa[0]}" 
                    data-nama="${siswa[1]}">
              <i class="bi bi-trash"></i> Hapus
            </button>
          </td>
        `;
                    tabelBody.appendChild(row);
                });

                // Inisialisasi event listener untuk tombol hapus
                document.querySelectorAll('.delete-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const nis = e.target.closest('button').dataset.nis;
                        const nama = e.target.closest('button').dataset.nama;
                        showDeleteConfirmModal(nis, nama);
                    });
                });
            })
            .catch(error => showAlert('Gagal memuat data siswa', 'danger'))
            .finally(() => hideLoading());
    }

    function showDeleteConfirmModal(nis, nama) {
        document.getElementById('studentNisToDelete').textContent = nis;
        document.getElementById('studentNameToDelete').textContent = nama;

        const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
        modal.show();

        document.getElementById('confirmDeleteBtn').onclick = () => {
            deleteStudent(nis);
            modal.hide();
        };
    }

    function deleteStudent(nis) {
        showLoading();

        fetch(`${APP_SCRIPT_URL}?action=deleteSiswa&nis=${encodeURIComponent(nis)}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('Siswa berhasil dihapus');
                    loadSiswa(); // Refresh tabel
                } else {
                    showAlert(data.error || 'Gagal menghapus siswa', 'danger');
                }
            })
            .catch(error => showAlert('Error: ' + error.message, 'danger'))
            .finally(() => hideLoading());
    }
}

// Contoh implementasi di fungsi loadSiswa():
function loadSiswa() {
    showLoading(); // Tampilkan loading

    fetch(`${APP_SCRIPT_URL}?action=getSiswa`)
        .then(response => response.json())
        .then(data => {
            // Proses data...
        })
        .catch(error => {
            showAlert('Gagal memuat data siswa', 'danger');
        })
        .finally(() => {
            hideLoading(); // Sembunyikan loading
        });
}

function setButtonLoading(button, isLoading) {
    const btn = button instanceof HTMLElement ? button : document.querySelector(button);
    if (isLoading) {
        btn.innerHTML = `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Memproses...`;
        btn.classList.add('btn-loading');
        btn.disabled = true;
    } else {
        btn.innerHTML = btn.dataset.originalText;
        btn.classList.remove('btn-loading');
        btn.disabled = false;
    }
}

// Contoh penggunaan:
const submitBtn = document.getElementById('submitBtn');
submitBtn.dataset.originalText = submitBtn.innerHTML;

setButtonLoading(submitBtn, true); // Saat loading
setButtonLoading(submitBtn, false); // Selesai

/**
 * FUNGSI KHUSUS UNTUK HALAMAN REKAP.HTML (Rekap Absensi)
 */
if (document.getElementById('tabelRekap')) {
    // Fungsi loadRekapData() sudah dipindahkan ke rekap.html inline script
    // karena membutuhkan filter khusus yang kompleks
}

// Inisialisasi tema untuk semua halaman
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
});