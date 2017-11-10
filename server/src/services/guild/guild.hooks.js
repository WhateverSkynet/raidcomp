const transformHook = require('../../hooks/object-transformer')
const http = require('http')

const get = (url) => new Promise((resolve, reject) => {
  http.get(url, res => {
    const { statusCode } = res
    const contentType = res.headers['content-type']

    let error
    if (statusCode !== 200) {
      error = new Error(`Request Failed. Status Code: ${statusCode}`)
    } else if (!/^text\/csv/.test(contentType)) {
      error = new Error('Invalid content-type.\n' +
        `Expected text/csv but received ${contentType}`)
    }
    if (error) {
      // consume response data to free up memory
      res.resume()
      reject(error)
      return
    }

    res.setEncoding('utf8')
    let rawData = ''
    res.on('data', (chunk) => { rawData += chunk })
    res.on('end', () => {
      try {
        const parsedData = rawData.replace(/\s+$/, '').split('\n').map(r => r.split(','))
        resolve(parsedData)
      } catch (e) {
        reject(e)
      }
    })
  }).on('error', (e) => {
    reject(e)
  })
})

const findGuild = () => async hook => {
  const { service, data } = hook
  const { realm, name, region } = data

  const guilds = await service.find({
    query: {
      name,
      realm,
      region
    }
  })

  if (guilds.total === 1) {
    hook.guild = guilds.data[0]
    hook.id = guilds.data[0].id
    hook.data.id = hook.id
  }
  return hook
}

const checkDuplicate = () => {
  return async (hook) => {
    const { service, data } = hook
    const { realm, name, region } = data

    const guilds = await service.find({
      query: {
        name,
        realm,
        region
      }
    })

    if (guilds.total) {
      throw new Error('Guild already exists')
    }
    return hook
  }
}

const WOW_AUDIT_ROLES = {
  'tank': 0,
  'heal': 1,
  'melee': 2,
  'ranged': 3
}

const syncWithAudit = () => {
  return async (hook) => {
    const { wowAuditKey } = hook.data
    if (wowAuditKey) {
      const [header, ...data] = await get(`http://data.wowaudit.com/wowcsv/${wowAuditKey}.csv`)
      const roleIndex = header.indexOf('role')
      // console.log(data)
      hook.roles = data.reduce((result, row) => {
        const name = row[0].toLowerCase()
        const realm = (row[2]).toLowerCase()
        const role = WOW_AUDIT_ROLES[row[roleIndex].toLowerCase()]
        const slug = [name, realm].join('_')
        result.set(slug, role)
        return result
      }, new Map())
    }
    return hook
  }
}

const syncWithBlizzard = () => {
  return async (hook) => {
    const { data, app, roles = new Map() } = hook
    const { realm, name, region: origin } = data
    const blizzard = app.get('blizzard')
    const { data: guild } = await blizzard.wow.guild(['profile', 'members'], { realm, name, origin })

    const characterService = app.service('/api/character')
    const characterUpdates = guild.members
      .filter((x, i) => x.character.level === 110)
      .map(async x => {
        const data = {
          name: x.character.name,
          realm: x.character.realm,
          region: origin
        }
        const characters = await characterService.find({ query: data })

        const slug = [data.name.toLowerCase(), data.realm.toLowerCase()].join('_')

        if (roles.has(slug)) {
          data.role = roles.get(slug)
        }

        data.rank = x.rank

        let id
        if (!characters.total) {
          const character = await characterService.create(data)
          id = character.id
        } else {
          data.updatedAt = new Date()
          const character = await characterService.update(characters.data[0].id, data)
          id = character.id
        }
        return id
      })

    let members = await Promise.all(characterUpdates)

    hook.data.members = members

    return hook
  }
}

module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [checkDuplicate(), syncWithAudit(), syncWithBlizzard()],
    update: [findGuild(), syncWithAudit(), syncWithBlizzard()],
    patch: [],
    remove: []
  },

  after: {
    all: [transformHook()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}
