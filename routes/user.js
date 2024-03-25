const db = require('../public/db');

function getUserByEmail(email, callback) { //Esta função recebe um email como entrada e retorna o usuário correspondente a esse email, se existir.
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]); //Retorna o usuário encontrado ou um erro, através de uma função de retorno de chamada.
  });
}

function createUser(email, password, callback) { //Esta função recebe um email e uma senha como entrada e cria um novo usuário com esses dados.
  db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err, results) => {
    if (err) {
      return callback(err);
    }
    callback(null);
  });
}

module.exports = {
  getUserByEmail,
  createUser
};
//As funções getUserByEmail e createUser são exportadas como um objeto para que outras partes do código possam utilizá-las para interagir com o banco de dados.





