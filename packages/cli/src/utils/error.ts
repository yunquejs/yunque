import { error as _error } from 'exception-error'

const ERROR = 'YunqueCliError'

export const error = (msg: string) => _error({ code: ERROR, msg })
