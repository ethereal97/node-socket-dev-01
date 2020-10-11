const sqlite = require('sqlite3').verbose();
const path = require('path');

let database_path = path.join(__dirname, 'database.sqlite');

const db = new sqlite.Database(database_path, err => {
    if (err) throw {
        on: 'connect',
        message: err.message
    };
});

db.serialize(() => {
    var columns = [
        'id INTEGER PRIMARY KEY AUTOINCREMENT',
        'username TEXT NOT NULL UNIQUE',
        'password TEXT NOT NULL',
        'birth DATE NOT NULL',
        'gender INT(1) NOT NULL', // [0]female [1]male
        'created_at DATETIME DEFAULT CURRENT_TIMESTAMP'
    ];

    db.run(`CREATE TABLE users (${columns.join(',')});`, err => {
        if (err) throw [err.message];
        console.log('Query Completed: Table `users` is crrated.');
    });
});
