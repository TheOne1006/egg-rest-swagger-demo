'use strict';

const Promise = require('bluebird');
const debug = require('debug')('app:model:admin');

let bcrypt;
try {
  // Try the native module first
  bcrypt = require('bcrypt');
  // Browserify returns an empty object
  if (bcrypt && typeof bcrypt.compare !== 'function') {
    bcrypt = require('bcryptjs');
  }
} catch (err) {
  // Fall back to pure JS impl
  bcrypt = require('bcryptjs');
}

const BaseModel = require('../common/BaseModel');
const adminConfig = require('./admin.json');

const SALT_WORK_FACTOR = 10;
const MAX_PASSWORD_LENGTH = 72;
// const DEFAULT_TTL = 1209600; // 2 weeks in seconds
// const DEFAULT_MAX_TTL = 31556926;

// {workdir}/app/model/admin.js 一定要使用此目录
// 挂在到ctx下通过 ctx.model.Admin.fn()使用
//
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;
  class Admin extends BaseModel {
    static async BelongOwnerById(userId, id) {
      return parseInt(userId, 10) === parseInt(id, 10);
    }
    /*
     * Hash the plain password
     */
    static hashPassword(plain) {
      this.validatePassword(plain);
      const salt = bcrypt.genSaltSync(app.config.saltWorkFactor || SALT_WORK_FACTOR);
      return bcrypt.hashSync(plain, salt);
    }

    static validatePassword(plain) {
      let err;
      if (plain && typeof plain === 'string' && plain.length <= MAX_PASSWORD_LENGTH) {
        return true;
      }
      if (plain.length > MAX_PASSWORD_LENGTH) {
        err = new Error('Password too long: %s', plain);
        err.code = 'PASSWORD_TOO_LONG';
      } else {
        err = new Error('Invalid password: %s', plain);
        err.code = 'INVALID_PASSWORD';
      }
      err.statusCode = 422;
      throw err;
    }

    static async owner(ctx) {
      const Model = this;
      const userId = ctx.session && ctx.session.admin && ctx.session.admin.id;
      const admin = await Model.findById(userId);

      let roleInstance = {};

      try {
        const roleMappingInstance = await app.model.RoleMapping.findOne({
          where: {
            principalType: 'USER',
            principalId: admin.id,
          },
        });
        roleInstance = await app.model.Role.findById(roleMappingInstance.roleId);
      } catch (e) {
        debug('user id: %s, not found role', admin.id);
      }

      const adminJSON = admin.toJSON();
      adminJSON.role = roleInstance;

      return adminJSON;
    }

    // 登录
    static async login(ctx, credentials) {
      const defaultError = new Error('login failed');
      defaultError.statusCode = 401;
      defaultError.code = 'LOGIN_FAILED';

      const query = this.normalizeCredentials(credentials);
      const admin = await this.findOne({ where: query });

      if (!admin) {
        app.logger.info(`${query.username || query.email} unfound`);
        throw defaultError;
      }

      const isMatch = await admin.hasPassword(credentials.password);

      if (!isMatch) {
        app.logger.info(`${query.username || query.email} password not match`);
        throw defaultError;
      }

      await admin.updateAttributes({
        lastSignInAt: new Date(),
      });

      let roleInstance = {};

      try {
        const roleMappingInstance = await app.model.RoleMapping.findOne({
          where: {
            principalType: 'USER',
            principalId: admin.id,
          },
        });
        roleInstance = await app.model.Role.findById(roleMappingInstance.roleId);
      } catch (e) {
        debug('user id: %s, not found role', admin.id);
      }

      // token
      admin.createLoginSession(credentials.ttl, credentials, ctx);

      const adminJSON = admin.toJSON();
      adminJSON.role = roleInstance;


      return adminJSON;
    }

    static async logout(ctx) {
      const sessionAdmin = ctx.session && ctx.session.admin;
      if (sessionAdmin) {
        ctx.session = null;
      }
      return {
        logout: true,
      };
    }

    /**
     * Normalize the credentials
     * @param {Object} credentials The credential object
     * @return {Object} The normalized credential object
     */
    static normalizeCredentials(credentials) {
      const query = {};
      credentials = credentials || {};


      if (credentials.email) {
        query.email = credentials.email;
      } else if (credentials.username) {
        query.username = credentials.username;
      }

      return query;
    }

    createLoginSession(ttl, options, ctx) {
      const admin = this;
      const adminModel = this.constructor;
      const loginTTL = Math.min(ttl || adminModel.settings.ttl, adminModel.settings.maxTTL);

      ctx.session.admin = admin;
      const rememberMe = options.rememberMe;

      if (rememberMe) ctx.session.maxAge = loginTTL;
    }
    /**
     * 校验字段是否匹配密码
     * @param  {String} plain 传入文本
     * @return {Object} Promise
     */
    hasPassword(plain) {
      const self = this;
      return new Promise((resolve, reject) => {
        if (self.password && plain) {
          bcrypt.compare(plain, self.password, function(err, isMatch) {
            if (err) return reject(err);
            resolve(isMatch);
          });
        } else {
          resolve(false);
        }
      });
    }
  }

  Admin.init({
    id: {
      type: INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true,
    },
    email: STRING,
    username: {
      type: STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: STRING,
      set(val) {
        this.setDataValue('password', Admin.hashPassword(val));
      },
    },
    lastSignInAt: DATE,
    createdAt: DATE,
    updatedAt: DATE,
    deletedAt: DATE,
  }, {
    sequelize: app.model,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    deletedAt: 'deletedAt',
    // tableName: 'admins', // class 这种方式 无效
    timestamps: true,
    paranoid: true,
    version: true,
  });

  // 设置隐藏 字段
  Admin.settings = adminConfig.settings;

  Admin.remotes = adminConfig.remotes;
  Admin.afterRemotes = {};
  Admin.beforeRemote = {};
  Admin.disabledRemotes = adminConfig.disabledRemotes;

  Admin.setupRemoting();
  return Admin;
};
