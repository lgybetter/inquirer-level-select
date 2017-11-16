const Base = require('./base')
const chalk = require('chalk')
const figures = require('figures')
const emojic = require('emojic')

function Del () {
  Base.apply(this, arguments)
}

Del.prototype = Object.create(Base.prototype)

/**
 * 终端渲染列表选择, 扩展表情
 * @param {Array} choices - 当前路径可选择的数组
 * @param {Number} pointer - 终端选择指示器的位置
 */
Del.prototype.listRender = function (choices, pointer) {
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

module.exports = Del

