'use strict';

const BaseModel = require('../common/BaseModel');
const roleMappingConfig = require('./roleMapping.json');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  class RoleMapping extends BaseModel {
  }

  RoleMapping.init({
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    principalType: { type: STRING, allowNull: false }, // 角色名称 The principal type, such as user, application, or role
    principalId: { type: INTEGER, allowNull: true }, // 类型的id 为 user 时为 userId
    roleId: { type: INTEGER, allowNull: true }, // 角色Id
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
  RoleMapping.settings = roleMappingConfig.settings;

  RoleMapping.afterRemotes = {};
  RoleMapping.beforeRemote = {};
  RoleMapping.remotes = {};
  RoleMapping.disabledRemotes = RoleMapping.disabledRemotes;

  RoleMapping.setupRemoting();
  return RoleMapping;
};
