// Ganti URL sesuai endpoint backend kamu
// const API_URL = 'http://localhost:8080/api/hari_libur';

let dataTableHariLibur; // simpan instance DataTables global supaya bisa diakses

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
function fetchAndRenderHariLibur() {
    fetch('api/hari_libur')
    .then (async res=> { // tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // showAlertFindContainer(`Data hari libur tidak ditemukan!`, 'danger');
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

        if (Array.isArray(hariLibur)) { // Mengecek apakah karyawan adalah array.
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
                <button class="btn btn-sm btn-danger btn-delete" onClick="showModalDeleteHariLibur('${hl.id}')" data-id="${hl.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                `
            ])
        ).draw();
    })
    .catch(err => {
        console.error(err);
    });
}

// init datatable
function initDataTableHariLibur() {
    if (!$.fn.DataTable.isDataTable('#table-hari-libur')) {
        dataTableHariLibur = $('#table-hari-libur').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 1, 2, 4], className: 'text-center' },
            { // kolom index 4 (aksi) tidak perlu di order atau di search karena kurang relevan
                targets: 4,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: data => data,
            }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-hari-libur_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-hari-libur', name: 'search-hari-libur' });
                    $('#table-hari-libur_wrapper .dataTables_filter label').attr('for', 'search-hari-libur');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// definisikan data table dan masukkan data yang sudah di fetch
function renderHariLibur() {
    initDataTableHariLibur();
    fetchAndRenderHariLibur();
}

// script untuk close modal tambah (aria hidden)
$(document).on('hide.bs.modal', '#modal-hari-libur', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal delete (aria hidden)
$(document).on('hide.bs.modal', '#modal-delete-hari-libur', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal edit (aria hidden)
$(document).on('hide.bs.modal', '#modal-edit-hari-libur', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});


// pindahkan fokus ke tombol tambah karyawan
$(document).on('hidden.bs.modal', '#modal-hari-libur', function() {
    $('#button-tambah-hari-libur').trigger('focus');
});

function showModalAlertHariLibur(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-hari-libur');
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

$(document).on('click', '#button-submit-hari-libur', async function(e) {
    e.preventDefault();

    const tanggal = document.getElementById("hari-libur").value; 
    const keterangan = document.getElementById("keterangan").value;

    try {
        const data = await handleFetchJSON(fetch("/api/hari_libur", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ tanggal, keterangan })
        }));

        // Berhasil, tampilkan pesan
        showModalAlertHariLibur(`Data hari libur <strong>'${data.data.keterangan}'</strong> tanggal '${data.data.tanggal}' berhasil ditambahkan!`, 'success');

        // Refresh tabel & reset input
        fetchAndRenderHariLibur();
        // Kosongkan elemen input
        document.getElementById("hari-libur").value = "";
        document.getElementById("keterangan").value = "";
        document.getElementById("hari-libur").focus();

    } catch (err) {
        // Gagal
        console.log("Error: "+err.message)
        showModalAlertHariLibur('Terjadi kesalahan: ' + err.message, 'danger');
    }
});


// // event listener submit form add hari libur
// $(document).on('click', '#button-submit-hari-libur', function(e) {
//     e.preventDefault();

//     // 1. tangkap input dari textbox
//     const tanggal = document.getElementById("hari-libur").value; 
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
//             // showModalAlertHariLibur(`Data hari libur sudah ada!`, 'danger');
//             //throw new Error(`Gagal simpan data hari libur:\n${errText}`);
//         }
//         return res.json();
//     })
//     .then(data => {
//         console.log(data)
//         // 4. berikan alert berisi data yang berhasil ditambahkan
//         showModalAlertHariLibur(`Data hari libur <strong>${data.data.keterangan}</strong> tanggal ${data.data.tanggal} berhasil ditambahkan!`, 'success');

//         // 5. tambah elemen pada tbody
//         // appendHariLibur(data.data)
//         fetchAndRenderHariLibur();

//         // 7. kosongkan elemen input
//         document.getElementById("hari-libur").value="";
//         document.getElementById("keterangan").value="";

//         // fokuskan lagi ke id
//         document.getElementById("hari-libur").focus();
//         // $('#modalKaryawan').modal('hide');
//     })
//     // 8. catch error
//     .catch(err => showModalAlertHariLibur('Terjadi kesalahan: ' + err.message, 'danger'));
// });

// section delete data
let idHariLiburToDelete = null; // variabel global sementara simpan id karyawan yg mau dihapus

// Fungsi dipanggil saat klik tombol Delete di tabel
function showModalDeleteHariLibur(id) {
    idHariLiburToDelete = id; // isi id var global
    document.getElementById('deleteIdHariLiburText').textContent = id;
    $('#modal-delete-hari-libur').modal('show'); // pakai jQuery Bootstrap 4 style
}

// Fungsi hapus dipanggil saat user klik tombol "Hapus" di modal
$(document).on('click', '#button-delete-hari-libur', function(e) {
    if (!idHariLiburToDelete) return; // jika id nya kosong, batal

    // showSpinner(); // ⏳ Tampilkan spinner

    fetch(`api/hari_libur/${idHariLiburToDelete}`, { method: 'DELETE' })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gagal menghapus hari libur:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        showAlertHariLibur(`Hari libur <strong>'${data.data.keterangan}'</strong> tanggal <strong>'${data.data.tanggal}'</strong> berhasil dihapus!`, 'success');
        fetchAndRenderHariLibur(); // refresh data tabel tanpa reload halaman
    })
    .catch(err => alert('Error: ' + err.message))
    .finally(() => {
        $('#modal-delete-hari-libur').modal('hide'); // lalu coba hide lagi
        idHariLiburToDelete = null;
        // hideSpinner(); // ✅ Sembunyikan spinner
    });
});

function showAlertHariLibur(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-hari-libur');

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

// script untuk open dan close modal editHariLibur
function openModalEditHariLibur(hl) {
    // Isi form dengan data hari libur
    document.getElementById("edit-id-hari-libur").value = hl.id;
    document.getElementById("edit-hari-libur").value = hl.tanggal;
    document.getElementById("edit-keterangan").value = hl.keterangan;

    $('#modal-edit-hari-libur').modal('show'); // pakai bootstrap show modal
}

// event listener submit form update hari libur
$(document).on('click', '#button-update-hari-libur', function(e) {
    e.preventDefault(); // agar tidak auto submit

    // 1. tangkap input dari textbox
    const id = document.getElementById("edit-id-hari-libur").value; 
    const tanggal = document.getElementById("edit-hari-libur").value; 
    const keterangan = document.getElementById("edit-keterangan").value; 
     
    // DEBUG console.log({ id, nama, jenjang, aktif});
    
    // 2. kirim request ke backend
    fetch(`/api/hari_libur/${id}`, {
        method: "PUT",
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
            const errJson = await res.json(); // coba ambil json dari error
            const errMsg = errJson.message || "Terjadi kesalahan yang tidak diketahui"; // ambil json "message" dari response, setelah || adalah pesan default kalau errJson.Msg tidak ada
            // throw new Error("Gagal tambah data: " + errMsg);
            alert("Gagal update data hari libur: "+errMsg);
            return;
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        // 4. berikan alert berisi data yang berhasil ditambahkan

        // 5. kosongkan elemen input modalEdit
        document.getElementById("edit-hari-libur").value="";
        document.getElementById("edit-keterangan").value="";

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderHariLibur();
      
        // 7. tutup modal
        $('#modal-edit-hari-libur').modal('hide');

        // 8. tampilkan notifikasi
        showAlertHariLibur(`Hari libur dengan ID <strong>'${data.data.id}'</strong> berhasil diupdate!`, 'success');
    })
    // 8. catch error
    .catch(err => showAlertHariLibur('Terjadi kesalahan: ' + err.message, 'danger'));
});