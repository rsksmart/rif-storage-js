import { Readable } from 'stream'
import tarStream from 'tar-stream'
import ky from 'ky-universal'
import debug from 'debug'

import normalizeStream from './utils/stream-normalization'
import {
  BzzConfig,
  BzzMode,
  DownloadOptions,
  KyOptions,
  ListResult,
  UploadOptions
} from './types'
import { Directory, DirectoryArray, DirectoryEntry } from '../definitions'
import { ValueError } from '../errors'
import { isReadable, isReadableOrBuffer, isTSDirectory, isTSDirectoryArray, markDirectory, markFile } from '../utils'
import prepareData from './utils/data'

export * from './types'
const log = debug('swarm-mini')

export const BZZ_MODE_PROTOCOLS = {
  default: 'bzz:/',
  immutable: 'bzz-immutable:/',
  raw: 'bzz-raw:/'
}

export function getModeProtocol (mode?: BzzMode, defaultMode?: BzzMode): string {
  return (mode && BZZ_MODE_PROTOCOLS[mode]) || (defaultMode && BZZ_MODE_PROTOCOLS[defaultMode]) || BZZ_MODE_PROTOCOLS.default
}

function getDownloadURL (hash: string, options: DownloadOptions = {}, defaultMode?: BzzMode): string {
  const protocol = getModeProtocol(options.mode, defaultMode)
  let url = `${protocol}${hash}/`

  if (options.path != null) {
    url += options.path
  }

  if (options.mode === 'raw' && options.contentType != null) {
    url += `?content_type=${options.contentType}`
  }

  return url
}

function getUploadURL (options: UploadOptions = {}): string {
  // Default URL to creation
  let url = getModeProtocol(options.mode, 'default')

  // Manifest update if hash is provided
  if (options.manifestHash != null) {
    url += `${options.manifestHash}/`

    if (options.path != null) {
      url += options.path
    }
  }

  if (options.defaultPath != null) {
    url += `?defaultpath=${options.defaultPath}`
  }
  return url
}

function mapDirectoryArrayToDirectory<T> (data: DirectoryArray<T>): Directory<T> {
  return data.reduce((previousValue: Directory<T>, currentValue) => {
    if (isReadable(currentValue.data) && !currentValue.size && currentValue.size !== 0) {
      throw new ValueError(`Missing "size" that is required for Readable streams (path: ${currentValue.path})`)
    }

    const path: string = currentValue.path
    previousValue[path] = {
      contentType: currentValue.contentType,
      data: currentValue.data,
      size: currentValue.size
    }
    return previousValue
  }, {})
}

function kyOnlyOptions (options: DownloadOptions | UploadOptions): KyOptions {
  return {
    headers: options.headers,
    timeout: options.timeout,
    onDownloadProgress: options.onDownloadProgress
  }
}

async function getReason (response: Response): Promise<string> {
  const errMessage = await response.text()
  const messageMatches = /Message: (.*)$/m.exec(errMessage)

  if (messageMatches && messageMatches.length === 2) {
    return messageMatches[1]
  }
  return errMessage
}

/**
 * Small simple client library for Bzz part of Swarm project.
 * It communicate using HTTP API.
 */
export class Bzz {
  private ky: typeof ky

  public constructor (config: BzzConfig) {
    const { url, timeout } = config
    this.ky = ky.create({ timeout, prefixUrl: url })
  }

  /**
   * Fetch list of entries of given manifest hash.
   *
   *
   * @param hash
   * @param options
   * @throws HTTPError when hash is not a manifest
   */
  private async list (hash: string, options: DownloadOptions = {}): Promise<ListResult> {
    let url = `bzz-list:/${hash}/`

    if (options.path != null) {
      url += options.path
    }

    try {
      return (await this.ky.get(url, kyOnlyOptions(options))).json()
    } catch (e) {
      if (e.response) {
        e.message = `${e.message}: ${await getReason(e.response)}`
      }

      throw e
    }
  }

  /**
   * Helper method for fetching single raw file.
   *
   * @param hash
   * @param options
   */
  private async getFile (hash: string, options: DownloadOptions = {}): Promise<Buffer> {
    const url = getDownloadURL(hash, options, 'raw')

    try {
      const arrayBuf = await (await this.ky.get(url, kyOnlyOptions(options))).arrayBuffer()
      return markFile(Buffer.from(arrayBuf))
    } catch (e) {
      if (e.response) {
        e.message = `${e.message}: ${await e.response.text()}`
      }

      throw e
    }
  }

  /**
   * Helper method for fetching directory defined by manifest.
   * It employees fetching of Tar file from Swarm with all files which is then extracted on the client side.
   *
   * @param hash
   * @param options
   */
  private async getDirectory (hash: string, options: DownloadOptions): Promise<Directory<Buffer>> {
    const dir: Directory<Buffer> = {}

    for await (const file of await this.getReadable(hash, options)) {
      const stream = file.data
      const chunks: Array<Buffer> = []

      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })
      stream.on('end', () => {
        dir[file.path] = {
          data: Buffer.concat(chunks),
          size: file.size
        }
      })
      stream.resume()
    }

    return dir
  }

  /**
   * Method for fetching file/directory from Swarm.
   *
   * Buffer is returned when it is single raw hash. You can use isFile() utility function to verify if file was returned.
   * Directory object is returned when it is manifest hash. You can use isDirectory() utility function to verify that it is directory.
   *
   * @param hash
   * @param options
   */
  public async get (hash: string, options: DownloadOptions = {}): Promise<Directory<Buffer> | Buffer> {
    if (typeof hash !== 'string') {
      throw new ValueError(`hash ${hash} is not a string!`)
    }

    try {
      const result = await this.list(hash)

      if (!result.entries && !result.common_prefixes) {
        throw new ValueError(`Hash ${hash} does not contain any files/folders!`)
      }
    } catch (e) {
      // Internal Server error is returned by Swarm when the hash is not Manifest
      if (!e.response || e.response.status !== 500) {
        throw e
      }

      return this.getFile(hash, options)
    }

    return markDirectory(await this.getDirectory(hash, options))
  }

  private async getStream (hash: string, options: DownloadOptions = {}): Promise<Readable> {
    if (options.headers == null) {
      options.headers = {}
    }
    options.headers.accept = 'application/x-tar'

    try {
      const respond = await this.ky.get(getDownloadURL(hash, options), kyOnlyOptions(options))

      if (!respond.body) {
        throw new Error('Respond does not have any stream body!')
      }
      return normalizeStream(respond.body)
    } catch (e) {
      if (e.response) {
        e.message = `${e.message}: ${await getReason(e.response)}`
      }

      throw e
    }
  }

  /**
   * Helper function that fetch single raw file from Swarm returning Readable
   *
   * @param hash
   * @param options
   * @private
   */
  private async getRawReadable (hash: string, options: DownloadOptions): Promise<Readable> {
    options.mode = 'raw'
    const stream = await this.getStream(hash, options)
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
   * @param hash
   * @param options
   * @private
   */
  private async getManifestReadable (hash: string, options: DownloadOptions): Promise<Readable> {
    const manifestStream = await this.getStream(hash, options)
    const readable = new Readable({ objectMode: true })
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    readable._read = (): void => {}

    const extract = tarStream.extract()
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

    manifestStream.pipe(extract)
    return readable
  }

  /**
   * Fetch data from Swarm and return Readable in object mode that yield
   * objects in format {data: <Readable>, path: 'string', size: number | undefined}
   * @param hash
   * @param options
   */
  public async getReadable (hash: string, options: DownloadOptions = {}): Promise<Readable> {
    if (typeof hash !== 'string') {
      throw new ValueError(`Address ${hash} is not a string!`)
    }

    try {
      return await this.getManifestReadable(hash, options)
    } catch (e) {
      // Internal Server error is returned by Swarm when the address is not Manifest
      if (!e.response || e.response.status !== 500) {
        throw e
      }

      return this.getRawReadable(hash, options)
    }
  }

  private async putItToSwarm (data: string | Buffer | Readable | Directory<Buffer | Readable>, options: UploadOptions): Promise<string> {
    const url = getUploadURL(options)

    try {
      // @ts-ignore: In NodeJS ky = node_fetch which supports Buffer and Readable, but ky uses browser's definitions, so ignoring it for compatibilities. Suggestions how to improve this will be welcomed.
      return (await this.ky.post(url, { body: await prepareData(data), headers: options.headers })).text()
    } catch (e) {
      if (e.response) {
        e.message = `${e.message}: ${await getReason(e.response)}`
      }

      throw e
    }
  }

  /**
   * Add data to Swarm
   *
   * If to the data are given some metadata (filename), then the original data are wrapped in directory
   * in order to persist these metadata.
   *
   * @param data
   * @param options
   */
  public put (data: string | Buffer | Readable, options?: UploadOptions): Promise<string>
  public put (data: Directory<string | Buffer | Readable> | DirectoryArray<Buffer | Readable>, options?: UploadOptions): Promise<string>
  // eslint-disable-next-line require-await
  public async put (data: any, options: UploadOptions = {}): Promise<any> {
    if (typeof data === 'string') {
      data = Buffer.from(data)
    }

    // Convert single element DirectoryArray
    if (Array.isArray(data) && data.length === 1) {
      const el = data[0]
      options.contentType = options.contentType || el.contentType
      options.size = options.size || el.size
      options.fileName = options.fileName || el.path
      data = el.data
    }

    if (Buffer.isBuffer(data) || isReadable(data)) {
      if (isReadable(data) && !options.size) {
        throw new ValueError('Missing "size" that is required for Readable streams')
      }

      if (options.fileName) {
        data = [
          {
            data: data,
            path: options.fileName,
            size: options.size,
            contentType: options.contentType
          }
        ]

        options.defaultPath = options.fileName
        delete options.fileName
        delete options.size
        delete options.contentType
      } else {
        log('uploading single buffer file')

        if (!options.headers) {
          options.headers = {}
        }

        if (options.size != null) {
          options.headers['content-length'] = options.size
        } else if (Buffer.isBuffer(data)) {
          options.headers['content-length'] = data.length
        }

        if (!options.contentType) {
          options.mode = 'raw'
        }

        if (options.headers['content-type'] == null && options.contentType) {
          options.headers['content-type'] = options.contentType
        }

        return this.putItToSwarm(data, options)
      }
    }

    log('uploading directory')

    if (options.fileName) {
      throw new ValueError('You are uploading directory, yet you specified filename that is not applicable here!')
    }

    if (options.size) {
      throw new ValueError('You are uploading directory, yet you specified size that is not applicable here!')
    }

    if ((typeof data !== 'object' && !Array.isArray(data)) || data === null || data === undefined) {
      throw new TypeError('data have to be string, Readable, Buffer, DirectoryArray or Directory object!')
    }

    if ((Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
      // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rif-storage-js/issues/4
      throw new ValueError('You passed empty Directory')
    }

    if (isTSDirectory<Buffer | Readable>(data, isReadableOrBuffer)) {
      Object.entries(data).forEach(([path, entry]) => {
        if (path === '') {
          throw new ValueError('Empty path (name of property) is not allowed!')
        }

        if (isReadable(entry.data) && !entry.size && entry.size !== 0) {
          throw new ValueError(`Missing "size" that is required for Readable streams (path: ${path})`)
        }
      })
      return this.putItToSwarm(data, options)
    } else if (isTSDirectoryArray<Buffer | Readable>(data, isReadableOrBuffer)) {
      const mappedData = mapDirectoryArrayToDirectory(data)
      return this.putItToSwarm(mappedData, options)
    } else {
      throw new ValueError('Data has to be string, Buffer, Readable, Directory<string | Buffer | Readable> or DirectoryArray<string | Buffer | Readable>')
    }
  }
}
