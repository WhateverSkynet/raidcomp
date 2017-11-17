const user = require('./users/user.service.js')
const guild = require('./guild/guild.service.js')
const character = require('./character/character.service.js')
const plan = require('./plan/plan.service.js')
module.exports = function() {
  const app = this // eslint-disable-line no-unused-vars
  app.configure(user)
  app.configure(guild)
  app.configure(character)
  app.configure(plan)
}
