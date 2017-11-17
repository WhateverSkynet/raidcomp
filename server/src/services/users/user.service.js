// Initializes the `users` service on path `/users`
const { createService } = require('../helpers')

const createModel = require('../../models/users.model')
const hooks = require('./user.hooks')
const filters = require('./user.filters')

module.exports = createService('user', hooks, filters, createModel)
