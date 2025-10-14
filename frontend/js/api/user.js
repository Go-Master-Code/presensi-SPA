// Ganti URL sesuai endpoint backend kamu
// const API_URL = 'http://localhost:8080/api/user';

let dataTableUser; // simpan instance DataTables global supaya bisa diakses

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
function fetchAndRenderUser() {
    fetch('api/user')
    .then (async res=> { // tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            // showAlertFindContainer(`Data user tidak ditemukan!`, 'danger');
            dataTableUser.clear().draw();
            const errText = await res.text();
            throw new Error(`Gagal ambil data user:\n${errText}`);
        }
        return res.json();
        })
    .then(data => {
        // DataTables
        const user = data.data; // response json berupa data, jadi data.data

        // Clear data lama
        dataTableUser.clear();

        // Kalau data cuma 1 object, ubah jadi array supaya .map bisa dipakai
        // const dataArray = Array.isArray(hariLibur) ? hariLibur : [hariLibur];

        let dataArray = []; // Inisialisasi variabel dataArray sebagai array kosong

        if (Array.isArray(user)) { // Mengecek apakah karyawan adalah array.
            dataArray = user.filter(u => u !== null); // Memastikan hanya elemen yang tidak null yang dimasukkan ke dataArray.
        } else if (user) { // Jika hariLibur bukan array, tapi masih ada nilainya (bukan null, undefined, atau false).
            dataArray = [user];
        }
        
        // Tambah data ke datatable
        dataTableUser.rows.add(
            dataArray.map(u => [
                u.id,
                u.email,
                u.username,
                u.role_name,
                `
                <button class="btn btn-sm btn-info btn-edit" onclick='openModalEditUser(${JSON.stringify(u)})'><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger btn-delete" onClick="showModalDeleteUser('${u.id}')" data-id="${u.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                `
            ])
        ).draw();
    })
    .catch(err => {
        console.error(err);
    });
}

// init datatable
function initDataTableUser() {
    if (!$.fn.DataTable.isDataTable('#table-user')) {
        dataTableUser = $('#table-user').DataTable({
            pageLength: 7, // jumlah baris per halaman
            lengthChange: false, // aktifkan true agar user bisa pilih 10/25/50/All
            searching: true, // kolom search kanan atas
            ordering: true, // bisa sorting kolom
            info: true, // "Showing 1 to 10 of 57 entries"
            autoWidth: false,
            responsive: true, // tabel responsif di layar kecil
            columnDefs: [ // semua data di cell table rata tengah
            { targets: [0, 3], className: 'text-center' },
            { // kolom index 4 (aksi) tidak perlu di order atau di search karena kurang relevan
                targets: 4,
                orderable: false,
                searchable: false,
                className: 'text-center',
                render: data => data,
            }
            ],
            initComplete: function () { // beri id unik untuk kolom search di tabel ini
                const $input = $('#table-user_wrapper .dataTables_filter input[type="search"]');
                if ($input.length > 0) {
                    $input.attr({ id: 'search-user', name: 'search-user' });
                    $('#table-user_wrapper .dataTables_filter label').attr('for', 'search-user');
                } else {
                    console.warn('Input search tidak ditemukan!');
                }
            }
        });
    }
}

// definisikan data table dan masukkan data yang sudah di fetch
function renderUser() {
    initDataTableUser();
    fetchAndRenderUser();
    fetchRole();
}

// function untuk add options ke dalam select
function createOption(value, text) { // func untuk add options ke dalam select
    const option = document.createElement("option");
    option.value = value;
    option.textContent = text;
    return option;
}

// fetch data role untuk modal add dan edit user
function fetchRole() {
    fetch("/api/role")
    .then(response=> response.json()) // ubah ke format json
    .then(data=> {
        const roleUser = document.getElementById("role-user");
        const editRoleUser = document.getElementById("edit-role-user")

        data.data.forEach(role => {
            const option = document.createElement("option");
            
            roleUser.appendChild(createOption(role.id,role.nama));
            editRoleUser.appendChild(createOption(role.id,role.nama));
        });
    })
    .catch(error=> {
        console.error("Gagal mengambil data role:", error)
    })
}

// script untuk close modal tambah (aria hidden)
$(document).on('hide.bs.modal', '#modal-user', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal delete (aria hidden)
$(document).on('hide.bs.modal', '#modal-delete-user', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});

// script untuk close modal edit (aria hidden)
$(document).on('hide.bs.modal', '#modal-edit-user', function() {
    const focusedEl = document.activeElement;
    if ($(this).has(focusedEl).length) {
        focusedEl.blur(); // quit focus dari modal
    }
});


// pindahkan fokus ke tombol tambah karyawan
$(document).on('hidden.bs.modal', '#modal-user', function() {
    $('#button-tambah-user').trigger('focus');
});

// pindahkan fokus input email saat modal tambah data dibuka
$(document).on('shown.bs.modal', '#modal-user', function() {
    $('#email-user').trigger('focus');
});

function showModalAlertUser(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-user');
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

function showModalAlertEditUser(message, type = 'danger', duration = 7000) {
    const alertContainer = document.getElementById('modal-alert-edit-user');
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

$(document).on('submit', '#form-user', async function(e) {
    e.preventDefault();

    const email = document.getElementById("email-user").value; 
    const username = document.getElementById("username-user").value;
    const password = document.getElementById("password-user").value;
    const confirmPassword = document.getElementById("confirm-password-user").value;
    const roleID = Number(document.getElementById("role-user").value);

    // validasi password dan confirm password
    if (password!=confirmPassword) {
        showModalAlertUser(`Password tidak sama, harap periksa kembali!`, 'danger');
        document.getElementById("confirm-password-user").focus();
        return;
    }

    try {
        const data = await handleFetchJSON(fetch("/api/user", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ 
                email: email,
                username: username,
                password: password,
                role_id: roleID,
             })
        }));

        // Berhasil, tampilkan pesan
        showModalAlertUser(`Data user <strong>'${data.data.username}'</strong> berhasil ditambahkan!`, 'success');

        // Refresh tabel & reset input
        fetchAndRenderUser();
        // Kosongkan elemen input
        document.getElementById("email-user").value = "";
        document.getElementById("username-user").value = "";
        document.getElementById("password-user").value = "";
        document.getElementById("confirm-password-user").value = "";
        document.getElementById("role-user").selectedIndex=0;
        document.getElementById("email-user").focus();

    } catch (err) {
        // Gagal
        console.log("Error: "+err.message)
        showModalAlertUser('Terjadi kesalahan: ' + err.message, 'danger');
    }
});

// section delete data
let idUserToDelete = null; // variabel global sementara simpan id karyawan yg mau dihapus

// Fungsi dipanggil saat klik tombol Delete di tabel
function showModalDeleteUser(id) {
    idUserToDelete = id; // isi id var global
    document.getElementById('deleteIdUserText').textContent = id;
    $('#modal-delete-user').modal('show'); // pakai jQuery Bootstrap 4 style
}

// Fungsi hapus dipanggil saat user klik tombol "Hapus" di modal
$(document).on('click', '#button-delete-user', function(e) {
    if (!idUserToDelete) return; // jika id nya kosong, batal

    // showSpinner(); // ⏳ Tampilkan spinner

    fetch(`api/user/${idUserToDelete}`, { method: 'DELETE' })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Gagal menghapus user:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        showAlertUser(`Data user <strong>'${data.data.username}'</strong> berhasil dihapus!`, 'success');
        fetchAndRenderUser(); // refresh data tabel tanpa reload halaman
    })
    .catch(err => alert('Error: ' + err.message))
    .finally(() => {
        $('#modal-delete-user').modal('hide'); // lalu coba hide lagi
        idUserToDelete = null;
        // hideSpinner(); // ✅ Sembunyikan spinner
    });
});

function showAlertUser(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-user');

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

// script untuk open dan close modal editUser
function openModalEditUser(u) {
    // Isi form dengan data user
    document.getElementById("edit-id-user").value = u.id; 
    document.getElementById("edit-email-user").value = u.email;
    document.getElementById("edit-username-user").value = u.username;
    document.getElementById("edit-role-user").value = u.role_id;

    $('#modal-edit-user').modal('show'); // pakai bootstrap show modal
}

// event listener submit form update user
$(document).on('submit', '#form-edit-user', function(e) {
    e.preventDefault(); // agar tidak auto submit

    // 1. tangkap input dari form
    const id = document.getElementById("edit-id-user").value; 
    const email = document.getElementById("edit-email-user").value; 
    const username = document.getElementById("edit-username-user").value;
    const password = document.getElementById("edit-password-user").value;
    const confirmPassword = document.getElementById("edit-confirm-password-user").value;
    const roleID = Number(document.getElementById("edit-role-user").value);

    // validasi password dan confirm password
    if (password!=confirmPassword) {
        showModalAlertEditUser(`Password tidak sama, harap periksa kembali!`, 'danger');
        document.getElementById("edit-confirm-password-user").focus();
        return;
    }
    
    console.log({ id, email, username, password, roleID});
    
    // 2. kirim request ke backend
    fetch(`/api/user/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
            email: email,
            username: username,
            password: password,
            role_id: roleID,
        })
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errJson = await res.json(); // coba ambil json dari error
            const errMsg = errJson.message || "Terjadi kesalahan yang tidak diketahui"; // ambil json "message" dari response, setelah || adalah pesan default kalau errJson.Msg tidak ada
            // throw new Error("Gagal tambah data: " + errMsg);
            alert("Gagal update data user: "+errMsg);
            return;
        }
        return res.json();
    })
    .then(data => {
        console.log(data);
        // 4. berikan alert berisi data yang berhasil ditambahkan

        // 5. kosongkan elemen input modalEdit
        document.getElementById("edit-email-user").value = "";
        document.getElementById("edit-username-user").value = "";
        document.getElementById("edit-password-user").value = "";
        document.getElementById("edit-confirm-password-user").value = "";
        document.getElementById("edit-role-user").selectedIndex=0;

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderUser();
      
        // 7. tutup modal
        $('#modal-edit-user').modal('hide');

        // 8. tampilkan notifikasi
        showAlertUser(`Data user dengan ID <strong>'${data.data.id}'</strong> berhasil diupdate!`, 'success');
    })
    // 8. catch error
    .catch(err => showAlertUser('Terjadi kesalahan: ' + err.message, 'danger'));
});