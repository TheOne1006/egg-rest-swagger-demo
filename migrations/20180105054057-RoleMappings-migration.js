'use strict';
const co = require('co');

module.exports = {
  up: co.wrap(function* (queryInterface, Sequelize) {

    const { STRING, INTEGER, DATE } = Sequelize;

    yield queryInterface.createTable('RoleMappings', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      principalType: { type: STRING, allowNull: false }, // 角色名称 The principal type, such as user, application, or role
      principalId: { type: INTEGER, allowNull: true }, // 类型的id 为 user 时为 userId
      roleId: { type: INTEGER, allowNull: true }, // 角色Id
      createdAt: DATE,
      updatedAt: DATE,
      deletedAt: DATE,
      version: INTEGER,
    });

    yield queryInterface.bulkInsert('RoleMappings', [{
      id: 1,
      principalType: 'USER',
      principalId: 1,
      roleId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    }, {
      id: 2,
      principalType: 'USER',
      principalId: 3,
      roleId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    }]);

    // 键值唯一
    yield queryInterface.addIndex('RoleMappings', [ 'principalId', 'roleId' ], { indicesType: 'UNIQUE' });

  }),
  down: queryInterface => queryInterface.dropTable('RoleMappings'),
};
