const passport = require('passport');
const User = require('../models/user');
const localStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user)
  })
})

passport.use('local.signup', new localStrategy({
  usernameField: 'email',
  passwordField: 'email',
  passReqToCallback: true
}, function(req, email, password, done) {
  req.checkBody('email', 'No puede estar vacío.').notEmpty()
  req.checkBody('email', 'No es un email válido.').isEmail()
  var errors = req.validationErrors()
  if (errors) {
    var messages = []
    errors.forEach(function(error) {
      messages.push(error.msg)
    })
    return done(null, false, req.flash('error', messages))
  }
  User.findOne({'email': email}, function(err, user) {
    if (err) {
      return done(err)
    }
    // user found in db
    if (user) {
      return done(null, false, {message: 'Email autorizado.'})
    }
    // user not found in db

    // create new user
    var newUser = new User()
      newUser.email = email
      newUser.password = newUser.encryptPassword(password)
      newUser.save(function(err, result) {
        if (err) {
          return done(err)
        }
        return done(null, newUser)
      })
  })
}))

passport.use('local.signin', new localStrategy({
  usernameField: 'email',
  passwordField: 'email',
  passReqToCallback: true
}, function(req, email, password, done) {
  req.checkBody('email', 'No es un email válido.').isEmail();
  req.checkBody('email', 'Email no puede estar vacío.').notEmpty();
  req.checkBody('email', 'Email debe tener sólo minúsculas.').isLowercase();
  var errors = req.validationErrors()
  if (errors) {
    var messages = []
    errors.forEach(function(error) {
      messages.push(error.msg)
    })
    return done(null, false, req.flash('error', messages))
  }
  User.findOne({'email': email}, function(err, user) {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false, {message: 'User not found.'})
    }
    if (!user.validPassword(password)) {
      return done(null, false, {message: 'Wrong password.'})
    }
    return done(null, user)
  })
}))
