// plan-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

/**
 * @typedef Plan
 * @prop {} a
 */
module.exports = function(app) {
  const mongooseClient = app.get('mongooseClient')
  const { Schema } = mongooseClient

  const group = new Schema(
    {
      index: { type: Number, required: true },
      character: [{ type: Schema.Types.ObjectId, ref: 'character' }],
    },
    {
      timestamps: true,
    },
  )

  const plan = new Schema(
    {
      title: { type: String, required: true },
      boss: { type: String, required: true },
      date: { type: Date, required: true },
      guild: { type: Schema.Types.ObjectId, ref: 'guild', required: true },
      groups: { type: [group] },
    },
    {
      timestamps: true,
    },
  )

  return mongooseClient.model('plan', plan)
}
