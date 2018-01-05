'use strict';

// had enabled by egg
// exports.static = true;

module.exports = {
  sequelize: {
    enable: true,
    package: 'egg-sequelize',
  },
  connectorRemote: {
    enable: true,
    package: 'egg-connector-remote',
  },
  swagger: {
    enable: true,
    package: 'egg-swagger',
  },
  session: {
    enable: true,
    package: 'egg-session',
  },
};
