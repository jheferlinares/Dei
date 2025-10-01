// Script para mover los referidos de octubre a septiembre
require('dotenv').config();
const mongoose = require('mongoose');
const HistorialReferido = require('./models/HistorialReferido');

async function moverOctubreSeptiembre() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar registros con mes 10 (octubre) del año 2025
    const registrosOctubre = await HistorialReferido.find({
      mes: 10,
      año: 2025
    });
    
    console.log(`Encontrados ${registrosOctubre.length} registros en octubre 2025`);
    
    if (registrosOctubre.length === 0) {
      console.log('No hay registros para mover');
      process.exit(0);
    }
    
    // Actualizar todos los registros de octubre a septiembre
    const resultado = await HistorialReferido.updateMany(
      { mes: 10, año: 2025 },
      { $set: { mes: 9 } }
    );
    
    console.log(`✅ Se movieron ${resultado.modifiedCount} registros de octubre a septiembre`);
    
    // Verificar la corrección
    const registrosSeptiembre = await HistorialReferido.find({
      mes: 9,
      año: 2025
    });
    
    console.log(`Ahora hay ${registrosSeptiembre.length} registros en septiembre 2025`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

moverOctubreSeptiembre();