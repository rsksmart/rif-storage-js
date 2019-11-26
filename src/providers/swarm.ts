import {
  Address,
  Directory,
  DirectoryEntry,
  DirectoryResult,
  EntryType, Provider,
  SwarmStorageProvider
} from '../types'
import { BzzConfig } from '@erebos/api-bzz-base'
import { Bzz, ListEntry } from '@erebos/api-bzz-node'
import { ValueError } from '../errors'
import { markDirectory, markFile } from '../utils'

function isBzz (client: BzzConfig | Bzz): client is Bzz {
  client = client as Bzz
  return typeof client.download === 'function' && typeof client.downloadDirectoryData === 'function'
}

function validateDirectory (data: Directory, validator: (entry: DirectoryEntry) => boolean): void {
  return Object.entries(data).forEach(([path, entry]) => {
    if (path === '') {
      throw new ValueError('Empty path (name of property) is not allowed!')
    }

    if (path.includes('/')) {
      // TODO: Related to https://github.com/MainframeHQ/erebos/issues/118
      throw new ValueError('Swarm does not support nested paths currently!')
    }

    if (!validator(entry)) {
      throw new ValueError(`Entry with path ${path} does not contain valid data!`)
    }
  })
}

async function fetchManifestAndMapData (this: SwarmStorageProvider, manifestHash: Address): Promise<DirectoryResult> {
  const entries = await this.bzz.list(manifestHash)

  if (!entries.entries) {
    return {}
  }

  return entries.entries.reduce<DirectoryResult>((directory: DirectoryResult, result: ListEntry): DirectoryResult => {
    directory[result.path] = {
      hash: result.hash,
      size: result.size,
      type: EntryType.FILE
    }
    return directory
  }, {})
}

/**
 * Helper function for retrieving one File or Directory from Swarm
 *
 * @see SwarmFactory#get
 * @param address
 * @private
 */
async function _get (this: SwarmStorageProvider, address: Address): Promise<Directory | Buffer> {
  try {
    const result = await this.bzz.list(address)

    if (!result.entries) {
      throw new ValueError(`Address ${address} does not contain any files/folders!`)
    }

    if (result.entries.length === 1) {
      const file = await this.bzz.download(address)
      return markFile(Buffer.from(await file.text()))
    }
  } catch (e) {
    // Internal Server error is returned by Swarm when the address is not Manifest
    if (e.status !== 500) {
      throw e
    }

    const file = await this.bzz.download(address, { mode: 'raw' })
    return markFile(Buffer.from(await file.text()))
  }

  return markDirectory(await this.bzz.downloadDirectoryData(address) as Directory)
}

/**
 * Factory for supporting Swarm
 *
 * Currently limitations:
 *  - no nested directories
 *
 * @param options
 * @constructor
 */
export default function SwarmFactory (options: BzzConfig | Bzz): SwarmStorageProvider {
  const bzz = isBzz(options) ? options : new Bzz(options)

  return {
    bzz,
    type: Provider.SWARM,

    /**
     * Retrieves data from Swarm
     *
     * @param addresses
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get (...addresses: (Address)[]): Promise<any> {
      addresses.forEach(address => {
        if (typeof address !== 'string') {
          throw new ValueError(`Address ${address} is not a string!`)
        }
      })

      const getObject = _get.bind(this)
      const data = await Promise.all(addresses.map(getObject))

      return data.length === 1 ? data[0] : data
    },

    /**
     * Add data to Swarm
     *
     * @param data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async put (data: Buffer | Directory): Promise<any> {
      if (Buffer.isBuffer(data)) {
        return this.bzz.uploadFile(data)
      }

      if (typeof data !== 'object' || Array.isArray(data) || data === null) {
        throw new ValueError('data have to be Buffer or Directory object!')
      }

      if (Object.keys(data).length === 0) {
        // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
        throw new ValueError('You passed empty Directory')
      }

      validateDirectory(data, entry => Buffer.isBuffer(entry.data))
      const manifestResult = await this.bzz.uploadDirectory(data)

      // First element is the root directory
      return [manifestResult, await fetchManifestAndMapData.call(this, manifestResult)]
    }
  }
}
