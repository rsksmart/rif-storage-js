import {
  Provider,
  SwarmStorageProvider
} from '../definitions'
import debug from 'debug'
import { Bzz, BzzConfig } from '../swarm-mini'

const log = debug('rds:swarm')

function isBzz (client: Bzz | BzzConfig): client is Bzz {
  client = client as Bzz
  return client instanceof Bzz
}

/**
 * Factory for supporting Swarm
 *
 * @param options
 * @constructor
 */
export default function SwarmFactory (options: BzzConfig | Bzz): SwarmStorageProvider {
  const bzz = isBzz(options) ? options : new Bzz(options)

  log('swarm client connected')

  return {
    type: Provider.SWARM,

    get: bzz.get.bind(bzz),
    getReadable: bzz.getReadable.bind(bzz),
    put: bzz.put.bind(bzz)
  }
}
