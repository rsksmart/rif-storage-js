import { Directory, IpfsStorageProvider, Provider, PutInputs } from '../types'
import ipfs, {
  CidAddress,
  ClientOptions,
  IpfsClient,
  IpfsObject,
  RegularFiles
} from 'ipfs-http-client'
import CID from 'cids'
import { ValueError } from '../errors'
import { isTSDirectory, isTSDirectoryArray, markDirectory, markFile, isReadable, isReadableOrBuffer } from '../utils'
import debug from 'debug'
import { Readable, Transform } from 'stream'

const log = debug('rds:ipfs')

function isIpfs (client: IpfsClient | ClientOptions): client is IpfsClient {
  client = client as IpfsClient
  return typeof client.get === 'function' && typeof client.add === 'function'
}

/**
 * Validates if an address is valid CID representative.
 *
 * @private
 * @throws ValueError if address is not valid
 * @param address
 */
function validateAddress (address: unknown): address is CidAddress {
  const isAddress = typeof address === 'string' || CID.isCID(address) || Buffer.isBuffer(address)

  if (!isAddress) {
    throw new ValueError(`Address ${address} is not valid IPFS's CID`)
  }

  return true
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
function mapDataFromIpfs<T extends { length?: number }> (data: Array<IpfsObject<T>>, originalAddress: CidAddress): Directory<T> {
  return data.reduce<Directory<T>>((directory: Directory<T>, file: IpfsObject<T>): Directory<T> => {
    // TODO: [Q] What about empty directories? Currently ignored
    if (!file.content) return directory

    directory[file.path.replace(originalAddress.toString() + '/', '')] = {
      data: file.content,
      size: file.content.length
    }
    return directory
  }, {})
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
function mapDataToIpfs<T> (data: Directory<T>): Array<IpfsObject<T>> {
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
async function put (this: IpfsStorageProvider, data: PutInputs, options?: RegularFiles.AddOptions): Promise<any> {
  options = options || {}

  if (typeof data === 'string') {
    data = Buffer.from(data)
  }

  if (Buffer.isBuffer(data) || isReadable(data as Readable)) {
    log('uploading single file')
    return (await this.ipfs.add(data as Buffer | Readable, options))[0].hash
  }

  log('uploading directory')
  options.wrapWithDirectory = options.wrapWithDirectory !== false

  if ((typeof data !== 'object' && !Array.isArray(data)) || data === null) {
    throw new TypeError('data have to be string, Readable, Buffer, DirectoryArray or Directory object!')
  }

  if ((Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
    // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
    throw new ValueError('You passed empty Directory')
  }

  if (isTSDirectory<Buffer | Readable>(data, isReadableOrBuffer)) {
    const mappedData = mapDataToIpfs<Buffer | Readable>(data)
    const results = await this.ipfs.add(mappedData, options)
    return results[results.length - 1].hash
  } else if (isTSDirectoryArray<Buffer | Readable>(data, isReadableOrBuffer)) {
    const mappedData = data.map(entry => {
      return {
        content: entry.data,
        path: entry.path
      }
    }) as Array<IpfsObject<Buffer | Readable>>
    const results = await this.ipfs.add(mappedData, options)
    return results[results.length - 1].hash
  } else {
    throw new ValueError('data have to be string, Readable, Buffer, DirectoryArray<Buffer | Readable> or Directory<Buffer | Readable> object!')
  }
}

/**
 * Retrieves data from IPFS
 *
 * @see Storage#get
 * @param address - CID compatible address
 * @param options
 */
async function get (this: IpfsStorageProvider, address: CidAddress, options?: RegularFiles.GetOptions): Promise<Directory<Buffer> | Buffer> {
  validateAddress(address)

  const result = await this.ipfs.get(address, options)

  // `result[0].content === undefined` means that downloaded empty directory
  if (result.length > 1 || result[0].content === undefined) {
    log(`fetching directory from ${address}`)
    return markDirectory(mapDataFromIpfs(result, address))
  }

  log(`fetching single file from ${address}`)
  return markFile(result[0].content)
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
async function getReadable (this: IpfsStorageProvider, address: CidAddress, options?: RegularFiles.GetOptions): Promise<Readable> {
  validateAddress(address)

  const trans = new Transform({
    objectMode: true,
    transform (chunk: IpfsObject<Readable>, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
      // We ignore folders, returning only files
      if (!chunk.content) {
        callback(null, null)
      } else {
        let pathWithoutRootHash

        if (chunk.path.includes('/')) {
          const splittedPath = chunk.path.split('/')
          pathWithoutRootHash = splittedPath.slice(1).join('/')
        } else { // Should be root
          pathWithoutRootHash = '/'
        }

        // eslint-disable-next-line standard/no-callback-literal
        callback(
          null,
          {
            path: pathWithoutRootHash,
            data: chunk.content
          })
      }
    }
  })
  this.ipfs.getReadableStream(address, options).pipe(trans)

  return trans
}

/**
 * Factory for supporting IPFS
 *
 * @param options
 * @constructor
 */
export default function IpfsFactory (options: ClientOptions | IpfsClient): IpfsStorageProvider {
  let ipfsClient: IpfsClient

  if (isIpfs(options)) {
    ipfsClient = options
    log('ipfs client using an embedded node')
  } else {
    ipfsClient = ipfs(options)

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
