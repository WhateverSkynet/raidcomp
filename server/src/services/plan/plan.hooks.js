// const { authenticate } = require('feathers-authentication').hooks
const transformHook = require('../../hooks/object-transformer')

const populateCompositions = () => hook => {
  hook.data.compositions = [
    {
      members: [],
    },
  ]
  return hook
}

const loadRoster = () => {
  return async hook => {
    const { data, app, id } = hook
    const { syncWithGuild } = data
    const guildService = app.service('/api/guild')
    const characterService = app.service('/api/character')
    let oldRoster = []
    let plan
    let guildId = data.guild

    if (id) {
      plan = await hook.service.get(id, {
        query: { $populate: 'roster' },
      })
      oldRoster = plan.roster
      if (!guildId) {
        guildId = plan.guild
      }
    }
    const guild = await guildService.get(guildId, {
      query: {
        $populate: 'members',
      },
    })

    if (id && syncWithGuild) {
      const tasks = guild.members.map(async member => {
        const data = Object.assign({ skipBlizzardUpdate: true }, member, {
          _id: undefined,
        })
        return await characterService.create(data)
      })
      const newRoster = await Promise.all(tasks)

      const newCompositions = plan.compositions.map(composition => {
        return Object.assign({}, composition, {
          members: composition.members
            .map(member => {
              const character = plan.roster.find(character =>
                character._id.equals(member.character),
              )
              if (!character) {
                return undefined
              }
              const newCharacter = newRoster.find(
                c =>
                  c.name === character.name &&
                  c.realm === character.realm &&
                  c.region === character.region,
              )
              if (!newCharacter) {
                return undefined
              }
              return Object.assign({}, member, { character: newCharacter.id })
            })
            .filter(member => !!member),
        })
      })
      hook.data.compositions = newCompositions
      hook.data.roster = newRoster.map(character => character.id)

      await Promise.all(
        oldRoster.map(character => characterService.remove(character._id)),
      )
    } else if (!id) {
      const tasks = guild.members.map(async member => {
        const data = Object.assign({ skipBlizzardUpdate: true }, member, {
          _id: undefined,
        })
        const { id } = await characterService.create(data)
        return id
      })
      hook.data.roster = await Promise.all(tasks)
    }
    return hook
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [populateCompositions(), loadRoster()],
    update: [loadRoster()],
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
