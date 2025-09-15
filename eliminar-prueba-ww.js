// Script para eliminar el referido de prueba "ww"
require('dotenv').config();
const mongoose = require('mongoose');
const AñoCorporativo = require('./models/AñoCorporativo');

async function eliminarPruebaWW() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar registros con empleado "ww"
    const registrosWW = await AñoCorporativo.find({
      nombreEmpleado: /^ww$/i
    });
    
    console.log(`Encontrados ${registrosWW.length} registros con empleado "ww"`);
    
    if (registrosWW.length > 0) {
      registrosWW.forEach((registro, i) => {
        console.log(`${i + 1}. Cliente: ${registro.nombreCliente}, Empleado: ${registro.nombreEmpleado}, Fecha: ${registro.fechaEnvio}`);
      });
      
      // Eliminar registros
      const resultado = await AñoCorporativo.deleteMany({
        nombreEmpleado: /^ww$/i
      });
      
      console.log(`\n✅ Eliminados ${resultado.deletedCount} registros de prueba`);
    } else {
      console.log('No se encontraron registros con empleado "ww"');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

eliminarPruebaWW();