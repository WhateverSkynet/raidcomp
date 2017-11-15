const path = require('path')
const favicon = require('serve-favicon')
const compress = require('compression')
const cors = require('cors')
const helmet = require('helmet')
const bodyParser = require('body-parser')

const feathers = require('feathers')
const configuration = require('feathers-configuration')
const hooks = require('feathers-hooks')
const rest = require('feathers-rest')
const socketio = require('feathers-socketio')

const handler = require('feathers-errors/handler')
const notFound = require('feathers-errors/not-found')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')

const authentication = require('./authentication')

const mongoose = require('./mongoose')

const app = feathers()

const blizzard = require('blizzard.js').initialize({
  apikey: process.env.BLIZZARD_ID,
})

/**
 * Manages concurrent Blizzard requests and ensures that we are not exceeding rate limits
 */
const handleRateLimits = () => {
  const { get: original } = blizzard
  let initiatedRequests = []
  let queue = []
  // This method should be called when new request is added to the queue or a request is finished

  const check = () => {
    if (queue.length) {
      enqueue()
      setTimeout(check, 1000)
    }
  }
  const enqueue = () => {
    const now = Date.now()
    initiatedRequests = initiatedRequests.filter(start => now - start < 1100)

    while (initiatedRequests.length < 100 && queue.length) {
      const [request] = queue.splice(0, 1)
      initiatedRequests.push(Date.now())
      original
        .apply(blizzard, request.args)
        .then(data => {
          request.resolve(data)
          enqueue()
        })
        .catch(error => {
          // TODO: catch rate limit errors and requeue
          // console.log(request, error)
          request.reject(error)
          enqueue()
        })
    }
  }
  // We need to replace the blizzard.js get method with a wrapper to queue requests
  const get = (...args) => {
    return new Promise((resolve, reject) => {
      queue.push({
        resolve,
        reject,
        args,
      })
      check()
    })
  }
  blizzard.get = get
}

handleRateLimits()

app.set('blizzard', blizzard)

// Load app configuration
app.configure(configuration())
// Enable CORS, security, compression, favicon and body parsing
app.use(cors())
app.use(helmet())
app.use(compress())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(favicon(path.join(app.get('public'), 'favicon.ico')))
// Host the public folder
app.use('/', feathers.static(app.get('public')))

// Set up Plugins and providers
app.configure(hooks())
app.configure(mongoose)
app.configure(rest())
app.configure(socketio())

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware)
app.configure(authentication)
// Set up our services (see `services/index.js`)
app.configure(services)
// Configure a middleware for 404s and the error handler
// if (process.env.NODE_ENV !== 'production') {
//   // Allow to serve client files using node during development
//   app.use('/*', (req, res) =>
//     res.sendFile(path.join(app.get('public'), 'index.html')),
//   )
// }
app.use(notFound())
app.use(handler())

app.hooks(appHooks)

module.exports = app
