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
    },
    registerRemote: true,
    accessRemote: {
      enable: true,
      getMatchFunc: app => app.model.Role.isInRole,
    },
  };

  return config;
};
