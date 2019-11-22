import { IpfsClient, CidAddress, ClientOptions } from 'ipfs-http-client'

export enum Provider {
  LOCAL_STORAGE = 'local',
  IPFS = 'ipfs',
  SWARM = 'swarm',
}

export interface Storage {
  readonly type: Provider

  /**
   * Retrieves data from provider's network
   * @param addresses
   * @return Buffer with data
   */
  get (addresses: Address): Promise<Directory | Buffer>
  get (...addresses: Array<Address>): Promise<Directory | Buffer | Array<Directory | Buffer>>

  /**
   * Stores data on provider's network
   * @param data
   * @return Address of the stored data
   */
  put (data: Buffer): Promise<Address>
  put (data: Directory): Promise<[Address, DirectoryResult]>
}

export type Address = string

export type Options = ClientOptions

export interface DirectoryEntry {
  data: Buffer
  contentType?: string
  size?: number
}

export type Directory = Record<string, DirectoryEntry>

export enum EntryType {
  FILE = 'file',
  DIRECTORY = 'directory'
}

export interface DirectoryResultEntry {
  hash: string
  size: number
  type: EntryType
}

export type DirectoryResult = Record<string, DirectoryResultEntry>

/*******************************************************
 ****************** IPFS INTEGRATION *******************
 *******************************************************/

export interface IpfsStorageProvider extends Storage {
  ipfs: IpfsClient
  put (data: Buffer): Promise<Address>
  put (data: Directory): Promise<[Address, DirectoryResult]>

  get (addresses: Address): Promise<Directory | Buffer>
  get (...addresses: Array<CidAddress>): Promise<Array<Directory | Buffer>>
}
