import sum from 'hash-sum'
import type { GeneratorPrefix, Generator } from './interface'

export function parseGenerator(generator: string): Generator {
  // xinlei3166/ts-template
  // xinlei3166/ts-template#main
  // github:xinlei3166/ts-template#v1.0.0
  const reg = /(?:(.+):)?(.+\/?.+)+\/([^/\s#]+)(?:#(.+))?$/
  const [, prefix = 'github', user, repo, version = 'master'] = reg.exec(generator) || []
  const hash = sum({
    type: 'repo',
    prefix,
    user,
    repo,
    version
  })
  return {
    type: 'repo',
    prefix: prefix as GeneratorPrefix,
    user,
    repo,
    version,
    hash
  }
}
