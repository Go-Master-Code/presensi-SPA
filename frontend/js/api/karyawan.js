// Ganti URL sesuai endpoint backend kamu
const API_URL = 'http://localhost:8080/api/karyawan';

let dataTableInstance; // simpan instance DataTables global supaya bisa diakses
let isEditMode = false; // mode edit / tambah karyawan

// tampilkan data table pada saat halaman dimuat
function fetchAndRenderKaryawan() {
    fetch(API_URL)
    .then(response=> {
        if (!response.ok) {
            throw new Error('Gagal mengambil data karyawan');
        }
        return response.json();
    })
    .then(response => {
        const data = response.data;

        // ✅ Cegah error jika data null (tidak ada data di db atau bukan array)
        if (!Array.isArray(data) || data.length === 0) {
            const tbody = document.querySelector('#table-karyawan tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">Tidak ada data karyawan tersedia.</td>
                </tr>
            `;

            // Jika sebelumnya sudah init DataTable, hapus dulu
            if ($.fn.DataTable.isDataTable('#table-karyawan')) {
                dataTableInstance.clear().destroy();
            }

            return; // hentikan eksekusi .map()
        }

        if ($.fn.DataTable.isDataTable('#table-karyawan')) { // memeriksa apakah elemen HTML dengan id table-karyawan sudah diinisialisasi sebagai DataTable.
            dataTableInstance.clear().destroy(); // harus dilakukan untuk reload data saat sudah hapus data dari table
            // clear() membersihkan data yang ada di instance DataTables (menghapus semua baris data di tabel).
            // destroy() menghancurkan (menghapus) instance DataTables dari tabel, sehingga tabel kembali ke bentuk HTML biasa tanpa fitur DataTables.
        }
        
        const tbody = document.querySelector('#table-karyawan tbody');
        tbody.innerHTML = '';

        dataTableInstance = $('#table-karyawan').DataTable({
            pageLength: 7, // isi per page 7 data
            lengthChange: false,
            searching: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: false, // supaya muncul scroll horizontal jika layar kecil
            data: data.map(karyawan => [
                karyawan.id,
                karyawan.nama,
                karyawan.jenjang,
                karyawan.aktif ? 'Ya' : 'Tidak',
                `
                <button class="btn btn-sm btn-info btn-edit" onclick='openModalEdit(${JSON.stringify(karyawan)})'><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-sm btn-danger btn-delete" onClick="showDeleteConfirmModal('${karyawan.id}')" data-id="${karyawan.id}"><i class="fas fa-trash-alt"></i> Delete</button>
                `
            ]),
            columnDefs: [
                { targets: [0,2,3], className: 'text-center' }, // index kolom 0, 2, dan 3 center
                {
                    targets: 4, // Aturan ini hanya berlaku untuk kolom indeks ke-4 (kolom kelima).
                    orderable: false, // Menonaktifkan fitur pengurutan (sorting) untuk kolom ini. Karena kolom ini berisi tombol (edit, delete), maka tidak perlu diurutkan.
                    searchable: false, // Menonaktifkan fitur pencarian pada kolom ini. Data di kolom tombol biasanya tidak relevan untuk pencarian.
                    className: 'text-center',
                    /*
                        Fungsi render mengontrol bagaimana isi data pada kolom ini akan ditampilkan.
                        data: nilai asli dari data pada kolom ini (di sini berupa string HTML tombol).
                        type: tipe rendering (misal, untuk display, filter, export, dll).
                        row: seluruh data baris.
                        meta: info meta lainnya.
                    */
                    render: function(data, type, row, meta) {
                        return data; // render tombol sebagai HTML
                    }
                }
            ]
        });
    })
    .catch(error => {
        alert('Terjadi kesalahan: ' + error.message);
    });
}

// function append data karyawan yang baru di add ke db ke dalam tabel
function appendKaryawan(karyawan) {
    const aktif = karyawan.aktif ? 'Ya' : 'Tidak'; // true=Ya, false=Tidak

    // tambahkan elemen button edit dan hapus
    const aksiButtons = `
        <button class="btn btn-sm btn-info btn-edit" onclick='openModalEdit(${JSON.stringify(karyawan)})'><i class="fas fa-edit"></i> Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" onClick="showDeleteConfirmModal('${karyawan.id}')" data-id="${karyawan.id}"><i class="fas fa-trash-alt"></i> Delete</button>
    `;

    // jangan pakai elemen tr dan td lagi
    dataTableInstance.row.add([
        karyawan.id,
        karyawan.nama,
        karyawan.jenjang,
        aktif,
        aksiButtons // -> kolom ke 5 yang berisi aksi edit dan delete
    ]).draw(false);
}

// event listener submit form add karyawan
document.getElementById("form-karyawan").addEventListener("submit", function(e) {
    e.preventDefault();

    // 1. tangkap input dari textbox
    const id = document.getElementById("id").value;
    const nama = document.getElementById("nama").value; 
    const jenjang = Number(document.getElementById("jenjang").value);
    
    console.log({ id, nama, jenjang});
    
    // 2. kirim request ke backend
    fetch("/api/karyawan", {
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
    })
    .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
        if (!res.ok) {
            const errText = await res.text();
            throw new Error("Gagal tambah data karyawan\n",errText)
        }
        return res.json();
    })
    .then(data => {
        console.log(data)
        // 4. berikan alert berisi data yang berhasil ditambahkan
        showModalAlert(`Data karyawan <strong>${data.data.nama}</strong> berhasil ditambahkan!`, 'success');

        // 5. tambah elemen pada tbody
        appendKaryawan(data.data)

        // 7. kosongkan elemen input
        document.getElementById("id").value="";
        document.getElementById("nama").value="";
        document.getElementById("jenjang").selectedIndex=0;

        // fokuskan lagi ke id
        document.getElementById("id").focus();
        // $('#modalKaryawan').modal('hide');
    })
    // 8. catch error
    .catch(err => showModalAlert('Terjadi kesalahan: ' + err.message, 'danger'));
});

// inisialisasi saat halaman siap
$(document).ready(function() {
    $('#modalKaryawan').on('hide.bs.modal', function () { // event sebelum modal ditutup
        const focusedEl = document.activeElement; // ambil elemen yang sedang fokus (biasanya tombol close di modal)
        if ($(this).has(focusedEl).length) { // memeriksa apakah focusedEL adalah (anak turunan) dari komponen modal, jika hasilnya > 0 maka fokus berada di dalam modal
            focusedEl.blur(); // remove focus dari elemen tersebut
        }
    });

    // pindahkan focus dari dalam modal ke tombol tambah data (di html utama)
    $('#modalKaryawan').on('hidden.bs.modal', function () { // setelah modal add karyawan di hidden
        $('[data-toggle="modal"][data-target="#modalKaryawan"]').trigger('focus'); // pindahkan ke tombol tambah karyawan
    });

    $('#modalEditKaryawan').on('hidden.bs.modal', function () { // setelah modal delete karyawan di hidden
        $('[data-toggle="modal"][data-target="#modalKaryawan"]').trigger('focus'); // pindahkan ke tombol tambah karyawan
    });

    $('#confirmDeleteModal').on('hidden.bs.modal', function () { // setelah modal delete karyawan di hidden
        $('[data-toggle="modal"][data-target="#modalKaryawan"]').trigger('focus'); // pindahkan ke tombol tambah karyawan
    });

    /* debug console untuk tombol close modal
    $('#modalKaryawan').on('hide.bs.modal', function () {
        console.log('Modal will hide');
        console.log('Focused element:', document.activeElement);
        console.log('aria-hidden:', $(this).attr('aria-hidden'));
    });

    $('#modalKaryawan').on('hidden.bs.modal', function () {
        console.log('Modal hidden');
        console.log('Focused element:', document.activeElement);
        console.log('aria-hidden:', $(this).attr('aria-hidden'));
    });

    // Log setiap kali fokus berubah di seluruh dokumen
    $(document).on('focusin', function(e) {
        console.log('Focus moved to:', e.target);
    });
    */

    // beri id pada search column yang dihasilkan dataTable
    /*
        📌 Penjelasan:
            init.dt adalah event yang dipicu saat DataTables selesai diinisialisasi.
            div.dataTables_filter input adalah input search-nya.
            Kita memberi id="search-karyawan" agar tidak muncul warning.
    */
    $('#table-karyawan').on('init.dt', function() {
        $('div.dataTables_filter input').attr('id', 'search-karyawan');
    });

    fetchAndRenderKaryawan();

    // saat modal dibuka langsung fokus ke ID
    $('#modalKaryawan').on('shown.bs.modal', function () {
        $('#id').trigger('focus');
    });

    // saat modal dibuka langsung fokus ke ID
    $('#modalEditKaryawan').on('shown.bs.modal', function () {
        $('#edit-nama').trigger('focus');
    });

    // ID hanya bisa angka
    $('#id').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});

// hapus data
async function hapusData(id) {
    // 1. tampilkan konfirmasi hapus data ke pengguna
    if (!confirm(`Yakin akan menghapus karyawan dengan ID: ${id} ?`)) return;

    // 2. kirim permintaan delete ke server dengan async dan await
    try {
        const res = await fetch(`api/karyawan/${id}`, { method: "DELETE" });

        if (!res.ok) { // 3. jika ada error
            const errorData = await res.json();
            const errorMsg = errorData.message || "Gagal menghapus karyawan";
            throw new Error(errorMsg);
        }

        // 4. jika tidak ada error, masukkan response json ke dalam const data
        const data = await res.json();
        
        // 5. beri alert
        alert(`Karyawan '${data.data.nama}' dengan ID '${data.data.id}' berhasil dihapus!`);
        fetchAndRenderKaryawan(); // 6. reload ulang data karyawan, jangan location.reload
    } catch (err) { // 6. catch error
        alert("Error: " + err.message);
    }
}

// section delete data
let idToDelete = null; // variabel global sementara simpan id karyawan yg mau dihapus

// Fungsi dipanggil saat klik tombol Delete di tabel
function showDeleteConfirmModal(id) {
    idToDelete = id; // isi id var global
    document.getElementById('deleteIdText').textContent = id;
    $('#confirmDeleteModal').modal('show'); // pakai jQuery Bootstrap 4 style
}

// Fungsi hapus dipanggil saat user klik tombol "Hapus" di modal
document.getElementById('btnConfirmDelete').addEventListener('click', () => {
  if (!idToDelete) return; // jika id nya kosong, batal

  showSpinner(); // ⏳ Tampilkan spinner

  fetch(`api/karyawan/${idToDelete}`, { method: 'DELETE' })
    .then(res => {
      if (!res.ok) throw new Error('Gagal menghapus karyawan');
      return res.json();
    })
    .then(data => {
      // alert(`Karyawan '${data.data.nama}' dengan ID '${data.data.id}' berhasil dihapus!`);
      // pakai alert modern
      showAlert(`Karyawan '${data.data.nama}' dengan ID '${data.data.id}' berhasil dihapus!`, 'success');
      fetchAndRenderKaryawan(); // refresh data tabel tanpa reload halaman
    })
    .catch(err => alert('Error: ' + err.message))
    .finally(() => {
        $('#confirmDeleteModal').modal('hide'); // lalu coba hide lagi
        idToDelete = null;
        hideSpinner(); // ✅ Sembunyikan spinner
    });
});

// script untuk open dan close modal editKaryawan
function openModalEdit(karyawan) {
    // Isi form dengan data enrichment
    document.getElementById("edit-id").value = karyawan.id;
    document.getElementById("edit-nama").value = karyawan.nama;
    document.getElementById("edit-jenjang").value = karyawan.jenjang_id;
    document.getElementById("edit-aktif").value = karyawan.aktif;

    $('#modalEditKaryawan').modal('show'); // pakai bootstrap show modal
}
function closeModalEdit() {
    $('#modalEditKaryawan').modal('hide');  // tutup modal dengan bootstrap
}

// script untuk update data sesuai dengan input pada modal
// event listener submit form add karyawan
document.getElementById("form-edit-karyawan").addEventListener("submit", function(e) {
    e.preventDefault();

    // 1. tangkap input dari textbox
    const id = document.getElementById("edit-id").value; 
    const nama = document.getElementById("edit-nama").value; 
    const jenjang = Number(document.getElementById("edit-jenjang").value);
    const aktif = document.getElementById("edit-aktif").value;
    
    console.log({ nama, jenjang, aktif});
    
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
        console.log(data)
        // 4. berikan alert berisi data yang berhasil ditambahkan
        // showModalAlert(`Data karyawan dengan ID <strong>${data.data.id}</strong> berhasil diupdate!`, 'success');

        // 5. kosongkan elemen input modalEdit
        document.getElementById("id-edit").value="";
        document.getElementById("nama-edit").value="";
        document.getElementById("jenjang-edit").selectedIndex=0;
        document.getElementById("aktif-edit").selectedIndex=0;

        // 6. reload data karyawan dari db (hasil update)
        fetchAndRenderKaryawan();

        // 7. tutup modal
        $('#modalKaryawan').modal('hide');
    })
    // 8. catch error
    .catch(err => showModalAlert('Terjadi kesalahan: ' + err.message, 'danger'));
});