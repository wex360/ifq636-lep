// LEP-14: pm2 process file. Start with: pm2 start deploy/ecosystem.config.js
module.exports = {
  apps: [{
    name: 'lep-api',
    cwd: require('path').join(__dirname, '..', 'backend'),
    script: 'server.js',
    env: { NODE_ENV: 'production' },
  }],
};
