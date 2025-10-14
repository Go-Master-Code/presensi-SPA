// Ganti URL sesuai endpoint backend kamu
// const API_URL = 'http://localhost:8080/api/karyawan';

let dataTableIjinKaryawan; // simpan instance DataTables global supaya bisa diakses

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
function fetchAndRenderIjinKaryawan() {
    fetch('/api/ijin')
    .then (async res=> { // tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // showAlertFindContainer(`Data hari libur tidak ditemukan!`, 'danger');
            dataTableIjinKaryawan.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data ijin:\n${errText}`);
        }
        return res.json();
        })
    .then(data => {
        // DataTables
        const ijin = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTableIjinKaryawan.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        // const dataArray = Array.isArray(hariLibur) ? hariLibur : [hariLibur];

        let dataArray = []; // Inisialisasi variabel dataArray sebagai array kosong

        if (Array.isArray(ijin)) { // Mengecek apakah karyawan adalah array.
            dataArray = ijin.filter(ik => ik !== null); // Memastikan hanya elemen yang tidak null yang dimasukkan ke dataArray.
        } else if (ijin) { // Jika hariLibur bukan array, tapi masih ada nilainya (bukan null, undefined, atau false).
            dataArray = [ijin];
        }
        
        // Tambah data ke datatable
        dataTableIjinKaryawan.rows.add(
            dataArray.map(ik => [
                ik.id,
                ik.tanggal,
                ik.karyawan_nama,
                ik.jenis_ijin_nama,
                ik.keterangan,
                `
                <button class="btn btn-sm btn-info btn-edit" onclick='openModalEditIjin(${JSON.stringify(ik)})'><i class="fas fa-edit"></i> Edit</button>
                `
            ])
        ).draw();
    })
    .catch(err => {
        console.error(err);
    });
}

// init datatable
function initDataTableIjin() {
    if (!$.fn.DataTable.isDataTable('#table-ijin-karyawan')) {
        dataTableIjinKaryawan = $('#table-ijin-karyawan').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 1, 3], className: 'text-center' },
            { // kolom index 4 (aksi) tidak perlu di order atau di search karena kurang relevan
                targets: 5,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: data => data,
            }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-ijin-karyawan_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-ijin-karyawan', name: 'search-ijin-karyawan' });
                    $('#table-ijin-karyawan_wrapper .dataTables_filter label').attr('for', 'search-ijin-karyawan');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// definisikan data table dan masukkan data yang sudah di fetch
function renderIjinKaryawan() {
    initDataTableIjin();
    fetchAndRenderIjinKaryawan();
    fetchJenisIjin();
    fetchKaryawanForIjin();
}

// function untuk add options ke dalam select
function createOption(value, text) { // func untuk add options ke dalam select
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// fetch data jenis ijin untuk modal add dan edit ijin karyawan
function fetchJenisIjin() {
    fetch("/api/jenis_ijin")
    .then(response=> response.json()) // ubah ke format json
    .then(data=> {
        const selectJenisIjin = document.getElementById("jenis-ijin-nama");
        const selectEditJenisIjin = document.getElementById("edit-jenis-ijin-nama");

        data.data.forEach(ijin => {
            selectJenisIjin.appendChild(createOption(ijin.id,ijin.nama));
            selectEditJenisIjin.appendChild(createOption(ijin.id,ijin.nama));
        });
    })
    .catch(error=> {
        console.error("Gagal mengambil data jenis ijin:", error)
    })
}

// fetch data karyawan untuk modal add dan edit ijin karyawan
function fetchKaryawanForIjin() {
    fetch("/api/karyawan")
    .then(response=> response.json()) // ubah ke format json
    .then(data=> {
        const selectKaryawan = document.getElementById("karyawan-ijin");
        const selectEditKaryawan = document.getElementById("edit-karyawan-ijin");

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
$(document).on('hide.bs.modal', '#modal-ijin-karyawan', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal edit (aria hidden)
$(document).on('hide.bs.modal', '#modal-edit-ijin-karyawan', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// pindahkan fokus ke tombol tambah karyawan
$(document).on('hidden.bs.modal', '#modal-ijin-karyawan', function() {
    $('#button-tambah-ijin-karyawan').trigger('focus');
});

// pindahkan fokus input tanggal ijin saat modal tambah dibuka
$(document).on('shown.bs.modal', '#modal-ijin-karyawan', function() {
    $('#tanggal-ijin').trigger('focus');
});

function showModalAlertIjinKaryawan(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-ijin-karyawan');
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

// event listener submit form add ijin karyawan
$(document).on('submit', '#form-ijin-karyawan', async function(e) {
    e.preventDefault();

    // 1. tangkap input dari textbox
    const tanggal = document.getElementById("tanggal-ijin").value;
    const idKaryawan = document.getElementById("karyawan-ijin").value; 
    const jenisIjin = Number(document.getElementById("jenis-ijin-nama").value);
    const keterangan = document.getElementById("keterangan-ijin").value;
    
    try {
        const data = await handleFetchJSON(fetch("/api/ijin", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
                tanggal: tanggal,
                karyawan_id: idKaryawan,
                jenis_ijin_id: jenisIjin,
                keterangan: keterangan,
            })
        }));

        // Berhasil, tampilkan pesan
        showModalAlertIjinKaryawan(`Data ijin karyawan dengan ID <strong>'${data.data.karyawan_id}'</strong> berhasil ditambahkan!`, 'success');

        // Refresh tabel & reset input
        fetchAndRenderIjinKaryawan();

        // Kosongkan elemen input
        document.getElementById("tanggal-ijin").value="";
        document.getElementById("karyawan-ijin").selectedIndex=0;
        document.getElementById("jenis-ijin-nama").selectedIndex=0;
        document.getElementById("keterangan-ijin").value="";
        
        // fokuskan lagi ke id
        document.getElementById("tanggal-ijin").focus();
        // $('#modalKaryawan').modal('hide');

    } catch (err) {
        // Gagal
        console.log("Error: "+err.message)
        showModalAlertIjinKaryawan('Terjadi kesalahan: ' + err.message, 'danger');
    }    
});

function showAlertIjin(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-ijin-karyawan');

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
function openModalEditIjin(ijin) {
    document.getElementById("edit-id-ijin").value = ijin.id;
    document.getElementById("edit-tanggal-ijin").value = ijin.tanggal;
    document.getElementById("edit-karyawan-ijin").value = ijin.karyawan_id;
    document.getElementById("edit-jenis-ijin-nama").value = ijin.jenis_ijin_id;
    document.getElementById("edit-keterangan-ijin").value = ijin.keterangan;

    $('#modal-edit-ijin-karyawan').modal('show'); // pakai bootstrap show modal
}

// event listener submit form update ijin karyawan
$(document).on('submit', '#form-edit-ijin-karyawan', function(e) {
    e.preventDefault(); // agar tidak auto submit

    // 1. tangkap input dari textbox
    const id = document.getElementById("edit-id-ijin").value;
    const tanggal = document.getElementById("edit-tanggal-ijin").value;
    const idKaryawan = document.getElementById("edit-karyawan-ijin").value; 
    const jenisIjin = Number(document.getElementById("edit-jenis-ijin-nama").value);
    const keterangan = document.getElementById("edit-keterangan-ijin").value;
    
    // DEBUG console.log({ id, nama, jenjang, aktif});
    
    // 2. kirim request ke backend
    fetch(`/api/ijin/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
            tanggal: tanggal,
            karyawan_id: idKaryawan,
            jenis_ijin_id: jenisIjin,
            keterangan: keterangan,
        })
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errJson = await res.json(); // coba ambil json dari error
            const errMsg = errJson.message || "Terjadi kesalahan yang tidak diketahui"; // ambil json "message" dari response, setelah || adalah pesan default kalau errJson.Msg tidak ada
            // throw new Error("Gagal tambah data: " + errMsg);
            alert("Gagal update data ijin karyawan: "+errMsg);
            return;
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        // 4. berikan alert berisi data yang berhasil ditambahkan
        // showModalAlert(`Data karyawan dengan ID <strong>${data.data.id}</strong> berhasil diupdate!`, 'success');

        // 5. kosongkan elemen input modalEdit
        document.getElementById("edit-id-ijin").value="";
        document.getElementById("edit-tanggal-ijin").value="";
        document.getElementById("edit-karyawan-ijin").selectedIndex=0;
        document.getElementById("edit-jenis-ijin-nama").selectedIndex=0;
        document.getElementById("edit-keterangan-ijin").value="";

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderIjinKaryawan();
      
        // 7. tutup modal
        $('#modal-edit-ijin-karyawan').modal('hide');

        // 8. tampilkan notifikasi
        showAlertIjin(`Data ijin dengan ID <strong>'${data.data.id}'</strong> berhasil diupdate!`, 'success');
    })
    // 8. catch error
    .catch(err => showModalAlertIjinKaryawan('Terjadi kesalahan: ' + err.message, 'danger'));
});