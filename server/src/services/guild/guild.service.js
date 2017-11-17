// Initializes the `guild` service on path `/guild`
const { createService } = require('../helpers')
const createModel = require('../../models/guild.model')
const hooks = require('./guild.hooks')
const filters = require('./guild.filters')

module.exports = createService('guild', hooks, filters, createModel)
