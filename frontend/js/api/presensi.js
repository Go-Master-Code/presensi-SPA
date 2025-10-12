function fetchPresensi() {
  return fetch('/api/presensi')
    .then(res => res.json())
    .then(obj => obj.data);
}

function renderPresensi() {
  const tbody = document.getElementById('presensi-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  fetchPresensi()
    .then(data => {
      data.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${p.tanggal}</td>
          <td>${p.karyawan_id}</td>
          <td>${p.status}</td>
        `;
        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      tbody.innerHTML = `<tr><td colspan="3">Error: ${err.message}</td></tr>`;
    });
}
