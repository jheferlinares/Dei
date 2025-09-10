const mongoose = require('mongoose');

const añoCorporativoSchema = new mongoose.Schema({
  // Información del cliente
  numeroCliente: {
    type: String,
    required: true,
    trim: true
  },
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
  
  // Información del supervisor (mantener para compatibilidad)
  nombreSupervisor: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Información del líder
  nombreLider: {
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
  fechaCierre: {
    type: Date,
    default: null
  },
  tipoEnvio: {
    type: String,
    required: true,
    enum: ['linea', 'callback'],
    default: 'linea'
  },
  
  // Solo vida para el año corporativo
  tipoProducto: {
    type: String,
    required: true,
    default: 'vida'
  },
  
  // Estado del referido
  cerrado: {
    type: Boolean,
    default: false
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
  },
  
  // Trimestre corporativo (1, 2, 3, 4)
  trimestreCorporativo: {
    type: Number,
    required: true
  },
  
  // Año corporativo
  añoCorporativo: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('AñoCorporativo', añoCorporativoSchema);