// Script para corregir referidos de agosto que están en septiembre
require('dotenv').config();
const mongoose = require('mongoose');
const HistorialReferido = require('./models/HistorialReferido');

async function corregirAgostoSeptiembre() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar registros con mes 9 (septiembre) pero con fechas de agosto
    const registrosSeptiembre = await HistorialReferido.find({
      mes: 9,
      año: 2025,
      $or: [
        {
          fechaEnvio: {
            $gte: new Date('2025-08-01'),
            $lt: new Date('2025-09-01')
          }
        },
        {
          fechaCierre: {
            $gte: new Date('2025-08-01'),
            $lt: new Date('2025-09-01')
          }
        }
      ]
    });
    
    console.log(`Encontrados ${registrosSeptiembre.length} registros en septiembre con fechas de agosto`);
    
    if (registrosSeptiembre.length === 0) {
      console.log('No hay registros para corregir');
      process.exit(0);
    }
    
    // Mostrar algunos ejemplos
    console.log('\nPrimeros 5 registros a corregir:');
    registrosSeptiembre.slice(0, 5).forEach((r, i) => {
      console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado} - Envío: ${r.fechaEnvio.toLocaleDateString()} - Mes actual: ${r.mes}`);
    });
    
    // Actualizar todos los registros de septiembre a agosto
    const resultado = await HistorialReferido.updateMany(
      {
        mes: 9,
        año: 2025,
        $or: [
          {
            fechaEnvio: {
              $gte: new Date('2025-08-01'),
              $lt: new Date('2025-09-01')
            }
          },
          {
            fechaCierre: {
              $gte: new Date('2025-08-01'),
              $lt: new Date('2025-09-01')
            }
          }
        ]
      },
      { $set: { mes: 8 } }
    );
    
    console.log(`\n✅ Se actualizaron ${resultado.modifiedCount} registros de septiembre a agosto`);
    
    // Verificar la corrección
    const registrosAgosto = await HistorialReferido.find({
      mes: 8,
      año: 2025
    });
    
    console.log(`Ahora hay ${registrosAgosto.length} registros en agosto 2025`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al corregir historial:', error);
    process.exit(1);
  }
}

corregirAgostoSeptiembre();