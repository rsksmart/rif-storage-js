import { Readable } from 'stream'
import { Provider } from '../src'
import CID from 'cids'

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
