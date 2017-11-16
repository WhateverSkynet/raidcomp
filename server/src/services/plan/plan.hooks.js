// const { authenticate } = require('feathers-authentication').hooks
const transformHook = require('../../hooks/object-transformer')

const loadRoster = () => {
  return async hook => {
    const { data, app } = hook
    const { guild: guildId } = data
    const guildService = app.service('/api/guild')
    const characterService = app.service('/api/guild')

    const guild = await guildService.get(guildId, {
      query: {
        $populate: 'members',
      },
    })
    const tasks = guild.members.map(async member => {
      const data = Object.assign({ skipBlizzardUpdate: true }, member)
      const { id } = await characterService.create(data)
      return id
    })
    hook.data.roster = await Promise.all(tasks)
    return hook
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [loadRoster()],
    update: [],
    patch: [],
    remove: [],
  },

  after: {
    all: [transformHook()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
}
