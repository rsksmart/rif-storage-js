import { Readable } from 'stream'

export function createReadable (input: string): Readable {
  const stream = new Readable()
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  stream._read = (): void => {}
  stream.push(Buffer.from(input))
  stream.push(null)

  return stream
}

export function streamToString (stream: Readable): Promise<string> {
  const chunks: Array<Buffer> = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => {
      chunks.push(chunk)
    })
    stream.on('error', reject)
    stream.on('end', () => {
      resolve(Buffer.concat(chunks).toString('utf8'))
    })
  })
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
