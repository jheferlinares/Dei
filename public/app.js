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
  const historialResumenBody = document.getElementById('historialResumenBody');
  const historialDetalleBody = document.getElementById('historialDetalleBody');
  const chartContainer = document.getElementById('chartContainer');
  const historialChartContainer = document.getElementById('historialChartContainer');
  const reiniciarBtn = document.getElementById('reiniciarBtn');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const historialMesSelect = document.getElementById('historialMes');
  const historialAñoSelect = document.getElementById('historialAño');
  const consultarHistorialBtn = document.getElementById('consultarHistorialBtn');
  const exportarHistorialBtn = document.getElementById('exportarHistorialBtn');

  // Establecer año actual en el selector
  const añoActual = new Date().getFullYear();
  const añoOption = historialAñoSelect.querySelector(`option[value="${añoActual}"]`);
  if (añoOption) {
    añoOption.selected = true;
  }

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
  consultarHistorialBtn.addEventListener('click', consultarHistorial);
  exportarHistorialBtn.addEventListener('click', exportarHistorial);

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
    } else if (tabId === 'historial') {
      consultarHistorial();
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
      actualizarGrafico(referidos, chartContainer);
      
      // Cargar detalle de referidos cerrados
      const detalleResponse = await fetch('/api/referidos/cerrados/detalle');
      const referidosDetalle = await detalleResponse.json();
      actualizarTablaCerradosDetalle(referidosDetalle);
      
      // Cargar estadísticas generales
      const estadisticasResponse = await fetch('/api/estadisticas');
      const estadisticas = await estadisticasResponse.json();
      
      // Actualizar contadores
      document.getElementById('totalCerrados').textContent = estadisticas.totalCerrados;
      document.getElementById('totalEnviados').textContent = estadisticas.totalEnviados;
    } catch (error) {
      console.error('Error al cargar referidos cerrados:', error);
    }
  }

  // Función para consultar historial
  async function consultarHistorial() {
    const mes = historialMesSelect.value;
    const año = historialAñoSelect.value;
    
    try {
      let url = '/api/historial';
      if (mes !== '' && año !== '') {
        url += `?mes=${mes}&año=${año}`;
      } else if (año !== '') {
        url += `?año=${año}`;
      } else if (mes !== '') {
        url += `?mes=${mes}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      actualizarTablaHistorialResumen(data.resumen);
      actualizarTablaHistorialDetalle(data.detalle);
      actualizarGrafico(data.resumen, historialChartContainer);
      
      // Actualizar contador total de historial
      const totalHistorial = data.detalle.length;
      document.getElementById('totalHistorialCerrados').textContent = totalHistorial;
    } catch (error) {
      console.error('Error al consultar historial:', error);
    }
  }

  // Función para registrar un nuevo referido
  async function registrarReferido(e) {
    e.preventDefault();
    
    // Verificar si el usuario tiene permisos de administrador
    if (window.esUsuarioAdmin === false) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
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
      
      if (response.status === 403) {
        alert('No tienes permisos para realizar esta acción');
        return;
      }
      
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
    // Verificar si el usuario tiene permisos de administrador
    if (window.esUsuarioAdmin === false) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    // Pedir el nombre del cerrador
    const nombreCerrador = prompt('Ingrese el nombre de quien cerró el referido:');
    if (!nombreCerrador) {
      return; // Cancelado por el usuario
    }
    
    // Pedir el nombre de la compañía
    const nombreCompania = prompt('Ingrese el nombre de la compañía:');
    if (nombreCompania === null) {
      return; // Cancelado por el usuario
    }
    
    if (!confirm('¿Confirmar que este referido ha sido cerrado?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/referidos/${id}/cerrar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombreCerrador, nombreCompania })
      });
      
      const referidos = await response.json();
      actualizarTablaPendientes(referidos);
      cargarReferidosCerrados();
      
      alert('Referido marcado como cerrado correctamente');
    } catch (error) {
      console.error('Error al cerrar referido:', error);
      if (error.status === 403) {
        alert('No tienes permisos para realizar esta acción');
      }
    }
  }

  // Función para eliminar un referido
  async function eliminarReferido(id) {
    // Verificar si el usuario tiene permisos de administrador
    if (window.esUsuarioAdmin === false) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
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
      if (error.status === 403) {
        alert('No tienes permisos para realizar esta acción');
      }
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
    // Verificar si el usuario tiene permisos de administrador
    if (window.esUsuarioAdmin === false) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    if (!confirm('¿Estás seguro de reiniciar los datos de referidos cerrados? Los datos se guardarán en el historial.')) {
      return;
    }
    
    try {
      await fetch('/api/reiniciar', {
        method: 'POST'
      });
      
      cargarReferidosCerrados();
      
      alert('Datos de referidos cerrados reiniciados correctamente y guardados en historial');
    } catch (error) {
      console.error('Error al reiniciar datos:', error);
      if (error.status === 403) {
        alert('No tienes permisos para realizar esta acción');
      }
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
      
      // Solo mostrar botones de acción si el usuario es administrador
      if (window.esUsuarioAdmin !== false) {
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
      } else {
        accionesCell.textContent = 'No disponible';
        accionesCell.style.color = '#999';
        accionesCell.style.fontStyle = 'italic';
      }
      
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
      cell.colSpan = 7; // Aumentado a 7 para incluir la columna del cerrador y compañía
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
      fechaCierreCell.textContent = referido.fechaCierre ? new Date(referido.fechaCierre).toLocaleDateString() : 'N/A';
      
      // Columna de cerrador
      const cerradorCell = document.createElement('td');
      cerradorCell.textContent = referido.nombreCerrador || 'No especificado';
      
      // Columna de compañía
      const companiaCell = document.createElement('td');
      companiaCell.textContent = referido.nombreCompania || 'No especificada';
      
      // Columna de tipo
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      // Agregar celdas a la fila
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(fechaEnvioCell);
      row.appendChild(fechaCierreCell);
      row.appendChild(cerradorCell);
      row.appendChild(companiaCell);
      row.appendChild(tipoCell);
      
      // Agregar fila a la tabla
      cerradosDetalleBody.appendChild(row);
    });
  }
  
  // Función para actualizar la tabla de resumen del historial
  function actualizarTablaHistorialResumen(referidos) {
    historialResumenBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 2;
      cell.textContent = 'No hay datos históricos para el período seleccionado';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      historialResumenBody.appendChild(row);
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
      historialResumenBody.appendChild(row);
    });
  }
  
  // Función para actualizar la tabla de detalle del historial
  function actualizarTablaHistorialDetalle(referidos) {
    historialDetalleBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 7; // Aumentado a 7 para incluir la columna del cerrador y compañía
      cell.textContent = 'No hay datos históricos para el período seleccionado';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      historialDetalleBody.appendChild(row);
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
      
      // Columna de cerrador
      const cerradorCell = document.createElement('td');
      cerradorCell.textContent = referido.nombreCerrador || 'No especificado';
      
      // Columna de compañía
      const companiaCell = document.createElement('td');
      companiaCell.textContent = referido.nombreCompania || 'No especificada';
      
      // Columna de tipo
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      // Agregar celdas a la fila
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(fechaEnvioCell);
      row.appendChild(fechaCierreCell);
      row.appendChild(cerradorCell);
      row.appendChild(companiaCell);
      row.appendChild(tipoCell);
      
      // Agregar fila a la tabla
      historialDetalleBody.appendChild(row);
    });
  }

  // Función para actualizar el gráfico
  function actualizarGrafico(referidos, container) {
    container.innerHTML = '';
    
    if (referidos.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'No hay datos para mostrar';
      mensaje.style.textAlign = 'center';
      mensaje.style.width = '100%';
      container.appendChild(mensaje);
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
      container.appendChild(barContainer);
    });
  }

  // Función para exportar datos actuales a Excel
  function exportarDatos() {
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
            csvContent += 'Cliente,Empleado,País,Fecha de Envío,Fecha de Cierre,Cerrado por,Compañía,Tipo\n';
            
            detalles.forEach(detalle => {
              const fechaEnvio = new Date(detalle.fechaEnvio).toLocaleDateString();
              const fechaCierre = detalle.fechaCierre ? new Date(detalle.fechaCierre).toLocaleDateString() : 'N/A';
              const tipo = detalle.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
              const pais = detalle.paisEmpleado || '';
              const cerrador = detalle.nombreCerrador || 'No especificado';
              const compania = detalle.nombreCompania || 'No especificada';
              
              csvContent += `${detalle.nombreCliente},${detalle.nombreEmpleado},${pais},${fechaEnvio},${fechaCierre},${cerrador},${compania},${tipo}\n`;
            });
            
            // Crear fecha para el nombre del archivo
            const fecha = new Date();
            const nombreArchivo = `Referidos_${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}.csv`;
            
            // Crear y descargar el archivo
            descargarCSV(csvContent, nombreArchivo);
          });
      })
      .catch(error => {
        console.error('Error al exportar datos:', error);
        alert('Error al exportar datos');
      });
  }
  
  // Función para exportar datos históricos
  function exportarHistorial() {
    const mes = historialMesSelect.value;
    const año = historialAñoSelect.value;
    
    let url = '/api/historial';
    if (mes !== '' && año !== '') {
      url += `?mes=${mes}&año=${año}`;
    } else if (año !== '') {
      url += `?año=${año}`;
    } else if (mes !== '') {
      url += `?mes=${mes}`;
    }
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.detalle.length === 0) {
          alert('No hay datos históricos para exportar');
          return;
        }
        
        // Crear contenido CSV
        let csvContent = 'HISTORIAL DE REFERIDOS\n';
        
        // Información del período
        let periodoTexto = 'Período: ';
        if (mes !== '') {
          const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
          periodoTexto += meses[parseInt(mes)];
        } else {
          periodoTexto += 'Todos los meses';
        }
        
        if (año !== '') {
          periodoTexto += ` ${año}`;
        } else {
          periodoTexto += ', Todos los años';
        }
        
        csvContent += `${periodoTexto}\n\n`;
        
        // Resumen por empleado
        csvContent += 'RESUMEN POR EMPLEADO\n';
        csvContent += 'Empleado,Referidos Cerrados\n';
        
        data.resumen.sort((a, b) => b.cantidad - a.cantidad);
        data.resumen.forEach(referido => {
          csvContent += `${referido.nombreEmpleado},${referido.cantidad}\n`;
        });
        
        // Detalle de referidos
        csvContent += '\nDETALLE DE REFERIDOS\n';
        csvContent += 'Cliente,Empleado,País,Fecha de Envío,Fecha de Cierre,Cerrado por,Compañía,Tipo\n';
        
        data.detalle.forEach(detalle => {
          const fechaEnvio = new Date(detalle.fechaEnvio).toLocaleDateString();
          const fechaCierre = new Date(detalle.fechaCierre).toLocaleDateString();
          const tipo = detalle.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
          const cerrador = detalle.nombreCerrador || 'No especificado';
          const compania = detalle.nombreCompania || 'No especificada';
          
          csvContent += `${detalle.nombreCliente},${detalle.nombreEmpleado},${detalle.paisEmpleado},${fechaEnvio},${fechaCierre},${cerrador},${compania},${tipo}\n`;
        });
        
        // Crear nombre del archivo
        let nombreArchivo = 'Historial_Referidos';
        if (mes !== '') {
          nombreArchivo += `_Mes-${parseInt(mes) + 1}`;
        }
        if (año !== '') {
          nombreArchivo += `_${año}`;
        }
        nombreArchivo += '.csv';
        
        // Crear y descargar el archivo
        descargarCSV(csvContent, nombreArchivo);
      })
      .catch(error => {
        console.error('Error al exportar historial:', error);
        alert('Error al exportar historial');
      });
  }
  
  // Función auxiliar para descargar CSV
  function descargarCSV(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
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
  }
  
  // Agregar botón de exportación
  const exportarBtn = document.createElement('button');
  exportarBtn.className = 'btn';
  exportarBtn.style.marginLeft = '10px';
  exportarBtn.textContent = 'Exportar a Excel';
  exportarBtn.addEventListener('click', exportarDatos);
  document.querySelector('.admin-controls').appendChild(exportarBtn);
});