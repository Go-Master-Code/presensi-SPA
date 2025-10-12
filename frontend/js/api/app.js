const routes = {
    '/': 'pages/karyawan.html',       // halaman default
    '/karyawan': 'pages/karyawan.html',
    '/jenis_ijin': 'pages/jenis_ijin.html',
    '/ijin': 'pages/ijin_karyawan.html',
    '/presensi': 'pages/presensi.html',
    '/hari_libur': 'pages/hari_libur.html',
    '/test': '/pages/test.html'
};

const appDiv = document.getElementById('app');

function loadRoute() {
    const hash = location.hash || '#/';
    if (typeof hash !== 'string') {
        appDiv.innerHTML = '<h2>Error: Invalid URL hash</h2>';
        return;
    }

    //console.log("hash saat ini:",hash);
    const path = hash.slice(1); // hapus '#'
    //console.log("path saat ini:",path);
    const page = routes[path];
    //console.log("page saat ini:",page);

    if (!page) {
        appDiv.innerHTML = '<h2>404 - Halaman tidak ditemukan</h2>';
        return;
    }

    fetch(page)
    .then(res => {
        if (!res.ok) throw new Error('Halaman tidak ditemukan');
        return res.text();    // PENTING: return res.text()
    })
    .then(html => {
        //console.log("HTML yang diterima:", html);
        appDiv.innerHTML = html;

        if (path === '/' || path === '/karyawan') {
            renderKaryawan();
            // alert("Datatable diisi");
        } else if (path === '/hari_libur') {
            renderHariLibur();
        } else if (path === '/jenis_ijin') {
            renderJenisIjin();
        } else if (path === '/ijin') {
            renderIjinKaryawan();
        } else if (path === '/presensi') {
            renderPresensi();
        }
    })
    .catch(err => {
        appDiv.innerHTML = `<h2>Error: ${err.message}</h2>`;
    });
}

window.addEventListener('hashchange', loadRoute);
window.addEventListener('DOMContentLoaded', loadRoute);
