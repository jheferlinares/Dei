// Script para corregir los datos del historial de julio
require('dotenv').config();
const mongoose = require('mongoose');
const HistorialReferido = require('./models/HistorialReferido');

async function corregirHistorialJulio() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar registros con mes 8 (agosto) del año 2024
    const registrosAgosto = await HistorialReferido.find({
      mes: 8,
      año: 2025
    });
    
    console.log(`Encontrados ${registrosAgosto.length} registros en agosto 2025`);
    
    if (registrosAgosto.length === 0) {
      console.log('No hay registros para corregir');
      process.exit(0);
    }
    
    // Actualizar todos los registros de agosto a julio
    const resultado = await HistorialReferido.updateMany(
      { mes: 8, año: 2025 },
      { $set: { mes: 7 } }
    );
    
    console.log(`Se actualizaron ${resultado.modifiedCount} registros de agosto a julio`);
    
    // Verificar la corrección
    const registrosJulio = await HistorialReferido.find({
      mes: 7,
      año: 2025
    });
    
    console.log(`Ahora hay ${registrosJulio.length} registros en julio 2025`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error al corregir historial:', error);
    process.exit(1);
  }
}

corregirHistorialJulio();