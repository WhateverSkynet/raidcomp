/* eslint-env mocha */
const assert = require('assert')
const app = require('../../src/app')

describe('\'guild\' service', () => {
  it('registered the service', () => {
    const service = app.service('guild')

    assert.ok(service, 'Registered the service')
  })
})
