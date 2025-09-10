// Función auxiliar para obtener nombre legible del producto
function obtenerNombreProducto(tipo) {
  const productos = {
    'vida': 'Vida',
    'casa': 'Casa',
    'auto': 'Auto',
    'comercial': 'Comercial',
    'salud': 'Salud'
  };
  return productos[tipo] || tipo || 'Vida';
}

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const nuevoReferidoForm = document.getElementById('nuevoReferidoForm');
  const nombreClienteInput = document.getElementById('nombreCliente');
  const nombreEmpleadoInput = document.getElementById('nombreEmpleado');
  const paisEmpleadoInput = document.getElementById('paisEmpleado');
  const nombreSupervisorInput = document.getElementById('nombreSupervisor');
  const tipoProductoSelect = document.getElementById('tipoProducto');
  const referidosHoyBody = document.getElementById('referidosHoyBody');

  // Cargar referidos del día al iniciar
  cargarReferidosHoy();

  // Event listeners
  nuevoReferidoForm.addEventListener('submit', registrarReferido);

  // Función para cargar referidos del día actual
  async function cargarReferidosHoy() {
    try {
      const response = await fetch('/api/referidos/pendientes');
      const referidos = await response.json();
      
      // Filtrar solo los referidos de hoy
      const hoy = new Date();
      const referidosHoy = referidos.filter(referido => {
        const fechaReferido = new Date(referido.fechaEnvio);
        return fechaReferido.toDateString() === hoy.toDateString();
      });
      
      actualizarTablaReferidosHoy(referidosHoy);
    } catch (error) {
      console.error('Error al cargar referidos de hoy:', error);
    }
  }

  // Función para registrar un nuevo referido
  async function registrarReferido(e) {
    e.preventDefault();
    
    const nombreCliente = nombreClienteInput.value.trim();
    const nombreEmpleado = nombreEmpleadoInput.value.trim();
    const paisEmpleado = paisEmpleadoInput.value.trim();
    const nombreSupervisor = nombreSupervisorInput.value.trim();
    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked').value;
    const tipoProducto = tipoProductoSelect.value;

    if (!nombreCliente || !nombreEmpleado || !paisEmpleado || !nombreSupervisor) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    try {
      const response = await fetch('/api/referidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombreCliente,
          nombreEmpleado,
          paisEmpleado,
          nombreSupervisor,
          tipoEnvio,
          tipoProducto
        })
      });
      
      if (response.status === 403) {
        alert('No tienes permisos para realizar esta acción');
        return;
      }
      
      if (response.ok) {
        // Limpiar formulario
        nombreClienteInput.value = '';
        nombreEmpleadoInput.value = '';
        paisEmpleadoInput.value = '';
        nombreSupervisorInput.value = '';
        document.querySelector('input[value="linea"]').checked = true;
        
        alert('Referido registrado correctamente');
        
        // Recargar referidos del día
        cargarReferidosHoy();
      } else {
        throw new Error('Error al registrar referido');
      }
    } catch (error) {
      console.error('Error al registrar referido:', error);
      alert('Error al registrar referido');
    }
  }

  // Función para actualizar la tabla de referidos de hoy
  function actualizarTablaReferidosHoy(referidos) {
    referidosHoyBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7;
      cell.textContent = 'No hay referidos registrados hoy';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      referidosHoyBody.appendChild(row);
      return;
    }
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      // Columna de cliente
      const clienteCell = document.createElement('td');
      clienteCell.textContent = referido.nombreCliente;
      
      // Columna de empleado
      const empleadoCell = document.createElement('td');
      empleadoCell.textContent = referido.nombreEmpleado;
      
      // Columna de país
      const paisCell = document.createElement('td');
      paisCell.textContent = referido.paisEmpleado;
      
      // Columna de líder
      const supervisorCell = document.createElement('td');
      supervisorCell.textContent = referido.nombreSupervisor || 'No especificado';
      
      // Columna de fecha
      const fechaCell = document.createElement('td');
      fechaCell.textContent = new Date(referido.fechaEnvio).toLocaleDateString();
      
      // Columna de tipo
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      // Columna de producto
      const productoCell = document.createElement('td');
      productoCell.textContent = obtenerNombreProducto(referido.tipoProducto);
      
      // Agregar celdas a la fila
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(paisCell);
      row.appendChild(supervisorCell);
      row.appendChild(fechaCell);
      row.appendChild(tipoCell);
      row.appendChild(productoCell);
      
      // Agregar fila a la tabla
      referidosHoyBody.appendChild(row);
    });
  }
});