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
   * @param address
   * @return Buffer with data
   */
  get (address: Address): Promise<Buffer>

  /**
   * Stores data on provider's network
   * @param data
   * @return Address of the stored data
   */
  put (data: Buffer): Promise<Address>
}

export type Address = string

export type Options = ClientOptions

/*******************************************************
 ****************** IPFS INTEGRATION *******************
 *******************************************************/

export interface IpfsStorageProvider extends Storage {
  ipfs: IpfsClient
  put (data: Buffer): Promise<Address>
  get (address: CidAddress): Promise<Buffer>
}
