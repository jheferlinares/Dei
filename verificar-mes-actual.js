// Script para verificar el mes actual y corregir si es necesario
require('dotenv').config();
const mongoose = require('mongoose');
const HistorialReferido = require('./models/HistorialReferido');

async function verificarMesActual() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1; // 0-11 -> 1-12
    const añoActual = fechaActual.getFullYear();
    
    console.log(`Fecha actual: ${fechaActual.toLocaleDateString()}`);
    console.log(`Mes actual calculado: ${mesActual} (${['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mesActual]})`);
    console.log(`Año actual: ${añoActual}`);
    
    // Verificar distribución actual en historial
    console.log('\n=== DISTRIBUCIÓN ACTUAL EN HISTORIAL 2025 ===');
    const distribucion = await HistorialReferido.aggregate([
      { $match: { año: 2025 } },
      { $group: { _id: '$mes', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    distribucion.forEach(mes => {
      const nombreMes = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mes._id];
      console.log(`${nombreMes} (${mes._id}): ${mes.count} registros`);
    });
    
    // Si hay registros en octubre (mes 10) que deberían estar en septiembre (mes 9)
    const registrosOctubre = await HistorialReferido.find({
      mes: 10,
      año: 2025,
      fechaCierre: {
        $gte: new Date('2025-09-01'),
        $lt: new Date('2025-10-01')
      }
    });
    
    if (registrosOctubre.length > 0) {
      console.log(`\n⚠️  Encontrados ${registrosOctubre.length} registros en octubre que tienen fechas de septiembre`);
      console.log('¿Quieres corregirlos? Ejecuta: node corregir-octubre-septiembre.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificarMesActual();