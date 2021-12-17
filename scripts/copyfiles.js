const fs = require('fs')
const copyfiles = require('copyfiles')

copyfiles(['README.md', 'docs'], {}, () => {})
fs.copyFileSync('README.md', 'docs/index.md')

const pkgs = fs.readdirSync(process.cwd() + '/packages').filter(x => !x.startsWith('.'))
for (const pkg of pkgs) {
  fs.copyFileSync(`packages/${pkg}/README.md`, `docs/${pkg}.md`)
}
