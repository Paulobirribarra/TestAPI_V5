# Facturas APP

Este aplicación WEB fué diseñado para ser presentada como proyecto de título. Es una aplicación que gestiona facturas, notas de crédito y entrega un resumen de ventas. Su función principal es realizar consultas a una API externa llamada simple Api. Esta tiene end points específicos como: "consultas por día" y "consultas por mes". Tiene apartado de configuración para ingresar los datos del consultante (previamente habilitado en el SII). Luego re realizar correctamente una consulta, almacena los datos (JSON) en una base de datos local Mongo. La consulta externa solo sirve para poblar la base local. Admás,permite a los usuarios visualizar y editar información relacionada con las facturas. Como campos de contacto, correo y metodos de pago. Tiene rutas protegidas con passport y express-session. La clave para realizar consultas se pide cada 1 hora y cada vez que inicia sesión se resetea el timer.

## Características de Seguridad

- Autenticación mediante Passport.js
- Sesiones seguras con express-session
- Protección de rutas
- HTTPS habilitado
- Headers de seguridad con Helmet
- Protección contra ataques de fuerza bruta (rate limiting)
- Políticas CORS configuradas
- Cookies seguras con httpOnly y sameSite

## Estructura del Proyecto

```
└── TestAPI_V5/
    ├── README.md
    ├── app.js                 # Punto de entrada de la aplicación
    ├── config/               # Configuraciones
    │   ├── BDConection.js    # Conexión a MongoDB
    │   ├── database.js       # Configuración de la base de datos
    │   ├── Passport.js       # Configuración de autenticación
    │   ├── procesarFacturas.js # Lógica de procesamiento de facturas
    │   ├── server.js         # Configuración del servidor
    │   ├── cors.js           # Configuración de CORS
    │   └── rateLimits.js     # Configuración de límites de tasa
    ├── controllers/          # Controladores de la aplicación
    │   ├── apiController.js  # Controlador de la API externa
    │   ├── configController.js # Controlador de configuración
    │   ├── indexController.js # Controlador principal
    │   ├── notasDeCreditoController.js # Controlador de notas de crédito
    │   └── resumenMensualController.js # Controlador de resumen mensual
    ├── middleware/           # Middlewares
    │   ├── auth.js          # Middleware de autenticación
    │   └── errorHandler.js  # Manejo de errores
    ├── models/              # Modelos de MongoDB
    │   ├── Config.js        # Modelo de configuración
    │   ├── configUserSii.js # Modelo de configuración SII
    │   ├── Facturas.js      # Modelo de facturas
    │   ├── ResumenMensual.js # Modelo de resumen mensual
    │   └── User.js          # Modelo de usuario
    ├── public/              # Archivos estáticos
    │   ├── css/            # Estilos CSS
    │   ├── js/             # Scripts JavaScript
    │   └── img/            # Imágenes
    ├── routes/             # Rutas de la aplicación
    │   ├── api.js          # Rutas de la API
    │   ├── auth.js         # Rutas de autenticación
    │   ├── config.js       # Rutas de configuración
    │   ├── index.js        # Rutas principales
    │   ├── notasDeCredito.js # Rutas de notas de crédito
    │   └── resumenMensual.js # Rutas de resumen mensual
    └── views/              # Vistas EJS
        ├── auth/           # Vistas de autenticación
        ├── partials/       # Partes reutilizables
        └── index.ejs       # Vista principal
```

## Dependencias

El proyecto utiliza las siguientes dependencias:

### Dependencias de producción

- **axios**: Para hacer solicitudes HTTP a la API externa.
- **bcryptjs**: Para encriptar contraseñas y datos sensibles.
- **chart.js**: Para generar gráficos interactivos en la página de resumen mensual.
- **cors**: Para manejar políticas de CORS en el servidor.
- **ejs**: Motor de plantillas para renderizar vistas en el frontend.
- **express**: Framework para construir la aplicación web.
- **express-rate-limit**: Para implementar límites de tasa y prevenir ataques de fuerza bruta.
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

### Configuración de Seguridad

- **Rate Limiting**:
  - Autenticación: 5 intentos en 15 minutos
  - API: 30 solicitudes por minuto
  - Consultas de facturas: 10 consultas por minuto
- **CORS**:
  - Configuración específica para desarrollo y producción
  - Métodos HTTP permitidos: GET, POST, PUT, DELETE, OPTIONS
  - Headers permitidos: Content-Type, Authorization
  - Credenciales habilitadas
  - Cache-Control: 24 horas

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

## Características Principales

1. **Gestión de Usuarios**:

   - Registro de usuarios con roles (admin/lector)
   - Autenticación segura con Passport.js
   - Sesiones persistentes con express-session

2. **Consulta de Facturas**:

   - Consulta por día o mes
   - Almacenamiento local en MongoDB
   - Verificación de duplicados
   - Paginación de resultados

3. **Notas de Crédito**:

   - Visualización de notas de crédito
   - Filtrado por folio, mes y año
   - Paginación de resultados

4. **Resumen Mensual**:
   - Visualización de resúmenes
   - Gráficos interactivos con Chart.js
   - Filtrado por mes y año

## Seguridad

- Autenticación mediante Passport.js
- Sesiones seguras con express-session
- Protección de rutas
- HTTPS habilitado
- Headers de seguridad con Helmet
- Protección contra ataques de fuerza bruta
- Políticas CORS configuradas
- Cookies seguras con httpOnly y sameSite

## Nota Académica

Este proyecto fue desarrollado como parte de un trabajo de título académico. El código y la documentación están disponibles para fines educativos y de investigación. Para cualquier consulta sobre el proyecto, por favor contactar al autor.

## Requisitos del Sistema

- Node.js v14 o superior
- MongoDB v4.4 o superior
- Navegador web moderno con soporte para JavaScript ES6+
- Espacio en disco: mínimo 1GB (dependiendo del volumen de datos)
- Memoria RAM: mínimo 4GB recomendado

## Troubleshooting

### Problemas Comunes y Soluciones

1. **Error de Conexión a MongoDB**

   ```
   Error: No se pudo conectar a MongoDB
   ```

   **Solución**:

   - Verificar que MongoDB esté corriendo
   - Comprobar la URL de conexión en `config/database.js`
   - Asegurar que el puerto 27017 esté disponible

2. **Error de Certificado HTTPS**

   ```
   Error: self signed certificate
   ```

   **Solución**:

   - Generar nuevos certificados SSL
   - Asegurar que los archivos `key.pem` y `cert.pem` estén en la carpeta `config/`

3. **Error de API Externa**

   ```
   Error: Cannot access a disposed object
   ```

   **Solución**:

   - Verificar la conectividad con SimpleAPI
   - Comprobar las credenciales del SII
   - Esperar unos minutos antes de reintentar

4. **Problemas de Sesión**
   ```
   Error: Sesión expirada
   ```
   **Solución**:
   - Cerrar sesión y volver a iniciar
   - Limpiar caché del navegador
   - Verificar la configuración de cookies

## Notas de Desarrollo

### Decisiones Técnicas

1. **Base de Datos**

   - Se eligió MongoDB por su flexibilidad con datos JSON
   - Facilita el almacenamiento de respuestas de la API externa
   - Permite consultas eficientes para reportes

2. **Autenticación**

   - Implementación de Passport.js para manejo seguro de sesiones
   - Roles de usuario (admin/lector) para control de acceso
   - Sesiones persistentes con express-session

3. **Frontend**

   - Uso de EJS como motor de plantillas
   - Bootstrap para diseño responsive
   - Chart.js para visualización de datos

4. **Seguridad**
   - HTTPS para todas las comunicaciones
   - Protección contra ataques comunes
   - Validación de datos en frontend y backend

### Desafíos Enfrentados

1. **Integración con API Externa**

   - Manejo de timeouts y errores
   - Implementación de reintentos automáticos
   - Verificación de duplicados

2. **Gestión de Datos**

   - Optimización de consultas MongoDB
   - Implementación de paginación
   - Manejo eficiente de grandes volúmenes de datos

3. **Experiencia de Usuario**
   - Diseño intuitivo de filtros
   - Feedback visual de operaciones
   - Manejo de estados de carga

### Mejoras Futuras

1. **Funcionalidades**

   - Exportación de datos a Excel/PDF
   - Notificaciones en tiempo real
   - Reportes personalizados

2. **Rendimiento**

   - Implementación de caché
   - Optimización de consultas
   - Compresión de datos

3. **Seguridad**
   - Implementación de 2FA
   - Auditoría de acciones
   - Backups automáticos

---

_Desarrollado por [Paulo Andrés Barra Irribarra] - [2025]_
