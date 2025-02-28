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
TestAPI_V5/
├── app.js               # Archivo principal del servidor
├── package.json         # Dependencias y configuraciones
├── .env                 # Variables de entorno
├── config/
│   ├── BDConection.js   # Configuración de la base de datos
├── models/
│   ├── Facturas.js      # Esquema de MongoDB para facturas
├── routes/
│   ├── api.js          # Rutas relacionadas con la API
│   ├── index.js        # Rutas principales
│   ├── notasDeCredito.js # Rutas para notas de crédito
├── views/
│   ├── index.ejs       # Plantilla principal
│   ├── partials/       # Fragmentos reutilizables de EJS
├── public/
│   ├── css/            # Archivos de estilos
│   ├── images/         # Imágenes y otros recursos estáticos
```

---
## APP en desarollo.
---