document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const nuevoReferidoForm = document.getElementById('nuevoReferidoForm');
  const nombreClienteInput = document.getElementById('nombreCliente');
  const nombreEmpleadoInput = document.getElementById('nombreEmpleado');
  const paisEmpleadoInput = document.getElementById('paisEmpleado');
  const pendientesBody = document.getElementById('pendientesBody');
  const cerradosBody = document.getElementById('cerradosBody');
  const cerradosDetalleBody = document.getElementById('cerradosDetalleBody');
  const chartContainer = document.getElementById('chartContainer');
  const reiniciarBtn = document.getElementById('reiniciarBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  // Cargar datos iniciales
  cargarReferidosPendientes();
  cargarReferidosCerrados();

  // Event listeners
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
  });
  
  nuevoReferidoForm.addEventListener('submit', registrarReferido);
  reiniciarBtn.addEventListener('click', reiniciarDatos);
  searchBtn.addEventListener('click', buscarReferidos);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      buscarReferidos();
    }
  });

  // Función para cambiar entre tabs
  function cambiarTab(tabId) {
    // Actualizar botones
    tabBtns.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.tab === tabId) {
        btn.classList.add('active');
      }
    });
    
    // Actualizar contenido
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tabId}-tab`) {
        content.classList.add('active');
      }
    });
    
    // Recargar datos según el tab
    if (tabId === 'pendientes') {
      cargarReferidosPendientes();
    } else if (tabId === 'cerrados') {
      cargarReferidosCerrados();
    }
  }

  // Función para cargar referidos pendientes
  async function cargarReferidosPendientes() {
    try {
      const response = await fetch('/api/referidos/pendientes');
      const referidos = await response.json();
      actualizarTablaPendientes(referidos);
    } catch (error) {
      console.error('Error al cargar referidos pendientes:', error);
    }
  }

  // Función para cargar referidos cerrados
  async function cargarReferidosCerrados() {
    try {
      // Cargar resumen para el gráfico
      const response = await fetch('/api/referidos/cerrados');
      const referidos = await response.json();
      actualizarTablaCerrados(referidos);
      actualizarGrafico(referidos);
      
      // Cargar detalle de referidos cerrados
      const detalleResponse = await fetch('/api/referidos/cerrados/detalle');
      const referidosDetalle = await detalleResponse.json();
      actualizarTablaCerradosDetalle(referidosDetalle);
    } catch (error) {
      console.error('Error al cargar referidos cerrados:', error);
    }
  }

  // Función para registrar un nuevo referido
  async function registrarReferido(e) {
    e.preventDefault();
    
    const nombreCliente = nombreClienteInput.value.trim();
    const nombreEmpleado = nombreEmpleadoInput.value.trim();
    const paisEmpleado = paisEmpleadoInput.value.trim();
    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked').value;
    
    if (!nombreCliente || !nombreEmpleado || !paisEmpleado) {
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
          tipoEnvio
        })
      });
      
      const referidos = await response.json();
      actualizarTablaPendientes(referidos);
      
      // Limpiar formulario
      nombreClienteInput.value = '';
      nombreEmpleadoInput.value = '';
      paisEmpleadoInput.value = '';
      document.querySelector('input[value="linea"]').checked = true;
      
      alert('Referido registrado correctamente');
    } catch (error) {
      console.error('Error al registrar referido:', error);
    }
  }

  // Función para marcar un referido como cerrado
  async function cerrarReferido(id) {
    if (!confirm('¿Confirmar que este referido ha sido cerrado?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/referidos/${id}/cerrar`, {
        method: 'PUT'
      });
      
      const referidos = await response.json();
      actualizarTablaPendientes(referidos);
      cargarReferidosCerrados();
      
      alert('Referido marcado como cerrado correctamente');
    } catch (error) {
      console.error('Error al cerrar referido:', error);
    }
  }

  // Función para eliminar un referido
  async function eliminarReferido(id) {
    if (!confirm('¿Estás seguro de eliminar este referido? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/referidos/${id}`, {
        method: 'DELETE'
      });
      
      cargarReferidosPendientes();
      
      alert('Referido eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar referido:', error);
    }
  }

  // Función para buscar referidos
  async function buscarReferidos() {
    const termino = searchInput.value.trim();
    
    if (!termino) {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }
    
    try {
      const response = await fetch(`/api/referidos/buscar?termino=${encodeURIComponent(termino)}`);
      const referidos = await response.json();
      
      actualizarTablaPendientes(referidos.filter(r => !r.cerrado));
      
      if (referidos.length === 0) {
        alert('No se encontraron referidos con ese término');
      }
    } catch (error) {
      console.error('Error al buscar referidos:', error);
    }
  }

  // Función para reiniciar datos
  async function reiniciarDatos() {
    if (!confirm('¿Estás seguro de reiniciar los datos de referidos cerrados? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await fetch('/api/reiniciar', {
        method: 'POST'
      });
      
      cargarReferidosCerrados();
      
      alert('Datos de referidos cerrados reiniciados correctamente');
    } catch (error) {
      console.error('Error al reiniciar datos:', error);
    }
  }

  // Función para actualizar la tabla de pendientes
  function actualizarTablaPendientes(referidos) {
    pendientesBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 6;
      cell.textContent = 'No hay referidos pendientes';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      pendientesBody.appendChild(row);
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
      
      // Columna de fecha
      const fechaCell = document.createElement('td');
      fechaCell.textContent = new Date(referido.fechaEnvio).toLocaleDateString();
      
      // Columna de tipo
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      // Columna de acciones
      const accionesCell = document.createElement('td');
      
      const cerrarBtn = document.createElement('button');
      cerrarBtn.className = 'action-btn cerrar';
      cerrarBtn.textContent = 'Cerrar';
      cerrarBtn.addEventListener('click', () => cerrarReferido(referido._id));
      
      const eliminarBtn = document.createElement('button');
      eliminarBtn.className = 'action-btn';
      eliminarBtn.textContent = 'Eliminar';
      eliminarBtn.addEventListener('click', () => eliminarReferido(referido._id));
      
      accionesCell.appendChild(cerrarBtn);
      accionesCell.appendChild(eliminarBtn);
      
      // Agregar celdas a la fila
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(paisCell);
      row.appendChild(fechaCell);
      row.appendChild(tipoCell);
      row.appendChild(accionesCell);
      
      // Agregar fila a la tabla
      pendientesBody.appendChild(row);
    });
  }

  // Función para actualizar la tabla de cerrados
  function actualizarTablaCerrados(referidos) {
    cerradosBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 2;
      cell.textContent = 'No hay referidos cerrados en este mes';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      cerradosBody.appendChild(row);
      return;
    }
    
    // Ordenar por cantidad (mayor a menor)
    referidos.sort((a, b) => b.cantidad - a.cantidad);
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      // Columna de empleado
      const empleadoCell = document.createElement('td');
      empleadoCell.textContent = referido.nombreEmpleado;
      
      // Columna de cantidad
      const cantidadCell = document.createElement('td');
      cantidadCell.textContent = referido.cantidad;
      
      // Agregar celdas a la fila
      row.appendChild(empleadoCell);
      row.appendChild(cantidadCell);
      
      // Agregar fila a la tabla
      cerradosBody.appendChild(row);
    });
  }
  
  // Función para actualizar la tabla de detalle de referidos cerrados
  function actualizarTablaCerradosDetalle(referidos) {
    cerradosDetalleBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 5;
      cell.textContent = 'No hay referidos cerrados en este mes';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      cerradosDetalleBody.appendChild(row);
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
      
      // Columna de fecha de envío
      const fechaEnvioCell = document.createElement('td');
      fechaEnvioCell.textContent = new Date(referido.fechaEnvio).toLocaleDateString();
      
      // Columna de fecha de cierre
      const fechaCierreCell = document.createElement('td');
      fechaCierreCell.textContent = new Date(referido.fechaCierre).toLocaleDateString();
      
      // Columna de tipo
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      // Agregar celdas a la fila
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(fechaEnvioCell);
      row.appendChild(fechaCierreCell);
      row.appendChild(tipoCell);
      
      // Agregar fila a la tabla
      cerradosDetalleBody.appendChild(row);
    });
  }

  // Función para actualizar el gráfico
  function actualizarGrafico(referidos) {
    chartContainer.innerHTML = '';
    
    if (referidos.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'No hay referidos cerrados en este mes';
      mensaje.style.textAlign = 'center';
      mensaje.style.width = '100%';
      chartContainer.appendChild(mensaje);
      return;
    }
    
    // Ordenar por cantidad (mayor a menor)
    referidos.sort((a, b) => b.cantidad - a.cantidad);
    
    // Encontrar el valor máximo para escalar las barras
    const maxCantidad = Math.max(...referidos.map(r => r.cantidad));
    
    // Altura máxima de las barras en píxeles
    const maxHeight = 250;
    
    referidos.forEach(referido => {
      // Crear contenedor de la barra
      const barContainer = document.createElement('div');
      barContainer.className = 'chart-bar';
      
      // Crear la barra
      const bar = document.createElement('div');
      bar.className = 'bar';
      
      // Calcular altura proporcional
      const height = (referido.cantidad / maxCantidad) * maxHeight;
      bar.style.height = `${height}px`;
      
      // Color aleatorio para la barra
      const hue = Math.floor(Math.random() * 360);
      bar.style.backgroundColor = `hsl(${hue}, 70%, 60%)`;
      
      // Valor en la parte superior de la barra
      const barValue = document.createElement('div');
      barValue.className = 'bar-value';
      barValue.textContent = referido.cantidad;
      bar.appendChild(barValue);
      
      // Etiqueta debajo de la barra
      const barLabel = document.createElement('div');
      barLabel.className = 'bar-label';
      barLabel.textContent = referido.nombreEmpleado;
      barLabel.title = referido.nombreEmpleado; // Para mostrar nombre completo al pasar el mouse
      
      // Agregar elementos al DOM
      barContainer.appendChild(bar);
      barContainer.appendChild(barLabel);
      chartContainer.appendChild(barContainer);
    });
  }

  // Función para exportar datos a Excel (CSV)
  window.exportarDatos = function() {
    // Primero obtenemos el resumen por empleado
    fetch('/api/referidos/cerrados')
      .then(response => response.json())
      .then(referidos => {
        if (referidos.length === 0) {
          alert('No hay datos para exportar');
          return;
        }
        
        // Luego obtenemos el detalle de los referidos cerrados
        fetch('/api/referidos/cerrados/detalle')
          .then(response => response.json())
          .then(detalles => {
            // Ordenar por cantidad (mayor a menor)
            referidos.sort((a, b) => b.cantidad - a.cantidad);
            
            // Crear contenido CSV
            let csvContent = 'RESUMEN POR EMPLEADO\n';
            csvContent += 'Empleado,Referidos Cerrados\n';
            
            referidos.forEach(referido => {
              csvContent += `${referido.nombreEmpleado},${referido.cantidad}\n`;
            });
            
            csvContent += '\nDETALLE DE REFERIDOS CERRADOS\n';
            csvContent += 'Cliente,Empleado,País,Fecha de Envío,Fecha de Cierre,Tipo\n';
            
            detalles.forEach(detalle => {
              const fechaEnvio = new Date(detalle.fechaEnvio).toLocaleDateString();
              const fechaCierre = new Date(detalle.fechaCierre).toLocaleDateString();
              const tipo = detalle.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
              
              csvContent += `${detalle.nombreCliente},${detalle.nombreEmpleado},${detalle.paisEmpleado},${fechaEnvio},${fechaCierre},${tipo}\n`;
            });
            
            // Crear fecha para el nombre del archivo
            const fecha = new Date();
            const nombreArchivo = `Referidos_${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}.csv`;
            
            // Crear y descargar el archivo
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            // Crear URL para descargar
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', nombreArchivo);
            link.style.visibility = 'hidden';
            
            // Agregar a DOM, hacer clic y eliminar
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
      })
      .catch(error => {
        console.error('Error al exportar datos:', error);
        alert('Error al exportar datos');
      });
  };
  
  // Agregar botón de exportación
  const exportarBtn = document.createElement('button');
  exportarBtn.className = 'btn';
  exportarBtn.style.marginLeft = '10px';
  exportarBtn.textContent = 'Exportar a Excel';
  exportarBtn.addEventListener('click', window.exportarDatos);
  document.querySelector('.admin-controls').appendChild(exportarBtn);
});