'use strict';

const co = require('co');

module.exports = {
  up: co.wrap(function* (queryInterface, Sequelize) {
    const { STRING, INTEGER, DATE } = Sequelize;

    yield queryInterface.createTable('Admins', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: STRING, allowNull: false },
      password: { type: STRING, allowNull: false },
      email: { type: STRING, allowNull: false },
      lastSignInAt: DATE,
      createdAt: DATE,
      updatedAt: DATE,
      deletedAt: DATE,
      version: INTEGER,
    });

    // yield queryInterface.addIndex('Admins', [ 'username' ], { indicesType: 'UNIQUE' });

    yield queryInterface.bulkInsert('Admins', [{
      id: 1,
      email: 'admin@admin.com',
      username: 'admin',
      password: '$2a$10$QlA.DnpNNoehYSsfoCPm.eMkv8Bujwbvl5x3r6afmO12E0PdQD3kO',
      lastSignInAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      version: 0,
    },
    {
      id: 2,
      email: 'demo@demo.com',
      username: 'demo',
      password: '$2a$10$CT48ULthG.bGsgCForJSReWvn7PIc3bO6rvyJEtaaeDbTbeElCfEC',
      lastSignInAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }]);
  }),
  // 清空 table
  down: queryInterface => queryInterface.dropTable('Admins'),
};
