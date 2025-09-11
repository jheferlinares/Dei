// Función auxiliar para obtener nombre legible del producto
function obtenerNombreProducto(tipo) {
  const productos = {
    'vida': 'Vida',
    'casa': 'Casa',
    'auto': 'Auto',
    'comercial': 'Comercial',
    'salud': 'Salud',
    'concurso': 'Concurso (Casa, Auto, Comercial)'
  };
  return productos[tipo] || tipo || 'Vida';
}

document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const nuevoReferidoForm = document.getElementById('nuevoReferidoForm');
  const nombreClienteInput = document.getElementById('nombreCliente');
  const nombreEmpleadoInput = document.getElementById('nombreEmpleado');
  const paisEmpleadoInput = document.getElementById('paisEmpleado');
  const nombreSupervisorInput = document.getElementById('nombreSupervisor');
  const tipoProductoSelect = document.getElementById('tipoProducto');
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
  const historialTrimestreSelect = document.getElementById('historialTrimestre');
  const consultarHistorialBtn = document.getElementById('consultarHistorialBtn');
  const exportarHistorialBtn = document.getElementById('exportarHistorialBtn');
  const corporativoCerradosBody = document.getElementById('corporativoCerradosBody');
  const filtroMesSelect = document.getElementById('filtroMes');
  const corporativoChartContainer = document.getElementById('corporativoChartContainer');
  const reiniciarAñoCorporativoBtn = document.getElementById('reiniciarAñoCorporativoBtn');
  const liderStatsBody = document.getElementById('liderStatsBody');
  const liderChartContainer = document.getElementById('liderChartContainer');
  
  // Referencias para búsquedas
  const searchCerradosInput = document.getElementById('searchCerradosInput');
  const searchCerradosBtn = document.getElementById('searchCerradosBtn');
  const clearCerradosBtn = document.getElementById('clearCerradosBtn');
  const searchCorporativoInput = document.getElementById('searchCorporativoInput');
  const searchCorporativoBtn = document.getElementById('searchCorporativoBtn');
  const clearCorporativoBtn = document.getElementById('clearCorporativoBtn');
  const searchHistorialInput = document.getElementById('searchHistorialInput');
  const searchHistorialBtn = document.getElementById('searchHistorialBtn');
  const clearHistorialBtn = document.getElementById('clearHistorialBtn');

  
  // Establecer año actual en el selector
  const añoActual = new Date().getFullYear();
  const añoOption = historialAñoSelect.querySelector(`option[value="${añoActual}"]`);
  if (añoOption) {
    añoOption.selected = true;
  }

  // Cargar datos iniciales
  cargarReferidosPendientes();
  cargarReferidosCerrados();
  cargarAñoCorporativo();

  // Event listeners
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => cambiarTab(btn.dataset.tab));
  });
  

  
  nuevoReferidoForm.addEventListener('submit', registrarReferido);
  
  // Función para cargar mis referidos (estadísticas por líder)
  async function cargarMisReferidos() {
    try {
      const response = await fetch('/api/referidos/por-lider');
      const referidos = await response.json();
      
      actualizarTablaMisReferidos(referidos);
      actualizarGrafico(referidos, document.getElementById('misReferidosChartContainer'));
    } catch (error) {
      console.error('Error al cargar mis referidos:', error);
    }
  }
  
  // Función para actualizar tabla de mis referidos
  function actualizarTablaMisReferidos(referidos) {
    const misReferidosBody = document.getElementById('misReferidosBody');
    misReferidosBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 2;
      cell.textContent = 'No hay referidos por líder';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      misReferidosBody.appendChild(row);
      return;
    }
    
    referidos.sort((a, b) => b.cantidad - a.cantidad);
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      const liderCell = document.createElement('td');
      liderCell.textContent = referido.nombreEmpleado;
      
      const cantidadCell = document.createElement('td');
      cantidadCell.textContent = referido.cantidad;
      
      row.appendChild(liderCell);
      row.appendChild(cantidadCell);
      misReferidosBody.appendChild(row);
    });
  }
  reiniciarBtn.addEventListener('click', reiniciarDatos);
  searchBtn.addEventListener('click', buscarReferidos);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      buscarReferidos();
    }
  });
  
  // Event listeners para Enter en búsquedas (con verificación)
  if (searchCerradosInput) {
    searchCerradosInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        buscarCerrados();
      }
    });
  }
  if (searchCorporativoInput) {
    searchCorporativoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        buscarCorporativo();
      }
    });
  }
  if (searchHistorialInput) {
    searchHistorialInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        buscarHistorial();
      }
    });
  }
  consultarHistorialBtn.addEventListener('click', consultarHistorial);
  exportarHistorialBtn.addEventListener('click', exportarHistorial);
  reiniciarAñoCorporativoBtn.addEventListener('click', reiniciarAñoCorporativo);
  
  // Event listeners para búsquedas (con verificación de existencia)
  if (searchCerradosBtn) {
    searchCerradosBtn.addEventListener('click', buscarCerrados);
  }
  if (clearCerradosBtn) {
    clearCerradosBtn.addEventListener('click', () => {
      searchCerradosInput.value = '';
      cargarReferidosCerrados();
    });
  }
  if (searchCorporativoBtn) {
    searchCorporativoBtn.addEventListener('click', buscarCorporativo);
  }
  if (clearCorporativoBtn) {
    clearCorporativoBtn.addEventListener('click', () => {
      searchCorporativoInput.value = '';
      cargarAñoCorporativo();
    });
  }
  if (searchHistorialBtn) {
    searchHistorialBtn.addEventListener('click', buscarHistorial);
  }
  if (clearHistorialBtn) {
    clearHistorialBtn.addEventListener('click', () => {
      searchHistorialInput.value = '';
      consultarHistorial();
    });
  }
  
  // Event listener para filtro de mes
  if (filtroMesSelect) {
    filtroMesSelect.addEventListener('change', cargarReferidosCerrados);
  }

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
    } else if (tabId === 'año-corporativo') {
      cargarAñoCorporativo();
    } else if (tabId === 'historial') {
      consultarHistorial();
    } else if (tabId === 'lider-stats') {
      cargarEstadisticasLider();
    } else if (tabId === 'mis-referidos') {
      cargarMisReferidos();
    }
  }

  // Función para cargar referidos pendientes
  async function cargarReferidosPendientes() {
    try {
      // Obtener el tipo de producto seleccionado (si existe el selector)
      const tipoProductoSelect = document.getElementById('filtroTipoProducto');
      const tipoProducto = tipoProductoSelect ? tipoProductoSelect.value : 'todos';
      
      const response = await fetch(`/api/referidos/pendientes?tipoProducto=${tipoProducto}`);
      const referidos = await response.json();
      actualizarTablaPendientes(referidos);
    } catch (error) {
      console.error('Error al cargar referidos pendientes:', error);
    }
  }

  // Función para cargar referidos cerrados
  async function cargarReferidosCerrados() {
    try {
      // Obtener filtros
      const tipoProductoSelect = document.getElementById('filtroTipoProducto');
      const tipoProducto = tipoProductoSelect ? tipoProductoSelect.value : 'todos';
      const mesSeleccionado = filtroMesSelect ? filtroMesSelect.value : '';
      
      // Construir URL con filtros
      let url = `/api/referidos/cerrados?tipoProducto=${tipoProducto}`;
      if (mesSeleccionado) {
        url += `&mes=${mesSeleccionado}`;
      }
      
      // Cargar resumen para el gráfico
      const response = await fetch(url);
      const referidos = await response.json();
      actualizarTablaCerrados(referidos);
      actualizarGrafico(referidos, chartContainer);
      
      // Cargar detalle de referidos cerrados
      const detalleResponse = await fetch(`/api/referidos/cerrados/detalle?tipoProducto=${tipoProducto}`);
      const referidosDetalle = await detalleResponse.json();
      actualizarTablaCerradosDetalle(referidosDetalle);
      
      // Cargar estadísticas generales
      const estadisticasResponse = await fetch(`/api/estadisticas?tipoProducto=${tipoProducto}`);
      const estadisticas = await estadisticasResponse.json();
      
      // Actualizar contadores
      document.getElementById('totalCerrados').textContent = estadisticas.totalCerrados;
      document.getElementById('totalEnviados').textContent = estadisticas.totalEnviados;
      
      // Obtener el nombre del mes actual
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const fechaActual = new Date();
      const mesActual = meses[fechaActual.getMonth()];
      const añoActual = fechaActual.getFullYear();
      
      // Actualizar título con el mes actual y el tipo de producto
      const nombreProducto = obtenerNombreProducto(tipoProducto);
      const tituloProducto = tipoProducto === 'todos' ? '' : ` - ${nombreProducto}`;
      document.getElementById('nombreMesActual').textContent = `${mesActual} ${añoActual}${tituloProducto}`;
      
      // Intentar cargar configuración personalizada del mes
      try {
        const configResponse = await fetch('/api/configuracion/mes-actual');
        const config = await configResponse.json();
        if (config && config.nombreMes) {
          document.getElementById('nombreMesActual').textContent = `${config.nombreMes}${tituloProducto}`;
        }
      } catch (configError) {
        console.log('No se encontró configuración personalizada del mes');
      }
    } catch (error) {
      console.error('Error al cargar referidos cerrados:', error);
    }
  }

  // Función para cargar estadísticas por líder
  window.cargarEstadisticasLider = async function() {
    try {
      const response = await fetch('/api/referidos/por-lider');
      const referidos = await response.json();
      
      actualizarTablaLider(referidos);
      actualizarGrafico(referidos, liderChartContainer);
    } catch (error) {
      console.error('Error al cargar estadísticas por líder:', error);
    }
  }

  // Función para actualizar tabla de líderes
  function actualizarTablaLider(referidos) {
    liderStatsBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 2;
      cell.textContent = 'No hay referidos por líder';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      liderStatsBody.appendChild(row);
      return;
    }
    
    referidos.sort((a, b) => b.cantidad - a.cantidad);
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      const liderCell = document.createElement('td');
      liderCell.textContent = referido.nombreEmpleado; // Usa nombreEmpleado que contiene el nombre del líder
      
      const cantidadCell = document.createElement('td');
      cantidadCell.textContent = referido.cantidad;
      
      row.appendChild(liderCell);
      row.appendChild(cantidadCell);
      liderStatsBody.appendChild(row);
    });
  }

  // Función para cargar año corporativo
  async function cargarAñoCorporativo() {
    try {
      console.log('Cargando datos del año corporativo...');
      
      // Cargar referidos cerrados del año corporativo
      const response = await fetch('/api/ano-corporativo/cerrados');
      const referidos = await response.json();
      console.log('Referidos del año corporativo recibidos:', referidos);
      
      actualizarTablaCorporativo(referidos);
      actualizarGrafico(referidos, corporativoChartContainer);
      
      // Cargar estadísticas del año corporativo
      const estadisticasResponse = await fetch('/api/ano-corporativo/estadisticas');
      const estadisticas = await estadisticasResponse.json();
      console.log('Estadísticas del año corporativo:', estadisticas);
      
      // Actualizar contador (solo cerrados para el concurso)
      document.getElementById('totalCorporativoCerrados').textContent = estadisticas.totalCerrados;
    } catch (error) {
      console.error('Error al cargar año corporativo:', error);
    }
  }

  // Función para reiniciar año corporativo
  async function reiniciarAñoCorporativo() {
    // Verificar si el usuario tiene permisos de administrador
    if (window.esUsuarioAdmin === false) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    if (!confirm('¿Estás seguro de reiniciar el año corporativo? Esta acción eliminará todos los referidos del año corporativo.')) {
      return;
    }
    
    try {
      const response = await fetch('/api/ano-corporativo/reiniciar', {
        method: 'POST'
      });
      
      const resultado = await response.json();
      alert(resultado.mensaje);
      cargarAñoCorporativo();
    } catch (error) {
      console.error('Error al reiniciar año corporativo:', error);
      alert('Error al reiniciar año corporativo');
    }
  }

  // Función para actualizar la tabla del año corporativo
  function actualizarTablaCorporativo(referidos) {
    corporativoCerradosBody.innerHTML = '';
    
    if (referidos.length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 2;
      cell.textContent = 'No hay referidos cerrados en el año corporativo';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      corporativoCerradosBody.appendChild(row);
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
      corporativoCerradosBody.appendChild(row);
    });
  }

  // Función para consultar historial
  async function consultarHistorial() {
    const mes = historialMesSelect.value;
    const año = historialAñoSelect.value;
    const trimestre = historialTrimestreSelect.value;
    
    try {
      let url = '/api/historial';
      const params = new URLSearchParams();
      
      if (mes) params.append('mes', mes);
      if (año) params.append('año', año);
      if (trimestre) params.append('trimestre', trimestre);
      
      if (params.toString()) {
        url += '?' + params.toString();
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
    
    // Verificar si el usuario tiene permisos de administrador o líder
    if (window.esUsuarioAdmin === false && window.esUsuarioLider !== true) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    const numeroCliente = document.getElementById('numeroCliente').value.trim();
    const nombreCliente = nombreClienteInput.value.trim();
    const nombreEmpleado = nombreEmpleadoInput.value.trim();
    const paisEmpleado = paisEmpleadoInput.value.trim();
    const nombreLider = document.getElementById('nombreLider').value.trim();
    const tipoEnvio = document.querySelector('input[name="tipoEnvio"]:checked').value;
    const tipoProducto = document.getElementById('tipoProducto').value;

    if (!numeroCliente || !nombreCliente || !nombreEmpleado || !paisEmpleado || !nombreLider) {
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
          numeroCliente,
          nombreCliente,
          nombreEmpleado,
          paisEmpleado,
          nombreLider,
          tipoEnvio,
          tipoProducto
        })
      });
      
      if (response.status === 403) {
        alert('No tienes permisos para realizar esta acción');
        return;
      }
      
      if (response.status === 201 || response.ok) {
        const referidos = await response.json();
        actualizarTablaPendientes(referidos);
        
        // Limpiar formulario
        document.getElementById('numeroCliente').value = '';
        nombreClienteInput.value = '';
        nombreEmpleadoInput.value = '';
        paisEmpleadoInput.value = '';
        document.getElementById('nombreLider').value = '';
        document.querySelector('input[value="linea"]').checked = true;
        
        alert('Referido registrado correctamente');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'Error al registrar referido'));
      }
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

  // Función para buscar en referidos cerrados
  async function buscarCerrados() {
    const termino = searchCerradosInput.value.trim();
    console.log('Buscando en cerrados:', termino);
    
    if (!termino) {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }
    
    try {
      const response = await fetch(`/api/referidos/cerrados/buscar?termino=${encodeURIComponent(termino)}`);
      const data = await response.json();
      console.log('Resultados cerrados:', data);
      
      actualizarTablaCerrados(data.resumen);
      actualizarGrafico(data.resumen, chartContainer);
      actualizarTablaCerradosDetalle(data.detalle);
      
      if (data.detalle.length === 0) {
        alert('No se encontraron referidos cerrados con ese término');
      }
    } catch (error) {
      console.error('Error al buscar referidos cerrados:', error);
    }
  }

  // Función para buscar en año corporativo
  async function buscarCorporativo() {
    const termino = searchCorporativoInput.value.trim();
    console.log('Buscando en corporativo:', termino);
    
    if (!termino) {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }
    
    try {
      const response = await fetch(`/api/ano-corporativo/buscar?termino=${encodeURIComponent(termino)}`);
      const referidos = await response.json();
      console.log('Resultados corporativo:', referidos);
      
      actualizarTablaCorporativo(referidos);
      actualizarGrafico(referidos, corporativoChartContainer);
      
      if (referidos.length === 0) {
        alert('No se encontraron referidos corporativos con ese término');
      }
    } catch (error) {
      console.error('Error al buscar en año corporativo:', error);
    }
  }

  // Función para buscar en historial
  async function buscarHistorial() {
    const termino = searchHistorialInput.value.trim();
    console.log('Buscando en historial:', termino);
    
    if (!termino) {
      alert('Por favor ingresa un término de búsqueda');
      return;
    }
    
    try {
      const response = await fetch(`/api/historial/buscar?termino=${encodeURIComponent(termino)}`);
      const data = await response.json();
      console.log('Resultados historial:', data);
      
      actualizarTablaHistorialResumen(data.resumen);
      actualizarTablaHistorialDetalle(data.detalle);
      actualizarGrafico(data.resumen, historialChartContainer);
      
      document.getElementById('totalHistorialCerrados').textContent = data.detalle.length;
      
      if (data.detalle.length === 0) {
        alert('No se encontraron referidos históricos con ese término');
      }
    } catch (error) {
      console.error('Error al buscar en historial:', error);
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
      cell.colSpan = 9; // Aumentado a 9 para incluir número
      cell.textContent = 'No hay referidos pendientes';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      pendientesBody.appendChild(row);
      return;
    }
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      // Columna de número
      const numeroCell = document.createElement('td');
      numeroCell.textContent = referido.numeroCliente || 'N/A';
      
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
      const liderCell = document.createElement('td');
      liderCell.textContent = referido.nombreLider || referido.nombreSupervisor || 'No especificado';
      
      // Columna de fecha
      const fechaCell = document.createElement('td');
      fechaCell.textContent = new Date(referido.fechaEnvio).toLocaleDateString();
      
      // Columna de tipo
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      // Columna de producto
      const productoCell = document.createElement('td');
      productoCell.textContent = obtenerNombreProducto(referido.tipoProducto);
      
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
      row.appendChild(numeroCell);
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(paisCell);
      row.appendChild(liderCell);
      row.appendChild(fechaCell);
      row.appendChild(tipoCell);
      row.appendChild(productoCell);
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
      cell.colSpan = 9;
      cell.textContent = 'No hay referidos cerrados en este mes';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      cerradosDetalleBody.appendChild(row);
      return;
    }
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      const clienteCell = document.createElement('td');
      clienteCell.textContent = referido.nombreCliente;
      
      const empleadoCell = document.createElement('td');
      empleadoCell.textContent = referido.nombreEmpleado;
      
      const supervisorCell = document.createElement('td');
      supervisorCell.textContent = referido.nombreLider || referido.nombreSupervisor || 'No especificado';
      
      const fechaEnvioCell = document.createElement('td');
      fechaEnvioCell.textContent = new Date(referido.fechaEnvio).toLocaleDateString();
      
      const fechaCierreCell = document.createElement('td');
      fechaCierreCell.textContent = referido.fechaCierre ? new Date(referido.fechaCierre).toLocaleDateString() : 'N/A';
      
      const cerradorCell = document.createElement('td');
      cerradorCell.textContent = referido.nombreCerrador || 'No especificado';
      
      const companiaCell = document.createElement('td');
      companiaCell.textContent = referido.nombreCompania || 'No especificada';
      
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      const productoCell = document.createElement('td');
      productoCell.textContent = obtenerNombreProducto(referido.tipoProducto);
      
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(supervisorCell);
      row.appendChild(fechaEnvioCell);
      row.appendChild(fechaCierreCell);
      row.appendChild(cerradorCell);
      row.appendChild(companiaCell);
      row.appendChild(tipoCell);
      row.appendChild(productoCell);
      
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
      cell.colSpan = 9;
      cell.textContent = 'No hay datos históricos para el período seleccionado';
      cell.style.textAlign = 'center';
      row.appendChild(cell);
      historialDetalleBody.appendChild(row);
      return;
    }
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      const clienteCell = document.createElement('td');
      clienteCell.textContent = referido.nombreCliente;
      
      const empleadoCell = document.createElement('td');
      empleadoCell.textContent = referido.nombreEmpleado;
      
      const supervisorCell = document.createElement('td');
      supervisorCell.textContent = referido.nombreLider || referido.nombreSupervisor || 'No especificado';
      
      const fechaEnvioCell = document.createElement('td');
      fechaEnvioCell.textContent = new Date(referido.fechaEnvio).toLocaleDateString();
      
      const fechaCierreCell = document.createElement('td');
      fechaCierreCell.textContent = new Date(referido.fechaCierre).toLocaleDateString();
      
      const cerradorCell = document.createElement('td');
      cerradorCell.textContent = referido.nombreCerrador || 'No especificado';
      
      const companiaCell = document.createElement('td');
      companiaCell.textContent = referido.nombreCompania || 'No especificada';
      
      const tipoCell = document.createElement('td');
      tipoCell.textContent = referido.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
      
      const productoCell = document.createElement('td');
      productoCell.textContent = obtenerNombreProducto(referido.tipoProducto);
      
      row.appendChild(clienteCell);
      row.appendChild(empleadoCell);
      row.appendChild(supervisorCell);
      row.appendChild(fechaEnvioCell);
      row.appendChild(fechaCierreCell);
      row.appendChild(cerradorCell);
      row.appendChild(companiaCell);
      row.appendChild(tipoCell);
      row.appendChild(productoCell);
      
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
    
    // Usar colores aleatorios para todas las barras
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
      
      // Generar un color aleatorio para cada barra
      const hue = Math.floor(Math.random() * 360);
      const saturation = 70 + Math.floor(Math.random() * 20); // Entre 70% y 90%
      const lightness = 50 + Math.floor(Math.random() * 20); // Entre 50% y 70%
      bar.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
      // Valor en la parte superior de la barra
      const barValue = document.createElement('div');
      barValue.className = 'bar-value';
      barValue.textContent = referido.cantidad;
      bar.appendChild(barValue);
      
      // Etiqueta debajo de la barra
      const barLabel = document.createElement('div');
      barLabel.className = 'bar-label';
      
      // Usar nombre completo
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
    // Obtener el tipo de producto seleccionado
    const tipoProductoSelect = document.getElementById('filtroTipoProducto');
    const tipoProducto = tipoProductoSelect ? tipoProductoSelect.value : 'todos';
    
    // Primero obtenemos el resumen por empleado
    fetch(`/api/referidos/cerrados?tipoProducto=${tipoProducto}`)
      .then(response => response.json())
      .then(referidos => {
        if (referidos.length === 0) {
          alert('No hay datos para exportar');
          return;
        }
        
        // Luego obtenemos el detalle de los referidos cerrados
        fetch(`/api/referidos/cerrados/detalle?tipoProducto=${tipoProducto}`)
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
            csvContent += 'Cliente,Empleado,País,Fecha de Envío,Fecha de Cierre,Cerrado por,Compañía,Tipo,Producto\n';
            
            detalles.forEach(detalle => {
              const fechaEnvio = new Date(detalle.fechaEnvio).toLocaleDateString();
              const fechaCierre = detalle.fechaCierre ? new Date(detalle.fechaCierre).toLocaleDateString() : 'N/A';
              const tipo = detalle.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
              const pais = detalle.paisEmpleado || '';
              const cerrador = detalle.nombreCerrador || 'No especificado';
              const compania = detalle.nombreCompania || 'No especificada';
              const producto = obtenerNombreProducto(detalle.tipoProducto);
              
              csvContent += `${detalle.nombreCliente},${detalle.nombreEmpleado},${pais},${fechaEnvio},${fechaCierre},${cerrador},${compania},${tipo},${producto}\n`;
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
        csvContent += 'Cliente,Empleado,País,Fecha de Envío,Fecha de Cierre,Cerrado por,Compañía,Tipo,Producto\n';
        
        data.detalle.forEach(detalle => {
          const fechaEnvio = new Date(detalle.fechaEnvio).toLocaleDateString();
          const fechaCierre = new Date(detalle.fechaCierre).toLocaleDateString();
          const tipo = detalle.tipoEnvio === 'linea' ? 'En Línea' : 'Callback';
          const cerrador = detalle.nombreCerrador || 'No especificado';
          const compania = detalle.nombreCompania || 'No especificada';
          const producto = obtenerNombreProducto(detalle.tipoProducto);
          
          csvContent += `${detalle.nombreCliente},${detalle.nombreEmpleado},${detalle.paisEmpleado},${fechaEnvio},${fechaCierre},${cerrador},${compania},${tipo},${producto}\n`;
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
  
  // Crear selector de tipo de producto para filtrar
  const filtroContainer = document.createElement('div');
  filtroContainer.className = 'filtro-container';
  filtroContainer.style.display = 'inline-block';
  filtroContainer.style.marginRight = '10px';
  
  const filtroLabel = document.createElement('label');
  filtroLabel.textContent = 'Filtrar por producto: ';
  filtroLabel.style.marginRight = '5px';
  
  const filtroSelect = document.createElement('select');
  filtroSelect.id = 'filtroTipoProducto';
  filtroSelect.style.padding = '5px';
  filtroSelect.style.borderRadius = '4px';
  
  // Opciones del selector
  const opciones = [
    { value: 'todos', text: 'Todos los productos' },
    { value: 'vida', text: 'Vida' },
    { value: 'concurso', text: 'Concurso (Casa, Auto, Comercial)' },
    { value: 'salud', text: 'Salud' }
    // Opciones individuales comentadas para posible uso futuro
    // { value: 'casa', text: 'Casa' },
    // { value: 'auto', text: 'Auto' },
    // { value: 'comercial', text: 'Comercial' },
  ];
  
  opciones.forEach(opcion => {
    const option = document.createElement('option');
    option.value = opcion.value;
    option.textContent = opcion.text;
    filtroSelect.appendChild(option);
  });
  
  // Evento de cambio
  filtroSelect.addEventListener('change', cargarReferidosCerrados);
  
  filtroContainer.appendChild(filtroLabel);
  filtroContainer.appendChild(filtroSelect);
  
  // Agregar selector y botón de exportación
  const adminControls = document.querySelector('.admin-controls');
  adminControls.appendChild(filtroContainer);
  
  const exportarBtn = document.createElement('button');
  exportarBtn.className = 'btn';
  exportarBtn.style.marginLeft = '10px';
  exportarBtn.textContent = 'Exportar a Excel';
  exportarBtn.addEventListener('click', exportarDatos);
  adminControls.appendChild(exportarBtn);
});