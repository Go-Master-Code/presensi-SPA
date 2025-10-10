// var global
let dataTableLaporanHarian;
let dataTablePresensi;
let dataTableHariLibur;

// beri id pada input text search
$(document).ready(function() {
    dataTableLaporanHarian = $('#table-laporan-presensi-harian').DataTable({
        pageLength: 10,           // jumlah baris per halaman
        lengthChange: false,      // aktifkan true agar user bisa pilih 10/25/50/All
        searching: true,          // kolom search kanan atas
        ordering: true,           // bisa sorting kolom
        info: true,               // "Showing 1 to 10 of 57 entries"
        autoWidth: false,
        responsive: true,         // tabel responsif di layar kecil
        columnDefs: [             // semua data di cell table rata tengah
            {
                targets: '_all',
                className: 'text-center'
            }
        ],
        initComplete: function () {
            // Pastikan input-nya sudah muncul di DOM
            const $input = $('#table-laporan-presensi-harian_wrapper .dataTables_filter input[type="search"]');
            if ($input.length > 0) {
                $input.attr({
                    id: 'search-laporan-presensi-harian',
                    name: 'search-laporan-presensi-harian'
                });

                $('#table-presensi_wrapper .dataTables_filter label').attr('for', 'search-laporan-presensi-harian');
            } else {
                console.warn('Input search tidak ditemukan!');
            }
        }
    });

    dataTablePresensi = $('#table-presensi').DataTable({
        pageLength: 10,           // jumlah baris per halaman
        lengthChange: false,      // aktifkan true agar user bisa pilih 10/25/50/All
        searching: true,          // kolom search kanan atas
        ordering: true,           // bisa sorting kolom
        info: true,               // "Showing 1 to 10 of 57 entries"
        autoWidth: false,
        responsive: true,         // tabel responsif di layar kecil
        columnDefs: [             // semua data di cell table rata tengah
            {
                targets: '_all',
                className: 'text-center'
            }
        ],
        initComplete: function () {
            // Pastikan input-nya sudah muncul di DOM
            const $input = $('#table-presensi_wrapper .dataTables_filter input[type="search"]');
            if ($input.length > 0) {
                $input.attr({
                    id: 'search-presensi',
                    name: 'search-presensi'
                });

                $('#table-presensi_wrapper .dataTables_filter label').attr('for', 'search-presensi');
            } else {
                console.warn('Input search tidak ditemukan!');
            }
        }
    });
    
    dataTableHariLibur = $('#table-hari-libur').DataTable({
        pageLength: 10,           // jumlah baris per halaman
        lengthChange: false,      // aktifkan true agar user bisa pilih 10/25/50/All
        searching: true,          // kolom search kanan atas
        ordering: true,           // bisa sorting kolom
        info: true,               // "Showing 1 to 10 of 57 entries"
        autoWidth: false,
        responsive: true,         // tabel responsif di layar kecil
        columnDefs: [             // semua data di cell table rata tengah
            {
                targets: '_all',
                className: 'text-center'
            }
        ],
        initComplete: function () {
            // Pastikan input-nya sudah muncul di DOM
            const $input = $('#table-hari-libur_wrapper .dataTables_filter input[type="search"]');
            if ($input.length > 0) {
                $input.attr({
                    id: 'search-hari-libur',
                    name: 'search-hari-libur'
                });

                $('#table-hari-libur_wrapper .dataTables_filter label').attr('for', 'search-hari-libur');
            } else {
                console.warn('Input search tidak ditemukan!');
            }
        }
    });

    // function untuk fetch data hari libur
    fetchAndRenderHariLibur();

    //  $(this) mengacu ke tabel yang diinisialisasi,
    // .closest('.dataTables_wrapper') mencari elemen wrapper DataTables terdekat,
    // .find('div.dataTables_filter input') ambil input filter hanya di wrapper itu.

    // $('#table-karyawan').on('init.dt', function() {
    //     $(this).closest('.dataTables_wrapper').find('div.dataTables_filter input').attr('id', 'search-a');
       
    // });

    // beri id dan label untuk tiap kolom find
    $('#table-presensi').on('init.dt', function() {
        const $filter = $(this).closest('.dataTables_wrapper').find('div.dataTables_filter');
        const $input = $filter.find('input[type="search"]').first();
        $input.attr({
            id: 'search-presensi',
            name: 'search-presensi' // <- tambahkan name
        });
        $filter.find('label').attr('for', 'search-presensi');
    });
    $('#table-laporan-presensi-harian').on('init.dt', function() {
        const $filter = $(this).closest('.dataTables_wrapper').find('div.dataTables_filter');
        const $input = $filter.find('input[type="search"]').first();
        $input.attr({
            id: 'search-laporan-presensi',
            name: 'search-laporan-presensi'
        });
        $filter.find('label').attr('for', 'search-laporan-presensi');
    });
    $('#table-hari-libur').on('init.dt', function() {
        const $filter = $(this).closest('.dataTables_wrapper').find('div.dataTables_filter');
        const $input = $filter.find('input[type="search"]').first();
        $input.attr({
            id: 'search-hari-libur',
            name: 'search-hari-libur'
        });
        $filter.find('label').attr('for', 'search-hari-libur');
    });

});

function fetchAndRenderHariLibur() {
    // Tampilkan loading atau disable button kalau perlu
    fetch(`/api/hari_libur`)
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            showAlertFindContainer(`Data hari libur tidak ditemukan!`, 'danger');
            dataTableHariLibur.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data hari libur:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        // DataTables
        const hariLibur = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTableHariLibur.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        // const dataArray = Array.isArray(hariLibur) ? hariLibur : [hariLibur];

        let dataArray = []; // Inisialisasi variabel dataArray sebagai array kosong

        if (Array.isArray(hariLibur)) { // Mengecek apakah hariLibur adalah array.
            dataArray = hariLibur.filter(hl => hl !== null); // Memastikan hanya elemen yang tidak null yang dimasukkan ke dataArray.
        } else if (hariLibur) { // Jika hariLibur bukan array, tapi masih ada nilainya (bukan null, undefined, atau false).
            dataArray = [hariLibur];
        }
 
        // Tambah data ke datatable
        dataTableHariLibur.rows.add(
            dataArray.map(hl => [
                hl.id,
                hl.tanggal,
                hl.hari,
                hl.keterangan,
                `
                <button class="btn btn-sm btn-info btn-edit" onclick='openModalEditHariLibur(${JSON.stringify(hl)})'><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger btn-delete" onClick="showDeleteConfirmModalHariLibur('${hl.id}')" data-id="${hl.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                `
            ])
        ).draw();
    })
    .catch(err => {
        console.error(err);
        // alert('Terjadi kesalahan: ' + err.message);
    });
}

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
            dataTablePresensi.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        // DataTables
        const presensi = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTablePresensi.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        const dataArray = Array.isArray(presensi) ? presensi : [presensi];
 
        // Tambah data ke datatable
        dataTablePresensi.rows.add(
            dataArray.map(p => [
                p.id,
                p.karyawan_id,
                p.karyawan_nama,
                p.tanggal,
                p.waktu_masuk,
                p.waktu_pulang,
                p.keterangan
            ])
        ).draw();
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

// script untuk open dan close modal editHariLibur
function openModalEditHariLibur(hl) {
    // Isi form dengan data enrichment
    document.getElementById("edit-hari-libur").value = hl.tanggal;
    document.getElementById("edit-keterangan").value = hl.keterangan;

    $('#modalEditHariLibur').modal('show'); // pakai bootstrap show modal
}
function closeModalEdit() {
    $('#modalEditHariLibur').modal('hide');  // tutup modal dengan bootstrap
}

// section delete data
let idDeleteHariLibur = null; // variabel global sementara simpan id karyawan yg mau dihapus

// Fungsi dipanggil saat klik tombol Delete di tabel hari libur
function showDeleteConfirmModalHariLibur(id) {
    idDeleteHariLibur = id;
    document.getElementById('deleteHariLibur').textContent = idDeleteHariLibur;
    $('#confirmDeleteHariLibur').modal('show'); // pakai jQuery Bootstrap 4 style
}

// Fungsi hapus dipanggil saat user klik tombol "Hapus" di modal hari libur
document.getElementById('btnConfirmDeleteHariLibur').addEventListener('click', () => {
  if (!idDeleteHariLibur) return; // jika id nya kosong, batal

  showSpinner(); // ⏳ Tampilkan spinner

  fetch(`api/hari_libur/${idDeleteHariLibur}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Gagal menghapus hari libur');
      return res.json();
    })
    .then(data => {
      showAlertHariLibur(`Hari libur '${data.data.keterangan}' tanggal '${data.data.tanggal}' berhasil dihapus!`, 'success');
      fetchAndRenderHariLibur(); // refresh data tabel tanpa reload halaman
    })
    .catch(err => alert('Error: ' + err.message))
    .finally(() => {
        $('#confirmDeleteHariLibur').modal('hide'); // lalu coba hide lagi
        idDeleteHariLibur = null;
        hideSpinner(); // ✅ Sembunyikan spinner
    });
});

// event listener submit form add karyawan
document.getElementById("form-hari-libur").addEventListener("submit", function(e) {
    e.preventDefault();

    // 1. tangkap input dari textbox
    const tanggal = document.getElementById("hari-libur").value; 
    const keterangan = document.getElementById("keterangan").value;
    
    console.log({ tanggal, keterangan });
    
    // 2. kirim request ke backend
    fetch("/api/hari_libur", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
            tanggal: tanggal,
            keterangan: keterangan,
        })
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gagal simpan data hari libur:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        console.log(data)
        // 4. berikan alert berisi data yang berhasil ditambahkan
        showModalAlertHariLibur(`Data hari libur <strong>${data.data.keterangan}</strong> tanggal ${data.data.tanggal} berhasil ditambahkan!`, 'success');

        // 5. tambah elemen pada tbody
        appendHariLibur(data.data)

        // 7. kosongkan elemen input
        document.getElementById("hari-libur").value="";
        document.getElementById("keterangan").value="";

        // fokuskan lagi ke id
        document.getElementById("hari-libur").focus();
        // $('#modalKaryawan').modal('hide');
    })
    // 8. catch error
    .catch(err => showModalAlert('Terjadi kesalahan: ' + err.message, 'danger'));
});

function appendHariLibur(hl) {
    // tambahkan elemen button edit dan hapus
    const aksiButtons = `
        <button class="btn btn-sm btn-info btn-edit" onclick='openModalEditHariLibur(${JSON.stringify(hl)})'><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" onClick="showDeleteConfirmModalHariLibur('${hl.id}')" data-id="${hl.id}"><i class="fas fa-trash-alt"></i> Delete</button>
    `;

    // jangan pakai elemen tr dan td lagi
    dataTableHariLibur.row.add([
        hl.id,
        hl.tanggal,
        hl.hari,
        hl.keterangan,
        aksiButtons // -> kolom ke 5 yang berisi aksi edit dan delete
    ]).draw(false);
}