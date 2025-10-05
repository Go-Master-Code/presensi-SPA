document.addEventListener("DOMContentLoaded", () => {
  // Tambahkan elemen baru ke dalam div #konten
  const kontenDiv = document.getElementById("konten");

  const p = document.createElement("p");
  p.textContent = "Halo! Ini ditambahkan dari main.js";
  p.style.color = "blue";
  kontenDiv.appendChild(p);

  // Ubah teks judul
  const judul = document.getElementById("judul");
  judul.textContent = "Selamat Datang di Halaman Interaktif";

  // Tambahkan efek animasi sederhana
  judul.style.transition = "color 0.5s";
  judul.style.color = "darkgreen";
});

// Fungsi global agar bisa dipanggil dari HTML (onclick)
function showMessage() {
  alert("Tombol diklik! Ini dari main.js");
}
