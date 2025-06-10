// recuperar-referidos.js
require('dotenv').config();
const mongoose = require('mongoose');
const Referido = require('./models/Referido');
const HistorialReferido = require('./models/HistorialReferido');

// Obtener la fecha actual para identificar los referidos recién movidos
const fechaActual = new Date();
const mesActual = fechaActual.getMonth();
const añoActual = fechaActual.getFullYear();

async function recuperarReferidos() {
  try {
    // Conectar a la base de datos
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Buscar referidos en el historial del mes y año actual
    const referidosHistorial = await HistorialReferido.find({
      mes: mesActual,
      año: añoActual
    });
    
    console.log(`Se encontraron ${referidosHistorial.length} referidos para recuperar`);
    
    // Si no hay referidos para recuperar, terminar
    if (referidosHistorial.length === 0) {
      console.log('No hay referidos para recuperar del mes actual');
      process.exit(0);
    }
    
    // Convertir cada referido del historial a un referido activo
    for (const refHistorial of referidosHistorial) {
      const nuevoReferido = new Referido({
        nombreCliente: refHistorial.nombreCliente,
        nombreEmpleado: refHistorial.nombreEmpleado,
        paisEmpleado: refHistorial.paisEmpleado,
        fechaEnvio: refHistorial.fechaEnvio,
        fechaCierre: refHistorial.fechaCierre,
        tipoEnvio: refHistorial.tipoEnvio,
        tipoProducto: refHistorial.tipoProducto,
        cerrado: true,
        nombreCerrador: refHistorial.nombreCerrador,
        nombreCompania: refHistorial.nombreCompania
      });
      
      await nuevoReferido.save();
      console.log(`Recuperado: ${refHistorial.nombreCliente} - ${refHistorial.nombreEmpleado}`);
    }
    
    // Eliminar los referidos recuperados del historial
    await HistorialReferido.deleteMany({
      mes: mesActual,
      año: añoActual
    });
    
    console.log('Proceso completado. Referidos recuperados exitosamente.');
    process.exit(0);
  } catch (error) {
    console.error('Error al recuperar referidos:', error);
    process.exit(1);
  }
}

recuperarReferidos();
