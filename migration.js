const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./database.sqlite');


db.run(`CREATE TABLE Artist (
   id INTEGER PRIMARY KEY NOT NULL,
   name TEXT NOT NULL,
   date_of_birth TEXT NOT NULL,
   biography TEXT NOT NULL,
   is_currently_employed INTEGER DEFAULT 1
)`);