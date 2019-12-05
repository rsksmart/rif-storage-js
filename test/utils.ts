import { Readable } from 'stream'

export function createReadable (input: string): Readable {
  const stream = new Readable()
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
