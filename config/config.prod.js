'use strict';

module.exports = () => {
  const config = exports = {};

  // remote 配置
  config.connectorRemote = {
    enable: true,
    swaggerDefinition: {
      info: { // API informations (required)
        title: 'information_resource_manager', // Title (required)
        version: '1.0.0', // Version (required)
        description: '接口管理', // Description (optional)
      },
      basePath: '/api/v1',
      host: 'egg-swagger-demo.herokuapp.com',
      // 设置 swagger 的 security Definitions
      securityDefinitions: {
        api_key: { // 对应
          type: 'apiKey',
          name: 'X-Access-Token',
          in: 'header',
        },
      },
    },
    registerRemote: true,
    accessRemote: {
      enable: true,
      getMatchFunc: app => app.model.Role.isInRole,
    },
  };

  // config.sequelize = {
  //   dialect: 'mysql',
  //   database: 'swaggerdemo',
  //   host: '101.200.52.19',
  //   port: 3306,
  //   username: 'root',
  //   password: 'renrenQQ@@zz123',
  //   timezone: '+08:00',
  // };

  return config;
};
