const createService = require('feathers-mongoose')

module.exports.createService = (name, hooks, filters, createModel) => {
  return function() {
    const app = this
    const Model = createModel(app)
    const paginate = app.get('paginate')
    const prefix = app.get('prefix')
    const servicePath = [prefix, name].join('/')

    const options = {
      name,
      Model,
      paginate,
      overwrite: false,
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
}
