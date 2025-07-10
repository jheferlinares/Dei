// Script para migrar referidos de vida existentes al año corporativo
require('dotenv').config();
const mongoose = require('mongoose');
const Referido = require('./models/Referido');
const AñoCorporativo = require('./models/AñoCorporativo');

// Función para obtener trimestre corporativo
function obtenerTrimestreCorporativo(fecha) {
  const mes = fecha.getMonth(); // 0-11
  if (mes >= 6 && mes <= 8) return 1; // Julio, Agosto, Septiembre
  if (mes >= 9 && mes <= 11) return 2; // Octubre, Noviembre, Diciembre
  if (mes >= 0 && mes <= 2) return 3; // Enero, Febrero, Marzo
  if (mes >= 3 && mes <= 5) return 4; // Abril, Mayo, Junio
}

async function migrarReferidos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar todos los referidos de vida que no estén en el año corporativo
    const referidosVida = await Referido.find({
      $or: [
        { tipoProducto: 'vida' },
        { tipoProducto: { $exists: false } }
      ]
    });
    
    console.log(`Encontrados ${referidosVida.length} referidos de vida`);
    
    let migrados = 0;
    
    for (const referido of referidosVida) {
      // Verificar si ya existe en el año corporativo
      const existeEnCorporativo = await AñoCorporativo.findOne({
        nombreCliente: referido.nombreCliente,
        nombreEmpleado: referido.nombreEmpleado,
        fechaEnvio: referido.fechaEnvio
      });
      
      if (!existeEnCorporativo) {
        const trimestreCorporativo = obtenerTrimestreCorporativo(referido.fechaEnvio);
        const añoCorporativo = referido.fechaEnvio.getFullYear();
        
        const referidoCorporativo = new AñoCorporativo({
          nombreCliente: referido.nombreCliente,
          nombreEmpleado: referido.nombreEmpleado,
          paisEmpleado: referido.paisEmpleado,
          fechaEnvio: referido.fechaEnvio,
          fechaCierre: referido.fechaCierre,
          tipoEnvio: referido.tipoEnvio,
          tipoProducto: 'vida',
          cerrado: referido.cerrado,
          nombreCerrador: referido.nombreCerrador || '',
          nombreCompania: referido.nombreCompania || '',
          trimestreCorporativo,
          añoCorporativo
        });
        
        await referidoCorporativo.save();
        migrados++;
        console.log(`Migrado: ${referido.nombreCliente} - ${referido.nombreEmpleado}`);
      }
    }
    
    console.log(`Migración completada. ${migrados} referidos migrados al año corporativo.`);
    process.exit(0);
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exit(1);
  }
}

migrarReferidos();