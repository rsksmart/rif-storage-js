import IPFSFactory, { FactoryOptions, Proc, SpawnOptions } from 'ipfsd-ctl'
import ipfsClient, { IpfsClient } from 'ipfs-http-client'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import IPFS from 'ipfs'
import mergeOptions from 'merge-options'

// Taken and modified from https://github.com/ipfs/js-ipfs/blob/master/test/utils/interface-common-factory.js
// Credit to Protocol Labs

interface IpfsFactory {
  setup (factoryOptions?: FactoryOptions, spawnOptions?: SpawnOptions): Promise<IpfsClient>
  teardown (): Promise<void[]>
}

export default function createIpfs (createFactoryOptions: FactoryOptions = {}, createSpawnOptions: SpawnOptions = {}): IpfsFactory {
  const nodes: Array<Proc> = []

  async function setup (factoryOptions: FactoryOptions = {}, spawnOptions: SpawnOptions = {}): Promise<IpfsClient> {
    factoryOptions = mergeOptions(
      {
        type: 'proc',
        exec: IPFS
      },
      factoryOptions,
      createFactoryOptions
    )

    // When not an in proc daemon use the http-client js-ipfs depends on, not the one from ipfsd-ctl
    if (factoryOptions.type !== 'proc') {
      factoryOptions.IpfsClient = factoryOptions.IpfsClient || ipfsClient
    }

    const ipfsFactory = IPFSFactory.create(factoryOptions)
    const node = await ipfsFactory.spawn(mergeOptions(
      {
        config: {
          Bootstrap: [],
          Discovery: {
            MDNS: {
              Enabled: false
            },
            webRTCStar: {
              Enabled: false
            }
          }
        },
        preload: { enabled: false }
      },
      spawnOptions,
      createSpawnOptions
    ))
    nodes.push(node)

    node.api.peerId = await node.api.id()

    return node.api
  }

  function teardown (): Promise<void[]> {
    return Promise.all(nodes.map(n => n.stop()))
  }

  return {
    setup,
    teardown
  }
}
