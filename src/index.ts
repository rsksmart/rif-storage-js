import ipfs from './providers/ipfs'
import { Storage, Provider, Options } from './types'

function factory (provider: Provider, options: Options): Storage {
  switch (provider) {
    case Provider.IPFS:
      return ipfs(options)
    case Provider.SWARM: // returns Swarm StorageProvider's implementation
    case Provider.LOCAL_STORAGE: // returns Local Storage StorageProvider's implementation
    default:
      throw Error('unknown provider')
  }
}

export default factory
export { Provider }
export { ipfs }
export { isFile, isDirectory } from './utils'
