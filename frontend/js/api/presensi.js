// Ganti URL sesuai endpoint backend kamu
// const API_URL = 'http://localhost:8080/api/karyawan';

let dataTablePresensi; // simpan instance DataTables global supaya bisa diakses

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

// function untuk mendapat tanggal hari ini
function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function isTerlambat(waktuMasuk, batas = "07:00:00") {
    // waktuMasuk dan batas format "HH:mm:ss"
    return waktuMasuk > batas; // string compare sudah aman di format HH:mm:ss
}

// fetch data dari API dan masukkan ke dalam table
function fetchAndRenderPresensi() {
    const tanggal = getTodayDate();
    fetch(`/api/presensi/harian?tanggal=${tanggal}`)
    .then (async res=> { // tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // showAlertFindContainer(`Data hari libur tidak ditemukan!`, 'danger');
            dataTablePresensi.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi:\n${errText}`);
        }
        return res.json();
        })
    .then(data => {
        console.log("Response data:", data); // Cek apa isi data
        // DataTables
        const presensi = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTablePresensi.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        // const dataArray = Array.isArray(hariLibur) ? hariLibur : [hariLibur];

        let dataArray = []; // Inisialisasi variabel dataArray sebagai array kosong

        if (Array.isArray(presensi)) { // Mengecek apakah karyawan adalah array.
            dataArray = presensi.filter(p => p !== null); // Memastikan hanya elemen yang tidak null yang dimasukkan ke dataArray.
        } else if (presensi) { // Jika hariLibur bukan array, tapi masih ada nilainya (bukan null, undefined, atau false).
            dataArray = [presensi];
        }
        
        // tambah data presensi ke dalam tabel
        dataTablePresensi.rows.add(
        dataArray.map(p => {
            // cek status terlambat menggunakan function (di atas)
            const statusTerlambat = isTerlambat(p.waktu_masuk) ? '<span class="text-danger font-weight-bold">Terlambat</span>' : '';

            return [
                p.id,
                p.karyawan_nama,
                p.waktu_masuk,
                statusTerlambat,  // Tambahkan kolom status
                p.waktu_pulang,
                p.keterangan,
                `<button class="btn btn-sm btn-info btn-edit" onclick='openModalEditpresensi(${JSON.stringify(p)})'>
                    <i class="fas fa-edit"></i> Edit
                </button>`
            ];
        })
    ).draw();

    })
    .catch(err => {
        console.error(err);
    });
}

// init datatable
function initDataTablePresensi() {
    if (!$.fn.DataTable.isDataTable('#table-presensi')) {
        dataTablePresensi = $('#table-presensi').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 2, 3, 4], className: 'text-center' },
            { // kolom index 5 (aksi) tidak perlu di order atau di search karena kurang relevan
                targets: 5,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: data => data,
            }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-presensi_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-presensi', name: 'search-presensi' });
                    $('#table-presensi_wrapper .dataTables_filter label').attr('for', 'search-presensi');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// definisikan data table dan masukkan data yang sudah di fetch
function renderPresensi() {
    initDataTablePresensi();
    fetchAndRenderPresensi();
    fetchKaryawanForPresensi();
}

// function untuk add options ke dalam select
function createOption(value, text) { // func untuk add options ke dalam select
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// fetch data karyawan untuk modal add dan edit presensi karyawan
function fetchKaryawanForPresensi() {
    fetch("/api/karyawan")
    .then(response=> response.json()) // ubah ke format json
    .then(data=> {
        const selectKaryawan = document.getElementById("karyawan-presensi");
        const selectEditKaryawan = document.getElementById("edit-karyawan-presensi");

        data.data.forEach(karyawan => {
            selectKaryawan.appendChild(createOption(karyawan.id,karyawan.nama));
            selectEditKaryawan.appendChild(createOption(karyawan.id,karyawan.nama));
        });
    })
    .catch(error=> {
        console.error("Gagal mengambil data karyawan:", error)
    })
}

// script untuk close modal tambah (aria hidden)
$(document).on('hide.bs.modal', '#modal-presensi', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal edit (aria hidden)
$(document).on('hide.bs.modal', '#modal-edit-presensi', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// pindahkan fokus ke tombol tambah karyawan
$(document).on('hidden.bs.modal', '#modal-presensi', function() {
    $('#button-tambah-presensi').trigger('focus');
});

// pindahkan fokus input tanggal presensi saat modal tambah dibuka
$(document).on('shown.bs.modal', '#modal-presensi', function() {
    $('#karyawan-presensi').trigger('focus');
});

function showModalAlertPresensi(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-presensi');
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

// event listener submit form add presensi karyawan
$(document).on('submit', '#form-presensi', async function(e) {
    e.preventDefault();

    // 1. tangkap input dari textbox
    const idKaryawan = document.getElementById("karyawan-presensi").value; 
    const tanggal = document.getElementById("tanggal-presensi").value;
    const waktuMasuk = document.getElementById("waktu-masuk-presensi").value;
    const keterangan = document.getElementById("keterangan-presensi").value;
    
    try {
        const data = await handleFetchJSON(fetch("/api/presensi", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
                karyawan_id: idKaryawan,
                tanggal: tanggal,
                waktu_masuk: waktuMasuk,
                keterangan: keterangan,
            })
        }));

        // Berhasil, tampilkan pesan
        showModalAlertPresensi(`Data presensi karyawan dengan ID <strong>'${data.data.karyawan_id}'</strong> berhasil ditambahkan!`, 'success');

        // Refresh tabel & reset input
        fetchAndRenderPresensi();

        // Kosongkan elemen input
        document.getElementById("karyawan-presensi").selectedIndex=0;
        document.getElementById("tanggal-presensi").value="";
        document.getElementById("waktu-masuk-presensi").value="";
        document.getElementById("keterangan-presensi").value="";
        
        // fokuskan lagi ke id
        document.getElementById("karyawan-presensi").focus();
        // $('#modalKaryawan').modal('hide');

    } catch (err) {
        // Gagal
        console.log("Error: "+err.message)
        showModalAlertPresensi('Terjadi kesalahan: ' + err.message, 'danger');
    }    
});

function showAlertpresensi(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-presensi');

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

// script untuk open dan close modal editKaryawan
function openModalEditpresensi(presensi) {
    document.getElementById("edit-id-presensi").value = presensi.id;
    document.getElementById("edit-karyawan-presensi").value = presensi.karyawan_id;
    document.getElementById("edit-tanggal-presensi").value = presensi.tanggal;
    document.getElementById("edit-waktu-masuk-presensi").value = presensi.waktu_masuk;
    document.getElementById("edit-waktu-pulang-presensi").value = presensi.waktu_pulang;
    document.getElementById("edit-keterangan-presensi").value = presensi.keterangan;

    $('#modal-edit-presensi').modal('show'); // pakai bootstrap show modal
}

// event listener submit form update presensi karyawan
$(document).on('submit', '#form-edit-presensi', function(e) {
    e.preventDefault(); // agar tidak auto submit

    // 1. tangkap input dari textbox
    //const id = document.getElementById("edit-id-presensi").value;
    const tanggal = document.getElementById("edit-tanggal-presensi").value;
    const idKaryawan = document.getElementById("edit-karyawan-presensi").value; 
    const waktuMasuk = document.getElementById("edit-waktu-masuk-presensi").value; 
    const waktuPulang = document.getElementById("edit-waktu-pulang-presensi").value; 
    const keterangan = document.getElementById("edit-keterangan-presensi").value;
    
    // DEBUG console.log({ id, nama, jenjang, aktif});
    
    // 2. kirim request ke backend
    fetch(`/api/presensi/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
            karyawan_id: idKaryawan,
            tanggal: tanggal,
            waktu_masuk: waktuMasuk,
            waktu_pulang: waktuPulang,
            keterangan: keterangan,
        })
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errJson = await res.json(); // coba ambil json dari error
            const errMsg = errJson.message || "Terjadi kesalahan yang tidak diketahui"; // ambil json "message" dari response, setelah || adalah pesan default kalau errJson.Msg tidak ada
            // throw new Error("Gagal tambah data: " + errMsg);
            alert("Gagal update data presensi: "+errMsg);
            return;
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        // 4. berikan alert berisi data yang berhasil ditambahkan
        // showModalAlert(`Data karyawan dengan ID <strong>${data.data.id}</strong> berhasil diupdate!`, 'success');

        // 5. kosongkan elemen input modalEdit
        document.getElementById("edit-id-presensi").value="";
        document.getElementById("edit-karyawan-presensi").selectedIndex=0;
        document.getElementById("edit-tanggal-presensi").value="";
        document.getElementById("edit-waktu-masuk-presensi").value="";
        document.getElementById("edit-waktu-pulang-presensi").value="";
        document.getElementById("edit-keterangan-presensi").value="";

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderPresensi();
      
        // 7. tutup modal
        $('#modal-edit-presensi').modal('hide');

        // 8. tampilkan notifikasi
        showAlertpresensi(`Data presensi dengan ID <strong>'${data.data.id}'</strong> berhasil diupdate!`, 'success');
    })
    // 8. catch error
    .catch(err => showModalAlertPresensi('Terjadi kesalahan: ' + err.message, 'danger'));
});