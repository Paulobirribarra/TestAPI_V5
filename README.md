# Facturas APP
Este aplicación WEB fué diseñado para ser presentada como proyecto de título. Es una aplicación que gestiona facturas, notas de crédito y entrega un resumen de ventas. Su función principal es realizar consultas a una API externa llamada simple Api. Esta tiene end points específicos como: "consultas por día" y "consultas por mes". Tiene apartado de configuración para ingresar los datos del consultante (previamente habilitado en el SII). Luego re realizar correctamente una consulta, almacena los datos (JSON) en una base de datos local Mongo. La consulta externa solo sirve para poblar la base local. Admás,permite a los usuarios visualizar y editar información relacionada con las facturas. Como campos de contacto, correo y metodos de pago. Tiene rutas protegidas con passport y express-session. La clave para realizar consultas se pide cada 1 hora y cada vez que inicia sesión se resetea el timer.

## Dependencias

El proyecto utiliza las siguientes dependencias:

### Dependencias de producción
- **axios**: Para hacer solicitudes HTTP a la API externa.
- **bcryptjs**: Para encriptar contraseñas y datos sensibles.
- **chart.js**: Para generar gráficos interactivos en la página de resumen mensual.
- **cors**: Para manejar políticas de CORS en el servidor.
- **ejs**: Motor de plantillas para renderizar vistas en el frontend.
- **express**: Framework para construir la aplicación web.
- **express-session**: Para gestionar sesiones de usuario.
- **helmet**: Para añadir seguridad a las cabeceras HTTP.
- **mongoose**: Para interactuar con la base de datos MongoDB.
- **mongoose-paginate-v2**: Para agregar paginación a las consultas de MongoDB.
- **morgan**: Para registrar las solicitudes HTTP en la consola.
- **multer**: Para manejar la carga de archivos (si se implementa carga de archivos).
- **passport**: Para implementar autenticación de usuarios.
- **passport-local**: Estrategia de autenticación local para Passport.

#### Nota sobre `dotenv`
Aunque `dotenv` aparece en las dependencias del `package.json`, no se utiliza en el proyecto. Las variables de entorno se manejan directamente en los archivos de configuración con valores por defecto, y los datos sensibles se ingresan a través de la interfaz de usuario.

### Dependencias de desarrollo
- **nodemon**: Para reiniciar automáticamente el servidor durante el desarrollo.

## Instalación y configuración
1. Clonar el repositorio
```bash 
git clone https://github.com/Paulobirribarra/TestAPI_V5.git
cd TestAPI_V5 
```

2. Instalación de dependencias
Para instalar todas las dependencias necesarias, abre una terminal en la raíz del proyecto y ejecuta:

```bash 
npm install
```
3. Generar Certificados Autofirmados
## Configuración de HTTPS
Para habilitar HTTPS localmente:
1. Genera un certificado autofirmado:

```bash
openssl req -x509 -newkey rsa:2048 -keyout config/key.pem -out config/cert.pem -days 365 -nodes
```
2. Coloca key.pem y cert.pem en la carpeta config/.
3. Inicia el servidor con npm run start.

## Ejecución del proyecto
1. Iniciar MongoDB
```bash 
mongod
```
2. Iniciar el servidor
npm run dev
Esto usará nodemon para reiniciar automáticamente el servidor cuando haya cambios en el código.

## 3. Acceder a la aplicación
```bash 
http://localhost:3000
```

---
### Estructura del proyecto
```bash 
└── TestAPI_V5/
    ├── README.md
    ├── app.js
    ├── docker-compose.yml
    ├── Dockerfile
    ├── package.json
    ├── config/
    │   ├── BDConection.js
    │   ├── database.js
    │   ├── Passport.js
    │   ├── procesarFacturas.js
    │   └── server.js
    ├── controllers/
    │   ├── apiController.js
    │   ├── configController.js
    │   ├── indexController.js
    │   ├── notasDeCreditoController.js
    │   └── resumenMensualController.js
    ├── middleware/
    │   ├── auth.js
    │   └── errorHandler.js
    ├── models/
    │   ├── Config.js
    │   ├── configUserSii.js
    │   ├── Facturas.js
    │   ├── ResumenMensual.js
    │   └── User.js
    ├── public/
    │   ├── css/
    │   │   ├── base.css
    │   │   ├── components.css
    │   │   ├── main.css
    │   │   ├── resumenMensual.css
    │   │   ├── styles.css
    │   │   ├── base/
    │   │   │   ├── _reset.css
    │   │   │   ├── _typography.css
    │   │   │   └── _variables.css
    │   │   ├── components/
    │   │   │   ├── _buttons.css
    │   │   │   ├── _cards.css
    │   │   │   ├── _forms.css
    │   │   │   └── _toggle.css
    │   │   ├── pages/
    │   │   │   ├── _auth.css
    │   │   │   ├── _config.css
    │   │   │   ├── _consultarFacturas.css
    │   │   │   ├── _index.css
    │   │   │   ├── _notasDeCredito.css
    │   │   │   └── _resumenMensual.css
    │   │   └── partials/
    │   │       └── header-footer.css
    │   └── js/
    │       ├── auth.js
    │       ├── config.js
    │       ├── consultarFacturas.js
    │       └── resumenMensual.js
    ├── routes/
    │   ├── api.js
    │   ├── auth.js
    │   ├── config.js
    │   ├── index.js
    │   ├── notasDeCredito.js
    │   └── resumenMensual.js
    ├── scripts/
    │   ├── injectFacturas.js
    │   ├── simulateInvoices.js
    │   └── updateFacturas.js
    ├── services/
    │   ├── apiService.js
    │   └── invoiceService.js
    └── views/
        ├── Configuracion.ejs
        ├── consultarFacturas.ejs
        ├── index.ejs
        ├── notasDeCredito.ejs
        ├── resumenMensual.ejs
        ├── Auth/
        │   ├── login.ejs
        │   └── Register.ejs
        └── partials/
            ├── card.ejs
            ├── filters.ejs
            ├── footer.ejs
            ├── head.ejs
            └── header.ejs
```

---
## APP en desarollo.
---