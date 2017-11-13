/* eslint-env mocha */
const assert = require('assert')
const app = require('../../src/app')

describe("'plan' service", () => {
  it('registered the service', () => {
    const service = app.service('/api/plan')

    assert.ok(service, 'Registered the service')
  })
})
