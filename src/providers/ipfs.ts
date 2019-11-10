import { Address, Provider, IpfsStorageProvider } from '../definitions'
import ipfs, { ClientOptions, CidAddress, IpfsClient } from 'ipfs-http-client'

function isIpfs (client: IpfsClient | ClientOptions): client is IpfsClient {
  client = client as IpfsClient
  return typeof client.get === 'function' && typeof client.add === 'function'
}

export default function IpfsFactory (options: ClientOptions | IpfsClient): IpfsStorageProvider {
  const ipfsClient = isIpfs(options) ? options : ipfs(options)

  return {
    ipfs: ipfsClient,
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
