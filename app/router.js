'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  app.get('/', 'home.index');
  app.get('/swagger.json', function* () {
    this.body = app.swagger;
  });
  app.registerRemote(app.model.Admin);
  app.registerRemote(app.model.Article);
  app.registerRemote(app.model.Category);
  app.registerRemote(app.model.Role);
  app.registerRemote(app.model.RoleMapping);
};
