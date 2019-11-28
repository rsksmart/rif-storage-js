import { IpfsClient, CidAddress, ClientOptions, RegularFiles } from 'ipfs-http-client'
import { Bzz } from '@erebos/api-bzz-browser'
import { BzzConfig, DownloadOptions, UploadOptions } from '@erebos/api-bzz-base'

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
   * @param options
   * @return Buffer with data
   */
  get (addresses: Address, options?: object): Promise<Directory | Buffer>

  /**
   * Stores data on provider's network
   * @param data
   * @param options
   * @return Address of the stored data
   */
  put (data: Buffer, options?: object): Promise<Address>
  put (data: Directory, options?: object): Promise<Address>
}

export type Address = string

export type Options = ClientOptions | BzzConfig

export interface DirectoryEntry {
  data: Buffer
  contentType?: string
  size?: number
}

export type Directory = Record<string, DirectoryEntry>

/*******************************************************
 ****************** IPFS INTEGRATION *******************
 *******************************************************/

export interface IpfsStorage extends Storage {
  readonly ipfs: IpfsClient
  put (data: Buffer, options?: RegularFiles.AddOptions): Promise<Address>
  put (data: Directory, options?: RegularFiles.AddOptions): Promise<Address>

  get (addresses: CidAddress, options?: RegularFiles.GetOptions): Promise<Directory | Buffer>
}

/*******************************************************
 ****************** SWARM INTEGRATION *******************
 *******************************************************/

export interface SwarmStorage extends Storage {
  readonly bzz: Bzz
  put (data: Buffer, options?: UploadOptions): Promise<Address>
  put (data: Directory, options?: UploadOptions): Promise<Address>

  get (addresses: Address, options?: DownloadOptions): Promise<Directory | Buffer>
}
