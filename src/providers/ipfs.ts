import asyncIterToStream from 'async-iterator-to-stream'
import CID from 'cids'
import debug from 'debug'
import { Readable, Transform } from 'stream'

import ipfs, { HttpOptions } from 'ipfs-http-client'
import type { ClientOptions } from 'ipfs-http-client/src/lib/core'
import type { ToFile, ToContent, File as IPFSFile, IPFSEntry } from 'ipfs-core-types/src/files'
import type { AddAllOptions, GetOptions as RootGetOptions } from 'ipfs-core-types/src/root'

import { Provider } from '../definitions'
import type { Directory, Ipfs, IpfsStorageProvider, PutInputs } from '../definitions'
import { ValueError } from '../errors'
import {
  isTSDirectory,
  isTSDirectoryArray,
  markDirectory,
  markFile,
  isReadable,
  isReadableOrBuffer,
  lastAsyncIterItem, arrayFromAsyncIter
} from '../utils'

const log = debug('rds:ipfs')

type AddOptions = AddAllOptions & HttpOptions
type GetOptions = RootGetOptions & HttpOptions

function isIpfs (client: Ipfs | ClientOptions): client is Ipfs {
  client = client as Ipfs
  return typeof client.get === 'function' && typeof client.add === 'function'
}

/**
 * Validates if an address is valid CID representative.
 *
 * @private
 * @throws ValueError if address is not valid
 * @param address
 */
function validateAddress (address: unknown): address is CID {
  const isAddress = typeof address === 'string' || CID.isCID(address) || Buffer.isBuffer(address)

  if (!isAddress) {
    throw new ValueError(`Address ${address} is not valid IPFS's CID`)
  }

  return true
}

async function contentToBuffer (iter: AsyncIterable<Uint8Array>): Promise<Buffer> {
  const arrs = await arrayFromAsyncIter(iter)
  return Buffer.concat(arrs)
}

/**
 * Converts IPFS style of returned data into Directory object
 *
 * @private
 * @example
 * const ipfs = [{
 *   path: '/tmp/myfile.txt',
 *   content: <data as T>
 * }]
 * mapDataFromIpfs(ipfs)
 * // returns:
 * // {
 * //   '/tmp/myfile.txt': {
 * //     data: <data as T>
 * //     size: <data as T>.length
 * //   }
 * // }
 *
 * @param data - IPFS data returned from ipfs.get()
 * @param originalAddress - Original CID address that is supposed to be removed from path
 */
async function mapDataFromIpfs (data: Array<IPFSEntry>, originalAddress: CID | string): Promise<Directory<Buffer>> {
  const result: Directory<Buffer> = {}

  for (const entry of data) {
    // TODO: [Q] What about directories? Currently ignored
    if (entry.type === 'dir') continue

    if (!entry.content) {
      throw new Error('File did not have any content returned from IPFS Client!')
    }

    const content = await contentToBuffer(entry.content)
    result[entry.path.replace(originalAddress.toString() + '/', '')] = {
      data: content,
      size: content.length
    }
  }

  return result
}

/**
 * Converts and validate Directory object to IPFS style of data
 *
 * @private
 * @example
 * const directory = {
 *   '/tmp/myfile.txt': {
 *     data: <data as a Buffer>
 *   }
 * }
 * mapDataFromIpfs(ipfs)
 * // returns:
 * // const ipfs = [{
 * //   path: '/tmp/myfile.txt',
 * //   content: <data as a Buffer >
 * // }]
 *
 * @param data - Directory data
 * @return Array of objects that is consumable using ipfs.add()
 */
function mapDataToIpfs (data: Directory<ToContent>): Array<ToFile> {
  return Object.entries(data).map(([path, entry]) => {
    if (path === '') {
      throw new ValueError('Empty path (name of property) is not allowed!')
    }

    return {
      path,
      content: entry.data
    }
  })
}

/**
 * Add data to IPFS
 *
 * @see Storage#put
 * @param data
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function put (this: IpfsStorageProvider, data: PutInputs, options?: AddOptions & { fileName?: string }): Promise<string> {
  options = options || {}

  if (typeof data === 'string') {
    data = Buffer.from(data)
  }

  // Convert single element DirectoryArray
  if (Array.isArray(data) && data.length === 1) {
    const el = data[0]
    data = el.data

    if (!options.fileName && el.path) {
      options.fileName = el.path
    }
  }

  if (Buffer.isBuffer(data) || isReadable(data as Readable)) {
    log('uploading single file')
    let dataToAdd: PutInputs | ToFile

    if (options.fileName) {
      dataToAdd = {
        content: data as Buffer | Readable,
        path: options.fileName || ''
      }
      delete options.fileName
      options.wrapWithDirectory = true
    } else {
      dataToAdd = data
    }

    const result = await this.ipfs.add(dataToAdd as Buffer | Readable, options)
    return result.cid.toString()
  }

  log('uploading directory')
  options.wrapWithDirectory = options.wrapWithDirectory !== false

  if ((typeof data !== 'object' && !Array.isArray(data)) || data === null) {
    throw new TypeError('data have to be string, Readable, Buffer, DirectoryArray or Directory object!')
  }

  if (options.fileName) {
    throw new ValueError('You are uploading directory, yet you specified fileName that is not applicable here!')
  }

  if ((Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
    // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rif-storage-js/issues/4
    throw new ValueError('You passed empty Directory')
  }

  let mappedData

  if (isTSDirectory<Buffer | Readable>(data, isReadableOrBuffer)) {
    mappedData = mapDataToIpfs(data)
  } else if (isTSDirectoryArray<Buffer | Readable>(data, isReadableOrBuffer)) {
    mappedData = data.map(entry => {
      return {
        content: entry.data,
        path: entry.path
      }
    }) as Array<ToFile>
  } else {
    throw new ValueError('data have to be string, Readable, Buffer, DirectoryArray<Buffer | Readable> or Directory<Buffer | Readable> object!')
  }

  const last = await lastAsyncIterItem(this.ipfs.addAll(mappedData, options))

  if (!last) {
    throw new Error('No data were returned from IPFS client.')
  }

  return last.cid.toString()
}

/**
 * Retrieves data from IPFS
 *
 * @see Storage#get
 * @param address - CID compatible address
 * @param options
 */
async function get (this: IpfsStorageProvider, address: CID | string, options?: GetOptions): Promise<Directory<Buffer> | Buffer> {
  validateAddress(address)

  const result = await arrayFromAsyncIter(this.ipfs.get(address, options))

  // Generally process directory when there is more then one
  // entry, but the first and only entry can be empty directory.
  if (result.length >= 2 || result[0].type === 'dir') {
    log(`fetching directory from ${address}`)
    return markDirectory(await mapDataFromIpfs(result, address))
  }

  const file = result[0] as IPFSFile
  log(`fetching single file from ${address}`)

  if (!file.content) {
    throw new Error('File did not have any content returned from IPFS Client!')
  }

  return markFile(await contentToBuffer(file.content))
}

/**
 * Fetch data from IPFS network and returns it as Readable stream in object mode
 * that yield objects in format {data: <Readable>, path: 'string'}
 *
 * @param address
 * @param options
 * @see Storage#getReadable
 */
// eslint-disable-next-line require-await
async function getReadable (this: IpfsStorageProvider, address: CID, options?: GetOptions): Promise<Readable> {
  validateAddress(address)

  const trans = new Transform({
    objectMode: true,
    transform (entry: IPFSEntry, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
      if (entry.type === 'dir') {
        callback(null, null)
      } else {
        let pathWithoutRootHash

        if (entry.path.includes('/')) {
          const splittedPath = entry.path.split('/')
          pathWithoutRootHash = splittedPath.slice(1).join('/')
        } else { // Should be root
          pathWithoutRootHash = '/'
        }

        callback(
          null,
          {
            path: pathWithoutRootHash,
            data: asyncIterToStream(entry.content!)
          })
      }
    }
  })

  asyncIterToStream.obj(this.ipfs.get(address, options)).pipe(trans)
  return trans
}

/**
 * Factory for supporting IPFS
 *
 * @param options
 * @constructor
 */
export default function IpfsFactory (options: ClientOptions | Ipfs): IpfsStorageProvider {
  let ipfsClient: Ipfs

  if (isIpfs(options)) {
    ipfsClient = options
    log('ipfs client using an embedded node')
  } else {
    ipfsClient = ipfs(options) as unknown as Ipfs

    const addr = typeof options === 'string' ? options : options.host
    log('ipfs client using http api to ', addr)
  }

  return Object.freeze({
    ipfs: ipfsClient,
    type: Provider.IPFS,

    put,
    get,
    getReadable
  })
}
