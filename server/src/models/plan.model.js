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

  const raidMember = new Schema(
    {
      index: { type: Number, required: true },
      character: {
        type: Schema.Types.ObjectId,
        ref: 'character',
        required: true,
      },
    },
    {
      timestamps: true,
    },
  )

  const compositions = new Schema(
    {
      members: { type: [raidMember] },
    },
    {
      timestamps: true,
    },
  )

  const plan = new Schema(
    {
      title: { type: String, required: true },
      boss: { type: String },
      date: { type: Date, required: true },
      guild: { type: Schema.Types.ObjectId, ref: 'guild', required: true },
      roster: [{ type: Schema.Types.ObjectId, ref: 'character' }],
      compositions: { type: [compositions] },
    },
    {
      timestamps: true,
    },
  )

  return mongooseClient.model('plan', plan)
}
