// Middleware para verificar si el usuario está autenticado
exports.estaAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
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
  if (req.isAuthenticated()) {
    // Los administradores pueden editar
    if (req.user.rol === 'admin') {
      return next();
    }
  }
  res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
};