const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const Referido = require('./models/Referido');

async function buscarReferidosVelasco() {
  try {
    console.log('Buscando referidos con apellido Velasco...');
    
    const referidos = await Referido.find({
      nombreCliente: { $regex: 'Velasco', $options: 'i' }
    });
    
    console.log(`Encontrados ${referidos.length} referidos con apellido Velasco:`);
    
    referidos.forEach(referido => {
      console.log(`Cliente: ${referido.nombreCliente}, Empleado: ${referido.nombreEmpleado}, Líder: ${referido.nombreLider || referido.nombreSupervisor || 'Sin líder'}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

buscarReferidosVelasco();