const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Ruta al archivo de datos
const dataPath = path.join(__dirname, 'data.json');

// Inicializar archivo de datos si no existe
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({ referidos: [] }));
}

// Leer datos
function leerDatos() {
  const rawData = fs.readFileSync(dataPath);
  return JSON.parse(rawData);
}

// Guardar datos
function guardarDatos(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Rutas API
// Obtener todos los referidos
app.get('/api/referidos', (req, res) => {
  const data = leerDatos();
  res.json(data.referidos);
});

// Agregar un referido
app.post('/api/referidos', (req, res) => {
  const { nombre, cantidad } = req.body;
  
  if (!nombre || cantidad === undefined) {
    return res.status(400).json({ error: 'Se requiere nombre y cantidad' });
  }

  const data = leerDatos();
  
  // Buscar si ya existe el trabajador
  const trabajadorIndex = data.referidos.findIndex(t => t.nombre.toLowerCase() === nombre.toLowerCase());
  
  if (trabajadorIndex >= 0) {
    // Actualizar cantidad de referidos
    data.referidos[trabajadorIndex].cantidad += parseInt(cantidad);
  } else {
    // Agregar nuevo trabajador
    data.referidos.push({
      id: Date.now().toString(),
      nombre,
      cantidad: parseInt(cantidad)
    });
  }
  
  guardarDatos(data);
  res.status(201).json(data.referidos);
});

// Eliminar un referido
app.delete('/api/referidos/:id', (req, res) => {
  const data = leerDatos();
  const id = req.params.id;
  
  const trabajadorIndex = data.referidos.findIndex(t => t.id === id);
  
  if (trabajadorIndex === -1) {
    return res.status(404).json({ error: 'Trabajador no encontrado' });
  }
  
  // Eliminar un referido
  if (data.referidos[trabajadorIndex].cantidad > 1) {
    data.referidos[trabajadorIndex].cantidad -= 1;
  } else {
    // Si solo queda un referido, eliminar el trabajador
    data.referidos.splice(trabajadorIndex, 1);
  }
  
  guardarDatos(data);
  res.json(data.referidos);
});

// Reiniciar datos (para cambio de mes)
app.post('/api/reiniciar', (req, res) => {
  guardarDatos({ referidos: [] });
  res.json({ mensaje: 'Datos reiniciados correctamente' });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});