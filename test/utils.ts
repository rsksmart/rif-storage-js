import { Readable } from 'stream'
import { File as IPFSFile, IPFSEntry } from 'ipfs-core-types/src/files'
import { arrayFromAsyncIter } from '../src/utils'

export function createReadable (input: string): Readable {
  const stream = new Readable()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stream._read = (): void => {}
  stream.push(Buffer.from(input))
  stream.push(null)

  return stream
}

export function streamToBuffer (stream: Readable): Promise<Buffer> {
  const chunks: Array<Buffer> = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => {
      chunks.push(chunk)
    })
    stream.on('error', reject)
    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })
  })
}

export function getFileEntry (entry: IPFSEntry): IPFSFile {
  if (entry.type === 'dir') {
    throw new Error('Entry is not file!')
  }

  return entry as unknown as IPFSFile
}

export async function streamToString (stream: Readable): Promise<string> {
  return (await streamToBuffer(stream)).toString('utf8')
}

export async function asyncIteratorToString (iter?: AsyncIterable<Uint8Array>): Promise<string> {
  if (!iter) throw new TypeError('Iter can not be undefined!')

  return Buffer.concat(await arrayFromAsyncIter(iter)).toString()
}

/**
 * Utility function for generating random Buffer
 * !!! IT IS NOT CRYPTO SAFE !!!
 * For that use `crypto.randomBytes()`
 *
 * @param length
 */
export function randomBuffer (length: number): Buffer {
  const buf = Buffer.alloc(length)

  for (let i = 0; i < length; ++i) {
    buf[i] = (Math.random() * 0xFF) << 0
  }

  return buf
}
