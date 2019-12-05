/**
 * Base error for all RDS errors
 */
export class RdsError extends Error {
  static code = 'RDS_ERR'

  constructor (message: string) {
    super(message)
    this.name = 'RdsError'
  }
}

/**
 * General error for any problems related to passed value that is not related to its type
 * (for that use built in TypeError)
 */
export class ValueError extends RdsError {
  static code = 'RDS_VALUE_ERR'

  constructor (message: string) {
    super(message)
    this.name = 'ValueError'
  }
}
