const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

// Determinar la URL de callback según el entorno
const isProduction = process.env.NODE_ENV === 'production';
const callbackURL = isProduction
  ? 'https://dei-p8ny.onrender.com/auth/google/callback'
  : 'http://localhost:3000/auth/google/callback';

console.log("Configuración OAuth:");
console.log("Entorno:", isProduction ? "Producción" : "Desarrollo");
console.log("GOOGLE_CLIENT_ID disponible:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET disponible:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("callbackURL:", callbackURL);

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: callbackURL,
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Perfil de Google recibido:", profile.id, profile.displayName);
        
        // Verificar si el usuario ya existe
        let usuario = await Usuario.findOne({ googleId: profile.id });
        
        if (usuario) {
          console.log("Usuario existente encontrado:", usuario.email);
          return done(null, usuario);
        }
        
        // Crear nuevo usuario
        console.log("Creando nuevo usuario:", profile.displayName);
        usuario = new Usuario({
          googleId: profile.id,
          nombre: profile.displayName,
          email: profile.emails && profile.emails[0] ? profile.emails[0].value : '',
          foto: profile.photos && profile.photos[0] ? profile.photos[0].value : ''
        });
        
        await usuario.save();
        console.log("Nuevo usuario guardado:", usuario.id);
        return done(null, usuario);
      } catch (error) {
        console.error("Error en autenticación:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;

