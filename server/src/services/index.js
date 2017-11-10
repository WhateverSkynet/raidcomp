const users = require('./users/users.service.js')
const guild = require('./guild/guild.service.js')
const character = require('./character/character.service.js')
const plan = require('./plan/plan.service.js')
module.exports = function () {
  const app = this // eslint-disable-line no-unused-vars
  app.configure(users)
  app.configure(guild)
  app.configure(character)
  app.configure(plan)
}
