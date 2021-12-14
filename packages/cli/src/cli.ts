import cac from 'cac'
import { red, yellow } from 'kolorist'
import pkg from '../package.json'
import { cleanOptions, suggestCommands } from './utils'
import { CreateOptions, GlobalCLIOptions } from './interface'
import { create } from './create'
import { list } from './list'

const cli = cac('yunque')

cli
  .command(
    '[template-name] <app-name>',
    'create a new project powered by yunque, <template-name> template name or github repo (xinlei3166/vite-vue-template), <app-name> project target dir'
  )
  .alias('create')
  .option('--no-clone', `[boolean] don't use git clone`)
  .action(async (templateName: string, appName: string, options: CreateOptions) => {
    if (!appName) {
      appName = templateName
      templateName = ''
    }
    const createOptions = cleanOptions(options)
    try {
      await create(templateName, appName, createOptions)
    } catch (e) {
      console.error(e)
    }
  })

cli
  .command('list', 'show template list')
  .action(async (templateName: string, appName: string, options: GlobalCLIOptions) => {
    list()
  })

cli.on('command:*', () => {
  const cmd = cli.args[0]
  cli.outputHelp()
  console.log(red(`\n  Unknown command ${yellow(cmd)}.\n`))
  suggestCommands(cli, cmd)
  process.exit(1)
})

cli.help()
cli.version(pkg.version)

try {
  cli.parse(process.argv, { run: false })
  cli.runMatchedCommand()
} catch (error) {
  const cmd = cli.commands.find(cmd => cmd.name === cli.matchedCommandName)
  const arg = (cmd && cmd.rawName.split(' ')[1]) || ''
  cli.outputHelp()
  if (cmd && cmd.name !== '') {
    console.log(red(`\n  Missing required argument ${yellow(arg)}.`))
    process.exit(1)
  }
}

// if (!process.argv.slice(2).length) {
//   cli.outputHelp()
// }
