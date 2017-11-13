import io from 'socket.io-client'
import feathers from 'feathers-client'

const socket = io('/', { transports: ['websocket'] })
const client = feathers().configure(feathers.socketio(socket))
const prefix = 'api'

export const characterService = client.service(prefix + '/character')
export const guildService = client.service(prefix + '/guild')
export const planService = client.service(prefix + '/plan')
