// Ganti URL sesuai endpoint backend kamu
// const API_URL = 'http://localhost:8080/api/karyawan';

let dataTableKaryawan; // simpan instance DataTables global supaya bisa diakses

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
function fetchAndRenderKaryawan() {
    fetch('/api/karyawan')
    .then (async res=> { // tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // showAlertFindContainer(`Data hari libur tidak ditemukan!`, 'danger');
            dataTableKaryawan.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data karyawan:\n${errText}`);
        }
        return res.json();
        })
    .then(data => {
        // DataTables
        const karyawan = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTableKaryawan.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        // const dataArray = Array.isArray(hariLibur) ? hariLibur : [hariLibur];

        let dataArray = []; // Inisialisasi variabel dataArray sebagai array kosong

        if (Array.isArray(karyawan)) { // Mengecek apakah karyawan adalah array.
            dataArray = karyawan.filter(kyw => kyw !== null); // Memastikan hanya elemen yang tidak null yang dimasukkan ke dataArray.
        } else if (karyawan) { // Jika hariLibur bukan array, tapi masih ada nilainya (bukan null, undefined, atau false).
            dataArray = [karyawan];
        }
        
        // Tambah data ke datatable
        dataTableKaryawan.rows.add(
            dataArray.map(k => [
                k.id,
                k.nama,
                k.jenjang,
                k.aktif ? 'Ya' : 'Tidak',
                `
                <button class="btn btn-sm btn-info btn-edit" onclick='openModalEditKaryawan(${JSON.stringify(k)})'><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger btn-delete" onClick="showModalDeleteKaryawan('${k.id}')" data-id="${k.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                `
            ])
        ).draw();
    })
    .catch(err => {
        console.error(err);
    });
}

// init datatable
function initDataTableKaryawan() {
    if (!$.fn.DataTable.isDataTable('#table-karyawan')) {
        dataTableKaryawan = $('#table-karyawan').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 2, 3], className: 'text-center' },
            { // kolom index 4 (aksi) tidak perlu di order atau di search karena kurang relevan
                targets: 4,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: data => data,
            }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-karyawan_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-karyawan', name: 'search-karyawan' });
                    $('#table-karyawan_wrapper .dataTables_filter label').attr('for', 'search-karyawan');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// definisikan data table dan masukkan data yang sudah di fetch
function renderKaryawan() {
    initDataTableKaryawan();
    fetchAndRenderKaryawan();
    fetchJenjang();

    // ID hanya bisa angka
    $('#id').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
}

// function untuk add options ke dalam select
function createOption(value, text) { // func untuk add options ke dalam select
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// fetch data jenjang untuk modal add dan edit karyawan
function fetchJenjang() {
    fetch("/api/jenjang")
    .then(response=> response.json()) // ubah ke format json
    .then(data=> {
        const select = document.getElementById("jenjang");
        const editJenjang = document.getElementById("edit-jenjang")

        data.data.forEach(jenjang => {
            const option = document.createElement("option");
            
            select.appendChild(createOption(jenjang.id,jenjang.nama));
            editJenjang.appendChild(createOption(jenjang.id,jenjang.nama));
        });
    })
    .catch(error=> {
        console.error("Gagal mengambil data jenjang:", error)
    })
}

// script untuk close modal tambah (aria hidden)
$(document).on('hide.bs.modal', '#modal-karyawan', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal delete (aria hidden)
$(document).on('hide.bs.modal', '#modal-delete-karyawan', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal edit (aria hidden)
$(document).on('hide.bs.modal', '#modal-edit-karyawan', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});


// pindahkan fokus ke tombol tambah karyawan
$(document).on('hidden.bs.modal', '#modal-karyawan', function() {
    $('#button-tambah-karyawan').trigger('focus');
});

// pindahkan fokus input ID saat modal tambah karyawan dibuka
$(document).on('shown.bs.modal', '#modal-karyawan', function() {
    $('#id').trigger('focus');
});

function showModalAlertKaryawan(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-karyawan');
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

// event listener submit form add karyawan
$(document).on('submit', '#form-karyawan', async function(e) {
    e.preventDefault();

    // 1. tangkap input dari textbox
    const id = document.getElementById("id").value;
    const nama = document.getElementById("nama").value; 
    const jenjang = Number(document.getElementById("jenjang").value);
    
    try {
        const data = await handleFetchJSON(fetch("/api/karyawan", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
                id: id,
                nama: nama,
                jenjang_id: jenjang,
                aktif: true,
            })
        }));

        // Berhasil, tampilkan pesan
        showModalAlertKaryawan(`Data karyawan <strong>${data.data.nama}</strong> berhasil ditambahkan!`, 'success');

        // Refresh tabel & reset input
        fetchAndRenderKaryawan();

        // Kosongkan elemen input
        document.getElementById("id").value="";
        document.getElementById("nama").value="";
        document.getElementById("jenjang").selectedIndex=0;

        // fokuskan lagi ke id
        document.getElementById("id").focus();
        // $('#modalKaryawan').modal('hide');

    } catch (err) {
        // Gagal
        console.log("Error: "+err.message)
        showModalAlertKaryawan('Terjadi kesalahan: ' + err.message, 'danger');
    }    

    // DEBUG console.log({ id, nama, jenjang});
});

// section delete data
let idToDelete = null; // variabel global sementara simpan id karyawan yg mau dihapus

// Fungsi dipanggil saat klik tombol Delete di tabel
function showModalDeleteKaryawan(id) {
    idToDelete = id; // isi id var global
    document.getElementById('deleteIdText').textContent = id;
    $('#modal-delete-karyawan').modal('show'); // pakai jQuery Bootstrap 4 style
}

// Fungsi hapus dipanggil saat user klik tombol "Hapus" di modal
$(document).on('click', '#button-delete-karyawan', function(e) {
    if (!idToDelete) return; // jika id nya kosong, batal

    // showSpinner(); // ⏳ Tampilkan spinner

    fetch(`api/karyawan/${idToDelete}`, { method: 'DELETE' })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gagal menghapus karyawan:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        showAlert(`Karyawan <strong>'${data.data.nama}'</strong> dengan ID <strong>'${data.data.id}'</strong> berhasil dihapus!`, 'success');
        fetchAndRenderKaryawan(); // refresh data tabel tanpa reload halaman
    })
    .catch(err => alert('Error: ' + err.message))
    .finally(() => {
        $('#modal-delete-karyawan').modal('hide'); // lalu coba hide lagi
        idToDelete = null;
        // hideSpinner(); // ✅ Sembunyikan spinner
    });
});

function showAlert(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-karyawan');

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
function openModalEditKaryawan(karyawan) {
    // Isi form dengan data enrichment
    document.getElementById("edit-id").value = karyawan.id;
    document.getElementById("edit-nama").value = karyawan.nama;
    document.getElementById("edit-jenjang").value = karyawan.jenjang_id;
    document.getElementById("edit-aktif").checked = karyawan.aktif;

    $('#modal-edit-karyawan').modal('show'); // pakai bootstrap show modal
}

// event listener submit form update karyawan
$(document).on('submit', '#form-edit-karyawan', function(e) {
    e.preventDefault(); // agar tidak auto submit

    // 1. tangkap input dari textbox
    const id = document.getElementById("edit-id").value; 
    const nama = document.getElementById("edit-nama").value; 
    const jenjang = Number(document.getElementById("edit-jenjang").value);
    const aktif = document.getElementById("edit-aktif").checked; // menghasilkan true/false - boolean untuk request body
    
    // DEBUG console.log({ id, nama, jenjang, aktif});
    
    // 2. kirim request ke backend
    fetch(`/api/karyawan/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
            id: id,
            nama: nama,
            jenjang_id: jenjang,
            aktif: aktif,
        })
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errJson = await res.json(); // coba ambil json dari error
            const errMsg = errJson.message || "Terjadi kesalahan yang tidak diketahui"; // ambil json "message" dari response, setelah || adalah pesan default kalau errJson.Msg tidak ada
            // throw new Error("Gagal tambah data: " + errMsg);
            alert("Gagal update data karyawan: "+errMsg);
            return;
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        // 4. berikan alert berisi data yang berhasil ditambahkan
        // showModalAlert(`Data karyawan dengan ID <strong>${data.data.id}</strong> berhasil diupdate!`, 'success');

        // 5. kosongkan elemen input modalEdit
        document.getElementById("edit-id").value="";
        document.getElementById("edit-nama").value="";
        document.getElementById("edit-jenjang").selectedIndex=0;
        document.getElementById("edit-aktif").checked=false;

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderKaryawan();
      
        // 7. tutup modal
        $('#modal-edit-karyawan').modal('hide');

        // 8. tampilkan notifikasi
        showAlert(`Data karyawan dengan ID <strong>'${data.data.id}'</strong> berhasil diupdate!`, 'success');
    })
    // 8. catch error
    .catch(err => showModalAlert('Terjadi kesalahan: ' + err.message, 'danger'));
});