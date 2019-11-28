import { Directory, DirectoryEntry, IpfsStorageProvider, Provider } from '../types'
import ipfs, { BufferIpfsObject, CidAddress, ClientOptions, IpfsClient, IpfsObject } from 'ipfs-http-client'
import CID from 'cids'
import { ValueError } from '../errors'
import { markDirectory, markFile } from '../utils'

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
 *   content: <data as a Buffer>
 * }]
 * mapDataFromIpfs(ipfs)
 * // returns:
 * // {
 * //   '/tmp/myfile.txt': {
 * //     data: <data as a Buffer>
 * //     size: <data as a Buffer>.length
 * //   }
 * // }
 *
 * @param data - IPFS data returned from ipfs.get()
 * @param originalAddress - Original CID address that is supposed to be removed from path
 */
function mapDataFromIpfs (data: Array<BufferIpfsObject>, originalAddress: CidAddress): Directory {
  return data.reduce<Directory>((directory: Directory, file: BufferIpfsObject): Directory => {
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
 * @param validator - Functions that validate if the passed entry is valid
 * @return Array of objects that is consumable using ipfs.add()
 */
function validateAndmapDataToIpfs (data: Directory, validator: (entry: DirectoryEntry) => boolean): Array<IpfsObject> {
  return Object.entries(data).map(([path, entry]) => {
    if (path === '') {
      throw new ValueError('Empty path (name of property) is not allowed!')
    }

    if (!validator(entry)) {
      throw new ValueError(`Entry with path ${path} does not contain valid data!`)
    }

    return {
      path,
      content: entry.data
    }
  })
}

/**
 * Helper function for retrieving one File or Directory from IPFS
 *
 * @see IpfsFactory#get
 * @param address
 * @private
 */
async function _get (this: IpfsStorageProvider, address: CidAddress): Promise<Directory | Buffer> {
  const result = await this.ipfs.get(address)

  // `result[0].content === undefined` means that downloaded empty directory
  if (result.length > 1 || result[0].content === undefined) {
    return markDirectory(mapDataFromIpfs(result, address))
  }

  return markFile(result[0].content)
}

/**
 *
 * @param options
 * @constructor
 */
export default function IpfsFactory (options: ClientOptions | IpfsClient): IpfsStorageProvider {
  const ipfsClient = isIpfs(options) ? options : ipfs(options)

  return {
    ipfs: ipfsClient,
    type: Provider.IPFS,

    /**
     * Retrieves data from IPFS
     *
     * @see Storage#get
     * @param addresses - CID compatible address
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get (...addresses: Array<CidAddress>): Promise<any> {
      addresses.forEach(validateAddress)

      const getObject = _get.bind(this)
      const data = await Promise.all(addresses.map(getObject))

      return data.length === 1 ? data[0] : data
    },

    /**
     * Add data to IPFS
     *
     * @see Storage#put
     * @param data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async put (data: Buffer | Directory): Promise<any> {
      if (Buffer.isBuffer(data)) {
        return (await this.ipfs.add(data))[0].hash
      }

      if (typeof data !== 'object' || Array.isArray(data) || data === null) {
        throw new ValueError('data have to be Buffer or Directory object!')
      }

      if (Object.keys(data).length === 0) {
        // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
        throw new ValueError('You passed empty Directory')
      }

      const ipfsData = validateAndmapDataToIpfs(data, entry => Buffer.isBuffer(entry.data))
      const result = await this.ipfs.add(ipfsData, { wrapWithDirectory: true })

      return result[result.length - 1].hash
    }
  }
}
