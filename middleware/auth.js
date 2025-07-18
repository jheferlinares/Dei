// Middleware para verificar si el usuario está autenticado
exports.estaAutenticado = (req, res, next) => {
  // Para entorno local, permitir acceso sin autenticación
  if (process.env.NODE_ENV !== 'production') {
    console.log('Entorno local: permitiendo acceso sin autenticación');
    return next();
  }
  
  if (req.isAuthenticated()) {
    console.log('Usuario autenticado:', req.user.email);
    return next();
  }
  console.log('Usuario no autenticado, redirigiendo a login');
  res.redirect('/login');
};

// Middleware para verificar si el usuario es administrador
exports.esAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.rol === 'admin') {
    return next();
  }
  res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
};

// Middleware para verificar permisos de edición
exports.puedeEditar = (req, res, next) => {
  // Para entorno local, permitir edición sin verificar permisos
  if (process.env.NODE_ENV !== 'production') {
    console.log('Entorno local: permitiendo edición sin verificar permisos');
    return next();
  }
  
  if (req.isAuthenticated()) {
    // Los administradores pueden editar
    if (req.user.rol === 'admin') {
      console.log('Usuario admin con permisos de edición:', req.user.email);
      return next();
    }
    console.log('Usuario sin rol admin:', req.user.email, 'Rol actual:', req.user.rol);
  } else {
    console.log('Intento de edición sin autenticación');
  }
  res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
};