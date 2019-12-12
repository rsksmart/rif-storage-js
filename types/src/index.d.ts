import ipfs from './providers/ipfs';
import swarm from './providers/swarm';
import { Provider, Options, IpfsStorageProvider, SwarmStorageProvider } from './types';
import { Manager } from './manager';
/**
 * Main entry point of the library that serves as a factory to create instances of StorageProvider
 * for given provider.
 *
 * @param provider
 * @param options
 */
declare function factory(provider: Provider, options: Options): IpfsStorageProvider | SwarmStorageProvider | Manager;
export default factory;
export { Provider, Manager };
export { ipfs, swarm };
export { isFile, isDirectory } from './utils';
