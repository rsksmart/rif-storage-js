import ipfs from './providers/ipfs'
import swarm from './providers/swarm'
import { Storage, Provider, Options } from './types'
import { ClientOptions } from 'ipfs-http-client'
import { BzzConfig } from '@erebos/api-bzz-base'

function factory (provider: Provider, options: Options): Storage {
  switch (provider) {
    case Provider.IPFS:
      return ipfs(options as ClientOptions)
    case Provider.SWARM:
      return swarm(options as BzzConfig)
    case Provider.LOCAL_STORAGE: // returns Local Storage StorageProvider's implementation
    default:
      throw Error('unknown provider')
  }
}

export default factory
export { Provider }
export { ipfs, swarm }
export { isFile, isDirectory } from './utils'
