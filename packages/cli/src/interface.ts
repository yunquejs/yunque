export interface IObject {
  [key: string]: any
}

export interface GlobalCLIOptions {
  '--'?: string[]
}

export interface CreateOptions extends GlobalCLIOptions {
  clone?: boolean
}

export interface RenameFiles extends IObject {
  _gitignore: '.gitignore'
}

export interface Prompt {
  yes: boolean
  templateName: string
  inputPackageName: string
}

export type GeneratorPrefix = 'github' | 'gitlab' | 'bitbucket'

export interface RepoGenerator {
  type: 'repo'
  prefix: GeneratorPrefix
  user: string
  repo: string
  version: string
  hash: string
}

export type Generator = RepoGenerator
