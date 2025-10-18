let dataTableLaporanPresensiPeriode; // simpan instance DataTables global supaya bisa diakses

async function handleFetchJSON(fetchPromise) {
    const res = await fetchPromise;

    const contentType = res.headers.get("Content-Type") || "";
    const isJSON = contentType.includes("application/json");

    const data = isJSON ? await res.json() : await res.text();

    if (!res.ok) {
        const message = typeof data === "string" ? data : data.error || "Terjadi kesalahan pada server."; // data.error: ambil field "error" pada response json
        throw new Error(message);
    }

    return data;
}

// definisikan data table (tanpa data sebelum dilakukan search)
function renderLaporanPresensiPeriode() {
    initDataTableLaporanPresensi();
}

// definisikan data table
function initDataTableLaporanPresensi() {
    if (!$.fn.DataTable.isDataTable('#table-laporan-presensi-periode')) {
        dataTableLaporanPresensiPeriode = $('#table-laporan-presensi-periode').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 2, 3], className: 'text-center' }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-laporan-presensi-periode_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-laporan-presensi-periode', name: 'search-laporan-presensi-periode' });
                    $('#table-laporan-presensi-periode_wrapper .dataTables_filter label').attr('for', 'search-laporan-presensi-periode');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// button clear filter tanggal awal dan akhir periode laporan
$(document).on('click', '#button-clear-laporan-presensi-periode', function(e) {
    // langsung clear semua elemen form
    document.getElementById('form-laporan-presensi-periode').reset();
    document.getElementById('button-export-laporan-presensi-periode').disabled=true;
    
    // OLD METHOD
    // document.getElementById('tanggal-awal-laporan-presensi-periode').value = '';
    // document.getElementById('tanggal-akhir-laporan-presensi-periode').value = '';
    // hapus isi jumlah kerja
    // document.getElementById('jml-hari-kerja').value="";
    // dataTableLaporanPresensiPeriode.clear();
    dataTableLaporanPresensiPeriode.clear().draw(); // Kosongkan tabel
});

$(document).on('click', '#button-export-laporan-presensi-periode', function(e) {
    const awal = document.getElementById('tanggal-awal-laporan-presensi-periode').value.trim();
    const akhir = document.getElementById('tanggal-akhir-laporan-presensi-periode').value.trim();

    // jangan gunakan method fetch() karena ini digunakan untuk mengambil data (binary/text/json)
    const url = `/laporan/presensi/periode?awal=${awal}&akhir=${akhir}`;
    window.open(url, '_blank'); // bisa juga '_self' jika ingin di tab yang sama
});

// alert untuk find data
function showAlertLaporanPresensiPeriode(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-laporan-presensi-periode');

    // Bersihkan alert yang lama (kalau ada)
    alertContainer.innerHTML = '';

    // Buat elemen alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;

    // Tambahkan ke container
    alertContainer.appendChild(alert);

    // Auto close setelah beberapa detik (duration)
    setTimeout(() => {
        $(alert).alert('close'); // gunakan jQuery Bootstrap alert close
    }, duration);
}

// event listener saat button find ditekan (dengan periode tanggal awal dan akhir)
$(document).on('submit', '#form-laporan-presensi-periode', function(e) {
    e.preventDefault(); // Mencegah reload halaman
    const awal = document.getElementById('tanggal-awal-laporan-presensi-periode').value.trim();
    const akhir = document.getElementById('tanggal-akhir-laporan-presensi-periode').value.trim();

    // Tampilkan loading atau disable button kalau perlu
    
    fetchWithAuth(`/api/laporan/presensi/periode?awal=${awal}&akhir=${akhir}`) // tangkap jumlah hari kerja global, hari kerja tiap orang
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // hapus isi jumlah kerja
            document.getElementById('jml-hari-kerja').value="";
            // show alert tidak ditemukan
            showAlertLaporanPresensiPeriode(`Data presensi tidak ditemukan!`, 'danger');
            // disable button export
            document.getElementById('button-export-laporan-presensi-periode').disabled=true;
            // kosongkan table
            dataTableLaporanPresensiPeriode.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        // DataTables
        const presensi = data.data.data; // ambil array yang isinya presensi: data(var js).data.data -> isinya data kehadiran

        // Jika data null atau tidak ada data, clear table dan tampilkan alert
        if (!presensi || (Array.isArray(presensi) && presensi.length === 0)) {
            dataTableLaporanPresensiPeriode.clear().draw();
            // hapus isi jumlah kerja
            document.getElementById('jml-hari-kerja').value="";
            document.getElementById('button-export-laporan-presensi-periode').disabled=true;
            // show alert tidak ditemukan
            showAlertLaporanPresensiPeriode('Data presensi tidak ditemukan untuk periode tersebut!', 'danger');
            return;
        }

        // lihat response json dari Postman
        const hariKerja = data.data.hari_kerja; // data.data.hari_kerja isinya jumlah hari kerja dari periode tanggal awal dan akhir
        document.getElementById('jml-hari-kerja').value=hariKerja;

        // Clear data lama
        dataTableLaporanPresensiPeriode.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        const dataArray = Array.isArray(presensi) ? presensi : [presensi];
 
        // Tambah data ke datatable
        dataTableLaporanPresensiPeriode.rows.add(
            dataArray.map(p => [
                p.karyawan_id,
                p.nama,
                p.kehadiran,
                hariKerja-p.kehadiran
            ])
        ).draw();

        // enable tombol export
        document.getElementById('button-export-laporan-presensi-periode').disabled=false;
    })
    .catch(err => {
        console.error(err);
    });
});