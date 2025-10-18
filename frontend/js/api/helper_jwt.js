// global flag untuk mennyatakan token expired
let hasShownTokenExpiredAlert = false;

// menambahkan header autentikasi pada setiap API (reusable function)
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwt_token');
    // DEBUG alert("Token: "+token);
    const headers = {
        'Authorization': `Bearer ${token}`,
        //'Content-Type': 'application/json',
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    }).then(async res => {
        if (res.status === 401) {
            // token expired atau tidak
            if (!hasShownTokenExpiredAlert) {
                hasShownTokenExpiredAlert=true; // set agar tidak tampil lagi
                 // Token expired atau tidak valid
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                localStorage.removeItem('jwt_token');
                // window.location.hash= '#/login';
                // throw new Error('Unauthorized - token tidak valid');
            }
           
        }

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(errText);
        }
        return res;
    });
}