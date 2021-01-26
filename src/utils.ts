import { Directory, DirectoryArray, Entry, Provider } from './definitions'
import { Readable } from 'stream'
import CID from 'cids'

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

  // @ts-ignore: TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
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

  // @ts-ignore: TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  obj[DIRECTORY_SYMBOL] = true
  return obj
}

/**
 * Verifies if the returned object is a file
 *
 * @param obj
 */
export function isFile (obj: object): obj is Entry<any> {
  if (typeof obj !== 'object' || obj === null) {
    throw TypeError('obj is not object!')
  }

  // @ts-ignore: TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  return Boolean(obj[FILE_SYMBOL])
}

/**
 * Verifies if the returned object is a directory
 *
 * @param obj
 */
export function isDirectory (obj: object): obj is Directory<any> {
  if (typeof obj !== 'object' || obj === null) {
    throw TypeError('obj is not object!')
  }

  // @ts-ignore: TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
  return Boolean(obj[DIRECTORY_SYMBOL])
}

export function isTSDirectory<T> (data: object, genericTest: (entry: T) => boolean): data is Directory<T> {
  if (typeof data !== 'object' || Array.isArray(data) || data === null) {
    return false
  }

  return !Object.values(data).some(
    entry => typeof entry !== 'object' ||
      !('data' in entry) ||
      !genericTest(entry.data)
  )
}

export function isTSDirectoryArray<T> (data: object, genericTest: (entry: T) => boolean): data is DirectoryArray<T> {
  if (!Array.isArray(data)) {
    return false
  }

  return !data.some(
    entry => typeof entry !== 'object' ||
      !entry.data ||
      !entry.path ||
      !genericTest(entry.data)
  )
}

export function isReadable (entry: unknown): entry is Readable {
  return typeof entry === 'object' &&
    entry !== null &&
    typeof (entry as Readable).pipe === 'function' &&
    (entry as Readable).readable !== false &&
    typeof (entry as Readable)._read === 'function'
}

export function isReadableOrBuffer (entry: unknown): entry is Readable | Buffer {
  return Buffer.isBuffer(entry) || isReadable(entry)
}

export function detectAddress (address: string): Provider | false {
  try {
    // eslint-disable-next-line no-new
    new CID(address)
    return Provider.IPFS
  } catch (e) {
    if (address.length !== 64) {
      return false
    }

    return Provider.SWARM
  }
}

/**
 * Fetches last item of the async iterable.
 * @param iter
 */
export async function lastAsyncIterItem<T> (iter: AsyncIterable<T>): Promise<T | undefined> {
  let last: T | undefined

  for await (const el of iter) {
    last = el
  }

  return last
}

export async function arrayFromAsyncIter<T> (iter: AsyncIterable<T>): Promise<T[]> {
  const arr: T[] = []

  for await (const el of iter) {
    arr.push(el)
  }

  return arr
}
