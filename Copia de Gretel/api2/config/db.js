const mysql = require('mysql')
const db = mysql.createConnection({
    host: "localhost",
    //port: "8888",
    socketPath: "/Applications/MAMP/tmp/mysql/mysql.sock",
    user: "root",
    password: "root",
    database:"Grettel" 
})

module.exports = db;