// guild-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient
  const guild = new Schema(
    {
      name: { type: String, required: true },
      realm: { type: String, required: true },
      region: { type: String, required: true },
      members: [{ type: Schema.Types.ObjectId, ref: 'character' }],
      rankNames: { type: [String], default: [] },
    },
    {
      timestamps: true,
    },
  )

  return mongooseClient.model('guild', guild)
}
