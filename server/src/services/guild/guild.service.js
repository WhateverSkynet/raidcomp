// Initializes the `guild` service on path `/guild`
const createService = require('feathers-mongoose')
const createModel = require('../../models/guild.model')
const hooks = require('./guild.hooks')
const filters = require('./guild.filters')

module.exports = function () {
  const app = this
  const Model = createModel(app)
  const paginate = app.get('paginate')

  const options = {
    name: 'guild',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use('/guild', createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('guild')

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
