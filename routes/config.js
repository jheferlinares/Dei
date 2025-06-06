const express = require('express');
const router = express.Router();
const Configuracion = require('../models/Configuracion');
const { estaAutenticado, puedeEditar } = require('../middleware/auth');

// Obtener configuración
router.get('/', async (req, res) => {
  try {
    const config = await Configuracion.obtenerConfig();
    res.json(config);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

// Actualizar configuración (requiere permisos de administrador)
router.put('/', estaAutenticado, puedeEditar, async (req, res) => {
  const { nombreMesActual } = req.body;
  
  if (!nombreMesActual) {
    return res.status(400).json({ error: 'Se requiere el nombre del mes' });
  }
  
  try {
    const config = await Configuracion.obtenerConfig();
    config.nombreMesActual = nombreMesActual;
    config.ultimaActualizacion = new Date();
    await config.save();
    
    res.json(config);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});

module.exports = router;