import sum from 'hash-sum'
import { GeneratorPrefix, Generator } from './interface'

export function parseGenerator(generator: string): Generator {
  // gitlab:xinlei3166/ts-template/tree/v1.0.0
  // github:xinlei3166/ts-template/tree/v1.0.0
  const reg = /\/tree\//i.test(generator)
    ? /(?:(.+):)?(.+\/?.+)+\/([^/]+)\/tree\/(.+)$/
    : /(?:(.+):)?(.+\/?.+)+\/([^/]+)(?:\/tree\/(.+))?$/
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
