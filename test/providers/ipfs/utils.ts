import IPFS from 'ipfs'
import createTempRepo from './create-repo-nodejs'

// Taken and modified from https://github.com/ipfs/js-ipfs/blob/master/packages/ipfs-core/test/utils/create-node.js
// Credit to Protocol Labs

interface IpfsFactory {
  ipfs: IPFS.IPFS
  teardown (): Promise<void>
}

export default async function createIpfs (): Promise<IpfsFactory> {
  const repo = createTempRepo()
  const ipfs = await IPFS.create({
    silent: true,
    repo,
    config: {
      Addresses: {
        Swarm: []
      },
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
    preload: {
      enabled: false
    }
  })

  return {
    ipfs,
    teardown: async () => {
      await ipfs.stop()
      await repo.teardown()
    }
  }
}
