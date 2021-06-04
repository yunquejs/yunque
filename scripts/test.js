const path = require('path')
const fs = require('fs')

const resolve = (...args) => path.resolve(process.cwd(), ...args)

const packages =
  (fs.existsSync(resolve('./packages/')) &&
    fs.readdirSync(resolve('./packages/')).filter(item => {
      const stat = fs.lstatSync(resolve('./packages/' + item))
      return stat.isDirectory()
    })) ||
  []

console.log(resolve('./packages/'))
const currentVersion = require('../package.json').version
console.log(currentVersion)

const args = require('minimist')(process.argv.slice(2))
