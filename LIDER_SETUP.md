# Configuración del Rol de Líder

## ¿Qué es un Líder?

El rol de **Líder** es un nuevo tipo de usuario que tiene permisos limitados en la aplicación:

### Permisos del Líder:
- ✅ **Agregar nuevos referidos**
- ✅ **Cerrar referidos existentes**
- ✅ **Ver referidos pendientes**
- ✅ **Ver referidos registrados en el día actual**
- ❌ **NO puede** ver estadísticas históricas
- ❌ **NO puede** reiniciar datos
- ❌ **NO puede** acceder al año corporativo
- ❌ **NO puede** ver el historial completo

### Vista Específica:
Los líderes son automáticamente redirigidos a `/lider` donde tienen una interfaz simplificada con:
- Formulario para registrar referidos
- Tabla con referidos del día actual
- Sin acceso a tabs de estadísticas

## Cómo Asignar el Rol de Líder

### Opción 1: Usando la Base de Datos Directamente
```javascript
// Conectar a MongoDB y ejecutar:
db.usuarios.updateOne(
  { email: "email@del-usuario.com" },
  { $set: { rol: "lider" } }
)
```

### Opción 2: Usando la API (requiere ser administrador)
```bash
# Primero obtener la lista de usuarios
GET /api/usuarios

# Luego cambiar el rol usando el ID del usuario
POST /api/usuarios/{USER_ID}/cambiar-rol
Content-Type: application/json

{
  "nuevoRol": "lider"
}
```

### Opción 3: Script de Node.js
Crear un archivo `asignar-lider.js`:

```javascript
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

async function asignarLider(email) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const usuario = await Usuario.findOneAndUpdate(
      { email: email },
      { rol: 'lider' },
      { new: true }
    );
    
    if (usuario) {
      console.log(`✅ Usuario ${usuario.nombre} (${usuario.email}) ahora es LÍDER`);
    } else {
      console.log('❌ Usuario no encontrado');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usar: node asignar-lider.js
asignarLider('email@del-usuario.com');
```

## Roles Disponibles

1. **admin**: Acceso completo a todas las funciones
2. **lider**: Puede agregar y cerrar referidos, vista limitada
3. **usuario**: Solo lectura, no puede modificar datos

## Verificar Roles

Para verificar qué rol tiene un usuario:
```javascript
db.usuarios.find({ email: "email@usuario.com" }, { nombre: 1, email: 1, rol: 1 })
```

## Notas Importantes

- Los líderes son automáticamente redirigidos a su vista específica
- No pueden acceder a la vista principal de administración
- Mantienen todos los permisos de edición de referidos
- La interfaz está simplificada para enfocarse en su trabajo diario