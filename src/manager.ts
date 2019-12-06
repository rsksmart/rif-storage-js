import {
  AllProviders,
  Directory,
  DirectoryArray,
  DirectoryArrayEntry,
  Options,
  Provider,
  StorageProvider
} from './types'
import { Readable } from 'stream'
import factory from './index'
import { ProviderError, ValueError } from './errors'
import { detectAddress } from '../test/utils'

/**
 * Utility class that supports easy usage of multiple providers in your applications.
 * It allows registration of all supported providers and then easy putting/getting data with
 * the same interface as providers.
 *
 * For getting data it is decided based on provided address what Provider should be used. If
 * provider for given address is not given, then error is thrown.
 *
 * For putting data, there is concept of "active" provider, that the data are passed to.
 * The first provider that you register automatically becomes the active provider. You can
 * change that anytime using `makeActive()` method.
 */
export class Manager implements StorageProvider<string, object, object> {
  private readonly providers: Partial<Record<Provider, AllProviders>>
  private active?: Provider
  readonly type: Provider

  constructor () {
    this.providers = {}
    this.type = Provider.MANAGER
  }

  /**
   * Returns the active provider
   */
  get activeProvider (): AllProviders | undefined {
    if (!this.active) { return undefined }

    return this.providers[this.active]
  }

  /**
   * Register new provider to be used by the Manager
   * @param type {@link Provider} enum value
   * @param options
   * @throws {TypeError} if no type is provided
   * @throws {ValueError} if invalid type is provided
   */
  addProvider (type: Provider, options: Options): void {
    if (!type) {
      throw new TypeError('type is required!')
    }

    if (!this.active) {
      this.active = type
    }

    // Type value is checked in factory
    this.providers[type] = factory(type, options)
  }

  /**
   * Specify active provider
   *
   * @throws {ProviderError} When provider is not registered
   * @param name {@link Provider} enum value
   */
  makeActive (name: Provider): void {
    if (!this.providers[name]) {
      throw new ProviderError(`${name} is not registered provider!`)
    }

    this.active = name
  }

  // eslint-disable-next-line require-await
  private async getHelper (fnName: 'get' | 'getReadable', address: string, options?: object): Promise<Directory<Buffer> | Buffer | Readable> {
    const detected = detectAddress(address)

    if (detected === Provider.IPFS) {
      if (this.providers[Provider.IPFS] === undefined) {
        throw new ProviderError('You wanted to fetched IPFS address, but you haven\'t register IPFS provider!')
      }

      return this.providers[Provider.IPFS]![fnName](address, options)
    } else if (detected === Provider.SWARM) {
      if (this.providers[Provider.SWARM] === undefined) {
        throw new ProviderError('You wanted to fetched Swarm address, but you haven\'t register Swarm provider!')
      }

      return this.providers[Provider.SWARM]![fnName](address, options)
    } else {
      throw new ValueError('Address does not have expected format')
    }
  }

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
  get (address: string, options?: object): Promise<Directory<Buffer> | Buffer> {
    return this.getHelper('get', address, options) as Promise<Directory<Buffer> | Buffer>
  }

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
  getReadable (address: string, options?: object): Promise<Readable> {
    return this.getHelper('getReadable', address, options) as Promise<Readable>
  }

  /**
   * Puts data to provider.
   *
   * @param data
   * @param options
   * @throws {ProviderError} if there is no activeProvider (and hence no provider registered)
   * @see Storage#put
   */
  put (data: string | Buffer | Readable, options?: object): Promise<string>
  put (data: Directory<string | Buffer | Readable> | Array<DirectoryArrayEntry<Buffer | Readable>>, options?: object): Promise<string>
  put (data: string | Buffer | Readable | Directory<string | Buffer | Readable> | DirectoryArray<Buffer | Readable>, options?: object): Promise<string> {
    if (!this.activeProvider) {
      throw new ProviderError('Before putting any data, you have to first add some provider!')
    }

    // TypeScript does have problems with overloading, the implementation
    // signature is actually matching but he looks only to the function definitions.
    // @ts-ignore
    return this.activeProvider.put(data, options)
  }
}
