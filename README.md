# egg restful-api 和 swagger 结合演示 Demo

#### 相关插件库

1. [egg-connector-remote](https://github.com/TheOne1006/egg-connector-remote)
  - 主要功能: 通过 Class Model 自定义相关参数, 创建 swagger 配置文件. 存储于 `app.swagger` 全局变量中
  - registerRemote 函数, 通过Model 注册生成 相关的控制器。也可以绑定现有的控制器
  - accessRemote: 访问鉴权, 方法访问控制
2. [egg-swagger](https://github.com/TheOne1006/egg-swagger)
  - 提供 swagger 相关的静态HTML 和 js


#### !注意

egg 2.2.0 版本依赖 koa-router7.7.0。  
在本版本中无法正确匹配到路由.

### Demo
url: <http://egg-swagger-demo.herokuapp.com/explorer>  
账号：admin:admin , demo:demo  
如果需要其他操作，需要从 admins/login 登录后访问。  
