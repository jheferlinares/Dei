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
    // Líderes: Solo pueden ver referidos pendientes
    
    // Ocultar TODOS los tabs excepto pendientes
    const tabsRestringidos = [
      document.querySelector('[data-tab="cerrados"]'),
      document.querySelector('[data-tab="año-corporativo"]'),
      document.querySelector('[data-tab="historial"]')
    ];
    
    tabsRestringidos.forEach(tab => {
      if (tab) {
        tab.style.display = 'none';
      }
    });
    
    // Mostrar mensaje para líderes
    const mensajeLider = document.createElement('div');
    mensajeLider.className = 'info-message lider';
    mensajeLider.textContent = 'Panel de Líder: Solo puedes agregar y gestionar referidos pendientes.';
    
    document.querySelector('.container').insertBefore(
      mensajeLider,
      document.querySelector('.tabs')
    );
    
  } else if (!esAdmin && !esLider) {
    // Usuarios normales: Solo lectura
    const elementosEdicion = [
      document.getElementById('nuevoReferidoForm'),
      document.getElementById('reiniciarBtn'),
      document.getElementById('reiniciarAñoCorporativoBtn')
    ];
    
    elementosEdicion.forEach(elemento => {
      if (elemento) {
        elemento.style.display = 'none';
      }
    });
    
    const mensajeNoPermisos = document.createElement('div');
    mensajeNoPermisos.className = 'info-message';
    mensajeNoPermisos.textContent = 'Modo de solo lectura. Contacte a un administrador para realizar cambios.';
    
    document.querySelector('.container').insertBefore(
      mensajeNoPermisos,
      document.querySelector('.tabs')
    );
  }
}