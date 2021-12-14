import { blue, yellow, red, cyan, white, lightRed, bgLightYellow } from 'kolorist'

console.log(red(`Error: something failed in ${cyan('my-file.js')}.`))
console.log(yellow(`Error: something failed in ${cyan('my-file.js')}.`))
console.log(blue(`Error: something failed in ${cyan('my-file.js')}.`))

console.log(lightRed(`Error: something failed in.`))

console.log(bgLightYellow(white(`Error: something failed in.`)))

import leven from 'leven'
import path from 'path'

const arr = ['abcd', 'efgh', 'jklo']
console.log(leven('cd', arr[0]))
console.log(leven('cd', arr[1]))
console.log(leven('cd', arr[2]))
const cwd = process.cwd()
console.log(path.relative('/adasd/q3123', 'asd'))
