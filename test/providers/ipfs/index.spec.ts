import { ipfs as ipfsProvider } from '../../../src'
import { IpfsClient } from 'ipfs-http-client'
import { IpfsStorageProvider } from '../../../src/definitions'
import createIpfs from './utils'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

describe('IPFS provider', () => {
  let ipfs: IpfsClient
  let provider: IpfsStorageProvider
  let teardown: () => Promise<void[]>

  before(async () => {
    const factory = createIpfs()
    ipfs = await factory.setup()
    teardown = factory.teardown

    provider = ipfsProvider(ipfs)
  })

  after(() => {
    teardown()
  })

  it('should store data', async () => {
    const cid = await provider.put(Buffer.from('hello world'))

    const fetchedFromIpfs = (await ipfs.get(cid))[0]
    expect(fetchedFromIpfs.path).to.equal(cid)
    expect(fetchedFromIpfs.content?.toString()).to.equal('hello world')
  })
})
