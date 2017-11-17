const host = 'strel.we-guild.tk'
module.exports = {
  host,
  port: 3025,
  public: '../public',
  prefix: '/api',
  paginate: {
    default: 10,
    max: 50,
  },
  authentication: {
    secret:
      '25a63e74c950a8df19f6c03b71ca3e5f1cf6e80f4993f95cfc4a3d4dbabee9a6e977ab69523aba60a3efeb7e9b2eec0b8f6a46de9aa4a655e3e4d42b850e5af1baf8c400df907d11c4aa71175fbe635195c0b64484093d36b3136b49e2c65c7cd33f688b28f35a73601e7447b3c26ab2e78857ebeccd8b9fc291ec9a6e41b45a22ea7614d674e8f3fcc215f4e05701a413d033ae2cd5b8cb89b9ced75268797857b315f4d989b6f0ddb18b2a38fd631d32a1b28e1e6a556a339d4d63e37639e0d6acbc91a3701d6b78543cc60845112f5b509d5a0775d0368dd72602234353e66ce5e3f65a7232e56d53e9c2969a51b091e58799e50d410b7ddb264d6bd17457',
    strategies: ['jwt'],
    path: '/authentication',
    service: '/api/user',
    jwt: {
      header: {
        typ: 'access',
      },
      audience: 'https://' + host,
      subject: 'anonymous',
      issuer: 'feathers',
      algorithm: 'HS256',
      expiresIn: '1d',
    },
    blizzard: {
      clientID: process.env.BLIZZARD_ID || 'abc',
      clientSecret: process.env.BLIZZARD_SECRET || 'abc',
      successRedirect: '/',
      region: 'eu',
      scope: ['wow.profile'],
    },
    cookie: {
      enabled: true,
      name: 'feathers-jwt',
      httpOnly: false,
      secure: false,
    },
  },
  mongodb: 'mongodb://mongo-e9b6cd9b.40a488c2.svc.dockerapp.io:54614/raidcomp_server',
}
