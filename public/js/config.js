document.addEventListener('DOMContentLoaded', () => {
  // Referencias a elementos del DOM
  const nombreMesActualSpan = document.getElementById('nombreMesActual');
  const editarMesBtn = document.getElementById('editarMesBtn');
  const editarMesModal = document.getElementById('editarMesModal');
  const nombreMesInput = document.getElementById('nombreMesInput');
  const guardarMesBtn = document.getElementById('guardarMesBtn');
  const cancelarMesBtn = document.getElementById('cancelarMesBtn');
  const closeModalBtn = document.querySelector('.close-modal');
  
  // Cargar configuración inicial
  cargarConfiguracion();
  
  // Event listeners
  if (editarMesBtn) {
    editarMesBtn.addEventListener('click', abrirModalEditarMes);
  }
  
  if (guardarMesBtn) {
    guardarMesBtn.addEventListener('click', guardarNombreMes);
  }
  
  if (cancelarMesBtn) {
    cancelarMesBtn.addEventListener('click', cerrarModal);
  }
  
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', cerrarModal);
  }
  
  // Cerrar modal al hacer clic fuera de él
  window.addEventListener('click', (e) => {
    if (e.target === editarMesModal) {
      cerrarModal();
    }
  });
  
  // Función para cargar la configuración
  async function cargarConfiguracion() {
    try {
      const response = await fetch('/api/configuracion');
      const config = await response.json();
      
      if (nombreMesActualSpan) {
        nombreMesActualSpan.textContent = config.nombreMesActual || 'Mes';
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  }
  
  // Función para abrir el modal de editar mes
  function abrirModalEditarMes() {
    // Verificar si el usuario tiene permisos de administrador
    if (window.esUsuarioAdmin === false) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }
    
    if (editarMesModal && nombreMesInput && nombreMesActualSpan) {
      nombreMesInput.value = nombreMesActualSpan.textContent;
      editarMesModal.style.display = 'block';
    }
  }
  
  // Función para guardar el nombre del mes
  async function guardarNombreMes() {
    const nuevoNombre = nombreMesInput.value.trim();
    
    if (!nuevoNombre) {
      alert('Por favor ingresa un nombre para el mes');
      return;
    }
    
    try {
      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombreMesActual: nuevoNombre
        })
      });
      
      if (response.status === 403) {
        alert('No tienes permisos para realizar esta acción');
        return;
      }
      
      const config = await response.json();
      
      if (nombreMesActualSpan) {
        nombreMesActualSpan.textContent = config.nombreMesActual;
      }
      
      cerrarModal();
      alert('Nombre del mes actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar nombre del mes:', error);
      alert('Error al guardar nombre del mes');
    }
  }
  
  // Función para cerrar el modal
  function cerrarModal() {
    if (editarMesModal) {
      editarMesModal.style.display = 'none';
    }
  }
});