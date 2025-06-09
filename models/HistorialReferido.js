// models/HistorialReferido.js
const mongoose = require('mongoose');

const historialReferidoSchema = new mongoose.Schema({
  mes: {
    type: Number,
    required: true
  },
  año: {
    type: Number,
    required: true
  },
  nombreCliente: {
    type: String,
    required: true,
    trim: true
  },
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
  fechaEnvio: {
    type: Date,
    required: true
  },
  fechaCierre: {
    type: Date,
    required: true
  },
  tipoEnvio: {
    type: String,
    required: true,
    enum: ['linea', 'callback']
  },
  tipoProducto: {
    type: String,
    required: true,
    enum: ['vida', 'casa', 'auto', 'comercial', 'salud'],
    default: 'vida'
  },
  nombreCerrador: {
    type: String,
    trim: true,
    default: ''
  },
  nombreCompania: {
    type: String,
    trim: true,
    default: ''
  },
  fechaArchivado: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('HistorialReferido', historialReferidoSchema);
