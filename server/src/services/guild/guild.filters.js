/* eslint no-console: 1 */
// eslint-disable-next-line no-console
console.warn(
  'You are using the default filter for the guild service. For more information about event filters see https://docs.feathersjs.com/api/events.html#event-filtering',
)

// eslint-disable-next-line no-unused-vars
module.exports = function(data, connection, hook) {
  return data
}
