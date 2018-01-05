'use strict';
const co = require('co');

module.exports = {
  up: co.wrap(function* (queryInterface, Sequelize) {

    const { STRING, INTEGER, DATE, TEXT } = Sequelize;

    yield queryInterface.createTable('Categories', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: STRING,
      alias: TEXT, // 别名集合
      pid: INTEGER,
      createdAt: DATE,
      updatedAt: DATE,
      deletedAt: DATE,
      version: INTEGER,
    });


    yield queryInterface.bulkInsert('Categories', [{
      name: 'Javascript',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      name: 'PHP',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      name: 'Node.js',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      name: 'Python',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      name: 'Go',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    ]);

    // yield queryInterface.addIndex('Categories', [ 'name' ], { indicesType: 'UNIQUE' });

  }),
  down: queryInterface => queryInterface.dropTable('Categories'),
};
