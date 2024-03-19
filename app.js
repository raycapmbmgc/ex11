const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path'); 

const app = express();

// Configura a pasta de visualizações
app.set('views', path.join(__dirname, 'views'));

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

app.get('/profile/:email', verificarAutenticacao, (req, res) => {
    const email = req.params.email; 
    const user = users.find(user => user.email === email);
    if (user) {
        res.render('profile', { email, users }); 
    } else {
        res.status(404).send('Usuário não encontrado');
    }
});

app.get('/usuarios', verificarAutenticacao, (req, res) => {
    res.render('usuarios', { users });
});

app.post('/excluir/:email', verificarAutenticacao, (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(user => user.email === email);
    users.splice(index, 1);
    res.redirect('/usuarios');
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '' });
});

app.post('/register', (req, res) => {
    const { email, password } = req.body;
    // Verifica se o usuário já existe
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.render('register', { errorMessage: 'Este email já está sendo utilizado' });
    }

    // Se o usuário não existir, adiciona-o à lista de usuários
    const newUser = { id: users.length + 1, email, password };
    users.push(newUser);
    
    // Redireciona para a página inicial após o registro
    res.redirect('/');
});
app.post('/excluir/:email', verificarAutenticacao, (req, res) => {
    const { email } = req.params;
    // Encontra o índice do usuário com o email fornecido
    const index = users.findIndex(user => user.email === email);
    // Remove o usuário da lista de usuários, se encontrado
    if (index !== -1) {
        users.splice(index, 1);
        res.redirect('/profile/' + req.session.usuario.email); 
        res.status(404).send('Usuário não encontrado');
    }
});


app.get('/', (req, res) => {
    res.render('index', { errorMessage: '' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        req.session.usuario = user;
        res.redirect(`/profile/${user.email}`);
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
