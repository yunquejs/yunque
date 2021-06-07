const cac = require('cac')
const { red, yellow } = require('kolorist')
const pkg = require('../package.json')
const { release } = require('./release')

const cli = cac('yunque-release')

function cleanOptions(options) {
  const ret = { ...options }
  delete ret['--']
  return ret
}

cli
  .command('[version]', '[semver] release and publish project by yunque-release, such as 1.0.0')
  .alias('release')
  .option('--dry', `[boolean] dry run`, {
    default: false
  })
  .option('--monorepo', `[boolean] monorepo`, {
    default: false
  })
  .option('--skipTest', `[boolean] skip test`, {
    default: true
  })
  .option('--skipBuild', `[boolean] skip build`, {
    default: false
  })
  .option('--skipChangelog', `[boolean] skip changelog`, {
    default: false
  })
  .option('--skip [skip]', `monorepo, [string] skip package, such as package1 package1,package2`)
  .option(
    '--pkgName [pkgName]',
    `[string] monorepo, the package name included in the updated version, such as package1 package1,package2`
  )
  .option(
    '--pkgPrefix [pkgPrefix]',
    `[string] monorepo, the package name prefix included in the updated version, such as @yunque`
  )
  .option(
    '--extend [extend]',
    `[string] extend other package.json file for reuse, such as ../../package.json`
  )
  .option('--tag, [tag]', `[string] publish tag, such as next`)
  .action(async (version, options) => {
    const releaseOptions = cleanOptions(options)
    try {
      await release(version, releaseOptions)
    } catch (e) {
      console.error(e)
    }
  })

cli.on('command:*', () => {
  const cmd = cli.args[0]
  cli.outputHelp()
  console.log(red(`\n  Unknown command ${yellow(cmd)}.\n`))
  process.exit(1)
})

cli.help()
cli.version(pkg.version)

try {
  cli.parse(process.argv, { run: false })
  cli.runMatchedCommand()
} catch (error) {
  cli.outputHelp()
  process.exit(1)
}
