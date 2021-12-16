const express = require('express') // https://www.npmjs.com/package/express
const morgan = require('morgan') // https://www.npmjs.com/package/morgan
const hbs = require('hbs'); 
const session = require('express-session');
const path = require('path'); // para indicar las carpetas front y back en views
require('./helpers/helpers');
require('dotenv').config()



const app = express()

let puerto = process.env.PORT || 3000

// Plantilla de visualización
app.set('view engine', 'hbs');
app.set('views', [
    path.join('./views/front'),
    path.join('./views/back'),
    path.join('./views/')
])
hbs.registerPartials(__dirname + '/views/partials');

// Middlewares
app.use(session({
	secret: process.env.SECRET,
    resave: false,
	saveUninitialized: false,
    cookie: { maxAge: 60000 }
}))
app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));

// rutas
app.use('/', require('./routes/rutas'))
app.use('/', express.static(__dirname + '/public'))

// 404
app.use(function(req, res) {
    res.status(404).render('404');
});


app.listen(puerto, () => {
    console.log(`Servidor online en puerto ${puerto}`)
})