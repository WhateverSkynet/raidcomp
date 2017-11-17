// Initializes the `character` service on path `/character`
const { createService } = require('../helpers')
const createModel = require('../../models/character.model')
const hooks = require('./character.hooks')
const filters = require('./character.filters')

module.exports = createService('character', hooks, filters, createModel)
