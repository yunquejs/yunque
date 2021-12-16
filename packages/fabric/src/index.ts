const eslint = require('./eslint')
const vueEslint = require('./vue.eslint')
const reactEslint = require('./react.eslint')
const prettier = require('./prettier')
const rollup = require('./rollup.config')

module.exports = {
  eslint,
  vueEslint,
  reactEslint,
  prettier,
  rollup
}
