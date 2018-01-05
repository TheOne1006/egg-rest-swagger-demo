'use strict';

// app/middleware/error_handler.js
const DEFAULT_ERR_STATUS = 500;

/**
 * 统一处理 err
 */

module.exports = () => {
  return async function errorHandler(ctx, next) {
    try {
      await next();
    } catch (err) {
      // 注意：自定义的错误统一处理函数捕捉到错误后也要 `app.emit('error', err, this)`
      // 框架会统一监听，并打印对应的错误日志
      ctx.app.emit('error', err, ctx);

      ctx.status = err.statusCode || DEFAULT_ERR_STATUS;
      if (ctx.app.config.env === 'prod') {
        ctx.body = {
          name: 'Error',
          status: err.status || err.statusCode || DEFAULT_ERR_STATUS,
          message: err.message,
          statusCode: err.statusCode || DEFAULT_ERR_STATUS,
        };
      } else {
        ctx.body = {
          name: 'Error',
          status: err.status || err.statusCode || DEFAULT_ERR_STATUS,
          message: err.message,
          stack: err.stack,
          statusCode: err.statusCode || DEFAULT_ERR_STATUS,
        };
      }
    }
  };
};
