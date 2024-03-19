const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


app.use(session({
    secret: 'chave-secreta',
    resave: false,
    saveUninitialized: true
}));

let users = [];


function verificarAutenticacao(req, res, next) {
    if (req.session.usuario) {
       
        next();
    } else {
      
        res.redirect('/');
    }
}

app.get('/perfil/:email', verificarAutenticacao, (req, res) => {
    const { email } = req.params;
    res.render('perfil', { email, users }); 
});

app.get('/usuarios', verificarAutenticacao, (req, res) => {
    res.render('usuarios', { users });
});

app.post('/excluir/:email', verificarAutenticacao, (req, res) => {
   
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '' });
});

app.post('/register', (req, res) => {
   
});

app.get('/', (req, res) => {
    res.render('index', { errorMessage: '' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        req.session.usuario = user;
        res.redirect(`/perfil/${user.email}`);
    } else {
        res.render('index', { errorMessage: 'Email ou senha incorretos' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            res.send('Erro ao fazer logout');
        } else {
            res.redirect('/');
        }
    });
});

app.listen(8080, () => {
    console.log(`Servidor está rodando em http://localhost:${8080}`);
});
