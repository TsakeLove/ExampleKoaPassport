const Koa = require('koa')
const app = new Koa()

const session = require('koa-session')
app.keys = ['your-session-secret']
app.use(session({}, app))

const bodyParser = require('koa-bodyparser')
app.use(bodyParser())

require('./auth')
const passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())

const fs    = require('fs')
const route = require('koa-route')

app.use(route.get('/', function(ctx) {
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/login.html')
}))

app.use(route.post('/custom', function(ctx) {
  return passport.authenticate('local', function(err, user) {
    if (user === false) {
      ctx.body = { success: false }
      ctx.throw(401)
    } else {
      ctx.body = { success: true }
      return ctx.login(user)
    }
  })(ctx)
}))

app.use(route.post('/login',
  passport.authenticate('local', {
    successRedirect: '/inside',
    failureRedirect: '/'
  })
))

app.use(route.get('/logout', function(ctx) {
  ctx.logout()
  ctx.redirect('/')
}))

app.use(route.get('/auth/facebook',
  passport.authenticate('facebook')
))

app.use(route.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
))

app.use(route.get('/auth/google',
  passport.authenticate('google')
))

app.use(route.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/app',
    failureRedirect: '/'
  })
))

app.use(function(ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.redirect('/')
  }
})

app.use(route.get('/inside', function(ctx) {
  ctx.type = 'html'
  ctx.body = fs.createReadStream('views/inside.html')
}))

const port = process.env.PORT || 3000
app.listen(port, () => console.log('Server listening on', port))
