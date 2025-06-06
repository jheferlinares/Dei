const mongoose = require('mongoose');

const referidoSchema = new mongoose.Schema({
  // Información del cliente
  nombreCliente: {
    type: String,
    required: true,
    trim: true
  },
  
  // Información del empleado
  nombreEmpleado: {
    type: String,
    required: true,
    trim: true
  },
  paisEmpleado: {
    type: String,
    required: true,
    trim: true
  },
  
  // Información del referido
  fechaEnvio: {
    type: Date,
    required: true,
    default: Date.now
  },
  tipoEnvio: {
    type: String,
    required: true,
    enum: ['linea', 'callback'],
    default: 'linea'
  },
  
  // Estado del referido
  cerrado: {
    type: Boolean,
    default: false
  },
  fechaCierre: {
    type: Date,
    default: null
  },
  
  // Información del cerrador
  nombreCerrador: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Información de la compañía
  nombreCompania: {
    type: String,
    trim: true,
    default: ''
  }
});

module.exports = mongoose.model('Referido', referidoSchema);