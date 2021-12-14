import path from 'path'
import os from 'os'
import fs from 'fs'
import spawn from 'cross-spawn'
import axios from 'axios'
import extractZip from '@egoist/extract-zip'
import { logger, error, move } from './utils'
import { Generator, RepoGenerator } from './interface'

export function getUrl(generator: RepoGenerator, clone?: boolean): string {
  let url = ''

  const origins = {
    github: 'github.com',
    gitlab: 'gitlab.com',
    bitbucket: 'bitbucket.com'
  }
  let origin = origins[generator.prefix] || ''

  if (clone) {
    origin = 'git@' + origin
  } else {
    origin = 'https://' + origin
  }

  if (/^git@/i.test(origin)) {
    origin = origin + ':'
  } else {
    origin = origin + '/'
  }

  // Build url
  if (clone) {
    url = origin + generator.user + '/' + generator.repo + '.git'
  } else {
    if (generator.prefix === 'github') {
      url = `${origin}${generator.user}/${generator.repo}/archive/${generator.version}.zip`
    } else if (generator.prefix === 'gitlab') {
      url = `${origin}${generator.user}/${generator.repo}/repository/archive.zip?ref=${generator.version}`
    } else if (generator.prefix === 'bitbucket') {
      url = `${origin}${generator.user}/${generator.repo}/get/${generator.version}.zip`
    }
  }

  return url
}

async function downloadFile(url: string, outPath: string, extract: boolean): Promise<void> {
  const tempFile = path.join(outPath, `temp`)
  const writer = fs.createWriteStream(tempFile)

  logger.info(`Downloading file: ${url}\n`)

  const response = await axios({ url, responseType: 'stream', method: 'GET' })
  response.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })

  if (extract) {
    logger.info(`Extracting downloaded file`)
    await extractZip(tempFile, {
      dir: outPath,
      strip: 1
    })
  } else {
    await move(tempFile, outPath)
  }
}

export async function downloadRepo(
  generator: Generator,
  { clone, outDir }: { clone?: boolean; outDir: string }
): Promise<void> {
  const url = getUrl(generator, clone)
  if (clone) {
    logger.info(`\nCloning project: ${url}\n`)
    const cmd = spawn.sync('git', [
      'clone',
      url,
      outDir,
      '--depth=1',
      generator.version === 'master' ? '' : `--branch=${generator.version}`
    ])
    if (cmd.status !== 0) {
      throw error(`Failed to download repo: ${cmd.output}\n`)
    }
  } else {
    await downloadFile(url, outDir, true)
  }
}
