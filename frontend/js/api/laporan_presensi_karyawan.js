let dataTableLaporanPresensiKaryawan; // simpan instance DataTables global supaya bisa diakses

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
function renderLaporanPresensiKaryawan() {
    initDataTableLaporanPresensiKaryawan();
    fetchKaryawanLaporanKaryawan();
}

// function untuk add options ke dalam select
function createOption(value, text) { // func untuk add options ke dalam select
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

function fetchKaryawanLaporanKaryawan() {
    fetchWithAuth("/api/karyawan")
    .then(response=> response.json()) // ubah ke format json
    .then(data=> {
        const selectKaryawanLaporanKaryawan = document.getElementById("karyawan-laporan-presensi-karyawan");

        data.data.forEach(karyawan => {
            selectKaryawanLaporanKaryawan.appendChild(createOption(karyawan.id,karyawan.nama));
        });
    })
    .catch(error=> {
        console.error("Gagal mengambil data karyawan:", error)
    })
}

// definisikan data table
function initDataTableLaporanPresensiKaryawan() {
    if (!$.fn.DataTable.isDataTable('#table-laporan-presensi-karyawan')) {
        dataTableLaporanPresensiKaryawan = $('#table-laporan-presensi-karyawan').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 1, 2, 3], className: 'text-center' }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-laporan-presensi-karyawan_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-laporan-presensi-karyawan', name: 'search-laporan-presensi-karyawan' });
                    $('#table-laporan-presensi-karyawan_wrapper .dataTables_filter label').attr('for', 'search-laporan-presensi-karyawan');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// button clear filter tanggal awal dan akhir karyawan laporan
$(document).on('click', '#button-clear-laporan-presensi-karyawan', function(e) {
    // langsung reset semua komponen form
    document.getElementById('form-laporan-presensi-karyawan').reset();
    document.getElementById('button-export-laporan-presensi-karyawan').disabled=true;
    
    // OLD METHOD
    // document.getElementById('tanggal-awal-laporan-presensi-karyawan').value = '';
    // document.getElementById('tanggal-akhir-laporan-presensi-karyawan').value = '';

    // dataTableLaporanPresensiKaryawan.clear();
    dataTableLaporanPresensiKaryawan.clear().draw(); // Kosongkan tabel
});

$(document).on('click', '#button-export-laporan-presensi-karyawan', function(e) {
    const karyawan = document.getElementById('karyawan-laporan-presensi-karyawan').value.trim();
    const awal = document.getElementById('tanggal-awal-laporan-presensi-karyawan').value.trim();
    const akhir = document.getElementById('tanggal-akhir-laporan-presensi-karyawan').value.trim();

    // jangan gunakan method fetch() karena ini digunakan untuk mengambil data (binary/text/json)
    const url = `/laporan/presensi/karyawan?karyawan_id=${karyawan}&awal=${awal}&akhir=${akhir}`;
    window.open(url, '_blank'); // bisa juga '_self' jika ingin di tab yang sama
});

// alert untuk find data
function showAlertLaporanPresensiKaryawan(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-laporan-presensi-karyawan');

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

// event listener saat button find ditekan (dengan karyawan tanggal awal dan akhir)
$(document).on('submit', '#form-laporan-presensi-karyawan', function(e) {
    e.preventDefault(); // Mencegah reload halaman

    const idKaryawan = document.getElementById('karyawan-laporan-presensi-karyawan').value.trim();
    const awal = document.getElementById('tanggal-awal-laporan-presensi-karyawan').value.trim();
    const akhir = document.getElementById('tanggal-akhir-laporan-presensi-karyawan').value.trim();

    // Tampilkan loading atau disable button kalau perlu
    
    // api/presensi/by_periode?karyawan_id=1234567897&tanggal_awal=2025-01-01&tanggal_akhir=2025-10-01
    fetchWithAuth(`/api/presensi/by_periode?karyawan_id=${idKaryawan}&tanggal_awal=${awal}&tanggal_akhir=${akhir}`) // tangkap jumlah hari kerja global, hari kerja tiap orang
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // show alert tidak ditemukan
            showAlertLaporanPresensiKaryawan(`Data presensi tidak ditemukan!`, 'danger');
             // disable button export
            document.getElementById('button-export-laporan-presensi-karyawan').disabled=true;
            // kosongkan table
            dataTableLaporanPresensiKaryawan.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi karyawan:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        // DataTables
        const presensi = data.data; // ambil array yang isinya presensi: data(var js).data.data -> isinya data kehadiran

        // Jika data null atau tidak ada data, clear table dan tampilkan alert
        if (!presensi || (Array.isArray(presensi) && presensi.length === 0)) {
            dataTableLaporanPresensiKaryawan.clear().draw();
            document.getElementById('button-export-laporan-presensi-karyawan').disabled=true;
            // show alert tidak ditemukan
            showAlertLaporanPresensiKaryawan('Data presensi tidak ditemukan untuk karyawan tersebut!', 'danger');
            return;
        }

        // Clear data lama
        dataTableLaporanPresensiKaryawan.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        const dataArray = Array.isArray(presensi) ? presensi : [presensi];
 
        // Tambah data ke datatable
        dataTableLaporanPresensiKaryawan.rows.add(
        dataArray.map(p => {
            // cek status terlambat menggunakan function (di atas)
            const statusTerlambat = isTerlambat(p.waktu_masuk) ? '<span class="text-danger font-weight-bold">Terlambat</span>' : '';

            return [
                p.tanggal,
                p.waktu_masuk,
                statusTerlambat,  // Tambahkan kolom status
                p.waktu_pulang,
                p.keterangan
            ];
        })
        ).draw();

         // enable tombol export
        document.getElementById('button-export-laporan-presensi-karyawan').disabled=false;
    })
    .catch(err => {
        console.error(err);
    });
});