// character-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const ARMOR_TOKENS = [
  'Conqueror', // Paladin, Priest, Warlock, Demon Hunter
  'Protector', // Warrior, Hunter, Shaman, Monk
  'Vanquisher' // Rogue, Death Knight, Mage, Druid
]

const ARMOR_TYPES = [
  'Cloth', // Mage, Priest, and Warlock
  'Leather', // Demon Hunter, Druid, Monk, and Rogue
  'Mail', // Hunter and Shaman
  'Plate' // Death Knight, Paladin, and Warrior
]

const CLASS_NAMES = [
  'Warrior',
  'Paladin',
  'Hunter',
  'Rogue',
  'Priest',
  'Death Knight',
  'Shaman',
  'Mage',
  'Warlock',
  'Monk',
  'Druid',
  'Demon Hunter'
]

const CLASS_ARMOR_TOKEN = [
  1,
  0,
  1,
  2,
  0,
  2,
  1,
  2,
  0,
  1,
  2,
  0
]

const CLASS_ARMOR_TYPE = [
  3,
  3,
  2,
  2,
  0,
  3,
  2,
  0,
  0,
  1,
  1,
  1
]

module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const character = new Schema({
    name: { type: String, required: true },
    class: { type: Number, required: true },
    role: { type: Number, required: true, default: -1 },
    armorToken: { type: Number, required: true, default: -1 },
    armorType: { type: Number, required: true, default: -1 },
    ilvl: { type: Number, required: true },
    rank: { type: Number, required: true, default: -1 },
    region: { type: String, required: true },
    lastModified: { type: Number, required: true }
  }, {
    timestamps: true
  })

  return mongooseClient.model('character', character)
}

module.exports.CHARACTER_CONSTANTS = {
  ARMOR_TYPES,
  ARMOR_TOKENS,
  CLASS_ARMOR_TOKEN,
  CLASS_ARMOR_TYPE,
  CLASS_NAMES
}
