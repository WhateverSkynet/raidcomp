// character-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const character = new Schema({
    n: { type: String, required: true, alias: 'name' },
    c: { type: Number, required: true, alias: 'class' },
    r: { type: Number, required: true, alias: 'role' },
    a: { type: Number, required: true, alias: 'armorType' },
    t: { type: Number, required: true, alias: 'token' },
    i: { type: Number, required: true, alias: 'ilvl' },
    p: { type: Number, required: true, alias: 'rank' },
    d: { type: String, required: true, alias: 'region' }
  }, {
    timestamps: {
      createdAt: 'ca',
      updatedAt: 'ua'
    }
  })

  return mongooseClient.model('character', character)
}
