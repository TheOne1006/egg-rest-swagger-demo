'use strict';

const BaseModel = require('../common/BaseModel');
const categoryConfig = require('./category.json');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  class Category extends BaseModel {
  }

  Category.init({
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    name: STRING,
    pid: INTEGER,
    createdAt: DATE,
    updatedAt: DATE,
    deletedAt: DATE,
    version: INTEGER,
  }, {
    sequelize: app.model,
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    paranoid: true,
    version: true,
  });

  // 设置 字段
  Category.settings = categoryConfig.settings;

  Category.afterRemotes = {};
  Category.beforeRemote = {};
  Category.remotes = {};
  Category.disabledRemotes = [ 'updateAll' ];


  Category.setupRemoting();
  return Category;
};
