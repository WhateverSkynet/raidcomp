/* eslint-env mocha */
const assert = require('assert')
const app = require('../../src/app')

describe('character service', () => {
  it('registered the service', () => {
    const service = app.service('/api/character')

    assert.ok(service, 'Registered the service')
  })
})
