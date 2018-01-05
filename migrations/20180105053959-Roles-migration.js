'use strict';
const co = require('co');

module.exports = {
  up: co.wrap(function* (queryInterface, Sequelize) {

    const { STRING, INTEGER, DATE } = Sequelize;

    yield queryInterface.createTable('Roles', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: STRING, allowNull: false }, // 角色名称
      description: { type: STRING, allowNull: true }, // 角色描述
      createdAt: DATE,
      updatedAt: DATE,
      deletedAt: DATE,
      version: INTEGER,
    });

    yield queryInterface.bulkInsert('Roles', [{
      id: 1,
      name: 'admin',
      description: '超级管理员',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    }, {
      id: 2,
      name: 'readOnly',
      description: '只读角色',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    }]);

    // 键值唯一
    // yield queryInterface.addIndex('Roles', [ 'name' ], { indicesType: 'UNIQUE' });

  }),
  down: queryInterface => queryInterface.dropTable('Roles'),
};
