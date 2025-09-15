// Script para unificar países RD -> República Dominicana
require('dotenv').config();
const mongoose = require('mongoose');
const Referido = require('./models/Referido');
const HistorialReferido = require('./models/HistorialReferido');
const AñoCorporativo = require('./models/AñoCorporativo');

async function unificarPaises() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Unificar en Referidos
    console.log('\n=== UNIFICANDO EN REFERIDOS ===');
    const resultadoReferidos = await Referido.updateMany(
      { paisEmpleado: /^RD$/i },
      { $set: { paisEmpleado: 'República Dominicana' } }
    );
    console.log(`Referidos actualizados: ${resultadoReferidos.modifiedCount}`);
    
    // Unificar en HistorialReferido
    console.log('\n=== UNIFICANDO EN HISTORIAL ===');
    const resultadoHistorial = await HistorialReferido.updateMany(
      { paisEmpleado: /^RD$/i },
      { $set: { paisEmpleado: 'República Dominicana' } }
    );
    console.log(`Historial actualizado: ${resultadoHistorial.modifiedCount}`);
    
    // Unificar en AñoCorporativo
    console.log('\n=== UNIFICANDO EN AÑO CORPORATIVO ===');
    const resultadoCorporativo = await AñoCorporativo.updateMany(
      { paisEmpleado: /^RD$/i },
      { $set: { paisEmpleado: 'República Dominicana' } }
    );
    console.log(`Año corporativo actualizado: ${resultadoCorporativo.modifiedCount}`);
    
    console.log('\n✅ Unificación de países completada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

unificarPaises();