const express = require('express');
const router = express.Router();
const passport = require('passport');
const Usuario = require('../models/Usuario');

// Ruta para iniciar sesión con Google
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback después de la autenticación con Google
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/');
  }
);

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});

// Obtener información del usuario actual
router.get('/usuario-actual', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      id: req.user._id,
      nombre: req.user.nombre,
      email: req.user.email,
      foto: req.user.foto,
      rol: req.user.rol
    });
  } else {
    res.json(null);
  }
});

module.exports = router;