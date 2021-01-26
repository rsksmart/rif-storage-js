import FormData from 'form-data'
import { Directory } from '../../definitions'
import { Readable } from 'stream'
import { isReadable } from '../../utils'

// eslint-disable-next-line require-await
export async function toFormData (input: Directory<Buffer | Readable>): Promise<FormData> {
  const formData = new FormData()

  for (const [path, entry] of Object.entries(input)) {
    // In Node.js, FormData can be passed a stream so no need to buffer
    formData.append(
      path,
      entry.data,
      {
        filepath: path,
        contentType: entry.contentType,
        knownLength: entry.size
      }
    )
  }

  return formData
}

// eslint-disable-next-line require-await
export default async function prepareData (data: string | Buffer | Readable | Directory<Buffer | Readable>): Promise<Buffer | FormData | Readable> {
  if (typeof data === 'string') {
    return Buffer.from(data)
  }

  if (Buffer.isBuffer(data) || isReadable(data)) {
    return data
  }

  return toFormData(data)
}
