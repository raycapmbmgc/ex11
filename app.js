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
})); //configurei  o Express, incluindo o mecanismo de modelo EJS para renderização de páginas e utilizei body-parser, cookie-parser e express-session
para lidar com análise de corpo de solicitação, cookies e gerenciamento de sessão.

const db = require('./db'); //importei o modulo db para interagir com banco de dados

function verificarAutenticacao(req, res, next) {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/');
    }
} //verifica se o usuario esta validando,se estiver validado vai para a proxima,mas se não estiver, ele redireciona o
usuário para a página inicial.

app.get('/profile/:email', verificarAutenticacao, (req, res) => {
    const email = req.params.email; //: Extrai o parâmetro email da URL da solicitação,Isso permite que o 
    código acesse o email fornecido na URL.
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) { // Verifica se ocorreu um erro durante a execução da consulta SQL. Se ocorrer um erro
            console.error('Erro ao buscar usuário:', err); 
            return res.status(500).send('Erro ao buscar usuário');
        }
        const user = result[0];
        if (user) { //se um usuário foi encontrado com o email fornecido. Se um usuário for encontrado, renderiza a página do perfil do
            usuário usando o modelo profile.ejs
            res.render('profile', { email: user.email, users: result });
        } else {
            res.status(404).send('Usuário não encontrado');
        }
    });
});

app.get('/usuarios', verificarAutenticacao, (req, res) => { //Define uma rota GET com o caminho /usuarios que exige autenticação, ou seja, só pode ser acessada se o usuário estiver autenticado.
    const sql = 'SELECT * FROM users'; 
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Erro ao buscar usuários:', err);//resposta HTTP com status 500 
            return res.status(500).send('Erro ao buscar usuários');
        }
        res.render('usuarios', { users: result });
    });
}); 

app.post('/excluir', verificarAutenticacao, (req, res) => {
    const { email } = req.body; //Extrai o email do usuário a ser excluído do corpo da requisição. O email é enviado através do formulário HTML na página.
    const sql = 'DELETE FROM users WHERE email = ?';
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Erro ao excluir usuário:', err);
            return res.status(500).send('Erro ao excluir usuário');//resposta HTTP com status 500 
        }
        res.redirect('/profile/' + req.session.usuario.email); //redireciona o usuário para a página de perfil do usuário logado após a exclusão bem-sucedida de outro usuário.
    });
});

app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '' });//permitir que o modelo exiba mensagens de erro, caso necessário.
});

app.post('/register', (req, res) => { //rota post para o caminho /register
    const { email, password } = req.body;
    const sql = 'INSERT INTO users (email, password) VALUES (?, ?)';
    db.query(sql, [email, password], (err, result) => {
        if (err) { //Verifica se ocorreu algum erro durante a execução da consulta SQL de inserção. Se houver um erro, ele é registrado no console 
            e uma mensagem de erro é passada para a página de registro para informar o usuário sobre o problema.
            console.error('Erro ao registrar usuário:', err);
            return res.render('register', { errorMessage: 'Erro ao registrar usuário. Por favor, tente novamente.' });
        }
        console.log('Usuário registrado com sucesso');
       
        res.redirect('/login');
    });
});

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: '' }); //não ha mensagem a ser enviada
});

app.post('/login', (req, res) => {
    const { email, password } = req.body; //Extrai os campos email e password do corpo da requisição. Estes campos são preenchidos pelo usuário no formulário de login.
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => { //Quando a consulta é concluída, a função de callback é executada.
        if (err) {
            console.error('Erro ao autenticar usuário:', err);
            return res.render('index', { errorMessage: 'Erro ao autenticar usuário' });
        } //Verifica se ocorreu algum erro durante a execução da consulta. Se houver um erro, ele é registrado no console e uma mensagem de erro é passada para o template index.ejs
        const user = result[0]; //Obtém o primeiro usuário retornado pelo banco de dados, se houver. Neste caso, espera-se que haja apenas um usuário com o mesmo email e senha.
        if (user) {
            req.session.usuario = user;
            // Corrigindo a configuração do cookie
            res.cookie('isLoggedIn', 'true', { maxAge: 900000, httpOnly: false });
            res.redirect(`/profile/${user.email}`); //Se um usuário for encontrado,ele é armazenado na sessão do usuário (req.session.usuario) e um cookie chamado
            isLoggedIn é configurado para indicar que o usuário está autenticado. Em seguida, o usuário é redirecionado para sua página de perfil.
        } else {
            res.render('index', { errorMessage: 'Email ou senha incorretos' });
        }//Se nenhum usuário for encontrado com o email e senha fornecidos, uma mensagem de erro é passada para o template index.ejs
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {//Destroi a sessão do usuário atual. Isso limpa todos os dados associados à sessão
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Erro ao fazer logout');
        }
        res.clearCookie('isLoggedIn'); //Limpa o cookie chamado isLoggedIn. Este cookie é usado para rastrear se o usuário está autenticado.
        res.redirect('/');
    });
});

// Rota para renderizar a página de índice
app.get('/', (req, res) => { //Define uma rota GET para a raiz do aplicativo, ou seja, para a página inicial.
    res.render('index', { errorMessage: '' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor está rodando em http://localhost:${PORT}`);
});
