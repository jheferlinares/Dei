// Script para corregir referidos de septiembre que están en octubre
require('dotenv').config();
const mongoose = require('mongoose');
const HistorialReferido = require('./models/HistorialReferido');

async function corregirOctubreSeptiembre() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar registros con mes 10 (octubre) pero con fechas de septiembre
    const registrosOctubre = await HistorialReferido.find({
      mes: 10,
      año: 2025,
      fechaCierre: {
        $gte: new Date('2025-09-01'),
        $lt: new Date('2025-10-01')
      }
    });
    
    console.log(`Encontrados ${registrosOctubre.length} registros en octubre con fechas de septiembre`);
    
    if (registrosOctubre.length === 0) {
      console.log('No hay registros para corregir');
      process.exit(0);
    }
    
    // Actualizar registros de octubre a septiembre
    const resultado = await HistorialReferido.updateMany(
      {
        mes: 10,
        año: 2025,
        fechaCierre: {
          $gte: new Date('2025-09-01'),
          $lt: new Date('2025-10-01')
        }
      },
      { $set: { mes: 9 } }
    );
    
    console.log(`✅ Se actualizaron ${resultado.modifiedCount} registros de octubre a septiembre`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

corregirOctubreSeptiembre();