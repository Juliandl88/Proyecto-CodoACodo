const axios = require('axios').default; // https://www.npmjs.com/package/axios 
const hbs = require('hbs');

/* Cálculo dolar */
let dolarHOY;
let dolar;
// Make a request for a user with a given ID
axios.get('https://www.dolarsi.com/api/api.php?type=valoresprincipales')
  .then(function (response) {
        dolar = response.data[0].casa.venta; // toma el valor de la propiedad (en este caso el oficial)
		dolar = dolar.replace(/,/g, '.')
		dolar = parseFloat(dolar) // de string a numero

        const impuestoPAIS = 0.30;
		const percepcionAFIP = 0.35;
        dolarHOY = (dolar * impuestoPAIS) + (dolar * percepcionAFIP) + dolar;
        
        return dolarHOY		
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
// FIN AXIOS 

hbs.registerHelper("dolarApeso", (precioEnDolar) => {
    
    let calculoSinDecimales = (dolarHOY * precioEnDolar).toFixed(0);
    // https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
    return new Intl.NumberFormat("es-AR").format(calculoSinDecimales, {style: "currency", currency: "ARY"})
})

// Hacer un array a base de un string separado por comas ("i3,16gb" --> ["i3","16gb"])
hbs.registerHelper("list", function(texto) {

	let array = texto.split(","); // ["i3","16gb"]
	var ret = "<ul>";

	for (var i = 0; i < array.length; i++) {
		ret = ret + "<li>" + array[i] + "</li>";
	}

  	return ret + "</ul>";
});


// FUNCION: subida de imagen
var multer  = require('multer')
var storage = multer.diskStorage({
	destination:  (req, file, cb) => {
		cb(null, './public/uploads/')
	},
	filename:  (req, file, cb) => {
		console.log("OBJETO FILE", file)
		let fileExtension = file.originalname.split('.')[1] 
		cb(null, file.originalname + '-' + Date.now() + "." + fileExtension)
	},
})

var maxSize = (1024 * 1024) * 5 // 5MB
var maxSizeMB = formatBytes(maxSize,2) 
// FUNCION: : Manejar errores de la imagen cargada
var upload = multer({
	storage:storage, 
	limits: {fileSize: maxSize },  
	fileFilter: (req, file, cb) => {
		if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || 	file.mimetype == "image/jpeg") {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Sólo los formatos .png, .jpg y .jpeg son los permitidos'));
        
		}
	}
}).single("imagen")

// FUNCION: tamaño de archivo
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


module.exports = {
    upload,
    maxSizeMB,
    multer,
    storage
}