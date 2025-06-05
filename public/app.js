document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const referidoForm = document.getElementById('referidoForm');
  const nombreInput = document.getElementById('nombre');
  const cantidadInput = document.getElementById('cantidad');
  const chartContainer = document.getElementById('chartContainer');
  const referidosBody = document.getElementById('referidosBody');
  const reiniciarBtn = document.getElementById('reiniciarBtn');

  // Cargar datos iniciales
  cargarReferidos();

  // Event listeners
  referidoForm.addEventListener('submit', agregarReferido);
  reiniciarBtn.addEventListener('click', reiniciarDatos);

  // Función para cargar referidos desde el servidor
  async function cargarReferidos() {
    try {
      const response = await fetch('/api/referidos');
      const referidos = await response.json();
      actualizarUI(referidos);
    } catch (error) {
      console.error('Error al cargar referidos:', error);
    }
  }

  // Función para agregar un referido
  async function agregarReferido(e) {
    e.preventDefault();
    
    const nombre = nombreInput.value.trim();
    const cantidad = parseInt(cantidadInput.value);
    
    if (!nombre || isNaN(cantidad) || cantidad < 1) {
      alert('Por favor ingresa un nombre válido y una cantidad positiva');
      return;
    }
    
    try {
      const response = await fetch('/api/referidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, cantidad })
      });
      
      const referidos = await response.json();
      actualizarUI(referidos);
      
      // Limpiar formulario
      nombreInput.value = '';
      cantidadInput.value = '1';
    } catch (error) {
      console.error('Error al agregar referido:', error);
    }
  }

  // Función para eliminar un referido
  async function eliminarReferido(id) {
    if (!confirm('¿Estás seguro de eliminar un referido?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/referidos/${id}`, {
        method: 'DELETE'
      });
      
      const referidos = await response.json();
      actualizarUI(referidos);
    } catch (error) {
      console.error('Error al eliminar referido:', error);
    }
  }

  // Función para reiniciar todos los datos
  async function reiniciarDatos() {
    if (!confirm('¿Estás seguro de reiniciar todos los datos? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await fetch('/api/reiniciar', {
        method: 'POST'
      });
      
      cargarReferidos();
    } catch (error) {
      console.error('Error al reiniciar datos:', error);
    }
  }

  // Función para actualizar la interfaz de usuario
  function actualizarUI(referidos) {
    // Ordenar referidos por cantidad (mayor a menor)
    referidos.sort((a, b) => b.cantidad - a.cantidad);
    
    // Actualizar gráfico
    actualizarGrafico(referidos);
    
    // Actualizar tabla
    actualizarTabla(referidos);
  }

  // Función para actualizar el gráfico de barras
  function actualizarGrafico(referidos) {
    chartContainer.innerHTML = '';
    
    // Encontrar el valor máximo para escalar las barras
    const maxCantidad = referidos.length > 0 
      ? Math.max(...referidos.map(r => r.cantidad)) 
      : 0;
    
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
      const height = maxCantidad > 0 
        ? (referido.cantidad / maxCantidad) * maxHeight 
        : 0;
      
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
      barLabel.textContent = referido.nombre;
      barLabel.title = referido.nombre; // Para mostrar nombre completo al pasar el mouse
      
      // Agregar elementos al DOM
      barContainer.appendChild(bar);
      barContainer.appendChild(barLabel);
      chartContainer.appendChild(barContainer);
    });
    
    // Mensaje si no hay datos
    if (referidos.length === 0) {
      const mensaje = document.createElement('p');
      mensaje.textContent = 'No hay referidos registrados en este mes';
      mensaje.style.textAlign = 'center';
      mensaje.style.width = '100%';
      chartContainer.appendChild(mensaje);
    }
  }

  // Función para actualizar la tabla
  function actualizarTabla(referidos) {
    referidosBody.innerHTML = '';
    
    referidos.forEach(referido => {
      const row = document.createElement('tr');
      
      // Columna de nombre
      const nombreCell = document.createElement('td');
      nombreCell.textContent = referido.nombre;
      
      // Columna de cantidad
      const cantidadCell = document.createElement('td');
      cantidadCell.textContent = referido.cantidad;
      
      // Columna de acciones
      const accionesCell = document.createElement('td');
      const eliminarBtn = document.createElement('button');
      eliminarBtn.className = 'action-btn';
      eliminarBtn.textContent = 'Eliminar uno';
      eliminarBtn.addEventListener('click', () => eliminarReferido(referido.id));
      
      accionesCell.appendChild(eliminarBtn);
      
      // Agregar celdas a la fila
      row.appendChild(nombreCell);
      row.appendChild(cantidadCell);
      row.appendChild(accionesCell);
      
      // Agregar fila a la tabla
      referidosBody.appendChild(row);
    });
  }
});