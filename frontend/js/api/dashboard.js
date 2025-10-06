// var global
let dataTableLaporanHarian;

// beri id pada input text search
$(document).ready(function() {
    dataTableLaporanHarian = $('#table-laporan-presensi-harian').DataTable({
        pageLength: 10,           // jumlah baris per halaman
        lengthChange: false,       // aktifkan true agar user bisa pilih 10/25/50/All
        searching: true,          // kolom search kanan atas
        ordering: true,           // bisa sorting kolom
        info: true,               // "Showing 1 to 10 of 57 entries"
        autoWidth: false,
        responsive: true          // tabel responsif di layar kecil
    });

    //  $(this) mengacu ke tabel yang diinisialisasi,
    // .closest('.dataTables_wrapper') mencari elemen wrapper DataTables terdekat,
    // .find('div.dataTables_filter input') ambil input filter hanya di wrapper itu.

    $('#table-karyawan').on('init.dt', function() {
        $(this).closest('.dataTables_wrapper').find('div.dataTables_filter input').attr('id', 'search-karyawan');
    });
    $('#table-laporan-presensi-harian').on('init.dt', function() {
        $(this).closest('.dataTables_wrapper').find('div.dataTables_filter input').attr('id', 'search-presensi-harian');
    });

});

// cegah form tersubmit secara ga sengaja, misal lagi ketik cari nama terus enter jadi submit form
document.addEventListener('DOMContentLoaded', () => {
    // pastikan form-filter-presensi diberikan eventListener setelah DOMContent dibuat
    document.querySelector('#form-filter-presensi').addEventListener('submit', function(e) {
        e.preventDefault();
        // proses pencarian
    });
});

// event listener saat button find ditekan (asumsi kehadiran karyawan di tanggal tertentu)
document.getElementById('button-find').addEventListener('click', function() {
    const nama = document.getElementById('filter-nama').value.trim();
    const tanggal = document.getElementById('filter-tanggal').value.trim();

    if (!nama || !tanggal) {
        showAlertFindContainer(`Mohon isi Tanggal dan Nama Karyawan!`, 'danger');
        return;
    }

    // Tampilkan loading atau disable button kalau perlu
    fetch(`/api/presensi/nama?nama=${nama}&tanggal=${tanggal}`)
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            showAlertFindContainer(`Data presensi tidak ditemukan!`, 'danger');

            const tbody = document.querySelector('#table-presensi tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">Data presensi tidak ditemukan!</td>
                </tr>
            `;
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        // if (!data.success || !data.data.length) {
        //     alert('Data absensi tidak ditemukan');
        //     return;
        // }
        const presensi = data.data; // response json berupa data, jadi data.data
        const tbody = document.querySelector('#table-presensi tbody');
        tbody.innerHTML = ''; // clear dulu

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">${presensi.id}</td>
            <td style="text-align: center;">${presensi.karyawan_id}</td>
            <td style="text-align: center;">${presensi.karyawan_nama}</td>
            <td style="text-align: center;">${presensi.tanggal}</td>
            <td style="text-align: center;">${presensi.waktu_masuk}</td>
            <td style="text-align: center;">${presensi.waktu_pulang}</td>
            <td style="text-align: center;">${presensi.keterangan}</td>
        `;
        tbody.appendChild(tr);
    })
    .catch(err => {
        console.error(err);
        // alert('Terjadi kesalahan: ' + err.message);
    });
});

// button clear filter-nama dan filter-tanggal di cari data absensi
document.getElementById('button-clear').addEventListener('click', function() {
    document.getElementById('filter-nama').value = '';
    document.getElementById('filter-tanggal').value = '';
    const tbody = document.querySelector('#table-presensi tbody');
    tbody.innerHTML = '';
});

document.getElementById('button-clear-laporan-harian').addEventListener('click', function() {
    document.getElementById('tanggal-laporan-harian').value = '';

    if (dataTableLaporanHarian) {
        dataTableLaporanHarian.clear().draw(); // Kosongkan tabel
    }
});

// event listener saat button tampilkan di laporan per hari ditekan
document.getElementById('button-tampilkan-laporan-harian').addEventListener('click', function() {
    const tanggal = document.getElementById('tanggal-laporan-harian').value.trim();

    if (!tanggal) {
        alert("Silakan pilih tanggal terlebih dahulu!");
        return;
    }

    fetch(`/api/presensi/harian?tanggal=${tanggal}`)
    .then(async res => {
        if (!res.ok) {
            dataTableLaporanHarian.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi:\n${errText}`);
        }
        return res.json();
    })
    .then(response => {
        const data = response.data;

        if (!Array.isArray(data) || data.length === 0) {
            // Clear datatable jika sudah ada data sebelumnya
            dataTableLaporanHarian.clear().draw();
            // Jangan set innerHTML langsung kalau pakai DataTable!
            return;
        }

        // Update data di DataTable tanpa inisialisasi ulang
        dataTableLaporanHarian.clear();
        dataTableLaporanHarian.rows.add(data.map(p => [
            p.id,
            p.karyawan_id,
            p.karyawan_nama,
            p.tanggal,
            p.waktu_masuk,
            p.waktu_pulang,
            p.keterangan
        ])).draw();
    })
    .catch(err => {
        console.error(err);
        alert('Terjadi kesalahan: ' + err.message);
    });
});