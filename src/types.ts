import { IpfsClient, CidAddress, ClientOptions } from 'ipfs-http-client'
import { Bzz } from '@erebos/api-bzz-node'
import { BzzConfig } from '@erebos/api-bzz-base'
import { Readable } from 'stream'
import { Manager } from './manager'

export enum Provider {
  MANAGER = 'manager',
  IPFS = 'ipfs',
  SWARM = 'swarm',
}

export type Address = string

export type Options = IpfsClient | ClientOptions | BzzConfig

export interface DirectoryEntry<T> {
  data: T
  contentType?: string
  size?: number
}

export type Directory<T> = Record<string, DirectoryEntry<T>>

export type DirectoryArrayEntry<T> = DirectoryEntry<T> & { path: string }
export type DirectoryArray<T> = Array<DirectoryArrayEntry<T>>

export type PutInputs =
  string
  | Buffer
  | Readable
  | Directory<string | Buffer | Readable>
  | DirectoryArray<Buffer | Readable>

export interface StorageProvider<Addr, GetOpts, PutOpts> {
  readonly type: Provider

  /**
   * Retrieves data from provider's network
   * @param address
   * @param options
   * @return Buffer with data
   */
  get (address: Addr, options?: GetOpts): Promise<Directory<Buffer> | Buffer>
  getReadable (address: Addr, options?: GetOpts): Promise<Readable>

  /**
   * Stores data on provider's network
   * @param data
   * @param options
   * @return Address of the stored data
   */
  put (data: string | Buffer | Readable, options?: PutOpts): Promise<Addr>
  put (data: Directory<string | Buffer | Readable> | DirectoryArray<Buffer | Readable>, options?: PutOpts): Promise<Addr>
}

/*******************************************************
 ****************** IPFS INTEGRATION *******************
 *******************************************************/

// TODO: Add proper options definitions
export interface IpfsStorageProvider
  extends StorageProvider<CidAddress, object, object> {
  readonly ipfs: IpfsClient
}

/*******************************************************
 ****************** SWARM INTEGRATION *******************
 *******************************************************/

export interface SwarmStorageProvider extends StorageProvider<Address, object, object> {
  readonly bzz: Bzz
}

export type AllProviders = IpfsStorageProvider | SwarmStorageProvider | Manager
