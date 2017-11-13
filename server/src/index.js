/* eslint-disable no-console */
const logger = require('winston')
const app = require('./app')
const port = app.get('port')
const server = app.listen(port)

logger.transport = new logger.transports.File({ filename: 'combined.log' })

process.on('unhandledRejection', (reason, p) =>
  logger.error('Unhandled Rejection at: Promise ', p, reason),
)

server.on('listening', () =>
  logger.info(
    'Feathers application started on http://%s:%d',
    app.get('host'),
    port,
  ),
)
