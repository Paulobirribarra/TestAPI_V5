# TestAPI_V6
Este proyecto es una aplicación para gestionar facturas y notas de crédito. La aplicación consulta datos desde una API externa, los almacena en una base de datos MongoDB y permite a los usuarios visualizar y editar información relacionada con las facturas.

## Dependencias
El proyecto utiliza las siguientes dependencias:

### Dependencias de producción
axios: Para hacer solicitudes HTTP a la API externa.
bcryptjs: Para encriptar contraseñas y datos sensibles.
cors: Para manejar políticas de CORS en el servidor.
dotenv: Para cargar variables de entorno desde un archivo .env.
ejs: Motor de plantillas para renderizar vistas en el frontend.
express: Framework para construir la aplicación web.
express-session: Para gestionar sesiones de usuario.
helmet: Para añadir seguridad a las cabeceras HTTP.
mongoose: Para interactuar con la base de datos MongoDB.
morgan: Para registrar las solicitudes HTTP en la consola.
passport: Para implementar autenticación de usuarios.
Dependencias de desarrollo
nodemon: Para reiniciar automáticamente el servidor cuando se detectan cambios en el código.
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
## Configuración del entorno
Antes de ejecutar la aplicación, configura las variables de entorno. Crea un archivo .env en la raíz del proyecto con el siguiente contenido:

```bash 
PORT=3000
MONGO_URI=mongodb://localhost:27017
API_URL=https://servicios.simpleapi.cl
USER_API=tu_usuario_api
PASSWORD_API=tu_password_api
RUT_USUARIO=tu_rut_usuario
RUT_EMPRESA=tu_rut_empresa
PASSWORD_SII=tu_clave_sii
AMBIENTE=0
```
Asegúrate de modificar los valores según tu configuración.

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
(si configuraste otro puerto en .env, usa ese valor en lugar de 3000).

---
### Estructura del proyecto
```bash 
└── paulobirribarra-testapi_v5/
    ├── README.md
    ├── app.js
    ├── docker-compose.yml          # Nuevo archivo para Docker
    ├── Dockerfile                  # Opcional, si decides incluirlo ahora
    ├── package.json
    ├── config/
    │   ├── BDConection.js         # Sin cambios
    │   ├── database.js            # Sin cambios
    │   ├── Passport.js            # Sin cambios
    │   ├── procesarFacturas.js    # Sin cambios
    │   └── server.js              # Sin cambios
    ├── controllers/
    │   ├── apiController.js       # Sin cambios
    │   ├── configController.js    # Sin cambios
    │   ├── indexController.js     # Sin cambios
    │   └── notasDeCreditoController.js # Sin cambios
    ├── middleware/
    │   ├── auth.js                # Sin cambios
    │   └── errorHandler.js        # Sin cambios
    ├── models/
    │   ├── Config.js              # Sin cambios
    │   ├── Facturas.js            # Sin cambios
    │   └── User.js                # Nuevo: modelo de usuarios
    ├── public/
    │   └── css/
    │       ├── auth.css           # Nuevo: estilos para login/register
    │       ├── base.css           # Sin cambios
    │       ├── cards.css          # Sin cambios
    │       ├── components.css     # Sin cambios
    │       ├── header-footer.css  # Sin cambios
    │       └── styles.css         # Sin cambios
    ├── routes/
    │   ├── api.js                 # Sin cambios
    │   ├── auth.js                # Nuevo: rutas de autenticación
    │   ├── config.js              # Sin cambios
    │   ├── index.js               # Sin cambios
    │   └── notasDeCredito.js      # Sin cambios
    ├── services/
    │   ├── apiService.js          # Sin cambios
    │   └── invoiceService.js      # Sin cambios
    └── views/
        ├── Configuracion.ejs      # Sin cambios
        ├── consultarFacturas.ejs  # Sin cambios
        ├── index.ejs              # Sin cambios
        ├── notasDeCredito.ejs     # Sin cambios
        ├── auth/                  # Nueva subcarpeta
        │   ├── login.ejs          # Nuevo: vista de login
        │   └── register.ejs       # Nuevo: vista de registro
        └── partials/
            ├── card.ejs           # Sin cambios
            ├── footer.ejs         # Sin cambios
            ├── head.ejs           # Sin cambios
            └── header.ejs         # Sin cambios
```

---
## APP en desarollo.
---