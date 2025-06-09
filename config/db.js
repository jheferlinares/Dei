const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    // Opciones de conexión para evitar problemas de compatibilidad
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    };
    
    console.log('Intentando conectar a MongoDB con URI:', 
      process.env.MONGODB_URI ? 
      process.env.MONGODB_URI.substring(0, 20) + '...' : 
      'URI no disponible');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);
    
    console.log(`MongoDB conectado: ${conn.connection.host}`);
    
    // Configurar eventos de conexión para mejor depuración
    mongoose.connection.on('error', err => {
      console.error('Error de conexión MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconectado');
    });
    
  } catch (error) {
    console.error(`Error de conexión a MongoDB: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

module.exports = conectarDB;