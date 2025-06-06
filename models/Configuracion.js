const mongoose = require('mongoose');

const configuracionSchema = new mongoose.Schema({
  nombreMesActual: {
    type: String,
    required: true,
    default: function() {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      return meses[new Date().getMonth()];
    }
  },
  ultimaActualizacion: {
    type: Date,
    default: Date.now
  }
});

// Asegurar que solo haya un documento de configuración
configuracionSchema.statics.obtenerConfig = async function() {
  let config = await this.findOne();
  if (!config) {
    config = await this.create({});
  }
  return config;
};

module.exports = mongoose.model('Configuracion', configuracionSchema);