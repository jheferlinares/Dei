// Script para verificar los datos del historial
require('dotenv').config();
const mongoose = require('mongoose');
const HistorialReferido = require('./models/HistorialReferido');

async function verificarHistorial() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Verificar todos los registros de 2025
    const todos2025 = await HistorialReferido.find({ año: 2025 });
    console.log(`\nTotal registros en 2025: ${todos2025.length}`);
    
    // Agrupar por mes
    const porMes = {};
    todos2025.forEach(registro => {
      const mes = registro.mes;
      if (!porMes[mes]) porMes[mes] = 0;
      porMes[mes]++;
    });
    
    console.log('\nRegistros por mes en 2025:');
    Object.keys(porMes).forEach(mes => {
      const nombreMes = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mes];
      console.log(`${nombreMes} (${mes}): ${porMes[mes]} registros`);
    });
    
    // Mostrar algunos registros de agosto si existen
    const agosto = await HistorialReferido.find({ mes: 8, año: 2025 }).limit(3);
    if (agosto.length > 0) {
      console.log('\nPrimeros 3 registros de agosto 2025:');
      agosto.forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificarHistorial();