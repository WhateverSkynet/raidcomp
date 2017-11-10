// Initializes the `character` service on path `/character`
const createService = require('feathers-mongoose')
const createModel = require('../../models/character.model')
const hooks = require('./character.hooks')
const filters = require('./character.filters')

module.exports = function () {
  const app = this
  const prefix = app.get('prefix')
  const Model = createModel(app)
  const paginate = app.get('paginate')
  const servicePath = prefix + '/character'

  const options = {
    name: 'character',
    Model,
    paginate
  }

  // Initialize our service with any options it requires
  app.use(servicePath, createService(options))

  // Get our initialized service so that we can register hooks and filters
  const service = app.service(servicePath)

  service.hooks(hooks)

  if (service.filter) {
    service.filter(filters)
  }
}
