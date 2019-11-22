export const FILE_SYMBOL = Symbol.for('@rds-lib/file')
export const DIRECTORY_SYMBOL = Symbol.for('@rds-lib/directory')

/**
 * Function that marks an object with Symbol signaling that it is a Directory object.
 *
 * @see isFile
 * @param obj
 */
export function markFile<T extends object> (obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    throw TypeError('obj is not object!')
  }

  // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  // @ts-ignore
  obj[FILE_SYMBOL] = true
  return obj
}

/**
 * Function that marks an object with Symbol signaling that it is a File object no matter what
 * sort of implementation it is (Readable|Buffer|async generator etc)
 *
 * @see isDirectory
 * @param obj
 */
export function markDirectory<T extends object> (obj: T): T {
  if (typeof obj !== 'object' || obj === null) {
    throw TypeError('obj is not object!')
  }

  // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  // @ts-ignore
  obj[DIRECTORY_SYMBOL] = true
  return obj
}

/**
 * Verifies if the returned object is a file
 *
 * @param obj
 */
export function isFile (obj: object): boolean {
  if (typeof obj !== 'object' || obj === null) {
    throw TypeError('obj is not object!')
  }

  // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  // @ts-ignore
  return Boolean(obj && obj[FILE_SYMBOL])
}

/**
 * Verifies if the retuned object is a directory
 *
 * @param obj
 */
export function isDirectory (obj: object): boolean {
  if (typeof obj !== 'object' || obj === null) {
    throw TypeError('obj is not object!')
  }

  // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  // @ts-ignore
  return Boolean(obj && obj[DIRECTORY_SYMBOL])
}
