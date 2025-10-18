document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('rfid-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const uid = this.value.trim();

            if (uid === "") return;

            // TODO: Ganti dengan request ke API backend untuk insert data absensi berdasarkan uid

            const today = new Date();
            const tanggalMySQL = today.toISOString().split('T')[0];
            const waktuMySQL = today.toTimeString().split(' ')[0];

             // 2. kirim request ke backend
            fetchWithAuth("/api/presensi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ // request body dalam bentuk key - value (key = nama field json nya, lihat di dto)
                    karyawan_id: uid,
                    tanggal: tanggalMySQL,
                    waktu_masuk: waktuMySQL,
                    waktu_pulang: waktuMySQL,
                })
            })
            .then (async res=> { // 3. tangkap error nya agar dapat dimunculkan di console
                if (!res.ok) {
                    // Kosongkan input dan fokus ulang setelah 0.1 detik
                    setTimeout(() => {
                        this.value = "";
                        this.focus();
                    }, 100);
                    // Tampilkan alert gagal simpan data
                    document.getElementById("alert-absen").innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            Gagal simpan data absensi untuk ID Karyawan: <strong>${uid}</strong>!
                        </div>
                    `;

                    // hilangkan kotak detil absensi di bawah
                    document.getElementById("karyawan-info").classList.add("d-none"); // tampilkan

                    const errText = await res.text();
                    throw new Error(`Gagal simpan data absensi:\n${errText}`);
                }
                return res.json();
            })
            .then(data => {
                console.log(data)
                
                const waktuMasuk = data.data.waktu_masuk;
                const waktuPulang = data.data.waktu_pulang;

                 // Tampilkan hasil absen di halaman
                document.getElementById("karyawan-nama").textContent = data.data.karyawan_nama;

                // Logic absen datang atau pulang
                if (waktuMasuk===waktuPulang) {
                    document.getElementById("waktu-absen").textContent = "Waktu Absen: " + data.data.tanggal +" pukul "+ waktuPulang;
                } else {
                    document.getElementById("waktu-absen").textContent = "Waktu Pulang: " + data.data.tanggal +" pukul "+ waktuPulang;
                }

                // document.getElementById("foto-pegawai").src = data.foto;
                document.getElementById("karyawan-info").classList.remove("d-none"); // tampilkan

                // Tampilkan alert sukses untuk absen datang / pulang
                document.getElementById("alert-absen").innerHTML = `
                    <div class="alert alert-success" role="alert">
                        Absensi berhasil untuk <strong>${data.data.karyawan_nama}</strong>!
                    </div>
                `;

                // Kosongkan input dan fokus ulang setelah 0.1 detik
                setTimeout(() => {
                    this.value = "";
                    this.focus();
                }, 100);
            })
        }
    });
});

// WAJIB link ke jQuery sebelum script presensi.js dimuat di presensi.html
// inisialisasi saat halaman siap
$(document).ready(function() {
    // ID hanya bisa angka
    $('#rfid-input').on('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
});
