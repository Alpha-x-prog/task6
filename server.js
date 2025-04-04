// server.js - Бэкенд
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', maxAge: 24 * 60 * 60 * 1000 }
}));

const usersFile = path.join(__dirname, 'users.json');
const cacheFile = path.join(__dirname, 'cache.json');

// Чтение пользователей
const getUsers = () => {
    if (!fs.existsSync(usersFile)) return {};
    return JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
};

// Запись пользователей
const saveUsers = (users) => {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
};

// Регистрация
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Все поля обязательны' });
    
    const users = getUsers();
    if (users[username]) return res.status(400).json({ error: 'Пользователь уже существует' });
    
    users[username] = await bcrypt.hash(password, 10);
    saveUsers(users);
    res.json({ success: true });
});


// Логин
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (!users[username] || !(await bcrypt.compare(password, users[username]))) {
        console.log("Ошибка авторизации:", username);
        return res.status(401).json({ error: 'Неверные данные' });
    }

    req.session.user = username;
    console.log("Успешный вход:", username);
    console.log("Состояние сессии после входа:", req.session);  // Лог состояния сессии
    res.json({ success: true });
});

// Профиль
app.get('/profile', (req, res) => {
    console.log("Проверка сессии на профиле:", req.session);

    if (!req.session.user) {
        console.log("Пользователь не авторизован");
        return res.redirect('/');  // Перенаправляем на главную страницу, если пользователь не авторизован
    }

    console.log("Пользователь авторизован:", req.session.user);

    // Отдаем HTML файл с возможностью передать данные
    res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});




// Выход
app.post('/logout', (req, res) => {
    req.session.destroy(() => res.json({ success: true }));
});

// Кэширование данных
const getCachedData = () => {
    if (!fs.existsSync(cacheFile)) return null;
    const { data, timestamp } = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    return Date.now() - timestamp < 60000 ? data : null;
};

const saveCache = (data) => {
    fs.writeFileSync(cacheFile, JSON.stringify({ data, timestamp: Date.now() }));
};

app.get('/data', (req, res) => {
    let cachedData = getCachedData();
    if (cachedData) return res.json({ data: cachedData, cached: true });
    
    const newData = { message: 'Актуальные данные', time: new Date().toISOString() };
    saveCache(newData);
    res.json({ data: newData, cached: false });
});

app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
