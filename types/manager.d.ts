/// <reference types="node" />
import { AllProviders, Directory, DirectoryArrayEntry, Options, Provider, StorageProvider } from './types';
import { Readable } from 'stream';
/**
 * Utility class that supports easy usage of multiple providers in your applications.
 * It allows registration of all supported providers and then easy putting/getting data with
 * the same interface as providers.
 *
 * It has concept of active provider which is the one to which the data are `put()`.
 * When registering providers the first one will become the active one by default.
 *
 * For getting data it is decided based on provided address what Provider should be used. If
 * provider for given address is not given, then error is thrown.
 *
 * For putting data, there is concept of "active" provider, that the data are passed to.
 * The first provider that you register automatically becomes the active provider. You can
 * change that anytime using `makeActive()` method.
 *
 * @example
 * ```javascript
 * import { Manager, Provider } from 'rif-storage'

 const storage = new Manager()

 // The first added provider becomes also the active one
 storage.addProvider(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })
 storage.addProvider(Provider.SWARM, { url: 'http://localhost:8500' })

 const ipfsHash = await storage.put(Buffer.from('hello ipfs!')) // Stored to IPFS

 storage.makeActive(Provider.SWARM)
 const swarmHash = await storage.put(Buffer.from('hello swarm!')) // Stored to Swarm

 console.log(storage.get(ipfsHash)) // Retrieves data from IPFS and prints 'hello ipfs!'
 console.log(storage.get(swarmHash)) // Retrieves data from Swarm and prints 'hello swarm!'
 ```
 */
export declare class Manager implements StorageProvider<string, object, object> {
    private readonly providers;
    private active?;
    /**
     * @hidden
     */
    readonly type: Provider;
    constructor();
    /**
     * Returns the active provider
     */
    get activeProvider(): AllProviders | undefined;
    /**
     * Register new provider to be used by the Manager
     * @param type {@link Provider} enum value
     * @param options
     * @throws {TypeError} if no type is provided
     * @throws {ValueError} if invalid type is provided
     */
    addProvider(type: Provider, options: Options): void;
    /**
     * Specify active provider
     *
     * @throws {ProviderError} When provider is not registered
     * @param name {@link Provider} enum value
     */
    makeActive(name: Provider): void;
    private getHelper;
    /**
     * Retrieves data from provider.
     *
     * It detects which provider to use based on the format of provided address. If the detected
     * provider is not registered then exception is raised
     *
     * @param address
     * @param options
     * @throws {ProviderError} when provider is not registered for given type of address
     * @throws {ValueError} if given address does not have expected format
     * @see Storage#get
     */
    get(address: string, options?: object): Promise<Directory<Buffer> | Buffer>;
    /**
     * Retrieves data from provider.
     *
     * It detects which provider to use based on the format of provided address. If the detected
     * provider is not registered then exception is raised.
     *
     * @param address
     * @param options
     * @throws {ProviderError} when provider is not registered for given type of address
     * @throws {ValueError} if given address does not have expected format
     * @see Storage#get
     */
    getReadable(address: string, options?: object): Promise<Readable>;
    /**
     * Puts data to provider.
     *
     * @param data
     * @param options
     * @throws {ProviderError} if there is no activeProvider (and hence no provider registered)
     * @see Storage#put
     */
    put(data: string | Buffer | Readable, options?: object): Promise<string>;
    put(data: Directory<string | Buffer | Readable> | Array<DirectoryArrayEntry<Buffer | Readable>>, options?: object): Promise<string>;
}
