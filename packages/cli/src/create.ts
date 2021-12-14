import fs from 'fs'
import path from 'path'
import { green, cyan } from 'kolorist'
import { prompt } from 'enquirer'
import { downloadRepo } from './download-repo'
import { parseGenerator } from './parse-generator'
import { emptyDir, getValidPackageName, spinner, logger, error } from './utils'
import { Prompt, CreateOptions } from './interface'
import templates from '../templates'

const cwd = process.cwd()

export async function create(template: string, targetDir: string, options: CreateOptions) {
  const packageName = await getValidPackageName(targetDir)
  const root = path.join(cwd, targetDir)

  // if exist, cleanup root
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true })
  } else {
    const existing = fs.readdirSync(root)
    if (existing.length) {
      const { yes } = await prompt<Prompt>({
        type: 'confirm',
        name: 'yes',
        initial: 'Y',
        message:
          (targetDir === '.' ? 'Current directory' : `Target directory ${targetDir}`) +
          ' is not empty.\n' +
          'Remove existing files and continue?'
      })
      if (yes) {
        emptyDir(root)
      } else {
        return
      }
    }
  }

  if (!template) {
    const { templateName } = await prompt<Prompt>({
      type: 'select',
      name: 'templateName',
      message: 'Select a template:',
      choices: templates.map((t: any) => ({
        name: t.name,
        value: t.name,
        message: t.name
      }))
    })
    template = templateName
  }

  // templates
  const t = templates.find(x => x.name === template)
  template = t ? t.repo : template

  // create by repo
  const res = await createByRepo(template, root, options)
  if (!res) {
    logger.error('\nFailed to create the project, please try again.\n')
    return
  }

  // end work
  const pkg = require(path.join(root, `package.json`))
  pkg.name = packageName
  pkg.description = packageName
  pkg.version = '1.0.0'

  const write = (targetPath: string, content: string) =>
    fs.writeFileSync(path.join(root, targetPath), content)
  write('README.md', `# ${packageName}`)
  write('package.json', JSON.stringify(pkg, null, 2))

  // remove temp files
  removeTempFiles(template, root, options)

  // complete
  const pkgManager = pkg.packageManager?.split('@')[0] || 'yarn'

  console.log(green(`Done. Now run:\n`))
  if (root !== cwd) {
    console.log(cyan(`  cd ${path.relative(cwd, root)}`))
  }
  console.log(cyan(`  ${pkgManager} install`))
  console.log(cyan(`  ${pkgManager} run dev`))
  console.log()
}

// created by remote repo
async function createByRepo(template: string, root: string, options: CreateOptions) {
  logger.info(`\nScaffolding project in ${root}...\n`)

  // Download repo
  spinner.start('Downloading repo\n')
  const generator = parseGenerator(template)
  if (!generator.user || !generator.repo) {
    spinner.stop()
    logger.error(`Invalid template: ${template}`)
    return false
  }

  try {
    await downloadRepo(generator, {
      clone: options.clone,
      outDir: root
    })
    logger.success('Downloaded repo\n')
  } catch (err: any) {
    let message = err.message
    if (err.host && err.path) {
      message += '\n' + err.host + err.path
    }
    throw error(message)
  } finally {
    spinner.stop()
  }

  return true
}

function removeTempFiles(template: string, root: string, options: CreateOptions) {
  logger.info(`\nCleaning up temporary files in ${root}...\n`)
  let tempDir: string
  if (options.clone) {
    tempDir = path.join(root, '.git')
  } else {
    const generator = parseGenerator(template)
    tempDir = path.join(root, `${generator.repo}-${generator.version}`)
    const tempFile = path.join(root, 'temp')
    fs.unlinkSync(tempFile)
  }
  if (fs.existsSync(tempDir)) {
    emptyDir(tempDir, false)
    fs.rmdirSync(tempDir)
  }
}
