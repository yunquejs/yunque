import { cyan } from 'kolorist'
import templates from '../templates'

export function list() {
  console.log('########################### Current Templates ###########################')
  for (const template of templates) {
    console.log(`\n${cyan(template.name)} ${template.desc}`)
  }
}
