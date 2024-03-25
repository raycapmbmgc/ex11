const db = require('../public/db');

function getUserByEmail(email, callback) {
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return callback(err, null);
    }
    callback(null, results[0]);
  });
}

function createUser(email, password, callback) {
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
