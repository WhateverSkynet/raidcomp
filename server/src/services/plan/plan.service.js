// Initializes the `plan` service on path `/plan`
const { createService } = require('../helpers')
const createModel = require('../../models/plan.model')
const hooks = require('./plan.hooks')
const filters = require('./plan.filters')

module.exports = createService('plan', hooks, filters, createModel)
