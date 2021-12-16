require('dotenv').config()
let nodemailer = require('nodemailer');
const db = require('../db');

// GET
const inicioGET = function (req, res) {

  // consulta a la base de datos
   let sql = "SELECT * FROM productos";
  
   db.query(sql, function (err,data) {
    
    if (err) res.send("Ocurrió un error: " + err)
    console.log("DATA -->", data) 

    // Luego renderizo la data recibida de la base de datos
    res.render('inicio', {
      titulo: "Mi emprendimiento",
        usuario: req.session.loggedin,
        logueado: req.session.username,
      data
    })
  }) 
  
  
  
}

// GET 
const sobreNosotrosGET = function (req, res) {
    res.render('sobre-nosotros', {
        logueado: req.session.loggedIn,
        usuario: req.session.username,
    })
}

// GET
const comoComprarGET = function (req, res) {
    res.render('como-comprar', { 
        usuario: req.session.loggedin,
        logueado: req.session.username
    })
}

// GET 
const contactoGET = function (req, res) {
    res.render('contacto', { 
        usuario: req.session.loggedin,
        logueado: req.session.username
    })
}

// POST 
const enviarMailPOST = function (req, res) {

    // Definimos el transporter
    let transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    })
    // Definimos el email
    let data = req.body // tomo toda la información del formulario 
    console.log("DATA", data )
    let mailOptions = {
        from: data.email,
        to: 'juliandelisio.88@gmail.com', 
        subject: data.asunto,
        text: data.mensaje
    }
    // enviar el mail
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            console.log("ERROR MAIL", error)
            res.status(500, error.message) // Le respondo desde yo (servidor) que hay un error interno del servidor
            res.status(500).render('contacto', { 
                mensaje: `Ha ocurrido el siguiente error: ${error.message}`,
                mostrar: true
            })
        } else {
            console.log("Email enviado")
            res.status(200).render('contacto', {
                mensaje: `Mail enviado correctamente`,
                mostrar: true
            })
        }
    }) 
}

// GET PRODUCTO:ID
const productoGET = function (req, res) {

    let id = req.params.id;

    let sql = 'SELECT * FROM productos WHERE id = ?';
    db.query(sql, [id], function (err,data) {
        res.render('producto', {
        usuario: req.session.loggedin,
        logueado: req.session.username,
            data: data[0]
        })
    })

}

module.exports = {
    inicioGET,
    enviarMailPOST,
    comoComprarGET,
    contactoGET,
    productoGET,
    sobreNosotrosGET
}