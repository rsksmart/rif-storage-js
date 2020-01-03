import {
  Address, PutInputs,
  Directory, DirectoryArray,
  Provider,
  SwarmStorageProvider
} from '../types'
import { BzzConfig, UploadOptions, DownloadOptions } from '@erebos/api-bzz-base'
import { Bzz } from '@erebos/api-bzz-node'
import { ValueError } from '../errors'
import { isTSDirectory, markDirectory, markFile, isReadable, isTSDirectoryArray, isReadableOrBuffer } from '../utils'
import debug from 'debug'
import { Readable } from 'stream'
import tar from 'tar-stream'

const log = debug('rds:swarm')

function isBzz (client: BzzConfig | Bzz): client is Bzz {
  client = client as Bzz
  return typeof client.download === 'function' && typeof client.downloadDirectoryData === 'function'
}

function mapDirectoryArrayToDirectory<T> (data: DirectoryArray<T>): Directory<T> {
  return data.reduce((previousValue: Directory<T>, currentValue) => {
    if (isReadable(currentValue.data) && !currentValue.size && currentValue.size !== 0) {
      throw new ValueError(`Missing "size" that is required for Readable streams (path: ${currentValue.path})`)
    }

    const path: string = currentValue.path
    delete currentValue.path
    previousValue[path] = currentValue
    return previousValue
  }, {})
}

function uploadStreamDirectory (client: Bzz, data: Directory<string | Readable | Buffer>): Promise<Address> {
  const pack = tar.pack()
  const entries = Object.entries(data)

  if (entries.length === 0) {
    throw new ValueError('Nothing to upload!')
  }

  async function loadEntries (): Promise<void> {
    for (const [path, entry] of entries) {
      if (Buffer.isBuffer(entry.data) || typeof entry.data === 'string') {
        pack.entry({ name: path }, entry.data)
      } else {
        await new Promise((resolve, reject) => {
          const entryStream = pack.entry({ name: path, size: entry.size }, err => {
            if (err) reject(err)
            else resolve()
          });

          (entry.data as Readable).pipe(entryStream)
        })
      }
    }

    pack.finalize()
  }

  // Fire-up loading entries without awaiting, in order to pass `pack` stream to `uploadFile`
  // as soon as possible, so the streaming kicks in and don't buffer.
  // The result is awaited in `uploadFile` because the response won't be returned before
  // all the streaming is done and hence the Promise returned from `uploadFile` will be
  // resolved with the hash we are looking for.
  loadEntries()
    .catch(err => {
      pack.destroy(err)
    })

  return client.uploadFile(pack, { contentType: 'application/x-tar' })
}

/**
 * Add data to Swarm
 *
 * @param data
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any,require-await
async function put (this: SwarmStorageProvider, data: PutInputs, options?: UploadOptions & { filename?: string }): Promise<any> {
  options = options || {}

  if (typeof data === 'string') {
    data = Buffer.from(data)
  }

  // Convert single element DirectoryArray
  if (Array.isArray(data) && data.length === 1) {
    const el = data[0]
    options.size = options.size || el.size
    options.filename = options.filename || el.path
    data = el.data
  }

  if (Buffer.isBuffer(data) || isReadable(data)) {
    if (isReadable(data) && !options.size) {
      throw new ValueError('Missing "size" that is required for Readable streams')
    }

    if (options.filename) {
      data = [
        {
          data: data as Buffer | Readable,
          path: options.filename,
          size: options.size
        }
      ]

      options.defaultPath = options.filename
      delete options.filename
      delete options.size
    } else {
      log('uploading single buffer file')

      return this.bzz.uploadFile(data, options)
    }
  }

  log('uploading directory')

  if (options.filename) {
    throw new ValueError('You are uploading directory, yet you specified filename that is not applicable here!')
  }

  if (options.size) {
    throw new ValueError('You are uploading directory, yet you specified size that is not applicable here!')
  }

  if ((typeof data !== 'object' && !Array.isArray(data)) || data === null || data === undefined) {
    throw new TypeError('data have to be string, Readable, Buffer, DirectoryArray or Directory object!')
  }

  if ((Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
    // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
    throw new ValueError('You passed empty Directory')
  }

  if (isTSDirectory(data, isReadableOrBuffer)) {
    Object.entries(data).forEach(([path, entry]) => {
      if (path === '') {
        throw new ValueError('Empty path (name of property) is not allowed!')
      }

      if (isReadable(entry.data) && !entry.size && entry.size !== 0) {
        throw new ValueError(`Missing "size" that is required for Readable streams (path: ${path})`)
      }
    })
    return uploadStreamDirectory(this.bzz, data)
  } else if (isTSDirectoryArray(data, isReadableOrBuffer)) {
    const mappedData = mapDirectoryArrayToDirectory(data)
    return uploadStreamDirectory(this.bzz, mappedData)
  } else {
    throw new ValueError('Data has to be string, Buffer, Readable, Directory<Readable> or DirectoryArray<Readable>')
  }
}

/**
 * Retrieves data from Swarm
 *
 * @param address
 * @param options
 */
async function get (this: SwarmStorageProvider, address: Address, options?: UploadOptions): Promise<Directory<Buffer> | Buffer> {
  if (typeof address !== 'string') {
    throw new ValueError(`Address ${address} is not a string!`)
  }

  try {
    const result = await this.bzz.list(address)

    if (!result.entries && !result.common_prefixes) {
      throw new ValueError(`Address ${address} does not contain any files/folders!`)
    }
  } catch (e) {
    // Internal Server error is returned by Swarm when the address is not Manifest
    if (!('status' in e) || e.status !== 500) {
      throw e
    }

    log(`fetching single raw file from ${address}`)
    const file = await this.bzz.download(address, Object.assign({ mode: 'raw' }, options))
    return markFile(Buffer.from(await file.arrayBuffer()))
  }

  log(`fetching directory from ${address}`)
  return markDirectory(await this.bzz.downloadDirectoryData(address) as Directory<Buffer>)
}

/**
 * Helper function that fetch single raw file from Swarm returning Readable
 *
 * @param address
 * @param options
 * @private
 */
async function _getRawReadable (this: SwarmStorageProvider, address: Address, options: DownloadOptions): Promise<Readable> {
  const stream = await this.bzz.downloadStream(address, Object.assign({ mode: 'raw' }, options))
  const wrapperStream = new Readable({ objectMode: true })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  wrapperStream._read = (): void => {}
  wrapperStream.push({
    data: stream,
    path: ''
  })
  wrapperStream.push(null)

  return wrapperStream
}

/**
 * Helper function that fetch file(s)/directory (eq. hash is manifest) from Swarm
 * returning Readable
 *
 * @param address
 * @param options
 * @private
 */
async function _getManifestReadable (this: SwarmStorageProvider, address: Address, options: DownloadOptions): Promise<Readable> {
  if (options.headers == null) {
    options.headers = {}
  }
  options.headers.accept = 'application/x-tar'

  const tarRes = await this.bzz.downloadStream(address, options)
  const readable = new Readable({ objectMode: true })
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  readable._read = (): void => {}

  const extract = tar.extract()
  extract.on('entry', (header, stream, next) => {
    if (header.type === 'file') {
      readable.push({
        data: stream,
        path: header.name,
        size: header.size
      })

      stream.on('end', next)
    } else {
      next()
    }
  })
  extract.on('finish', () => {
    readable.push(null)
  })
  extract.on('error', (err) => {
    readable.destroy(err)
  })

  tarRes.pipe(extract)
  return readable
}

/**
 * Fetch data from Swarm and return Readable in object mode that yield
 * objects in format {data: <Readable>, path: 'string'}
 * @param address
 * @param options
 */
// eslint-disable-next-line require-await
async function getReadable (this: SwarmStorageProvider, address: Address, options?: DownloadOptions): Promise<Readable> {
  if (typeof address !== 'string') {
    throw new ValueError(`Address ${address} is not a string!`)
  }

  options = options || {}

  try {
    return await _getManifestReadable.call(this, address, options)
  } catch (e) {
    // Internal Server error is returned by Swarm when the address is not Manifest
    if (!e.status || e.status !== 500) {
      throw e
    }

    log(`fetching single raw file from ${address}`)
    return _getRawReadable.call(this, address, options)
  }
}

/**
 * Factory for supporting Swarm
 *
 * @param options
 * @constructor
 */
export default function SwarmFactory (options: BzzConfig | Bzz): SwarmStorageProvider {
  const bzz = isBzz(options) ? options : new Bzz(options)

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  log(`swarm client connected to ${bzz.url}`)

  return {
    bzz,
    type: Provider.SWARM,

    get,
    getReadable,
    put
  }
}
