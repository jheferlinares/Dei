const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI);

const Referido = require('./models/Referido');
const AñoCorporativo = require('./models/AñoCorporativo');

async function asignarEmpleadosAlfonzo() {
  try {
    console.log('Asignando empleados a Alfonzo Navarro...');
    
    const empleados = [
      'Angelica Suarez',
      'Karla Abreu', 
      'Michel Caro',
      'Nerfi Valenzuela',
      'Solin Mordan',
      'Esther Matos',
      'Osvayelin de la Cruz'
    ];
    
    for (const empleado of empleados) {
      // Actualizar en Referidos
      const resultado1 = await Referido.updateMany(
        { nombreEmpleado: empleado },
        { 
          nombreLider: 'Alfonzo Navarro',
          nombreSupervisor: 'Alfonzo Navarro'
        }
      );
      
      // Actualizar en Año Corporativo
      const resultado2 = await AñoCorporativo.updateMany(
        { nombreEmpleado: empleado },
        { 
          nombreLider: 'Alfonzo Navarro',
          nombreSupervisor: 'Alfonzo Navarro'
        }
      );
      
      console.log(`${empleado}: ${resultado1.modifiedCount} referidos + ${resultado2.modifiedCount} corporativo`);
    }
    
    console.log('Asignación completada');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

asignarEmpleadosAlfonzo();