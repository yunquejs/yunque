import Logger from 'xlogger-pretty'
import * as colors from 'kolorist'

export const logger = new Logger({
  wrapLabel: true
  // colors: {
  //   info: colors.bgCyan,
  //   debug: colors.bgMagenta,
  //   notice: colors.bgCyan,
  //   warn: colors.bgYellow,
  //   error: colors.bgRed,
  //   success: colors.bgGreen
  // }
})
