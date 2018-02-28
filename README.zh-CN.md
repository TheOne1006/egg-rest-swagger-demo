# egg restful-api 和 swagger 结合演示 Demo

#### 相关插件库

1. [egg-connector-remote](https://github.com/TheOne1006/egg-connector-remote)
  - 主要功能: 通过 Class Model 自定义相关参数, 创建 swagger 配置文件. 存储于 `app.swagger` 全局变量中
  - registerRemote 函数, 通过Model 注册生成 相关的控制器。也可以绑定现有的控制器
  - accessRemote: 访问鉴权, 方法访问控制
2. [egg-swagger](https://github.com/TheOne1006/egg-swagger)
  - 提供 swagger 相关的静态HTML 和 js

#### 展示

swagger 地址: <http://egg-swagger-demo.herokuapp.com/explorer>


#### feature

1. 同时 支持 session 和 accessToken 方式登录

#### !注意

egg 2.2.0 版本依赖 koa-router7.7.0。  
在本版本中无法正确匹配到路由.


#### Authorize 设置 之 token 配置

1. config 配置, 增加

```js
config.connectorRemote = {
  enable: true,
  swaggerDefinition: {
    ...
    // 开启 swagger 的前端身份验证
    securityDefinitions: {
      api_key: { // 对应
        type: 'apiKey',
        name: 'X-Access-Token',
        in: 'header',
      },
    },
  },
  ...
};
```

2. model 配置

```js
// 在对应的 model.remtoes 中配置
"security": [{ "api_key": [] }]
// 如 model/admin.json line:64,
// 如果没有改行内容, swagger ui 是不会 设置 header 中的 accessTokens 的，但是项目开发可以自行添加。
```


3. 登录请求

用户名密码 admin:admin


```bash
curl -X POST "http://localhost:7001/api/v1/admins/login" -H "accept: application/json" -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin\"}"

{"id":1,"email":"admin@admin.com","username":"admin","password":"$2a$10$QlA.DnpNNoehYSsfoCPm.eMkv8Bujwbvl5x3r6afmO12E0PdQD3kO","lastSignInAt":"2018-02-28T06:36:36.051Z","createdAt":"2018-01-05T05:42:32.896Z","updatedAt":"2018-02-28T06:36:36.054Z","deletedAt":null,"role":{"id":1,"name":"admin","description":"超级管理员","createdAt":"2018-01-05T05:42:33.010Z","updatedAt":"2018-01-05T05:42:33.010Z","deletedAt":null},"token":{"id":2,"ttl":1209600,"token":"QjZuMTFvJojCLzZoGFTihAXBe6iD8Ffzm8bEEOo1nAnZLjsnXBEjntGamPyTMge1","userId":1,"createdAt":"2018-02-28T06:36:36.087Z"}}
 ```

4. 设置 swagger ui 页面的 token

- 点击右上角 Authorize 的按钮
- 填入 token 并确认
