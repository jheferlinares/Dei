const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
require('dotenv').config();

async function cambiarRol(email, nuevoRol) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    const usuario = await Usuario.findOneAndUpdate(
      { email: email },
      { rol: nuevoRol },
      { new: true }
    );
    
    if (usuario) {
      console.log(`✅ ${usuario.nombre} (${usuario.email}) ahora es: ${nuevoRol.toUpperCase()}`);
    } else {
      console.log('❌ Usuario no encontrado con ese email');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Obtener argumentos de línea de comandos
const email = process.argv[2];
const rol = process.argv[3];

if (!email || !rol) {
  console.log('Uso: node cambiar-rol.js <email> <rol>');
  console.log('Roles disponibles: admin, lider, usuario');
  console.log('Ejemplo: node cambiar-rol.js tu@email.com lider');
  process.exit(1);
}

if (!['admin', 'lider', 'usuario'].includes(rol)) {
  console.log('❌ Rol inválido. Usa: admin, lider, o usuario');
  process.exit(1);
}

cambiarRol(email, rol);