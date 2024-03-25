const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const cookieParser = require('cookie-parser');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'chave-secreta',
    resave: false,
    saveUninitialized: true
}));

const db = require('./db');

function verificarAutenticacao(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get('/profile/:email', verificarAutenticacao, (req, res) => {
    const email = req.params.email;
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).send('Erro ao buscar usuário');
        }
        const user = result[0];
        if (user) {
            res.render('profile', { email: user.email, users: result });
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    });
});

app.get('/usuarios', verificarAutenticacao, (req, res) => {
    const sql = 'SELECT * FROM users';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao buscar usuários:', err);
            return res.status(500).send('Erro ao buscar usuários');
        }
        res.render('usuarios', { users: result });
    });
});

app.post('/excluir', verificarAutenticacao, (req, res) => {
    const { email } = req.body; 
    const sql = 'DELETE FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            return res.status(500).send('Erro ao excluir usuário');
        }
        res.redirect('/profile/' + req.session.usuario.email);
    });
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '' });
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Erro ao registrar usuário:', err);
            return res.render('register', { errorMessage: 'Erro ao registrar usuário. Por favor, tente novamente.' });
        }
        console.log('Usuário registrado com sucesso');
       
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: '' }); 
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Erro ao autenticar usuário:', err);
            return res.render('index', { errorMessage: 'Erro ao autenticar usuário' });
        }
        const user = result[0];
        if (user) {
            req.session.usuario = user;
            // Corrigindo a configuração do cookie
            res.cookie('isLoggedIn', 'true', { maxAge: 900000, httpOnly: false });
            res.redirect(`/profile/${user.email}`);
        } else {
            res.render('index', { errorMessage: 'Email ou senha incorretos' });
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.clearCookie('isLoggedIn');
        res.redirect('/');
    });
});

// Rota para renderizar a página de índice
app.get('/', (req, res) => {
    res.render('index', { errorMessage: '' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor está rodando em http://localhost:${PORT}`);
});
