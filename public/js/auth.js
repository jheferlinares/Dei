document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Verificar autenticación (tanto local como producción)
    const response = await fetch('/auth/usuario-actual');
    const usuario = await response.json();
    
    if (usuario) {
      // Usuario autenticado
      mostrarInfoUsuario(usuario);
      configurarPermisos(usuario);
    } else {
      // No autenticado, redirigir a login
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error al verificar autenticación:', error);
  }
});

// Mostrar información del usuario en la interfaz
function mostrarInfoUsuario(usuario) {
  // Crear elemento para mostrar información del usuario
  const userInfoContainer = document.createElement('div');
  userInfoContainer.className = 'user-info';
  
  // Crear avatar
  const avatar = document.createElement('img');
  avatar.src = usuario.foto || 'https://via.placeholder.com/40';
  avatar.alt = 'Avatar';
  avatar.className = 'user-avatar';
  
  // Crear nombre de usuario
  const userName = document.createElement('span');
  userName.textContent = usuario.nombre;
  userName.className = 'user-name';
  
  // Crear indicador de rol
  const userRole = document.createElement('span');
  const roleText = usuario.rol === 'admin' ? 'Administrador' : 
                   usuario.rol === 'lider' ? 'Líder' : 'Usuario';
  userRole.textContent = roleText;
  userRole.className = `user-role ${usuario.rol}`;
  
  // Crear botón de cerrar sesión
  const logoutBtn = document.createElement('a');
  logoutBtn.href = '/auth/logout';
  logoutBtn.textContent = 'Cerrar sesión';
  logoutBtn.className = 'logout-btn';
  
  // Agregar elementos al contenedor
  userInfoContainer.appendChild(avatar);
  userInfoContainer.appendChild(userName);
  userInfoContainer.appendChild(userRole);
  userInfoContainer.appendChild(logoutBtn);
  
  // Agregar a la página
  document.querySelector('.container').insertBefore(
    userInfoContainer, 
    document.querySelector('.tabs')
  );
}

// Configurar permisos según el rol del usuario
function configurarPermisos(usuario) {
  const esAdmin = usuario && usuario.rol === 'admin';
  const esLider = usuario && usuario.rol === 'lider';
  
  // Variables globales para permisos
  window.esUsuarioAdmin = esAdmin;
  window.esUsuarioLider = esLider;
  
  if (esLider && !esAdmin) {
    // Líderes: Pueden agregar referidos y ver todas las gráficas (sin editar)
    
    // Ocultar botones de reinicio (no pueden editar)
    const elementosAdmin = [
      document.getElementById('reiniciarBtn'),
      document.getElementById('reiniciarAñoCorporativoBtn')
    ];
    
    elementosAdmin.forEach(elemento => {
      if (elemento) {
        elemento.style.display = 'none';
      }
    });
    
    // Agregar tab especial para líderes
    const tabsContainer = document.querySelector('.tabs');
    const liderTab = document.createElement('button');
    liderTab.className = 'tab-btn';
    liderTab.setAttribute('data-tab', 'lider-stats');
    liderTab.textContent = 'Mis Referidos';
    liderTab.addEventListener('click', () => {
      // Actualizar botones
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      liderTab.classList.add('active');
      
      // Actualizar contenido
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById('lider-stats-tab').classList.add('active');
      
      // Cargar datos
      if (window.cargarEstadisticasLider) {
        window.cargarEstadisticasLider();
      }
    });
    tabsContainer.appendChild(liderTab);
    
    // Mostrar mensaje para líderes
    const mensajeLider = document.createElement('div');
    mensajeLider.className = 'info-message lider';
    mensajeLider.textContent = 'Panel de Líder: Puedes agregar referidos y ver todas las estadísticas.';
    
    document.querySelector('.container').insertBefore(
      mensajeLider,
      document.querySelector('.tabs')
    );
    
  } else if (!esAdmin && !esLider) {
    // Usuarios normales: Solo pueden ver gráfica de referidos cerrados del mes
    const elementosOcultos = [
      document.getElementById('nuevoReferidoForm'),
      document.getElementById('reiniciarBtn'),
      document.getElementById('reiniciarAñoCorporativoBtn')
    ];
    
    elementosOcultos.forEach(elemento => {
      if (elemento) {
        elemento.style.display = 'none';
      }
    });
    
    // Ocultar TODOS los tabs excepto cerrados
    const tabsRestringidos = [
      document.querySelector('[data-tab="pendientes"]'),
      document.querySelector('[data-tab="año-corporativo"]'),
      document.querySelector('[data-tab="historial"]')
    ];
    
    tabsRestringidos.forEach(tab => {
      if (tab) {
        tab.style.display = 'none';
      }
    });
    
    // Activar tab de cerrados por defecto
    document.querySelector('[data-tab="cerrados"]').click();
    
    // Ocultar elementos innecesarios para usuarios
    setTimeout(() => {
      // Ocultar sección de búsqueda
      const searchSection = document.querySelector('#cerrados-tab .search-container');
      if (searchSection) {
        searchSection.style.display = 'none';
      }
      
      // Ocultar título y tabla de detalle
      const detalleTitle = document.querySelector('#cerrados-tab h3');
      if (detalleTitle) {
        detalleTitle.style.display = 'none';
      }
      
      // Ocultar tabla de detalle de referidos cerrados
      const tablaDetalle = document.querySelector('#cerradosDetalleBody');
      if (tablaDetalle && tablaDetalle.closest('.table-container')) {
        tablaDetalle.closest('.table-container').style.display = 'none';
      }
    }, 100);
    
    const mensajeUsuario = document.createElement('div');
    mensajeUsuario.className = 'info-message';
    mensajeUsuario.textContent = 'Usuario: Solo puedes ver las estadísticas de referidos cerrados del mes.';
    
    document.querySelector('.container').insertBefore(
      mensajeUsuario,
      document.querySelector('.tabs')
    );
  }
}