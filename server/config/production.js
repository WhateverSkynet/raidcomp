module.exports = {
  host: process.env['HOST_NAME'],
  port: 3025,
  mongodb:
    process.env['RAIDCOMP_DATABASE_PORT_27017_TCP'].replace(
      /^tcp:/,
      'mongodb:',
    ) + '/raidcomp_server',
}
