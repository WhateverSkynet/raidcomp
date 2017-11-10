// plan-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

/**
 * @typedef Plan
 * @prop {} a
 */
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient

  const group = new Schema({
    i: { type: Number, required: true, alias: 'index' },
    c: { type: String, required: true, alias: 'characterId' }
  }, {
    timestamps: {
      createdAt: 'ca',
      updatedAt: 'ua'
    }
  })

  const plan = new Schema({
    t: { type: String, required: true, alias: 'title' },
    b: { type: String, required: true, alias: 'boss' },
    d: { type: Date, required: true, alias: 'date' },
    g: { type: [group], alias: 'groups' }
  }, {
    timestamps: {
      createdAt: 'ca',
      updatedAt: 'ua'
    }
  })

  return mongooseClient.model('plan', plan)
}
