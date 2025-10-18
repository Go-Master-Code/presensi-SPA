// login.js (misal simpan di file terpisah, atau di bawah script utama)

async function loginUser(username, password) {
    try {
        const response = await fetch('/api/login', {  // sesuaikan endpoint backend-mu
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            // Bisa cek status code dan pesan error backend
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login gagal');
        }

        const data = await response.json();
        const token = data.data // response di json data:isinya token

        // DEBUG alert("Token: "+token);

        if (token) {
            // Simpan token di localStorage (atau sessionStorage)
            localStorage.setItem('jwt_token', token);
            localStorage.setItem('username', username);
            return true;
        } else {
            throw new Error('Token tidak ditemukan pada response');
        }
    }
    catch (err) {
        throw err;
    }
}

function clearFormValidation(form) {
  form.classList.remove('was-validated');
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-login');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        clearFormValidation(form);

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const username = document.getElementById("username-login").value;
        const password = document.getElementById("password-login").value;

        try {
            const success = await loginUser(username, password);
            if (success) {
                // Redirect ke halaman dashboard misalnya
                window.location.href = 'index.html';
            }
        }
        catch (error) {
            showAlertLogin(`Username / password salah!`, 'danger');
        }
    });
});

// tampilkan alert dengan UI di atas halaman login
function showAlertLogin(message, type = 'success', duration = 4000) {
    const alertContainer = document.getElementById('alert-container-login');

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

// menambahkan header autentikasi pada setiap API (reusable)
function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('jwt_token');
    // DEBUG alert("Token: "+token);
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    });
}
