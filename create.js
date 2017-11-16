const Base = require('./base')
const Choices = require('inquirer/lib/objects/choices')
const path = require('path')
const chalk = require('chalk')
const figures = require('figures')
const emojic = require('emojic')

/**
 * 用于创建条件下使用的Prompt
 */
function Create () {
  Base.apply(this, arguments)
}

Create.prototype = Object.create(Base.prototype)

/**
 * 判断是否为不可选数据，是的话终端指针向下移动
 */
Create.prototype.cursorNext = function () {
  let next = true
  this.opt.choices.forEach(choice => {
    if (choice.type !== 1) {
      next = false
    }
    if (next) {
      this.selected++
    }
  })
}

/**
 * 响应选择目录事件
 */
Create.prototype.handleDrill = function () {
  const choice = this.opt.choices.getChoice(this.selected)
  this.pathArr.push(this.selected)
  this.depth++
  // 拼接路径
  this.currentPath += `/${this.tempData[this.selected].title}`
  // 重新获取选择数据
  this.opt.choices = new Choices(this.createChoices())
  // 重置选择项
  this.selected = 0
  this.cursorNext()
  this.render()
}

/**
 * 响应返回事件
 */
Create.prototype.handleBack = function () {
  if (this.depth > 0) {
    const choice = this.opt.choices.getChoice(this.selected)
    this.depth--
    this.pathArr.pop()
    // 拼接路径
    this.currentPath = path.dirname(this.currentPath);
    // 重新获取选择数据
    this.opt.choices = new Choices(this.createChoices())
    // 重置选择项
    this.selected = 0
    this.cursorNext()
    this.render()
  }
}

/**
 * 向上选择
 */
Create.prototype.onUpKey = function () {
  const len = this.opt.choices.realLength
  this.selected = (this.selected > 0) ? this.selected - 1 : len - 1
  const choice = this.opt.choices.getChoice(this.selected)
  if (choice.type === 1) {
    this.onUpKey()
  }
  this.render()
}

/**
 * 向下选择
 */
Create.prototype.onDownKey = function () {
  const len = this.opt.choices.realLength
  this.selected = (this.selected < len - 1) ? this.selected + 1 : 0
  const choice = this.opt.choices.getChoice(this.selected)
  if (choice.type === 1) {
    this.onDownKey()
  }
  this.render()
}

/**
 * 终端渲染列表选择, 扩展表情
 * @param {Array} choices - 当前路径可选择的数组
 * @param {Number} pointer - 终端选择指示器的位置
 */
Create.prototype.listRender = function (choices, pointer) {
  let output = ''
  let separatorOffset = 0
  choices.forEach((choice, i) => {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n'
      return
    }
    let isSelected = (i - separatorOffset === pointer)
    const icon = (choice.type === 1 ? emojic.pageFacingUp : emojic.fileFolder) + '  '
    let line = (isSelected ? figures.pointer + ' ' : '  ') + ((choice.type === 1 || choice.type === 0) ? icon : '') + choice.name
    if (isSelected) {
      line = chalk.cyan(line)
    }
    output += line + ' \n'
  })
  return output.replace(/\n$/, '')
}

module.exports = Create