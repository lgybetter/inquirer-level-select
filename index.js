/**
 * 层级结构类型 prompt
 */
const rx = require('rx-lite')
const _ = require('lodash')
const util = require('util')
const chalk = require('chalk')
const figures = require('figures')
const cliCursor = require('cli-cursor')
const Base = require('inquirer/lib/prompts/base')
const observe = require('inquirer/lib/utils/events')
const Paginator = require('inquirer/lib/utils/paginator')
const Choices = require('inquirer/lib/objects/choices')
const Separator = require('inquirer/lib/objects/separator')
const path = require('path')

/**
 * 常量
 */
const CHOOSE = '选择当前路径'
const BACK = '返回'

/**
 * Prompt 类
 */
class Prompt {
  constructor () {
    Base.apply(this, arguments)
    if (!this.opt.basePath) {
      this.throwParamError('basePath')
    }
    if (!this.opt.data) {
      this.throwParamError('data')
    }
    // 当前的数据
    this.data = this.opt.data
    this.tempData = []
    // 记录当前进入目录的层数
    this.depth = 0
    // 记录用户选择的路径，方便后续查找
    this.pathArr = []
    // 转换数组数据为选择项
    this.opt.choices = new Choices(this.createChoices())
    // 用于展示的路径
    this.currentPath = this.opt.basePath
    // 分隔符
    this.paginator = new Paginator()
    // 光标的位置
    this.selected = 0
    this.opt.default = null
  }
  /**
   * 入口函数
   * @param {Function} cb 
   */
  _run (cb) {
    this.searchMode = false
    this.done = cb
    const events = observe(this.rl)

    const keyUps = events.keypress.filter(e => {
      return e.key.name === 'up'
    }).share()

    const keyDowns = events.keypress.filter(e => {
      return e.key.name === 'down'
    }).share()

    const keyMinus = events.keypress.filter(e => {
      return e.value === '-';
    }).share()
    const outcome = this.handleSubmit(events.line)
    outcome.drill.forEach(this.handleDrill.bind(this))
    outcome.back.forEach(this.handleBack.bind(this))
    keyUps.takeUntil(outcome.done).forEach(this.onUpKey.bind(this))
    keyDowns.takeUntil(outcome.done).forEach(this.onDownKey.bind(this))
    keyMinus.takeUntil(outcome.done).forEach(this.handleBack.bind(this))
    outcome.done.forEach(this.onSubmit.bind(this))
    cliCursor.hide()
    this.render()
    return this
  }
  /**
   * 转换数组数据为选择项
   */
  createChoices () {
    const choices = this.flashData()
    if (choices.length > 0) {
      choices.push(new Separator())
    }
    choices.push(CHOOSE)
    if (this.depth > 0) {
      choices.push(new Separator())
      choices.push(BACK)
      choices.push(new Separator())
    }
    return choices
  }
  /**
   * 获取数据数组
   */
  flashData () {
    let choices = this.data
    this.pathArr.forEach((item, index) => {
      choices = choices[item].children
    })
    this.tempData = choices
    return choices.map(item => item.title)
  }
  /**
   * 终端输出函数
   */
  render () {
    let message = this.getQuestion()
    if (this.status === 'answered') {
      message += chalk.cyan(this.currentPath)
    } else {
      message += chalk.bold('\n 当前目录: ') + chalk.cyan(this.currentPath)
      const choicesStr = listRender(this.opt.choices, this.selected)
      message += '\n' + this.paginator.paginate(choicesStr, this.selected, this.opt.pageSize)
    }
    this.screen.render(message)
  }
  /**
   * 响应enter事件
   */
  handleSubmit (e) {
    const obx = e.map(() => {
      return this.opt.choices.getChoice(this.selected).value
    }).share()
    const done = obx.filter(choise => {
      return choise === CHOOSE
    }).take(1)
    const back = obx.filter(choice => {
      return choice === BACK
    }).takeUntil(done)
    const drill = obx.filter(choise => {
      return choise !== BACK && choise !== CHOOSE
    }).takeUntil(done)
    return {
      done,
      back,
      drill
    }
  }
  /**
   * 响应选择目录事件
   */
  handleDrill () {
    const choice = this.opt.choices.getChoice(this.selected)
    this.pathArr.push(this.selected)
    this.depth++
    // 拼接路径
    this.currentPath += `/${this.tempData[this.selected].title}`
    // 重新获取选择数据
    this.opt.choices = new Choices(this.createChoices())
    // 重置选择项
    this.selected = 0
    this.render()
  }

  /**
   * 响应返回事件
   */
  handleBack () {
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
      this.render()
    }
  }

  /**
   * 确定选择该路径
   */
  onSubmit () {
    this.status = 'answered'
    this.render()
    this.screen.done()
    cliCursor.show()
    // 完成的事件处理
    this.done(this.pathArr)
  }

  /**
   * 向上选择
   */
  onUpKey () {
    const len = this.opt.choices.realLength
    this.selected = (this.selected > 0) ? this.selected - 1 : len - 1
    this.render()
  }

  /**
   * 向下选择
   */
  onDownKey () {
    const len = this.opt.choices.realLength
    this.selected = (this.selected < len - 1) ? this.selected + 1 : 0
    this.render()
  }
  
}

util.inherits(Prompt, Base)

/**
 * 终端渲染列表选择
 * @param {Array} choices - 当前路径可选择的数组
 * @param {Number} pointer - 终端选择指示器的位置
 */
function listRender(choices, pointer) {
  let output = ''
  let separatorOffset = 0
  choices.forEach((choice, i) => {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n'
      return
    }
    let isSelected = (i - separatorOffset === pointer)
    let line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name
    if (isSelected) {
      line = chalk.cyan(line)
    }
    output += line + ' \n'
  })
  return output.replace(/\n$/, '')
}

module.exports = Prompt
