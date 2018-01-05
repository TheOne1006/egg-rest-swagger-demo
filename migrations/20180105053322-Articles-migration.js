'use strict';
const co = require('co');

module.exports = {
  up: co.wrap(function* (queryInterface, Sequelize) {

    const { STRING, INTEGER, DATE } = Sequelize;

    yield queryInterface.createTable('Articles', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: STRING,
      content: STRING,
      owner: INTEGER,
      cateId: INTEGER,
      createdAt: DATE,
      updatedAt: DATE,
      deletedAt: DATE,
      version: INTEGER,
    });


    yield queryInterface.bulkInsert('Articles', [{
      id: 1,
      title: 'es6 新特性',
      content: '默认参数, 模版表达式, 多行字符串',
      owner: 1,
      cateId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      id: 2,
      title: 'laravel 开发',
      content: 'laravel, laravel, laravel',
      owner: 2,
      cateId: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      id: 3,
      title: 'express 的使用',
      content: 'express, express, express',
      owner: 1,
      cateId: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    {
      id: 4,
      title: 'babel 转义',
      content: '转义与编译的差别',
      owner: 1,
      cateId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
    },
    ]);

    // yield queryInterface.addIndex('Articles', [ 'title' ], { indicesType: 'UNIQUE' });

  }),
  down: queryInterface => queryInterface.dropTable('Articles'),
};
