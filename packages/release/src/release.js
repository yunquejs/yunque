/**
 * modified from https://github.com/vuejs/vue-next/blob/master/scripts/release.js
 */

const fs = require('fs')
const path = require('path')
const chalk = require('kolorist')
const semver = require('semver')
const { prompt } = require('enquirer')
const execa = require('execa')

const cwd = process.cwd()
const resolve = (...args) => path.resolve(cwd, ...args)
const pkg = require(resolve('./package.json'))
const currentVersion = pkg.version

const inc = i => semver.inc(currentVersion, i)
const bin = name => resolve('../node_modules/.bin/', name)
const exec = (bin, args, opts = {}) => execa(bin, args, { stdio: 'inherit', ...opts })

const versionIncrements = [
  'patch',
  'minor',
  'major',
  'prepatch',
  'preminor',
  'premajor',
  'prerelease'
]

const packagesPath = './packages/'
const packages =
  (fs.existsSync(resolve(packagesPath)) &&
    fs.readdirSync(resolve(packagesPath)).filter(item => {
      const stat = fs.lstatSync(resolve(packagesPath + item))
      return stat.isDirectory()
    })) ||
  []

const getPkgRoot = pkg => resolve(packagesPath, pkg)
const step = (msg, newline = true) => console.log(chalk.cyan(newline ? '\n' + msg : msg))

// todo 基于monorepo或者单包进行重构
async function release(version, opts) {
  const pkgOptions = pkg.yunque?.release || {}
  let parentOptions = {}
  const parentPkgPath = pkgOptions.extend || opts.extend
  try {
    parentOptions = (parentPkgPath && require(resolve(parentPkgPath)).yunque?.release) || {}
  } catch (e) {
    console.log(e)
  }
  let options = { ...opts, ...parentOptions, ...pkgOptions }
  options = {
    ...options,
    skip: typeof options.skip === 'string' ? options.skip.split(',') : options.skip,
    name: typeof options.name === 'string' ? options.name.split(',') : options.name
  }

  const { dry, skipTest, skipBuild, skip, skipChangelog } = options

  const dryRun = (bin, args, opts = {}) =>
    console.log(chalk.blue(`[dryrun] ${bin} ${args.join(' ')}`), opts)
  const run = dry ? dryRun : exec

  if (!version) {
    // no explicit version, offer suggestions
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom'])
    })

    if (release === 'custom') {
      version = (
        await prompt({
          type: 'input',
          name: 'version',
          message: 'Input custom version',
          initial: currentVersion
        })
      ).version
    } else {
      version = release.match(/\((.*)\)/)[1]
    }
  }

  if (!semver.valid(version)) {
    throw new Error(`invalid target version: ${version}`)
  }

  const { yes } = await prompt({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${version}. Confirm?`
  })

  if (!yes) {
    return
  }

  // run test before release
  step('Running test...')
  if (!skipTest && !dry) {
    await run(bin('jest'), ['--clearCache'])
    await run('yarn', ['test', '--bail'])
  } else {
    console.log(`(skipped test)`)
  }

  // update all package versions and inter-dependencies
  step('Updating cross dependencies...')
  updateVersions(version, options)

  // build all packages with types
  step('Building all packages...')
  if (!skipBuild && !dry) {
    await run('yarn', ['build'])
    // test generated dts files
    // step('Verifying type declarations...')
    // await run('yarn', ['test-dts-only'])
  } else {
    console.log(`(skipped build)`)
  }

  // generate changelog
  step('Changelog...')
  if (!skipChangelog && !dry) {
    await run(`yarn`, ['changelog'])
  } else {
    console.log(`(skipped changelog)`)
  }

  // git commit changelog
  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' })
  if (stdout) {
    step('Committing changes...')
    await run('git', ['add', '-A'])
    await run('git', ['commit', '-m', `release: v${version}`])
  } else {
    console.log('No changes to commit.')
  }

  // publish packages
  step('Publishing packages...')
  await publishPackages(version, run, options)

  // push to GitHub
  step('Pushing to GitHub...')
  await run('git', ['tag', `v${version}`])
  await run('git', ['push', 'origin', `refs/tags/v${version}`])
  await run('git', ['push'])

  if (dry) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }

  if (skip.length) {
    console.log(
      chalk.yellow(`The following packages are skipped and NOT published:\n- ${skip.join('\n- ')}`)
    )
  }
  console.log()
}

function updateVersions(version, options) {
  updatePackage(path.resolve('.'), version, options)
  if (!options.monorepo) return
  packages.forEach(p => updatePackage(getPkgRoot(p), version, options))
}

function updatePackage(pkgRoot, version, options) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  if (!options.monorepo) return
  updateDeps(pkg, 'dependencies', version, options)
  updateDeps(pkg, 'peerDependencies', version, options)
}

function updateDeps(pkg, depType, version, options) {
  const pkgName = options.pkgName || ''
  const pkgPrefix = options.pkgPrefix || ''
  const deps = pkg[depType]
  const reg = new RegExp(`^${pkgPrefix}\/`)
  if (!deps) return
  Object.keys(deps).forEach(dep => {
    if (
      pkgName.includes(dep) ||
      (dep.startsWith(pkgPrefix) && packages.includes(dep.replace(reg, '')))
    ) {
      console.log(chalk.yellow(`${pkg.name} -> ${depType} -> ${dep}@${version}`))
      deps[dep] = version
    }
  })
}

async function publishPackages(version, run, options) {
  await publishPackage('.', version, run, options)
  if (!options.monorepo) return
  for (const pkg of packages) {
    await publishPackage(pkg, version, run, options)
  }
}

async function publishPackage(pkgName, version, run, options) {
  const { skip, tag } = options
  if (skip && skip.includes(pkgName)) {
    return
  }
  const pkgRoot = getPkgRoot(pkgName)
  console.log(pkgName, pkgRoot)
  // todo stop here, by dry
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  if (pkg.private) {
    return
  }

  step(`Publishing ${pkgName}...`)

  const publicArgs = [
    'publish',
    '--no-git-tag-version',
    '--new-version',
    version,
    '--access',
    'public'
  ]
  if (tag) {
    publicArgs.push(`--tag`, tag)
  }
  try {
    await run('yarn', publicArgs, {
      cwd: pkgRoot,
      stdio: 'pipe'
    })
    console.log(chalk.green(`Successfully published ${pkgName}@${version}`))
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(chalk.red(`Skipping already published: ${pkgName}`))
    } else {
      throw e
    }
  }
}

module.exports = {
  release
}
