// Script para verificar los datos del año corporativo
require('dotenv').config();
const mongoose = require('mongoose');
const Referido = require('./models/Referido');
const AñoCorporativo = require('./models/AñoCorporativo');

async function verificarDatos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Verificar referidos de vida
    const referidosVida = await Referido.find({
      $or: [
        { tipoProducto: 'vida' },
        { tipoProducto: { $exists: false } }
      ]
    });
    
    console.log(`\n=== REFERIDOS DE VIDA ===`);
    console.log(`Total referidos de vida: ${referidosVida.length}`);
    console.log(`Cerrados: ${referidosVida.filter(r => r.cerrado).length}`);
    console.log(`Pendientes: ${referidosVida.filter(r => !r.cerrado).length}`);
    
    // Verificar año corporativo
    const corporativos = await AñoCorporativo.find({});
    
    console.log(`\n=== AÑO CORPORATIVO ===`);
    console.log(`Total en año corporativo: ${corporativos.length}`);
    console.log(`Cerrados: ${corporativos.filter(r => r.cerrado).length}`);
    console.log(`Pendientes: ${corporativos.filter(r => !r.cerrado).length}`);
    
    if (corporativos.length > 0) {
      console.log('\nPrimeros 3 registros del año corporativo:');
      corporativos.slice(0, 3).forEach((r, i) => {
        console.log(`${i + 1}. ${r.nombreCliente} - ${r.nombreEmpleado} - Cerrado: ${r.cerrado}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

verificarDatos();