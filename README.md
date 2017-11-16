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
        },
        {
          "name": "manage",
          "title": "管理",
          "children": [
          ],
          "type": 0
        },
        {
          "name": "manage2",
          "title": "管理2",
          "children": [
          ],
          "type": 1
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
const { del: Prompt } = require('./index')
inquirer.registerPrompt('level', Prompt)

inquirer.prompt([
  {
    type: "level",
    name: "pathArr",
    message: "请选择",
    basePath: "./模块",
    data: result
  }
]).then(res => {
  console.log(res)
})


```