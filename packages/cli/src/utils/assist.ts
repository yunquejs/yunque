import { CAC } from 'cac'
import fs from 'fs'
import path from 'path'
import { red, yellow } from 'kolorist'
import leven from 'leven'
import { prompt } from 'enquirer'
import { GlobalCLIOptions, Prompt, RenameFiles } from '../interface'

export function cleanOptions(options: GlobalCLIOptions) {
  const ret = { ...options }
  delete ret['--']
  return ret
}

export function suggestCommands(cli: CAC, unknownCommand: string) {
  const availableCommands = cli.commands.map(cmd => cmd.name)

  let suggestion: any

  availableCommands.forEach(cmd => {
    const isBestMatch = leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand)
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd
    }
  })

  if (suggestion) {
    console.log(red(`  Did you mean ${yellow(suggestion)}?`))
  }
}

export const renameFiles: RenameFiles = {
  _gitignore: '.gitignore',
  _npmrc: '.npmrc'
}

export function useWrite(root: string, templateDir: string) {
  return function (file: string, content?: string) {
    const targetPath = renameFiles[file]
      ? path.join(root, renameFiles[file])
      : path.join(root, file)
    if (content) {
      fs.writeFileSync(targetPath, content)
    } else {
      copy(path.join(templateDir, file), targetPath)
    }
  }
}

export function copy(src: string, dest: string) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

export function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true })
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file)
    const destFile = path.resolve(destDir, file)
    copy(srcFile, destFile)
  }
}

export function emptyDir(dir: string, debug = true) {
  if (!fs.existsSync(dir)) {
    return
  }
  for (const file of fs.readdirSync(dir)) {
    debug && console.log(dir, file)
    const abs = path.resolve(dir, file)
    // baseline is Node 12 so can't use rmSync :(
    if (fs.lstatSync(abs).isDirectory()) {
      emptyDir(abs, debug)
      fs.rmdirSync(abs)
    } else {
      fs.unlinkSync(abs)
    }
  }
}

export async function getValidPackageName(projectName: string) {
  const packageNameRegExp = /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/
  if (packageNameRegExp.test(projectName)) {
    return projectName
  } else {
    const suggestedPackageName = projectName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._]/, '')
      .replace(/[^a-z0-9-~]+/g, '-')

    /**
     * @type {{ inputPackageName: string }}
     */
    const { inputPackageName } = await prompt<Prompt>({
      type: 'input',
      name: 'inputPackageName',
      message: `Package name:`,
      initial: suggestedPackageName,
      validate: input => (packageNameRegExp.test(input) ? true : 'Invalid package.json name')
    })
    return inputPackageName
  }
}
