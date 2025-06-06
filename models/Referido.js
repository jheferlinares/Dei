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
  }
});

module.exports = mongoose.model('Referido', referidoSchema);