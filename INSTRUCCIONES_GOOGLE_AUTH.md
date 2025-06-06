# Configuración de Autenticación con Google

Para configurar la autenticación con Google en la aplicación de Control de Referidos, sigue estos pasos:

## 1. Crear un proyecto en Google Cloud Platform

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el ID del proyecto

## 2. Configurar OAuth 2.0

1. En el menú lateral, ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" y selecciona "ID de cliente de OAuth"
3. Configura la pantalla de consentimiento:
   - Tipo de usuario: Externo
   - Nombre de la aplicación: Control de Referidos
   - Correo electrónico de soporte: [tu correo]
   - Dominios autorizados: tu dominio (o localhost para desarrollo)

4. Crea el ID de cliente OAuth:
   - Tipo de aplicación: Aplicación web
   - Nombre: Control de Referidos Web
   - Orígenes autorizados de JavaScript: 
     - `http://localhost:3000` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - URIs de redirección autorizados:
     - `http://localhost:3000/auth/google/callback` (para desarrollo)
     - `https://tu-dominio.com/auth/google/callback` (para producción)

5. Haz clic en "Crear" y anota el ID de cliente y el secreto de cliente

## 3. Configurar variables de entorno

Actualiza el archivo `.env` con las credenciales de Google:

```
MONGODB_URI=mongodb+srv://tu_usuario:tu_contraseña@cluster.mongodb.net/referidos_db?retryWrites=true&w=majority
PORT=3000
SESSION_SECRET=un_secreto_largo_y_aleatorio
GOOGLE_CLIENT_ID=tu_id_de_cliente_de_google
GOOGLE_CLIENT_SECRET=tu_secreto_de_cliente_de_google
```

## 4. Configurar administradores

Para configurar un usuario como administrador, debes modificar manualmente su rol en la base de datos:

1. Accede a MongoDB Atlas
2. Ve a la colección "usuarios" en la base de datos "referidos_db"
3. Busca el usuario por su correo electrónico
4. Edita el documento y cambia el campo "rol" de "usuario" a "admin"

Ejemplo en MongoDB Shell:
```javascript
db.usuarios.updateOne(
  { email: "correo@ejemplo.com" },
  { $set: { rol: "admin" } }
)
```

## 5. Reiniciar la aplicación

Después de configurar las variables de entorno y los administradores, reinicia la aplicación para que los cambios surtan efecto.