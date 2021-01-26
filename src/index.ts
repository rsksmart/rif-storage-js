import ipfs from './providers/ipfs'
import swarm from './providers/swarm'
import { Provider, ProviderOptions, IpfsStorageProvider, SwarmStorageProvider, Ipfs } from './definitions'
import type { ClientOptions } from 'ipfs-http-client/src/lib/core'
import { Manager } from './manager'
import { BzzConfig } from './swarm-mini'

/**
 * Main entry point of the library that serves as a factory to create instances of StorageProvider
 * for given provider.
 *
 * @param provider
 * @param options
 */
function factory (provider: Provider, options: ProviderOptions): IpfsStorageProvider | SwarmStorageProvider | Manager {
  if (!options) {
    throw new Error('You have to pass options!')
  }

  switch (provider) {
    case Provider.IPFS:
      return ipfs(options as ClientOptions | Ipfs)
    case Provider.SWARM:
      return swarm(options as BzzConfig)
    case Provider.MANAGER: // returns Local Storage StorageProvider's implementation
      return new Manager()
    default:
      throw Error('unknown provider')
  }
}

export default factory
export { Manager }
export { ipfs, swarm }
export { isFile, isDirectory } from './utils'
export * from './definitions'
