// Ganti URL sesuai endpoint backend kamu
// const API_URL = 'http://localhost:8080/api/hari_libur';

let dataTableJenisIjin; // simpan instance DataTables global supaya bisa diakses

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

// fetch data dari API dan masukkan ke dalam table
function fetchAndRenderJenisIjin() {
    fetchWithAuth('api/jenis_ijin')
    .then (async res=> { // tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // showAlertFindContainer(`Data hari libur tidak ditemukan!`, 'danger');
            dataTableJenisIjin.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data jenis ijin:\n${errText}`);
        }
        return res.json();
        })
    .then(data => {
        // DataTables
        const jenisIjin = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTableJenisIjin.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        // const dataArray = Array.isArray(JenisIjin) ? JenisIjin : [JenisIjin];

        let dataArray = []; // Inisialisasi variabel dataArray sebagai array kosong

        if (Array.isArray(jenisIjin)) { // Mengecek apakah karyawan adalah array.
            dataArray = jenisIjin.filter(ji => ji !== null); // Memastikan hanya elemen yang tidak null yang dimasukkan ke dataArray.
        } else if (jenisIjin) { // Jika JenisIjin bukan array, tapi masih ada nilainya (bukan null, undefined, atau false).
            dataArray = [jenisIjin];
        }
        
        // Tambah data ke datatable
        dataTableJenisIjin.rows.add(
            dataArray.map(ji => [
                ji.id,
                ji.kode,
                ji.nama,
                ji.aktif ? 'Ya' : 'Tidak',
                `
                <button class="btn btn-sm btn-info btn-edit" onclick='openModalEditJenisIjin(${JSON.stringify(ji)})'><i class="fas fa-edit"></i> Edit</button>
                `
            ])
        ).draw();
    })
    .catch(err => {
        console.error(err);
    });
}

// init datatable
function initDataTableJenisIjin() {
    if (!$.fn.DataTable.isDataTable('#table-jenis-ijin')) {
        dataTableJenisIjin = $('#table-jenis-ijin').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 1, 2, 3, 4], className: 'text-center' },
            { // kolom index 4 (aksi) tidak perlu di order atau di search karena kurang relevan
                targets: 4,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: data => data,
            }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-jenis-ijin_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-jenis-ijin', name: 'search-jenis-ijin' });
                    $('#table-jenis-ijin_wrapper .dataTables_filter label').attr('for', 'search-jenis-ijin');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// definisikan data table dan masukkan data yang sudah di fetch
function renderJenisIjin() {
    initDataTableJenisIjin();
    fetchAndRenderJenisIjin();
}

// script untuk close modal tambah (aria hidden)
$(document).on('hide.bs.modal', '#modal-jenis-ijin', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal delete (aria hidden)
$(document).on('hide.bs.modal', '#modal-delete-jenis-ijin', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal edit (aria hidden)
$(document).on('hide.bs.modal', '#modal-edit-jenis-ijin', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// pindahkan fokus ke tombol tambah jenis ijin
$(document).on('hidden.bs.modal', '#modal-jenis-ijin', function() {
    $('#button-tambah-jenis-ijin').trigger('focus');
});

// pindahkan fokus input jenis ijin saat modal tambah jenis ijin dibuka
$(document).on('shown.bs.modal', '#modal-jenis-ijin', function() {
    $('#jenis-ijin').trigger('focus');
});

function showModalAlertJenisIjin(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-jenis-ijin');
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    alertContainer.innerHTML = ''; // clear previous
    alertContainer.appendChild(alert);

    setTimeout(() => {
        $(alert).alert('close');
    }, duration);
}

$(document).on('submit', '#form-jenis-ijin', async function(e) {
    e.preventDefault();

    const jenisIjin = document.getElementById("jenis-ijin").value; 
    const deskripsiIjin = document.getElementById("deskripsi-ijin").value;

    try {
        const data = await handleFetchJSON(fetchWithAuth("/api/jenis_ijin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
                kode: jenisIjin,
                nama: deskripsiIjin,
                aktif: true,
            })
        }));

        // Berhasil, tampilkan pesan
        showModalAlertJenisIjin(`Data jenis ijin <strong>'${data.data.kode}'</strong> dengan deskripsi <strong>'${data.data.nama}'<strong> berhasil ditambahkan!`, 'success');

        // Refresh tabel & reset input
        fetchAndRenderJenisIjin();
        // Kosongkan elemen input
        document.getElementById("jenis-ijin").value = "";
        document.getElementById("deskripsi-ijin").value = "";
        document.getElementById("jenis-ijin").focus();

    } catch (err) {
        // Gagal
        console.log("Error: "+err.message)
        showModalAlertJenisIjin('Terjadi kesalahan: ' + err.message, 'danger');
    }
});


// // event listener submit form add hari libur
// $(document).on('click', '#button-submit-jenis-ijin', function(e) {
//     e.preventDefault();

//     // 1. tangkap input dari textbox
//     const tanggal = document.getElementById("jenis-ijin").value; 
//     const keterangan = document.getElementById("keterangan").value;
    
//     console.log({ tanggal, keterangan });
    
//     // 2. kirim request ke backend
//     fetch("/api/hari_libur", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
//             tanggal: tanggal,
//             keterangan: keterangan,
//         })
//     })
//     .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
//         if (!res.ok) {
//             const errText = await res.text();
//             console.log(errText);
//             // showModalAlertJenisIjin(`Data hari libur sudah ada!`, 'danger');
//             //throw new Error(`Gagal simpan data hari libur:\n${errText}`);
//         }
//         return res.json();
//     })
//     .then(data => {
//         console.log(data)
//         // 4. berikan alert berisi data yang berhasil ditambahkan
//         showModalAlertJenisIjin(`Data hari libur <strong>${data.data.keterangan}</strong> tanggal ${data.data.tanggal} berhasil ditambahkan!`, 'success');

//         // 5. tambah elemen pada tbody
//         // appendJenisIjin(data.data)
//         fetchAndRenderJenisIjin();

//         // 7. kosongkan elemen input
//         document.getElementById("jenis-ijin").value="";
//         document.getElementById("keterangan").value="";

//         // fokuskan lagi ke id
//         document.getElementById("jenis-ijin").focus();
//         // $('#modalKaryawan').modal('hide');
//     })
//     // 8. catch error
//     .catch(err => showModalAlertJenisIjin('Terjadi kesalahan: ' + err.message, 'danger'));
// });

// section delete data
let idJenisIjinToDelete = null; // variabel global sementara simpan id karyawan yg mau dihapus

// Fungsi dipanggil saat klik tombol Delete di tabel
function showModalDeleteJenisIjin(id) {
    idJenisIjinToDelete = id; // isi id var global
    document.getElementById('deleteIdJenisIjinText').textContent = id;
    $('#modal-delete-jenis-ijin').modal('show'); // pakai jQuery Bootstrap 4 style
}

function showAlertJenisIjin(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-jenis-ijin');

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

// script untuk open dan close modal editJenisIjin
function openModalEditJenisIjin(ji) {
    // Isi form dengan data hari libur
    document.getElementById("edit-id-jenis-ijin").value = ji.id;
    document.getElementById("edit-jenis-ijin").value = ji.kode;
    document.getElementById("edit-deskripsi-ijin").value = ji.nama;
    document.getElementById("edit-jenis-ijin-aktif").checked = ji.aktif;

    $('#modal-edit-jenis-ijin').modal('show'); // pakai bootstrap show modal
}

// event listener submit form update hari libur
$(document).on('submit', '#form-edit-jenis-ijin', function(e) {
    e.preventDefault(); // agar tidak auto submit

    // 1. tangkap input dari textbox
    const id = document.getElementById("edit-id-jenis-ijin").value; 
    const jenisIjin = document.getElementById("edit-jenis-ijin").value; 
    const deskripsiIjin = document.getElementById("edit-deskripsi-ijin").value; 
    const aktif = document.getElementById("edit-jenis-ijin-aktif").checked; 
     
    // 2. kirim request ke backend
    fetchWithAuth(`/api/jenis_ijin/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
            kode: jenisIjin,
            nama: deskripsiIjin,
            aktif: aktif,
        })
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errJson = await res.json(); // coba ambil json dari error
            const errMsg = errJson.message || "Terjadi kesalahan yang tidak diketahui"; // ambil json "message" dari response, setelah || adalah pesan default kalau errJson.Msg tidak ada
            // throw new Error("Gagal tambah data: " + errMsg);
            alert("Gagal update data jenis ijin: "+errMsg);
            return;
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        // 4. berikan alert berisi data yang berhasil ditambahkan

        // 5. kosongkan elemen input modalEdit
        document.getElementById("edit-id-jenis-ijin").value="";
        document.getElementById("edit-jenis-ijin").value="";
        document.getElementById("edit-deskripsi-ijin").value="";
        document.getElementById("edit-jenis-ijin-aktif").checked=false;

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderJenisIjin();
      
        // 7. tutup modal
        $('#modal-edit-jenis-ijin').modal('hide');

        // 8. tampilkan notifikasi
        showAlertJenisIjin(`Jenis ijin dengan ID <strong>'${data.data.id}'</strong> berhasil diupdate!`, 'success');
    })
    // 8. catch error
    .catch(err => showAlertJenisIjin('Terjadi kesalahan: ' + err.message, 'danger'));
});