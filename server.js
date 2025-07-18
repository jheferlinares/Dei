const dotenv = require('dotenv');
// Cargar variables de entorno
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const conectarDB = require('./config/db');
const Referido = require('./models/Referido');
const HistorialReferido = require('./models/HistorialReferido');
const Configuracion = require('./models/Configuracion');
const AñoCorporativo = require('./models/AñoCorporativo');
const authRoutes = require('./routes/auth');
const { estaAutenticado, puedeEditar } = require('./middleware/auth');



// Conectar a MongoDB
conectarDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'secreto-desarrollo',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sesiones'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 1 día
  }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas de configuración
app.use('/api/configuracion', require('./routes/config'));

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
    const tipoProducto = req.query.tipoProducto || 'todos';
    
    // Filtrar por tipo de producto si se especifica
    let filtro = { cerrado: true };
    
    // NUEVO: Agrupar casa, auto y comercial como un solo tipo para el concurso
    if (tipoProducto === 'concurso') {
      filtro.$or = [
        { tipoProducto: 'casa' },
        { tipoProducto: 'auto' },
        { tipoProducto: 'comercial' }
      ];
    } else if (tipoProducto !== 'todos') {
      // Para manejar referidos antiguos que no tienen tipoProducto definido
      if (tipoProducto === 'vida') {
        filtro.$or = [
          { tipoProducto: 'vida' },
          { tipoProducto: { $exists: false } } // Incluir documentos sin el campo tipoProducto
        ];
      } else {
        filtro.tipoProducto = tipoProducto;
      }
    }
    
    console.log('Filtro para referidos cerrados:', filtro);
    const referidos = await Referido.find(filtro);
    
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
          cantidad: 1,
          tipoProducto: tipoProducto === 'concurso' ? 'concurso' : referido.tipoProducto
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
    const tipoProducto = req.query.tipoProducto || 'todos';
    
    // Filtrar por tipo de producto si se especifica
    let filtroCerrados = { cerrado: true };
    let filtroEnviados = {};
    
    // NUEVO: Agrupar casa, auto y comercial como un solo tipo para el concurso
    if (tipoProducto === 'concurso') {
      filtroCerrados.$or = [
        { tipoProducto: 'casa' },
        { tipoProducto: 'auto' },
        { tipoProducto: 'comercial' }
      ];
      filtroEnviados.$or = [
        { tipoProducto: 'casa' },
        { tipoProducto: 'auto' },
        { tipoProducto: 'comercial' }
      ];
    } else if (tipoProducto !== 'todos') {
      // Para manejar referidos antiguos que no tienen tipoProducto definido
      if (tipoProducto === 'vida') {
        filtroCerrados.$or = [
          { tipoProducto: 'vida' },
          { tipoProducto: { $exists: false } } // Incluir documentos sin el campo tipoProducto
        ];
        filtroEnviados.$or = [
          { tipoProducto: 'vida' },
          { tipoProducto: { $exists: false } } // Incluir documentos sin el campo tipoProducto
        ];
      } else {
        filtroCerrados.tipoProducto = tipoProducto;
        filtroEnviados.tipoProducto = tipoProducto;
      }
    }
    
    // Contar referidos cerrados
    const totalCerrados = await Referido.countDocuments(filtroCerrados);
    
    // Contar todos los referidos (enviados)
    const totalEnviados = await Referido.countDocuments(filtroEnviados);
    
    console.log('Estadísticas calculadas:', { tipoProducto, totalCerrados, totalEnviados });
    
    res.json({
      tipoProducto,
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
    const tipoProducto = req.query.tipoProducto || 'todos';
    
    // Filtrar por tipo de producto si se especifica
    let filtro = { cerrado: true };
    
    // NUEVO: Agrupar casa, auto y comercial como un solo tipo para el concurso
    if (tipoProducto === 'concurso') {
      filtro.$or = [
        { tipoProducto: 'casa' },
        { tipoProducto: 'auto' },
        { tipoProducto: 'comercial' }
      ];
    } else if (tipoProducto !== 'todos') {
      // Para manejar referidos antiguos que no tienen tipoProducto definido
      if (tipoProducto === 'vida') {
        filtro.$or = [
          { tipoProducto: 'vida' },
          { tipoProducto: { $exists: false } } // Incluir documentos sin el campo tipoProducto
        ];
      } else {
        filtro.tipoProducto = tipoProducto;
      }
    }
    
    const referidos = await Referido.find(filtro).sort({ fechaCierre: -1 });
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
    const tipoProducto = req.query.tipoProducto || 'todos';
    
    // Filtrar por tipo de producto si se especifica
    let filtro = { cerrado: false };
    
    // NUEVO: Agrupar casa, auto y comercial como un solo tipo para el concurso
    if (tipoProducto === 'concurso') {
      filtro.$or = [
        { tipoProducto: 'casa' },
        { tipoProducto: 'auto' },
        { tipoProducto: 'comercial' }
      ];
    } else if (tipoProducto !== 'todos') {
      filtro.tipoProducto = tipoProducto;
    }
    
    const referidos = await Referido.find(filtro).sort({ fechaEnvio: -1 });
    res.json(referidos);
  } catch (error) {
    console.error('Error al obtener referidos pendientes:', error);
    res.status(500).json({ error: 'Error al obtener referidos pendientes' });
  }
});

// Función auxiliar para obtener trimestre corporativo
function obtenerTrimestreCorporativo(fecha) {
  const mes = fecha.getMonth(); // 0-11
  if (mes >= 6 && mes <= 8) return 1; // Julio, Agosto, Septiembre
  if (mes >= 9 && mes <= 11) return 2; // Octubre, Noviembre, Diciembre
  if (mes >= 0 && mes <= 2) return 3; // Enero, Febrero, Marzo
  if (mes >= 3 && mes <= 5) return 4; // Abril, Mayo, Junio
}

// Obtener referidos del año corporativo
app.get('/api/ano-corporativo/cerrados', async (req, res) => {
  try {
    console.log('Consultando referidos del año corporativo...');
    const referidos = await AñoCorporativo.find({ cerrado: true });
    console.log(`Encontrados ${referidos.length} referidos cerrados en el año corporativo`);
    
    // Agrupar por empleado
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
    
    console.log('Referidos agrupados por empleado:', referidosPorEmpleado);
    res.json(referidosPorEmpleado);
  } catch (error) {
    console.error('Error al obtener referidos del año corporativo:', error);
    res.status(500).json({ error: 'Error al obtener referidos del año corporativo' });
  }
});

// Obtener estadísticas del año corporativo
app.get('/api/ano-corporativo/estadisticas', async (req, res) => {
  try {
    console.log('Consultando estadísticas del año corporativo...');
    const totalCerrados = await AñoCorporativo.countDocuments({ cerrado: true });
    const totalEnviados = await AñoCorporativo.countDocuments();
    
    console.log(`Estadísticas: ${totalCerrados} cerrados, ${totalEnviados} enviados`);
    
    res.json({
      totalCerrados,
      totalEnviados
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del año corporativo:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas del año corporativo' });
  }
});

// Reiniciar año corporativo
app.post('/api/ano-corporativo/reiniciar', estaAutenticado, puedeEditar, async (req, res) => {
  try {
    const resultado = await AñoCorporativo.deleteMany({});
    console.log(`Eliminados ${resultado.deletedCount} referidos del año corporativo`);
    res.json({ 
      mensaje: `Año corporativo reiniciado correctamente. Se eliminaron ${resultado.deletedCount} referidos.`
    });
  } catch (error) {
    console.error('Error al reiniciar año corporativo:', error);
    res.status(500).json({ error: 'Error al reiniciar año corporativo' });
  }
});

// Agregar un nuevo referido (requiere autenticación y permisos de edición)
app.post('/api/referidos', estaAutenticado, puedeEditar, async (req, res) => {
  const { nombreCliente, nombreEmpleado, paisEmpleado, tipoEnvio, tipoProducto } = req.body;
  
  if (!nombreCliente || !nombreEmpleado || !paisEmpleado) {
    return res.status(400).json({ error: 'Se requieren todos los campos' });
  }

  try {
    const fechaActual = new Date();
    const tipoProductoFinal = tipoProducto || 'vida';
    
    // Crear nuevo referido
    const nuevoReferido = new Referido({
      nombreCliente,
      nombreEmpleado,
      paisEmpleado,
      tipoEnvio: tipoEnvio || 'linea',
      tipoProducto: tipoProductoFinal,
      fechaEnvio: fechaActual,
      cerrado: false
    });
    
    await nuevoReferido.save();
    
    // Si es de tipo vida, también guardarlo en el año corporativo
    if (tipoProductoFinal === 'vida') {
      const trimestreCorporativo = obtenerTrimestreCorporativo(fechaActual);
      const añoCorporativo = fechaActual.getFullYear();
      
      const referidoCorporativo = new AñoCorporativo({
        nombreCliente,
        nombreEmpleado,
        paisEmpleado,
        tipoEnvio: tipoEnvio || 'linea',
        tipoProducto: 'vida',
        fechaEnvio: fechaActual,
        cerrado: false,
        trimestreCorporativo,
        añoCorporativo
      });
      
      await referidoCorporativo.save();
    }
    
    const referidos = await Referido.find({ cerrado: false }).sort({ fechaEnvio: -1 });
    res.status(201).json(referidos);
  } catch (error) {
    console.error('Error al agregar referido:', error);
    res.status(500).json({ error: 'Error al agregar referido' });
  }
});


// Marcar un referido como cerrado (requiere autenticación y permisos de edición)
app.put('/api/referidos/:id/cerrar', estaAutenticado, puedeEditar, async (req, res) => {
  const id = req.params.id;
  const { nombreCerrador, nombreCompania } = req.body;
  
  try {
    console.log('Cerrando referido con ID:', id);
    console.log('Datos recibidos:', { nombreCerrador, nombreCompania });
    
    const referido = await Referido.findById(id);
    
    if (!referido) {
      console.error('Referido no encontrado con ID:', id);
      return res.status(404).json({ error: 'Referido no encontrado' });
    }
    
    console.log('Referido encontrado:', referido);
    
    const fechaCierre = new Date();
    const nombreCerradorFinal = nombreCerrador || (req.user ? req.user.nombre : 'Usuario Local');
    const nombreCompaniaFinal = nombreCompania || '';
    
    // Marcar como cerrado y establecer fecha de cierre
    referido.cerrado = true;
    referido.fechaCierre = fechaCierre;
    referido.nombreCerrador = nombreCerradorFinal;
    referido.nombreCompania = nombreCompaniaFinal;
    
    console.log('Guardando referido con datos actualizados:', {
      cerrado: referido.cerrado,
      fechaCierre: referido.fechaCierre,
      nombreCerrador: referido.nombreCerrador,
      nombreCompania: referido.nombreCompania
    });
    
    const referidoGuardado = await referido.save();
    console.log('Referido guardado correctamente:', referidoGuardado);
    
    // Si es de tipo vida, también cerrar en el año corporativo
    if (referido.tipoProducto === 'vida' || !referido.tipoProducto) {
      const referidoCorporativo = await AñoCorporativo.findOne({
        nombreCliente: referido.nombreCliente,
        nombreEmpleado: referido.nombreEmpleado,
        fechaEnvio: referido.fechaEnvio,
        cerrado: false
      });
      
      if (referidoCorporativo) {
        referidoCorporativo.cerrado = true;
        referidoCorporativo.fechaCierre = fechaCierre;
        referidoCorporativo.nombreCerrador = nombreCerradorFinal;
        referidoCorporativo.nombreCompania = nombreCompaniaFinal;
        await referidoCorporativo.save();
        console.log('Referido corporativo también cerrado');
      } else {
        console.log('No se encontró referido corporativo correspondiente para cerrar');
      }
    }
    
    // Verificar que el referido se guardó correctamente
    const referidoVerificado = await Referido.findById(id);
    console.log('Verificación del referido guardado:', referidoVerificado);
    
    const referidosPendientes = await Referido.find({ cerrado: false }).sort({ fechaEnvio: -1 });
    res.json(referidosPendientes);
  } catch (error) {
    console.error('Error al cerrar referido:', error);
    res.status(500).json({ error: 'Error al cerrar referido' });
  }
});

// Eliminar un referido (requiere autenticación y permisos de edición)
app.delete('/api/referidos/:id', estaAutenticado, puedeEditar, async (req, res) => {
  const id = req.params.id;
  
  try {
    const referido = await Referido.findById(id);
    
    if (referido) {
      // Si es de tipo vida, también eliminar del año corporativo
      if (referido.tipoProducto === 'vida' || !referido.tipoProducto) {
        await AñoCorporativo.findOneAndDelete({
          nombreCliente: referido.nombreCliente,
          nombreEmpleado: referido.nombreEmpleado,
          fechaEnvio: referido.fechaEnvio
        });
      }
      
      await Referido.findByIdAndDelete(id);
    }
    
    const referidos = await Referido.find({}).sort({ fechaEnvio: -1 });
    res.json(referidos);
  } catch (error) {
    console.error('Error al eliminar referido:', error);
    res.status(500).json({ error: 'Error al eliminar referido' });
  }
});

// Reiniciar datos (para cambio de mes) (requiere autenticación y permisos de edición)
app.post('/api/reiniciar', estaAutenticado, puedeEditar, async (req, res) => {
  try {
    // Obtener todos los referidos cerrados
    const referidosCerrados = await Referido.find({ cerrado: true });
    
    // Guardar en historial antes de eliminar
    const fecha = new Date();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    // Guardar cada referido en el historial
    for (const referido of referidosCerrados) {
      await new HistorialReferido({
        mes: mes + 1, // Corregir: mes va de 0-11, pero queremos 1-12
        año,
        nombreCliente: referido.nombreCliente,
        nombreEmpleado: referido.nombreEmpleado,
        paisEmpleado: referido.paisEmpleado,
        fechaEnvio: referido.fechaEnvio,
        fechaCierre: referido.fechaCierre,
        tipoEnvio: referido.tipoEnvio,
        tipoProducto: referido.tipoProducto || 'vida',
        nombreCerrador: referido.nombreCerrador || '',
        nombreCompania: referido.nombreCompania || ''
      }).save();
    }
    
    // Eliminar solo los referidos cerrados (NO eliminar del año corporativo)
    await Referido.deleteMany({ cerrado: true });
    
    res.json({ 
      mensaje: 'Datos de referidos cerrados reiniciados correctamente y guardados en historial. Los referidos de vida se mantienen en el año corporativo.'
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

// Ruta de login
app.get('/login', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta principal (protegida)
app.get('/', estaAutenticado, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});