const transformHook = require('../../hooks/object-transformer')
const http = require('http')
const csv = require('fast-csv')

const {
  CLASS_NAMES,
} = require('../../models/character.model').CHARACTER_CONSTANTS

const get = url =>
  new Promise((resolve, reject) => {
    http
      .get(url, res => {
        const { statusCode } = res
        const contentType = res.headers['content-type']

        let error
        if (statusCode !== 200) {
          error = new Error(`Request Failed. Status Code: ${statusCode}`)
        } else if (!/^text\/csv/.test(contentType)) {
          error = new Error(
            'Invalid content-type.\n' +
              `Expected text/csv but received ${contentType}`,
          )
        }
        if (error) {
          // consume response data to free up memory
          res.resume()
          reject(error)
          return
        }
        res.setEncoding('utf8')
        const data = []
        res
          .pipe(csv())
          .on('data', chunk => {
            data.push(chunk)
          })
          .on('end', () => {
            resolve(data)
            // try {
            //   const pattern = /^(?:(?:"((?:""|[^"])+)"|([^,]*))(?:$|,))+$/
            //   const parsedData = rawData
            //     .replace(/\s+$/, '')
            //     .split('\n')
            //     .map(r => {
            //       const match = pattern.exec(r)
            //       return r.split(',')
            //     })
            //   resolve(parsedData)
            // } catch (e) {
            //   reject(e)
            // }
          })
      })
      .on('error', e => {
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
      region,
    },
  })

  if (guilds.total === 1) {
    hook.guild = guilds.data[0]
    hook.id = guilds.data[0].id
    hook.data.id = hook.id
  }
  return hook
}

const checkDuplicate = () => {
  return async hook => {
    const { service, data } = hook
    const { realm, name, region } = data

    const guilds = await service.find({
      query: {
        name,
        realm,
        region,
      },
    })

    if (guilds.total) {
      throw new Error('Guild already exists')
    }
    return hook
  }
}

const WOW_AUDIT_ROLES = {
  tank: 0,
  heal: 1,
  melee: 2,
  ranged: 3,
}

const getCharactersFromWowAudit = async key => {
  const [, ...data] = await get(`http://data.wowaudit.com/wowcsv/${key}.csv`)
  // console.log(data)
  return data.map(row => {
    const name = row[0]
    const classIndex = CLASS_NAMES.indexOf(row[1])
    const realm = row[2]
    const role = WOW_AUDIT_ROLES[row[92].toLowerCase()]
    const ilvl = parseInt(row[3], 10)
    return {
      class: classIndex,
      name,
      realm,
      role,
      ilvl,
    }
  })
}

const syncWithAudit = () => {
  return async hook => {
    const { data, app, id: guildId } = hook
    const { region, wowAuditKeys } = data
    if (Array.isArray(wowAuditKeys) && wowAuditKeys.length) {
      const [mains, ...alts] = wowAuditKeys
      const characterService = app.service('/api/character')
      const mainCharacters = await getCharactersFromWowAudit(mains)
      let oldCharacters = []

      if (guildId) {
        const characters = await characterService.find({
          query: {
            guild: guildId,
          },
          limit: 0,
        })
        oldCharacters = characters.data
      }

      const characterUpdates = mainCharacters.map(async x => {
        const data = Object.assign(
          {
            region,
            guild: guildId,
            main: true,
            skipBlizzardUpdate: true,
          },
          x,
        )
        const { id } = await characterService.create(data)

        return id
      })

      alts.forEach(() => {})

      let members = await Promise.all(characterUpdates)

      hook.data.members = members

      oldCharacters.forEach(character => characterService.remove(character.id))
    }
    return hook
  }
}
module.exports = {
  before: {
    all: [],
    find: [],
    get: [],
    create: [checkDuplicate(), syncWithAudit()],
    update: [findGuild(), syncWithAudit()],
    patch: [],
    remove: [],
  },

  after: {
    all: [transformHook()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
}
