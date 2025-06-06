const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const conectarDB = require('./config/db');
const Referido = require('./models/Referido');
const HistorialReferido = require('./models/HistorialReferido');

// Cargar variables de entorno
dotenv.config();

// Conectar a MongoDB
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Rutas API

// Obtener todos los referidos (cerrados y no cerrados)
app.get('/api/referidos/todos', async (req, res) => {
  try {
    const referidos = await Referido.find({}).sort({ fechaEnvio: -1 });
    res.json(referidos);
  } catch (error) {
    console.error('Error al obtener referidos:', error);
    res.status(500).json({ error: 'Error al obtener referidos' });
  }
});

// Obtener solo referidos cerrados (para el gráfico)
app.get('/api/referidos/cerrados', async (req, res) => {
  try {
    const referidos = await Referido.find({ cerrado: true });
    
    // Agrupar por empleado para el contador
    const referidosPorEmpleado = [];
    const empleadosMap = {};
    
    referidos.forEach(referido => {
      const { nombreEmpleado } = referido;
      
      if (empleadosMap[nombreEmpleado]) {
        empleadosMap[nombreEmpleado].cantidad += 1;
      } else {
        empleadosMap[nombreEmpleado] = {
          _id: referido._id,
          nombreEmpleado,
          cantidad: 1
        };
        referidosPorEmpleado.push(empleadosMap[nombreEmpleado]);
      }
    });
    
    res.json(referidosPorEmpleado);
  } catch (error) {
    console.error('Error al obtener referidos cerrados:', error);
    res.status(500).json({ error: 'Error al obtener referidos cerrados' });
  }
});

// Obtener estadísticas generales
app.get('/api/estadisticas', async (req, res) => {
  try {
    // Contar referidos cerrados
    const totalCerrados = await Referido.countDocuments({ cerrado: true });
    
    // Contar todos los referidos (enviados)
    const totalEnviados = await Referido.countDocuments();
    
    res.json({
      totalCerrados,
      totalEnviados
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener estadísticas generales
app.get('/api/estadisticas', async (req, res) => {
  try {
    // Contar referidos cerrados
    const totalCerrados = await Referido.countDocuments({ cerrado: true });
    
    // Contar todos los referidos (enviados)
    const totalEnviados = await Referido.countDocuments();
    
    res.json({
      totalCerrados,
      totalEnviados
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Obtener detalle de referidos cerrados
app.get('/api/referidos/cerrados/detalle', async (req, res) => {
  try {
    const referidos = await Referido.find({ cerrado: true }).sort({ fechaCierre: -1 });
    res.json(referidos);
  } catch (error) {
    console.error('Error al obtener detalle de referidos cerrados:', error);
    res.status(500).json({ error: 'Error al obtener detalle de referidos cerrados' });
  }
});

// Obtener historial de referidos por mes y año
app.get('/api/historial', async (req, res) => {
  try {
    const { mes, año } = req.query;
    
    let consulta = {};
    if (mes !== undefined && año !== undefined) {
      consulta = { mes: parseInt(mes), año: parseInt(año) };
    } else if (mes !== undefined) {
      consulta = { mes: parseInt(mes) };
    } else if (año !== undefined) {
      consulta = { año: parseInt(año) };
    }
    
    const historial = await HistorialReferido.find(consulta).sort({ fechaCierre: -1 });
    
    // Agrupar por empleado para estadísticas
    const empleadosMap = {};
    historial.forEach(referido => {
      const { nombreEmpleado } = referido;
      
      if (empleadosMap[nombreEmpleado]) {
        empleadosMap[nombreEmpleado].cantidad += 1;
      } else {
        empleadosMap[nombreEmpleado] = {
          nombreEmpleado,
          cantidad: 1
        };
      }
    });
    
    const resumenEmpleados = Object.values(empleadosMap);
    
    res.json({
      detalle: historial,
      resumen: resumenEmpleados,
      total: historial.length
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Obtener referidos pendientes (no cerrados)
app.get('/api/referidos/pendientes', async (req, res) => {
  try {
    const referidos = await Referido.find({ cerrado: false }).sort({ fechaEnvio: -1 });
    res.json(referidos);
  } catch (error) {
    console.error('Error al obtener referidos pendientes:', error);
    res.status(500).json({ error: 'Error al obtener referidos pendientes' });
  }
});

// Agregar un nuevo referido
app.post('/api/referidos', async (req, res) => {
  const { nombreCliente, nombreEmpleado, paisEmpleado, tipoEnvio } = req.body;
  
  if (!nombreCliente || !nombreEmpleado || !paisEmpleado) {
    return res.status(400).json({ error: 'Se requieren todos los campos' });
  }

  try {
    // Crear nuevo referido
    const nuevoReferido = new Referido({
      nombreCliente,
      nombreEmpleado,
      paisEmpleado,
      tipoEnvio: tipoEnvio || 'linea',
      fechaEnvio: new Date(),
      cerrado: false
    });
    
    await nuevoReferido.save();
    
    const referidos = await Referido.find({ cerrado: false }).sort({ fechaEnvio: -1 });
    res.status(201).json(referidos);
  } catch (error) {
    console.error('Error al agregar referido:', error);
    res.status(500).json({ error: 'Error al agregar referido' });
  }
});

// Marcar un referido como cerrado
app.put('/api/referidos/:id/cerrar', async (req, res) => {
  const id = req.params.id;
  
  try {
    const referido = await Referido.findById(id);
    
    if (!referido) {
      return res.status(404).json({ error: 'Referido no encontrado' });
    }
    
    // Marcar como cerrado y establecer fecha de cierre
    referido.cerrado = true;
    referido.fechaCierre = new Date();
    await referido.save();
    
    const referidosPendientes = await Referido.find({ cerrado: false }).sort({ fechaEnvio: -1 });
    res.json(referidosPendientes);
  } catch (error) {
    console.error('Error al cerrar referido:', error);
    res.status(500).json({ error: 'Error al cerrar referido' });
  }
});

// Eliminar un referido
app.delete('/api/referidos/:id', async (req, res) => {
  const id = req.params.id;
  
  try {
    await Referido.findByIdAndDelete(id);
    
    const referidos = await Referido.find({}).sort({ fechaEnvio: -1 });
    res.json(referidos);
  } catch (error) {
    console.error('Error al eliminar referido:', error);
    res.status(500).json({ error: 'Error al eliminar referido' });
  }
});

// Reiniciar datos (para cambio de mes)
app.post('/api/reiniciar', async (req, res) => {
  try {
    // Obtener todos los referidos cerrados
    const referidosCerrados = await Referido.find({ cerrado: true });
    
    // Guardar en historial antes de eliminar
    const HistorialReferido = require('./models/HistorialReferido');
    const fecha = new Date();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    // Guardar cada referido en el historial
    for (const referido of referidosCerrados) {
      await new HistorialReferido({
        mes,
        año,
        nombreCliente: referido.nombreCliente,
        nombreEmpleado: referido.nombreEmpleado,
        paisEmpleado: referido.paisEmpleado,
        fechaEnvio: referido.fechaEnvio,
        fechaCierre: referido.fechaCierre,
        tipoEnvio: referido.tipoEnvio
      }).save();
    }
    
    // Eliminar solo los referidos cerrados
    await Referido.deleteMany({ cerrado: true });
    
    res.json({ 
      mensaje: 'Datos de referidos cerrados reiniciados correctamente y guardados en historial'
    });
  } catch (error) {
    console.error('Error al reiniciar datos:', error);
    res.status(500).json({ error: 'Error al reiniciar datos' });
  }
});

// Buscar referidos por nombre de cliente o empleado
app.get('/api/referidos/buscar', async (req, res) => {
  const { termino } = req.query;
  
  if (!termino) {
    return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
  }
  
  try {
    const referidos = await Referido.find({
      $or: [
        { nombreCliente: { $regex: termino, $options: 'i' } },
        { nombreEmpleado: { $regex: termino, $options: 'i' } }
      ]
    }).sort({ fechaEnvio: -1 });
    
    res.json(referidos);
  } catch (error) {
    console.error('Error al buscar referidos:', error);
    res.status(500).json({ error: 'Error al buscar referidos' });
  }
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});