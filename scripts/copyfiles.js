const path = require('path')
const fs = require('fs')

fs.copyFileSync('./README.md', './docs/index.md')

const pkgs = fs.readdirSync('./packages').filter(x => !x.startsWith('.'))

for (const pkg of pkgs) {
  fs.copyFileSync(`./packages/${pkg}/README.md`, `./docs/${pkg}.md`)
}
