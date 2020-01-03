import { IpfsClient, CidAddress, ClientOptions } from 'ipfs-http-client'
import { Bzz } from '@erebos/api-bzz-node'
import { BzzConfig } from '@erebos/api-bzz-base'
import { Readable } from 'stream'
import { Manager } from './manager'

/**
 * Enum of supported providers.
 */
export enum Provider {
  MANAGER = 'manager',
  IPFS = 'ipfs',
  SWARM = 'swarm',
}

export type Address = string

export type ProviderOptions = IpfsClient | ClientOptions | BzzConfig

/**
 * Object represents a file and some of its metadata in [[Directory]] object.
 *
 * Used both for data input (eq. as part of [[Directory]] for `put()`)
 * or when retrieving data using `get()` in case the address is not a single file.
 */
export interface DirectoryEntry<T> {
  data: T

  /**
   * Applicable only for Swarm provider.
   * When left undefined than the data are stored as `raw`.
   */
  contentType?: string

  /**
   * Applicable mainly for Swarm provider.
   * Required when `data` is Readable.
   */
  size?: number
}

/**
 * Object that represents directory structure.
 * Keys are paths and values are `DirectoryEntry` objects.
 */
export type Directory<T> = Record<string, DirectoryEntry<T>>

/**
 * Object representing single file.
 *
 * @see DirectoryEntry
 */
export type Entry<T> = DirectoryEntry<T> & { path: string }

/**
 * Alternative data structure for representing directories. Used mainly together with streaming.
 */
export type DirectoryArray<T> = Array<Entry<T>>

export type PutInputs =
  string
  | Buffer
  | Readable
  | Directory<string | Buffer | Readable>
  | DirectoryArray<Buffer | Readable>

/**
 * Common options for all providers for the .put() method.
 */
export interface PutOptions {
  filename?: string
}

/**
 * Generic interface that every provider has to implement.
 */
export interface StorageProvider<Addr, GetOpts, PutOpts extends PutOptions> {
  readonly type: Provider

  /**
   * Retrieves data from provider's network.
   *
   * You can distinguish between returned objects using `isDirectory(obj)` or `isFile(obj)` utility functions.
   *
   * Addresses that point to single files are handled in two ways.
   *  - if address contains raw data then Buffer is returned
   *  - if address contains file with metadata (content-type, filename) then it is returned as single unit [[Directory]]
   *
   * @param address string hash or CID
   * @param options options passed to either IPFS's `get()` or Erebos's `download()` functions
   * @return Buffer object if the address was pointing to raw data. [[Directory]] otherwise.
   */
  get (address: Addr, options?: GetOpts): Promise<Directory<Buffer> | Buffer>

  /**
   * Retrieves data from provider's network using streaming support.
   *
   * @param address string hash or CID
   * @param options options passed to either IPFS's `get()` or Erebos's `download()` functions
   * @return `Readable` in object mode that yields [[Entry]] objects with `Readable` as `data`. The `data` has to be fully processed before moving to next entry.
   */
  getReadable (address: Addr, options?: GetOpts): Promise<Readable>

  /**
   * Stores data on provider's network
   *
   * If to the data are given some metadata (content-type or filename), then the original data are wrapped in directory
   * in order to persist these metadata.
   *
   * @param data
   * @param options
   * @return Address of the stored data
   */
  put (data: string | Buffer | Readable, options?: PutOpts): Promise<Addr>
  put (data: Directory<string | Buffer | Readable> | DirectoryArray<Buffer | Readable>, options?: PutOpts): Promise<Addr>
}

// TODO: Add proper options definitions
export interface IpfsStorageProvider
  extends StorageProvider<CidAddress, object, object> {
  readonly ipfs: IpfsClient
}

export interface SwarmStorageProvider extends StorageProvider<Address, object, object> {
  readonly bzz: Bzz
}

export type AllProviders = IpfsStorageProvider | SwarmStorageProvider | Manager
