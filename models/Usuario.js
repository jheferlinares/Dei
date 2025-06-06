const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  foto: String,
  rol: {
    type: String,
    enum: ['usuario', 'admin'],
    default: 'usuario'
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);