const mongoose = require('mongoose');

// Añadir hooks para depuración
mongoose.set('debug', true);

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
  
  // Información del supervisor
  nombreSupervisor: {
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
  
  // Tipo de producto
  tipoProducto: {
    type: String,
    required: true,
    enum: ['vida', 'casa', 'auto', 'comercial', 'salud'],
    default: 'vida'
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

// Añadir middleware pre-save para depuración
referidoSchema.pre('save', function(next) {
  console.log('Guardando referido:', this);
  next();
});

referidoSchema.post('save', function(doc) {
  console.log('Referido guardado correctamente:', doc);
});

module.exports = mongoose.model('Referido', referidoSchema);
