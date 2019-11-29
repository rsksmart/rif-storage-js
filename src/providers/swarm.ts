import {
  Address,
  Directory,
  DirectoryEntry,
  Provider,
  SwarmStorage
} from '../types'
import { BzzConfig, UploadOptions } from '@erebos/api-bzz-base'
import { Bzz } from '@erebos/api-bzz-browser'
import { ValueError } from '../errors'
import { markDirectory, markFile } from '../utils'
import debug from 'debug'

const log = debug('rds:swarm')

function isBzz (client: BzzConfig | Bzz): client is Bzz {
  client = client as Bzz
  return typeof client.download === 'function' && typeof client.downloadDirectoryData === 'function'
}

function validateDirectory (data: Directory, validator: (entry: DirectoryEntry) => boolean): void {
  return Object.entries(data).forEach(([path, entry]) => {
    if (path === '') {
      throw new ValueError('Empty path (name of property) is not allowed!')
    }

    if (!validator(entry)) {
      throw new ValueError(`Entry with path ${path} does not contain valid data!`)
    }
  })
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
export default function SwarmFactory (options: BzzConfig | Bzz): SwarmStorage {
  const bzz = isBzz(options) ? options : new Bzz(options)

  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  // @ts-ignore
  log(`swarm client connected to ${bzz.url}`)

  return {
    bzz,
    type: Provider.SWARM,

    /**
     * Retrieves data from Swarm
     *
     * @param address
     * @param options
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async get (address: Address, options?: UploadOptions): Promise<any> {
      if (typeof address !== 'string') {
        throw new ValueError(`Address ${address} is not a string!`)
      }

      try {
        const result = await this.bzz.list(address)

        if (!result.entries) {
          throw new ValueError(`Address ${address} does not contain any files/folders!`)
        }

        if (result.entries.length === 1) {
          log(`fetching single file from ${address}`)
          const file = await this.bzz.download(address)
          return markFile(Buffer.from(await file.text()))
        }
      } catch (e) {
        // Internal Server error is returned by Swarm when the address is not Manifest
        if (!('status' in e) || e.status !== 500) {
          throw e
        }

        log(`fetching single raw file from ${address}`)
        const file = await this.bzz.download(address, { mode: 'raw' })
        return markFile(Buffer.from(await file.text()))
      }

      log(`fetching directory from ${address}`)
      return markDirectory(await this.bzz.downloadDirectoryData(address) as Directory)
    },

    /**
     * Add data to Swarm
     *
     * @param data
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,require-await
    async put (data: Buffer | Directory): Promise<any> {
      if (Buffer.isBuffer(data)) {
        log('uploading single file')
        return this.bzz.uploadFile(data)
      }
      log('uploading directory')

      if (typeof data !== 'object' || Array.isArray(data) || data === null) {
        throw new ValueError('data have to be Buffer or Directory object!')
      }

      if (Object.keys(data).length === 0) {
        // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
        throw new ValueError('You passed empty Directory')
      }

      validateDirectory(data, entry => Buffer.isBuffer(entry.data))
      return this.bzz.uploadDirectory(data)
    }
  }
}
