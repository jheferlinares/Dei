# Instrucciones para configurar MongoDB Atlas

Para que la aplicación funcione correctamente con MongoDB Atlas, sigue estos pasos:

## 1. Crear una cuenta en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Regístrate con tu correo electrónico
3. Completa el proceso de registro

## 2. Crear un cluster gratuito

1. Selecciona "Build a Database"
2. Elige la opción gratuita (Free/Shared)
3. Selecciona un proveedor de nube (AWS, Google Cloud o Azure) y una región cercana
4. Haz clic en "Create Cluster" (tardará unos minutos en crearse)

## 3. Configurar acceso a la base de datos

1. En el panel de MongoDB Atlas, ve a "Database Access" en el menú lateral
2. Haz clic en "Add New Database User"
3. Crea un usuario con contraseña (anota estos datos)
4. Asigna permisos de "Read and Write to Any Database"
5. Haz clic en "Add User"

## 4. Configurar acceso de red

1. Ve a "Network Access" en el menú lateral
2. Haz clic en "Add IP Address"
3. Para desarrollo, puedes seleccionar "Allow Access from Anywhere" (0.0.0.0/0)
4. Para producción, es mejor limitar el acceso a las IPs específicas
5. Haz clic en "Confirm"

## 5. Obtener la cadena de conexión

1. Ve a "Databases" en el menú lateral
2. Haz clic en "Connect" en tu cluster
3. Selecciona "Connect your application"
4. Copia la cadena de conexión (se verá algo así: `mongodb+srv://usuario:<password>@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`)

## 6. Configurar la aplicación

1. Abre el archivo `.env` en la carpeta de la aplicación
2. Reemplaza la cadena de conexión con la que copiaste de MongoDB Atlas
3. Asegúrate de reemplazar `<password>` con la contraseña del usuario que creaste
4. Cambia `myFirstDatabase` por `referidos_db`

Ejemplo de cómo debe quedar el archivo `.env`:

```
MONGODB_URI=mongodb+srv://tu_usuario:tu_contraseña_real@cluster0.mongodb.net/referidos_db?retryWrites=true&w=majority
PORT=3000
```

## 7. Instalar dependencias y ejecutar la aplicación

1. Abre una terminal en la carpeta de la aplicación
2. Ejecuta `npm install` para instalar las dependencias
3. Ejecuta `npm start` para iniciar la aplicación

## 8. Desplegar en Render (opcional)

1. Sube tu código a GitHub
2. En Render, crea un nuevo Web Service conectado a tu repositorio
3. Asegúrate de configurar las variables de entorno en Render:
   - Añade `MONGODB_URI` con el valor de tu cadena de conexión
   - Añade `PORT` con el valor `3000`
4. Configura el comando de inicio como `npm start`