'use strict';

const BaseModel = require('../common/BaseModel');
const debug = require('debug')('app:model:role');
const roleConfig = require('./role.json');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  class Role extends BaseModel {
    static async isInRole(ctx, acl, rule, curProperty, model, modelId) {
      let userId = ctx.session && ctx.session.admin && ctx.session.admin.id;

      if (!userId) {
        const AccessToken = app.model.AccessToken;

        try {
          const token = AccessToken.tokenIdForRequest(ctx);
          if (token) {
            const tokenInstance = await AccessToken.findOne({
              where: { token },
            });
            if (tokenInstance && tokenInstance.userId) {
              userId = tokenInstance.userId;
            }
          }
        } catch (err) {
          debug('token parse error');
        }

      }

      const inSystem = [ Role.OWNER, Role.AUTHENTICATED, Role.UNAUTHENTICATED, Role.EVERYONE ].some(item => item === rule.principalId);

      debug('inSystem %s', inSystem);
      debug('current acl %o', acl);
      debug('current rule %o', rule);

      if (inSystem) {
        const resolver = Role.resolvers[rule.principalId];
        const result = await resolver(ctx, userId, model, modelId);
        debug('inSystem %s ,userId %s, result %s', rule.principalId, userId, result);
        return result && acl;
      }
      // 自定义 role
      let isMatch = false;
      try {
        const roleInstance = await Role.findOne({ where: { name: rule.principalId } });
        const roleMapping = await app.model.RoleMapping.findOne({ where: { roleId: roleInstance.id, principalId: userId } });
        isMatch = roleInstance && roleMapping;
      } catch (e) {
        isMatch = false;
      }

      debug('custom role isMatch: %s', isMatch);

      return isMatch && acl;
    }
    static registerResolver(role, resolver) {
      if (!Role.resolvers) {
        Role.resolvers = {};
      }
      Role.resolvers[role] = resolver;
    }
  }

  // Special roles
  Role.OWNER = '$owner'; // owner of the object
  Role.RELATED = '$related'; // any User with a relationship to the object
  Role.AUTHENTICATED = '$authenticated'; // authenticated user
  Role.UNAUTHENTICATED = '$unauthenticated'; // authenticated user
  Role.EVERYONE = '$everyone'; // everyone


  Role.registerResolver(Role.OWNER, async (ctx, userId, modelName, modelId) => {
    debug('in registerResolver');
    if (!modelName || !modelId || !userId) {
      return false;
    }
    const Model = app.model.models[modelName];

    if (Model.BelongOwnerById && typeof Model.BelongOwnerById === 'function') {
      debug('userId %s, model %s', userId, modelId);

      const isMatch = await Model.BelongOwnerById(userId, modelId);
      debug('isMatch %s', isMatch);

      return isMatch;
    }
    return false;
  });

  Role.registerResolver(Role.AUTHENTICATED, async (ctx, userId) => {
    return !!userId;
  });

  Role.registerResolver(Role.UNAUTHENTICATED, async (ctx, userId) => {
    return !userId;
  });

  Role.registerResolver(Role.EVERYONE, async () => {
    return true;
  });

  Role.init({
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    name: { type: STRING, allowNull: false }, // 角色名称
    description: { type: STRING, allowNull: true }, // 角色描述
    createdAt: DATE,
    updatedAt: DATE,
    deletedAt: DATE,
  }, {
    sequelize: app.model,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    version: true,
  });

  // 设置 字段
  Role.settings = roleConfig.settings;

  Role.afterRemotes = {};
  Role.beforeRemote = {};
  Role.remotes = {};
  Role.disabledRemotes = roleConfig.disabledRemotes;

  Role.setupRemoting();
  return Role;
};
