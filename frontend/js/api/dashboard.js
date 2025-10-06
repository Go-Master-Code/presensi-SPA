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

            const tbody = document.querySelector('#table-presensi tbody');
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">Data presensi tidak ditemukan!</td>
                </tr>
            `;
            const errText = await res.text();
            throw new Error(`Gagal ambil data presensi:\n${errText}`);
        }
        return res.json();
    })
    .then(data => {
        // if (!data.success || !data.data.length) {
        //     alert('Data absensi tidak ditemukan');
        //     return;
        // }
        const presensi = data.data; // response json berupa data, jadi data.data
        const tbody = document.querySelector('#table-presensi tbody');
        tbody.innerHTML = ''; // clear dulu

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align: center;">${presensi.id}</td>
            <td style="text-align: center;">${presensi.karyawan_id}</td>
            <td style="text-align: center;">${presensi.karyawan_nama}</td>
            <td style="text-align: center;">${presensi.tanggal}</td>
            <td style="text-align: center;">${presensi.waktu_masuk}</td>
            <td style="text-align: center;">${presensi.waktu_pulang}</td>
            <td style="text-align: center;">${presensi.keterangan}</td>
        `;
        tbody.appendChild(tr);
    })
    .catch(err => {
        console.error(err);
        // alert('Terjadi kesalahan: ' + err.message);
    });
});

document.getElementById('button-clear').addEventListener('click', function() {
    document.getElementById('filter-nama').value = '';
    document.getElementById('filter-tanggal').value = '';
    const tbody = document.querySelector('#table-presensi tbody');
    tbody.innerHTML = '';
});