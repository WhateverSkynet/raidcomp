/* eslint-env mocha */
const assert = require('assert')
const app = require('../../src/app')

describe('\'character\' service', () => {
  it('registered the service', () => {
    const service = app.service('/api/character')

    assert.ok(service, 'Registered the service')
  })

  it('updates syncs character with Blizzard api', async () => {
    const service = app.service('/api/character')

    const character = await service.sync(null, { name: 'Bliezeja', realm: 'Auchindoun', region: 'eu' })

    assert.ok(character, 'Character synced')
  })
})
