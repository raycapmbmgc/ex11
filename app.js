const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

let users = [];


app.get('/profile/:email', (req, res) => {
    const { email } = req.params;
    res.render('profile', { email, users }); 
});


app.get('/users', (req, res) => {
    res.render('users', { users });
});


app.post('/delete/:email', (req, res) => {
    const { email } = req.params;
    const index = users.findIndex(user => user.email === email);
    if (index !== -1) {
        users.splice(index, 1);
        console.log('User deleted:', email);
    }
    res.redirect('/users');
});


app.get('/register', (req, res) => {
    res.render('register', { errorMessage: '' });
});


app.post('/register', (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    if (password !== confirmPassword) {
        return res.render('register', { errorMessage: 'Password and confirm password do not match' });
    }
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        return res.render('register', { errorMessage: 'Email is already in use' });
    }
    users.push({ name, email, password });
    console.log('New user registered:', { name, email });
    res.redirect('/');
});


app.get('/', (req, res) => {
    res.render('index', { errorMessage: '' });
});


app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(user => user.email === email && user.password === password);
    if (user) {
        res.redirect(`/profile/${user.email}`);
    } else {
        res.render('index', { errorMessage: 'Email or password is incorrect' });
    }
});


app.listen(3000, () => {
    console.log(`Server is running on http://localhost:${3000}`);
});
