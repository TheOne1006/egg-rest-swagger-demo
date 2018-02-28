'use strict';

const co = require('co');

module.exports = {
  up: co.wrap(function* (queryInterface, Sequelize) {
    const { STRING, INTEGER, DATE } = Sequelize;

    yield queryInterface.createTable('AccessTokens', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      token: {
        type: STRING,
        allowNull: false,
      },
      userId: {
        type: INTEGER,
      },
      ttl: {
        type: INTEGER,
        defulat: 1209600,
      },
      createdAt: DATE,
      deletedAt: DATE,
    });

    yield queryInterface.addIndex('AccessTokens', [ 'userId' ]);

    yield queryInterface.addIndex('AccessTokens', [ 'token' ]);
  }),
  // 清空 table
  down: queryInterface => queryInterface.dropTable('AccessTokens'),
};
