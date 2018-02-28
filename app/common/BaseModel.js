'use strict';

const _ = require('lodash');
const Sequelize = require('sequelize');

const { STRING, INTEGER, DATE, BOOLEAN, TEXT } = Sequelize;

// TODO: 集成到 connet-remote help
function rawAttrs2swaggerDefinePart(sourceClass) {
  const rawAttrs = sourceClass.prototype.rawAttributes;
  const properties = {};
  const required = [];

  _.each(rawAttrs, attr => {
    const field = attr.field;

    if (attr.type instanceof STRING || attr.type instanceof TEXT) {
      properties[field] = {
        type: 'string',
      };
    } else if (attr.type instanceof INTEGER) {
      properties[field] = {
        type: 'integer',
      };
    } else if (attr.type instanceof INTEGER) {
      properties[field] = {
        type: 'integer',
      };
    } else if (attr.type instanceof DATE) {
      properties[field] = {
        type: 'string',
        format: 'date',
      };
    } else if (attr.type instanceof BOOLEAN) {
      properties[field] = {
        type: 'boolean',
      };
    }
  });

  return {
    properties,
    required,
  };
}

class BaseModel extends Sequelize.Model {
  static createDefinition() {
    const curClass = this;

    const { properties } = rawAttrs2swaggerDefinePart(curClass);

    const description = curClass.settings && curClass.settings.description;

    const defineObject = {
      type: 'object',
      description,
      properties,
      additionalProperties: false,
    };

    return defineObject;
  }
  // 注册方法
  static remoteMethod(name, options) {
    this.remotes[name] = options;
  }
  static beforeRemote(name, fn) {
    const beforeRemoteMethods = this.beforeRemotes[name];
    if (beforeRemoteMethods && beforeRemoteMethods.length) {
      this.beforeRemotes[name].push();
    } else {
      this.beforeRemotes[name] = [ fn ];
    }
  }
  static afterRemote(name, fn) {
    const afterRemoteMethods = this.afterRemotes[name];
    if (afterRemoteMethods && afterRemoteMethods.length) {
      this.afterRemotes[name].push();
    } else {
      this.afterRemotes[name] = [ fn ];
    }
  }
  /**
   * 排除未找到错误
   * @param  {String} msg 错误描述
   * @return {Error} error
   */
  static errorModelNotFound(msg = 'Not found Model') {
    const error = new Error(msg);
    error.statusCode = 404;
    error.code = 'MODEL_NOT_FOUND';
    return error;
  }

  static isProtectedProperty(propertyName) {
    const Model = this;
    const settings = Model.settings;
    const protectedProperties = settings && (settings.protectedProperties || settings.protected);

    return protectedProperties && protectedProperties.length > 1 && protectedProperties.indexOf(propertyName) > -1;
  }

  static isHiddenProperty(propertyName) {
    const Model = this;
    const settings = Model.settings;
    const hiddenProperties = settings && (settings.hiddenProperties || settings.hidden);

    return hiddenProperties && hiddenProperties.length > 0 && hiddenProperties.indexOf(propertyName) > -1;
  }
  static async queryAll(ctx, filter) {
    const safeIncludeMap = {
      material: ctx.app.model.Material,
      planMaterial: ctx.app.model.PlanMaterial,
      plan: ctx.app.model.Plan,
      project: ctx.app.model.Project,
      source: ctx.app.model.Source,
      statistic: ctx.app.model.Statistic,
    };

    function buildInlude(include) {
      if (_.isEmpty(include) && !Array.isArray(include)) {
        return [];
      }
      const safeIncludes = include
        .filter(item => safeIncludeMap[item.model])
        .map(item => {
          return _.assign({}, item, {
            model: safeIncludeMap[item.model],
            as: item.model,
          });
        });

      return safeIncludes;
    }
    if (!_.isEmpty(filter)) {
      filter.include = buildInlude(filter.include);
    }
    const results = await super.findAll(filter);

    return results;
  }

  async show() {
    const instance = this;
    return instance;
  }

  static async updateAll(ctx, data, where) {
    const Model = this;
    const [ affectedCount ] = await Model.update(data, { where });
    return { affectedCount };
  }

  static async exists(ctx, id) {
    // const Model = this;
    const instance = await super.findById(id);
    return { exists: !!instance };
  }

  static async createInstance(ctx, data) {
    const Model = this;
    const instance = Model.build(data);
    return instance.save();
  }

  async updateById(ctx, data) {
    const instance = this;
    const result = await instance.updateAttributes(data);
    return result;
  }

  static async updateAttributesById(id, data) {
    const instance = await super.findById(id);
    if (instance) {
      return instance.updateAttributes(data);
    }

    throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
  }
  // 重写 findById
  static async findById(id) {
    const instance = await super.findById(id);
    if (!instance) {
      throw this.errorModelNotFound(`Unknown ${this.name} id ${id}`);
    }

    return instance;
  }
  static async countAll(ctx, where) {
    const Model = this;
    const count = await Model.count({ where });
    return { count };
  }

  toJSON() {
    return this.toObject(false, true, false);
  }

  toObject(onlySchema = true, removeHidden = true, removeProtected = true) {

    const data = {};
    const self = this;
    const Model = this.constructor;

    // if it is already an Object
    if (Model === Object) {
      return self;
    }

    let props = [];
    let keys = [];

    if (onlySchema) {
      props = Model.attributes;
      keys = Object.keys(props);
    } else {
      const dataValues = self.dataValues;
      keys = Object.keys(dataValues);
    }

    for (let i = 0; i < keys.length; i++) {
      const propertyName = keys[i];
      let val = self[propertyName];

      // Exclude functions
      if (typeof val === 'function') {
        continue;
      }
      // Exclude hidden properties
      if (removeHidden && Model.isHiddenProperty(propertyName)) {
        continue;
      }

      if (removeProtected && Model.isProtectedProperty(propertyName)) {
        continue;
      }

      if (val instanceof Sequelize.Model) {
        val = val.toObject(onlySchema, removeHidden, removeProtected);
      }

      // XXX: List
      // coding

      if (val === undefined) {
        val = null;
      }

      data[propertyName] = val;
    }

    return data;
  }

  async updateAttributes(data, options) {
    const self = this;
    return self.update(data, options);
  }
}

BaseModel.afterRemotes = {};
BaseModel.beforeRemote = {};
BaseModel.remotes = {};
BaseModel.disabledRemotes = [];

BaseModel.setupRemoting = function() {
  const CurrentModel = this;
  const typeName = CurrentModel.name;
  const remotes = CurrentModel.remotes;
  const disabledRemotes = CurrentModel.disabledRemotes || [];
  const defaultRemotes = {
    queryAll: {
      summary: '从数据源中找到与筛选器匹配的所有实例.',
      isStatic: true,
      accessType: 'READ',
      accepts: [
        {
          arg: 'filter',
          type: 'object',
          description: '过滤定义 fields, where, include, order, offset, 以及 limit',
        },
      ],
      returns: { arg: 'data', type: 'array', model: typeName, root: true },
      http: { verb: 'get', path: '/' },
      security: [{ api_key: [] }],
    },
    createInstance: {
      summary: '创建模型的一个新实例并将其持久化到数据库中.',
      isStatic: true,
      accessType: 'WRITE',
      accepts: {
        arg: 'data', type: 'object', model: typeName,
        description: 'Model 实例数据', required: true, root: true,
        http: { source: 'body' },
      },
      returns: { arg: 'data', model: typeName, root: true },
      http: { verb: 'post', path: '/' },
      security: [{ api_key: [] }],
    },
    countAll: {
      summary: '统计 Model 实例数量可以使用, 可以使用 where 参数.',
      isStatic: true,
      accessType: 'READ',
      accepts: {
        arg: 'where',
        type: 'object',
        description: 'where 条件',
      },
      returns: { arg: 'count', type: 'number' },
      http: { verb: 'get', path: '/count' },
      security: [{ api_key: [] }],
    },
    exists: {
      summary: '通过 {{id}} 获取 Model 实例 是否存在.',
      isStatic: true,
      accessType: 'READ',
      accepts: { arg: 'id', type: 'integer', description: 'Model id', required: true,
        http: { source: 'path' } },
      http: { verb: 'get', path: '/exists/:id' },
      returns: { arg: 'exists', type: 'object', root: true },
      security: [{ api_key: [] }],
    },
    updateAll: {
      summary: '批量更新Model 所有实例',
      isStatic: true,
      accessType: 'WRITE',
      accepts: [{
        arg: 'data',
        type: 'object',
        description: 'Model 需要更新的数据',
        root: true,
        required: true,
        http: { source: 'body' },
      }, {
        arg: 'where',
        type: 'object',
        description: 'where 条件',
        http: { source: 'query' },
      }],
      http: { verb: 'put', path: '/' },
      security: [{ api_key: [] }],
      returns: { arg: 'affectedRows', type: 'object' },
    },
    show: {
      summary: '从数据源中通过 {{id}} 查找 Model 的实例 .',
      isStatic: false,
      accessType: 'READ',
      accepts: [
        { arg: 'id', type: 'integer', description: 'Model id', required: true,
          http: { source: 'path' } },
        { arg: 'filter', type: 'object',
          description: '定义 fields(字段) 和 include' },
      ],
      returns: { arg: 'data', model: typeName, root: true },
      http: { verb: 'get', path: '/:id' },
      security: [{ api_key: [] }],
    },
    updateById: {
      summary: '更新模型实例的属性并将其持久化到数据源中.',
      isStatic: false,
      accessType: 'WRITE',
      accepts: [
        {
          arg: 'data', type: 'object', model: typeName, required: true, root: true,
          http: { source: 'body' },
          description: '模型属性名称/值对的对象',
        },
        { arg: 'id', type: 'integer', description: 'Model id', required: true,
          http: { source: 'path' },
        },
      ],
      returns: { arg: 'data', model: typeName, root: true },
      http: { verb: 'put', path: '/:id' },
      security: [{ api_key: [] }],
    },
    destroy: {
      accessType: 'WRITE',
      aliases: [ 'destroyById', 'removeById' ],
      summary: '通过 {{id}} 获取 Model 实例 并将其从数据源中删除.',
      accepts: { arg: 'id', type: 'integer', description: 'Model id', required: true,
        http: { source: 'path' } },
      http: { verb: 'del', path: '/:id' },
      returns: { arg: 'count', type: 'object', root: true },
      security: [{ api_key: [] }],
    },
  };

  // filter disable remotes
  const customRemotes = _.omit(_.extend({}, defaultRemotes, remotes), disabledRemotes);

  CurrentModel.remotes = customRemotes;
};

module.exports = BaseModel;
