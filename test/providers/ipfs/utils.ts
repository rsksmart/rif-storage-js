import { createController, Controller } from 'ipfsd-ctl'
import ipfsClient, { IpfsClient } from 'ipfs-http-client'
// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import IPFS from 'ipfs'

// Taken and modified from https://github.com/ipfs/js-ipfs/blob/master/test/utils/interface-common-factory.js
// Credit to Protocol Labs

interface IpfsFactory {
  setup (): Promise<IpfsClient>
  teardown (): Promise<void>
}

export default function createIpfs (): IpfsFactory {
  let node: Controller

  async function setup (): Promise<IpfsClient> {
    const factoryOptions = {
      remote: true,
      disposable: true,
      type: 'proc',
      ipfsHttpModule: ipfsClient,
      ipfsModule: IPFS,
      ipfsOptions: {
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
      }
    }

    node = await createController(factoryOptions)
    return node.api
  }

  function teardown (): Promise<void> {
    return node.stop()
  }

  return {
    setup,
    teardown
  }
}
