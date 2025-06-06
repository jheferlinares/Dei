// Archivo: config/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../models/Usuario');

console.log("Variables de entorno en passport.js:");
console.log("GOOGLE_CLIENT_ID disponible:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET disponible:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("callbackURL:", "/auth/google/callback");

// Añade este código de depuración
console.log("Variables de entorno en passport.js:");
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);


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
      callbackURL: "https://dei-p8ny.onrender.com/auth/google/callback",
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Verificar si el usuario ya existe
        let usuario = await Usuario.findOne({ googleId: profile.id });
        
        if (usuario) {
          // Usuario existente
          return done(null, usuario);
        }
        
        // Crear nuevo usuario
        usuario = new Usuario({
          googleId: profile.id,
          nombre: profile.displayName,
          email: profile.emails[0].value,
          foto: profile.photos[0].value
        });
        
        await usuario.save();
        return done(null, usuario);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
