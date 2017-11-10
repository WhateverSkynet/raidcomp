const { authenticate } = require('feathers-authentication').hooks
const commonHooks = require('feathers-hooks-common')
const { restrictToOwner } = require('feathers-authentication-hooks')

const restrict = [
  authenticate('jwt'),
  restrictToOwner({
    idField: '_id',
    ownerField: '_id'
  })
]

const customizeBlizzardUser = () => {
  return hook => {
    console.log('Customizing Github Profile')
    // If there is a github field they signed up or
    // signed in with github so let's pull the primary account email.
    if (hook.data.github) {
      hook.data.email = hook.data.github.profile.emails.find(email => email.primary).value
    }
    // if ()

    if (hook.params.oauth.provider === 'blizzard') {
      hook.data.battleTag = hook.data.blizzard.profile.battletag
    }

    return Promise.resolve(hook)
  }
}

module.exports = {
  before: {
    all: [],
    find: [authenticate('jwt')],
    get: [...restrict],
    create: [customizeBlizzardUser()],
    update: [...restrict, customizeBlizzardUser()],
    patch: [...restrict],
    remove: [...restrict]
  },

  after: {
    all: [
      commonHooks.when(
        hook => hook.params.provider,
        commonHooks.discard('password')
      )
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
