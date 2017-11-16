const Base = require('./base')
const util = require('util')

class Create {
  constructor() {
    Base.apply(this, arguments)
  }

  /**
   * 判断是否为不可选数据，是的话终端指针向下移动
   */
  cursorNext () {
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
    this.cursorNext()
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
      this.cursorNext()
      this.render()
    }
  }

  /**
   * 向上选择
   */
  onUpKey () {
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
  onDownKey () {
    const len = this.opt.choices.realLength
    this.selected = (this.selected < len - 1) ? this.selected + 1 : 0
    const choice = this.opt.choices.getChoice(this.selected)
    if (choice.type === 1) {
      this.onDownKey()
    }
    this.render()
  }
}

util.inherits(Create, Base)

module.exports = Create