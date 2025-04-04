document.addEventListener('DOMContentLoaded', () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.className = theme;

    if (window.location.pathname === '/profile') {
        // Обратите внимание на параметр credentials: 'same-origin'
        fetch('/profile', { credentials: 'same-origin' })  // передаем сессионные cookies
            .then(res => {
                if (res.status === 401) {
                    // Если сессия не существует, перенаправляем на главную
                    window.location.href = '/';
                }
                return res.text();  // Получаем HTML
            })
            .then(data => {
                document.body.innerHTML = data;  // Вставляем полученную HTML страницу
            })
            .catch(err => {
                console.log("Ошибка при получении данных профиля:", err);
                window.location.href = '/';
            });
    }
});


// Функции для logout и смены темы, например
function logout() {
    fetch('/logout', { method: 'POST' }).then(() => window.location.href = '/');
}

function toggleTheme() {
    const newTheme = document.body.className === 'light' ? 'dark' : 'light';
    document.body.className = newTheme;
    localStorage.setItem('theme', newTheme);
}

// Логин
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/login', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username, password }),
        credentials: 'same-origin' // Добавлено для передачи cookies
    })
    .then(res => res.json())
    .then(data => {
        console.log("Ответ от сервера на логин:", data); // Логируем ответ
        if (data.success) {
            console.log("Успешный вход, редирект на /profile");
            window.location.href = '/profile'; 
        } else {
            console.log("Ошибка входа:", data.error); // Логируем ошибку
            alert(data.error);
        }
    })
    .catch(err => {
        console.log("Ошибка при попытке логина:", err); // Логируем ошибку
        alert("Произошла ошибка при попытке войти.");
    });
}



function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/register', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ username, password }) 
    })
    .then(res => res.json())
    .then(data => {
        console.log("Ответ от сервера на регистрацию:", data); // Логируем ответ
        if (data.success) {
            console.log("Регистрация успешна, логинимся");
            login(); // Если регистрация успешна, сразу пробуем логиниться
        } else {
            console.log("Ошибка регистрации:", data.error); // Логируем ошибку
            alert(data.error);
        }
    })
    .catch(err => {
        console.log("Ошибка при регистрации:", err); // Логируем ошибку
        alert("Произошла ошибка при регистрации.");
    });
}





function fetchData() {
    fetch('/data')
        .then(res => res.json())
        .then(data => document.getElementById('data').textContent = JSON.stringify(data, null, 2));
}
