const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let users = [];


app.get('/perfil/:email', (req, res) => {
    const { email } = req.params;
    res.render('perfil', { email, users }); 
});


app.get('/usuarios', (req, res) => {
    res.render('usuarios', { users });
});


app.post('/excluir/:email', (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(user => user.email === email);
    if (index !== -1) {
        users.splice(index, 1);
        console.log('Usuário excluído:', email);
    }
    res.redirect('/usuarios');
});


app.get('/registro', (req, res) => {
    res.render('registro', { errorMessage: '' });
});


app.post('/registro', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.render('registro', { errorMessage: 'Senha e confirmação de senha não coincidem' });
    }
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.render('registro', { errorMessage: 'O email já está em uso' });
    }
    users.push({ name, email, password });
    console.log('Novo usuário registrado:', { name, email });
    res.redirect('/');
});


app.get('/', (req, res) => {
    res.render('index', { errorMessage: '' });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        res.redirect(`/perfil/${user.email}`);
    } else {
        res.render('index', { errorMessage: 'Email ou senha incorretos' });
    }
});


app.listen(3000, () => {
    console.log(`Servidor está rodando em http://localhost:${3000}`);
});

