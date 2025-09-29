// Script para buscar referidos de agosto en todas las colecciones
require('dotenv').config();
const mongoose = require('mongoose');
const Referido = require('./models/Referido');
const HistorialReferido = require('./models/HistorialReferido');
const AñoCorporativo = require('./models/AñoCorporativo');

async function buscarAgosto() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    console.log('\n=== BUSCANDO EN REFERIDOS ACTIVOS ===');
    const referidosAgosto = await Referido.find({
      fechaEnvio: {
        $gte: new Date('2025-08-01'),
        $lt: new Date('2025-09-01')
      }
    });
    console.log(`Referidos en agosto 2025: ${referidosAgosto.length}`);
    if (referidosAgosto.length > 0) {
      referidosAgosto.slice(0, 5).forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado} - ${r.fechaEnvio.toLocaleDateString()}`);
      });
    }
    
    console.log('\n=== BUSCANDO EN HISTORIAL POR MES 8 ===');
    const historialMes8 = await HistorialReferido.find({
      mes: 8,
      año: 2025
    });
    console.log(`Historial mes 8 año 2025: ${historialMes8.length}`);
    if (historialMes8.length > 0) {
      historialMes8.slice(0, 5).forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado} - Mes: ${r.mes}`);
      });
    }
    
    console.log('\n=== BUSCANDO EN HISTORIAL POR FECHA AGOSTO ===');
    const historialFechaAgosto = await HistorialReferido.find({
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
    console.log(`Historial con fechas de agosto 2025: ${historialFechaAgosto.length}`);
    if (historialFechaAgosto.length > 0) {
      historialFechaAgosto.slice(0, 5).forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado} - Envío: ${r.fechaEnvio.toLocaleDateString()} - Cierre: ${r.fechaCierre ? r.fechaCierre.toLocaleDateString() : 'N/A'}`);
      });
    }
    
    console.log('\n=== BUSCANDO EN AÑO CORPORATIVO ===');
    const corporativoAgosto = await AñoCorporativo.find({
      fechaEnvio: {
        $gte: new Date('2025-08-01'),
        $lt: new Date('2025-09-01')
      }
    });
    console.log(`Año corporativo agosto 2025: ${corporativoAgosto.length}`);
    if (corporativoAgosto.length > 0) {
      corporativoAgosto.slice(0, 5).forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado} - ${r.fechaEnvio.toLocaleDateString()}`);
      });
    }
    
    console.log('\n=== BUSCANDO TODOS LOS MESES EN HISTORIAL 2025 ===');
    const todosMeses = await HistorialReferido.aggregate([
      { $match: { año: 2025 } },
      { $group: { _id: '$mes', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('Distribución por mes en historial 2025:');
    todosMeses.forEach(mes => {
      const nombreMes = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mes._id];
      console.log(`${nombreMes} (${mes._id}): ${mes.count} registros`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

buscarAgosto();