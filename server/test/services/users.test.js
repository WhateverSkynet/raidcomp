/* eslint-env mocha */
const assert = require('assert')
const app = require('../../src/app')

describe('users service', () => {
  it('registered the service', () => {
    const service = app.service('/api/user')

    assert.ok(service, 'Registered the service')
  })
})
