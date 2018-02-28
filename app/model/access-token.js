'use strict';

const uid = require('uid-promise');

const BaseModel = require('../common/BaseModel');
const accessTokenConfig = require('./access-token.json');

const DEFAULT_TOKEN_LEN = 64;

// app/model/access-token.js
module.exports = app => {

  const { STRING, INTEGER, DATE } = app.Sequelize;

  class AccessToken extends BaseModel {
    /**
     * Create a cryptographically random access token id.
     * @return {Promise} promise
     */
    static async createAccessTokenId() {
      const token = await uid(DEFAULT_TOKEN_LEN);
      return token;
    }

    /**
    * 获取 token Id
    * @param {Object} ctx 上下文
    * @param {Object} options 参数项
    * @return {String} tokenId
    */
    static tokenIdForRequest(ctx, options = {}) {
      const req = ctx.request;
      let params = options.params || [];
      let headers = options.headers || [];
      let cookies = options.cookies || [];

      let i = 0;
      let length;
      let id;

      params = params.concat([ 'access_token' ]);
      headers = headers.concat([ 'x-access-token', 'authorization' ]);
      cookies = cookies.concat([ 'access_token', 'authorization' ]);

      // params
      for (length = params.length; i < length; i++) {
        const param = params[i];
        // replacement for deprecated req.param()
        id = req.params && req.params[param] !== undefined ? req.params[param] :
          req.body && req.body[param] !== undefined ? req.body[param] :
            req.query && req.query[param] !== undefined ? req.query[param] :
              undefined;

        if (typeof id === 'string') {
          return id;
        }
      }
      for (i = 0, length = headers.length; i < length; i++) {
        id = req.header[headers[i]];

        if (typeof id === 'string') {
          // Add support for oAuth 2.0 bearer token
          // http://tools.ietf.org/html/rfc6750
          if (id.indexOf('Bearer ') === 0) {
            id = id.substring(7);
            // Decode from base64
            const buf = new Buffer(id, 'base64');
            id = buf.toString('utf8');
          } else if (/^Basic /i.test(id)) {
            id = id.substring(6);
            id = (new Buffer(id, 'base64')).toString('utf8');
            // The spec says the string is user:pass, so if we see both parts
            // we will assume the longer of the two is the token, so we will
            // extract "a2b2c3" from:
            //   "a2b2c3"
            //   "a2b2c3:"   (curl http://a2b2c3@localhost:3000/)
            //   "token:a2b2c3" (curl http://token:a2b2c3@localhost:3000/)
            //   ":a2b2c3"
            const parts = /^([^:]*):(.*)$/.exec(id);
            if (parts) {
              id = parts[2].length > parts[1].length ? parts[2] : parts[1];
            }
          }
          return id;
        }
      }

      if (ctx.cookies) {
        for (i = 0, length = cookies.length; i < length; i++) {
          id = ctx.cookies.get(cookies[i]);

          if (typeof id === 'string') {
            return id;
          }
        }
      }
      return null;
    }

    /**
    * 验证实例是否过期
    * @return {boolean} isValid 是否合法
    */
    validateLive() {
      const instance = this;

      const now = Date.now();
      const created = this.createdAt.getTime();
      const elapsedSeconds = (now - created) / 1000;

      // 兼容 App 应用, 不设置 ttl
      if (instance.ttl) {
        const secondsToLive = instance.ttl;
        const isValid = elapsedSeconds < secondsToLive;

        return isValid;
      }

      return true;
    }
    saveToken2Cookie(ctx) {
      const tokenInstance = this;
      console.log(ctx.cookie);
      ctx.cookies.set('access_token', tokenInstance.token);
    }
  }

  AccessToken.init({
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    token: {
      type: STRING,
      index: true,
      allowNull: false,
    },
    userId: {
      type: INTEGER,
      index: true,
    },
    ttl: {
      type: INTEGER,
    },
    createdAt: DATE,
    deletedAt: DATE,
  }, {
    sequelize: app.model,
    createdAt: 'createdAt',
    updatedAt: false,
    // tableName: 'admins', // class 这种方式 无效
    timestamps: true,
    paranoid: false,
    version: false,
  });

  // 设置隐藏 字段
  AccessToken.settings = accessTokenConfig.settings;

  AccessToken.remotes = {};
  AccessToken.afterRemotes = {};
  AccessToken.beforeRemote = {};
  AccessToken.disabledRemotes = [ 'exists', 'updateAll', 'countAll', 'queryAll' ];


  AccessToken.setupRemoting();
  return AccessToken;
};
