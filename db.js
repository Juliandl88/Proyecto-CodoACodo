var mysql = require('mysql');

var connection = mysql.createConnection({
  host     : process.env.DB_HOST,
  database : process.env.DB_DATABASE,
  user     : process.env.DB_USER,
  password : process.env.DB_PASS,

});

connection.connect(err => {
    if (err) throw err
    console.log('DB esta conectada')
});

// truco para mantener viva la conexión
setInterval(function () {
    connection.query('SELECT 1');
    console.log("manteniendo viva la conexion")
}, 50000);


module.exports = connection