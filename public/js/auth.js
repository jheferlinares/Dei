document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Obtener información del usuario actual
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
  userRole.textContent = usuario.rol === 'admin' ? 'Administrador' : 'Usuario';
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
  const esAdmin = usuario.rol === 'admin';
  
  // Elementos que solo los administradores pueden usar
  const elementosAdmin = [
    document.getElementById('nuevoReferidoForm'),
    document.getElementById('reiniciarBtn')
  ];
  
  // Botones de acción en tablas (se añadirán dinámicamente)
  window.esUsuarioAdmin = esAdmin;
  
  if (!esAdmin) {
    // Ocultar elementos para usuarios no administradores
    elementosAdmin.forEach(elemento => {
      if (elemento) {
        elemento.style.display = 'none';
      }
    });
    
    // Mostrar mensaje para usuarios no administradores
    const mensajeNoAdmin = document.createElement('div');
    mensajeNoAdmin.className = 'info-message';
    mensajeNoAdmin.textContent = 'Modo de solo lectura. Contacte a un administrador para realizar cambios.';
    
    document.querySelector('.container').insertBefore(
      mensajeNoAdmin,
      document.querySelector('.tabs')
    );
  }
}