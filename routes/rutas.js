var express = require('express');
var router = express.Router(); 

const front = require('../controllers/front.ctrl')
const back = require('../controllers/back.ctrl')

/* 
************************************************************************************************
// rutas FRONT
*/
router.get('/', front.inicioGET )
router.get('/como-comprar', front.comoComprarGET)
router.get('/contacto', front.contactoGET)
router.get('/producto/:id', front.productoGET)
router.get('/sobre-nosotros', front.sobreNosotrosGET)
router.post('/enviar-mail', front.enviarMailPOST)


/* 
************************************************************************************************
// rutas BACK
*/
router.get('/admin', back.adminGET)
router.get('/login', back.loginGET)
router.post('/login', back.loginPOST)
router.get("/agregar", back.agregarGET)
router.get("/borrar/:id", back.borrarGET)
router.get("/editar/:id", back.editarGET)
router.post("/editar/:id", back.editarPOST)
router.post("/agregar", back.agregarPOST)
router.get("/logout", back.logoutGET)

module.exports = router