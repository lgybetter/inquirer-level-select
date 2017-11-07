## 层级结构数据终端选择交互命令

### Example

1. 具有层级结构数据传入格式

```json
{
  "result": [
    {
      "name": "channel",
      "title": "渠道",
      "type": 0,
      "children": [
        { 
          "name ": "order",
          "title": "订单",
          "children": [
            {
              "name": "list",
              "title": "列表",
              "children": [],
              "type": 1
            }
          ],
          "type": 0
        }
      ]
    },
    {
      "name": "distribu",
      "title": "分销",
      "type": 0,
      "children": []
    }
  ]
}

```

2. Prompt的注册调用

```js
const inquirer = require("inquirer")
const { result } = require("./config")
const Prompt = require('./index')
inquirer.registerPrompt('level', Prompt)

inquirer.prompt([
  {
    type: "level",
    name: "pathArr",
    message: "请选择 目录/模块",
    basePath: "./模块",
    data: result
  }
]).then(res => {
  console.log(res)
})

```