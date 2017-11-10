// guild-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const guild = new Schema({
    n: { type: String, required: true, alias: 'name' },
    r: { type: String, required: true, alias: 'realm' },
    d: { type: String, required: true, alias: 'region' },
    m: { type: [String], alias: 'members' },
    p: { type: [String], alias: 'rankNames' }
  }, {
    timestamps: {
      createdAt: 'ca',
      updatedAt: 'ua'
    }
  })

  return mongooseClient.model('guild', guild)
}
