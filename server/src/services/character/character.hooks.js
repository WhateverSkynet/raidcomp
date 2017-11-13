const transformHook = require('../../hooks/object-transformer')

const {
  CLASS_ARMOR_TYPE,
  CLASS_ARMOR_TOKEN,
} = require('../../models/character.model').CHARACTER_CONSTANTS

const calculateArmorTokenFromClass = _class =>
  _class === -1 || _class >= CLASS_ARMOR_TOKEN.length
    ? -1
    : CLASS_ARMOR_TOKEN[_class]

const calculateArmorTypeFromClass = _class =>
  _class === -1 || _class >= CLASS_ARMOR_TYPE.length
    ? -1
    : CLASS_ARMOR_TYPE[_class]

const syncWithBlizzard = () => {
  return async hook => {
    const { data, id, method, app } = hook
    const { realm, name, region: origin } = data
    const blizzard = app.get('blizzard')
    if (hook.data.role) {
      console.log(name, realm, hook.data.role)
    }
    if (!id && method === 'update') {
      throw new Error('Update requires character Id')
    }
    try {
      const { data: character } = await blizzard.wow.character(['items'], {
        realm,
        name,
        origin,
      })

      hook.data.armorType = calculateArmorTypeFromClass(character.class)
      hook.data.armorToken = calculateArmorTokenFromClass(character.class)
      hook.data.class = character.class
      hook.data.ilvl = character.items.averageItemLevelEquipped
      hook.data.lastModified = character.lastModified
    } catch (error) {
      console.log(error)
    }

    return hook
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [syncWithBlizzard()],
    update: [syncWithBlizzard()],
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
