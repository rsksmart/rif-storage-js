import { Address, Provider, IpfsStorageProvider } from '../definitions'
import ipfs, { ClientOptions, CidAddress } from 'ipfs-http-client'

export default function IpfsFactory (options: ClientOptions): IpfsStorageProvider {
  return {
    ipfs: ipfs(options),
    type: Provider.IPFS,

    async get (address: CidAddress): Promise<Buffer> {
      const result = await this.ipfs.get(address)

      if (result.length > 1 || result[0].content === undefined) {
        throw new Error('directories are not supported atm')
      }

      return result[0].content
    },

    async put (data: Buffer): Promise<Address> {
      return (await this.ipfs.add(data))[0].hash
    }
  }
}
