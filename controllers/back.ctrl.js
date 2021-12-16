require('dotenv').config()
const fs = require('fs');
const db = require('../db');
const {upload, maxSizeMB, multer, storage} = require('../helpers/helpers')


// GET
const adminGET =  function (req, res) {


    if (req.session.loggedin) { // si la propiedad "loggedin" es TRUE...
         // consulta a la base de datos
        let sql = "SELECT * FROM productos";
        
        db.query(sql, function (err,data) {
            
            if (err) res.send("Ocurrió un error: " + err)
            // console.log("DATA -->", data) 

            // Luego renderizo la data recibida de la base de datos
            res.render('admin', {
                titulo: "Panel de control",
                data
            })
        }) 
    } else {
        res.redirect("/login").render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" })
    }

   
}

// GET
const agregarGET = function (req, res) {
    // Chequear si se inició sesión
    if (req.session.loggedin) {
        res.render("agregar", { 
            titulo: "Agregar producto", 
            usuario: req.session.username,
            logueado: true
        })
    } else {
        res.redirect("/login")
    }
}

// POST 
const agregarPOST = (req, res) => {

    if (req.session.loggedin) {

        // Usar función de multer
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // Error de Multer al subir imagen
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).render('agregar', { error: `Imagen muy grande, por favor ahicar a ${maxSizeMB}`});
                }
                return res.status(400).render('agregar', { error: err.code});
            } else if (err) {
                // Ocurrió un error desconocido al subir la imagen
                return res.status(400).render('agregar', { error: err});
            }
            
            // TODO ESTUVO BIEN - instrucciones 
            // almacenar los fields
            const productoDetalles=req.body;
            const nombreImagen = req.file.filename;
            productoDetalles.imagen = nombreImagen
            
            // Consulta SQL - insertar data en la DB
            var sql = 'INSERT INTO productos SET ?';
            console.log("AGREGANDO...", productoDetalles)
            db.query(sql, productoDetalles, function (err, data) { 
                if (err) throw err;
                res.render("agregar", {
                    mensaje: "Producto agregado correctamente",
                    titulo: 'Agregar producto'
                })
            });
            res.redirect(302,"admin")
        })
    } else {
        res.location("/login")
        res.render("login", { titulo: "Login", error: "Por favor loguearse para poder agregar un producto" })
    }
   

}

// GET borrar:id
const borrarGET = function (req, res) {

    if (req.session.loggedin) {

        let id = req.params.id


        let sql = 'DELETE FROM productos WHERE id = ?'
        db.query(sql, [id], function (err,data) {
            if (err) throw err;
            console.log(data.affectedRows + " registro(s) borrado(s)");

        })

        res.redirect(302, '/admin');

    } else {
         res.location("/login")
        res.render("login", { titulo: "Login", error: "Por favor loguearse para poder borrar un producto" })
    }
    
}

// GET editar:id
const editarGET = function (req, res) {

    if (req.session.loggedin) { 
        let id = req.params.id
    

        let sql = "SELECT * FROM productos WHERE id = ?";
        db.query(sql, [id], function (err,data) {
            if (err) throw err;
            console.log("LA DATA ES --->", data)
            res.render('editar', { 
                titulo: 'Editar producto',
                data: data[0]
            }); 
        })
    } else {
        res.location("/login")
        res.render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" })
    }

}

// POST editar:id
const editarPOST = function (req, res) {

     if (req.session.loggedin) { 

    // Usar función de multer
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                // Error de Multer al subir imagen
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(418).render('agregar', { error: `Imagen muy grande, por favor ahicar a ${maxSizeMB}`});
                }
                return res.status(418).render('agregar', { error: err.code});
            } else if (err) {
                // Ocurrió un error desconocido al subir la imagen
                return res.status(418).render('agregar', { error: err});
            }
            
            // todo OK continuando
            const id = req.params.id;
            const productoDetalles=req.body;
            
            // chequear si la edición incluyó cambio de imagen
            if (req.hasOwnProperty("file")) {
                
                
                const nombreImagen = req.file.filename;
                productoDetalles.imagen = nombreImagen	
                
                // Se procede a borrar la imagen del servidor
                var borrarImagen = 'SELECT imagen FROM productos WHERE id = ?';
                db.query(borrarImagen, [id], function (err, data) {
                    
                    if (err) res.send(`Ocurrió un error ${err.code}`)
                    
                    fs.unlink('public/uploads/' + data[0].imagen, (err) => {
                        if (err) res.send(`Ocurrió un error ${err.code}`)
                        
                        var sql = `UPDATE productos SET ? WHERE id= ?`;
                        
                        db.query(sql, [productoDetalles, id], function (err, data) {
                            if (err) res.send(`Ocurrió un error ${err.code}`);
                            console.log(data.affectedRows + " registro(s) actualizado(s)");
                        });
                    });		
                });	
            } 
            
            // Insertar datos modificados (sin haber cambiado la imagen)
            console.log("Producto Detalles: ", productoDetalles)
            var sql = `UPDATE productos SET ? WHERE id= ?`;
            
            db.query(sql, [productoDetalles, id], function (err, data) {
                if (err) res.send(`Ocurrió un error ${err.code}`);
                console.log(data.affectedRows + " registro(s) actualizado(s)");
            });
            
            res.redirect(302,'/admin');
        })

    } else {
        res.location("/login")
        res.render("login", { titulo: "Login", error: "Por favor loguearse para ver ésta página" })
    }

}

// GET login 
const loginGET = function (req, res){
    res.render("login")
}

// POST login
const loginPOST = function (req, res){

    // Tomar los campos del LOGIN
    var username = req.body.username;
    var password = req.body.password;

    // Validación
    if (username && password) {

        // consulta sql 
        let sql = 'SELECT * FROM cuentas WHERE email = ? AND password = ?'
        db.query(sql, [username, password], function (err,data) {
            if (data.length > 0) { // Chequeo que la base de datos me devuelva ALGO sino... es porque no existe la info introducida por el usuario
                console.log("LOGIN REQ", req.session)
                req.session.loggedin = true; // seteo que es Ok el ingreso del usuario
                req.session.username = username; // le pongo "nombre" a la sesión de ese  usuario
                res.redirect(302,'/admin');

            } else {
                res.render("login", { titulo: "Login", error: "Nombre de usuario o contraseña incorrecto" })
            }
        })

    }

}

// LOGOUT 
const logoutGET = function(req, res) { 

    req.session.destroy((err)=>{})

    // Al finalizar sesión vuelve al inicio
	let sql='SELECT * FROM productos';
    db.query(sql, function (err, data, fields) {
        if (err) res.send(`Ocurrió un error ${err.code}`);

        res.render('inicio', { 
            titulo: "Mi emprendimiento",
            data
        })
    });

}

module.exports = {
    adminGET,
    agregarGET,
    agregarPOST,
    borrarGET,
    editarGET,
    editarPOST,
    loginGET,
    loginPOST,
    logoutGET
}