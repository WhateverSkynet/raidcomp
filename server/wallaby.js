const path = require('path')
module.exports = function () {
  process.env.NODE_ENV = 'test'
  process.env.NODE_CONFIG_DIR = path.join(__dirname, 'config')
  return {
    files: [
      'src/**/*.js'
    ],

    tests: [
      'test/**/*test.js'
    ],

    env: {
      type: 'node',
      runner: 'node'
    },
    workers: {
      initial: 6,
      regular: 4,
      recycle: true
    }
  }
}
