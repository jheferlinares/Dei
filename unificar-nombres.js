// Script para unificar nombres con diferentes mayúsculas/minúsculas
require('dotenv').config();
const mongoose = require('mongoose');
const Referido = require('./models/Referido');
const HistorialReferido = require('./models/HistorialReferido');
const AñoCorporativo = require('./models/AñoCorporativo');

async function unificarNombres() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Unificar en Referidos
    console.log('\n=== UNIFICANDO EN REFERIDOS ===');
    const resultadoReferidos = await Referido.updateMany(
      { nombreEmpleado: /^dorka de la cruz$/i },
      { $set: { nombreEmpleado: 'Dorka De la Cruz' } }
    );
    console.log(`Referidos actualizados: ${resultadoReferidos.modifiedCount}`);
    
    // Unificar en HistorialReferido
    console.log('\n=== UNIFICANDO EN HISTORIAL ===');
    const resultadoHistorial = await HistorialReferido.updateMany(
      { nombreEmpleado: /^dorka de la cruz$/i },
      { $set: { nombreEmpleado: 'Dorka De la Cruz' } }
    );
    console.log(`Historial actualizado: ${resultadoHistorial.modifiedCount}`);
    
    // Unificar en AñoCorporativo
    console.log('\n=== UNIFICANDO EN AÑO CORPORATIVO ===');
    const resultadoCorporativo = await AñoCorporativo.updateMany(
      { nombreEmpleado: /^dorka de la cruz$/i },
      { $set: { nombreEmpleado: 'Dorka De la Cruz' } }
    );
    console.log(`Año corporativo actualizado: ${resultadoCorporativo.modifiedCount}`);
    
    console.log('\n✅ Unificación completada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

unificarNombres();