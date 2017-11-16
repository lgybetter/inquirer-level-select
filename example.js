const inquirer = require("inquirer")
const { result } = require("./config")
const { base: Prompt } = require('./index')
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
