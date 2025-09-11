const mongoose = require('mongoose');
require('dotenv').config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI);

const Referido = require('./models/Referido');
const AñoCorporativo = require('./models/AñoCorporativo');

async function corregirLiderDahiana() {
  try {
    console.log('Iniciando corrección de líder para referidos de Dahiana...');
    
    const nombresClientes = [
      'Maria Velasco',
      'Felipe Velasco jr',
      'Michelle Velasco',
      'Maria E Velasco',
      'Honorio Felioe Velasco'
    ];
    
    // Actualizar en la colección principal de Referidos
    for (const nombreCliente of nombresClientes) {
      const resultado = await Referido.updateMany(
        { 
          nombreCliente: nombreCliente,
          nombreEmpleado: 'Dahiana Galva'
        },
        { 
          nombreLider: 'Dorka de la Cruz',
          nombreSupervisor: 'Dorka de la Cruz'
        }
      );
      
      console.log(`${nombreCliente}: ${resultado.modifiedCount} referidos actualizados en Referidos`);
    }
    
    // Actualizar en la colección de Año Corporativo
    for (const nombreCliente of nombresClientes) {
      const resultado = await AñoCorporativo.updateMany(
        { 
          nombreCliente: nombreCliente,
          nombreEmpleado: 'Dahiana Galva'
        },
        { 
          nombreLider: 'Dorka de la Cruz',
          nombreSupervisor: 'Dorka de la Cruz'
        }
      );
      
      console.log(`${nombreCliente}: ${resultado.modifiedCount} referidos actualizados en Año Corporativo`);
    }
    
    console.log('Corrección completada exitosamente');
    process.exit(0);
    
  } catch (error) {
    console.error('Error al corregir líder:', error);
    process.exit(1);
  }
}

corregirLiderDahiana();