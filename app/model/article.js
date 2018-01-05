'use strict';

const BaseModel = require('../common/BaseModel');
const articleConfig = require('./article.json');

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  class Article extends BaseModel {
  }

  Article.init({
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    title: STRING,
    content: STRING,
    owner: INTEGER,
    cateId: INTEGER,
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
  Article.settings = articleConfig.settings;

  Article.afterRemotes = {};
  Article.beforeRemote = {};
  Article.remotes = {};
  Article.disabledRemotes = [ 'updateAll' ];


  Article.setupRemoting();
  return Article;
};
