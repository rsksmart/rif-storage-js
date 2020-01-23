/* eslint-env browser */

import { Directory } from '../../types'
import { Readable } from 'readable-stream'
import { isReadable } from '../../utils'

export async function toFormData (input: Directory<string | Buffer | Readable>): Promise<FormData> {
  const formData = new FormData()
  for (const [path, entry] of Object.entries(input)) {
    if (Buffer.isBuffer(entry.data)) {
      formData.append(path, new Blob([entry.data.buffer], { type: entry.contentType }), path)
    } else if (isReadable(entry.data)) {
      // In the browser there's _currently_ no streaming upload, buffer up our
      // async iterator chunks and append a big Blob :(
      // One day, this will be browser streams
      const bufs = []
      for await (const chunk of entry.data) {
        bufs.push(chunk)
      }
      formData.append(path, new Blob([Buffer.concat(bufs).buffer], { type: entry.contentType }), path)
    } else {
      throw new Error('Unknown type of data!')
    }
  }

  return formData
}

// eslint-disable-next-line require-await
export default async function prepareData (data: string | Buffer | Readable | Directory<Buffer | Readable>): Promise<string | Buffer | FormData> {
  if (Buffer.isBuffer(data) || typeof data === 'string') {
    return data
  }

  if (isReadable(data)) {
    return new Promise(resolve => {
      const buffers: Array<Uint8Array> = []
      data.on('data', function (d) {
        buffers.push(d)
      })
      data.on('end', function () {
        resolve(Buffer.concat(buffers))
      })
    })
  }

  return toFormData(data)
}
