import { IpfsClient } from 'ipfs-http-client'
import createIpfs from './providers/ipfs/utils'
import { Manager } from '../src/manager'
import { Provider } from '../src'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import { ProviderError, ValueError } from '../src/errors'
import { streamToString } from './utils'
import { Bzz } from '@erebos/api-bzz-node'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

describe('manager', function () {
  let bzz: Bzz
  let ipfs: IpfsClient
  let teardown: () => Promise<void>
  this.timeout(10 * 1000)

  before(async () => {
    const factory = createIpfs()
    ipfs = await factory.setup()
    teardown = factory.teardown

    bzz = new Bzz({
      url: 'http://localhost:8500'
    })
  })

  after(() => {
    teardown()
  })

  it('should allow all providers', function () {
    const manager = new Manager()
    expect(manager.activeProvider).to.be.undefined()

    manager.addProvider(Provider.IPFS, ipfs)

    expect(manager.activeProvider && manager.activeProvider.type).to.eq(Provider.IPFS)
    manager.addProvider(Provider.SWARM, {
      url: 'http://localhost:8500'
    })
    expect(manager.activeProvider && manager.activeProvider.type).to.eq(Provider.IPFS)

    // @ts-ignore
    expect(manager.providers).to.have.all.keys(Provider.SWARM, Provider.IPFS)
    expect(manager.activeProvider && manager.activeProvider.type).to.eq(Provider.IPFS)
  })

  it('should fail adding unknown provider', function () {
    const manager = new Manager()

    expect(() => {
      // @ts-ignore
      manager.addProvider('unkown_provider', ipfs)
    }).to.throw(Error, 'unknown provider')
  })

  it('makeActive fails with unregistered provider', function () {
    const manager = new Manager()

    expect(() => {
      manager.makeActive(Provider.IPFS)
    }).to.throw(ProviderError)
  })

  it('makeActive changes provider', function () {
    const manager = new Manager()
    manager.addProvider(Provider.IPFS, ipfs)
    manager.addProvider(Provider.SWARM, {
      url: 'http://localhost:8500'
    })

    expect(manager.activeProvider && manager.activeProvider.type).to.eq(Provider.IPFS)
    manager.makeActive(Provider.SWARM)
    expect(manager.activeProvider && manager.activeProvider.type).to.eq(Provider.SWARM)
  })

  it('should raise when putting without default', function () {
    const manager = new Manager()

    expect(() => {
      manager.put('some-data')
    }).to.throw(ProviderError)
  })

  it('should put data', async function () {
    const manager = new Manager()
    manager.addProvider(Provider.IPFS, ipfs)

    const cid = await manager.put('hello world')

    const result = await ipfs.get(cid)
    const fetchedFromIpfs = result[0]
    expect(fetchedFromIpfs.path).to.equal(cid)
    expect(fetchedFromIpfs.content && fetchedFromIpfs.content.toString()).to.equal('hello world')
  })

  it('should put data to correct providers', async function () {
    const manager = new Manager()
    manager.addProvider(Provider.IPFS, ipfs)
    manager.addProvider(Provider.SWARM, {
      url: 'http://localhost:8500'
    })

    const cid = await manager.put('hello world')

    const ipfsResult = await ipfs.get(cid)
    const fetchedFromIpfs = ipfsResult[0]
    expect(fetchedFromIpfs.path).to.equal(cid)
    expect(fetchedFromIpfs.content && fetchedFromIpfs.content.toString()).to.equal('hello world')

    manager.makeActive(Provider.SWARM)
    const hash = await manager.put('hello world')

    expect(cid).to.not.eql(hash)

    const swarmResult = await bzz.download(hash, { mode: 'raw' })
    expect(await swarmResult.text()).to.equal('hello world')
  })

  it('should get data based on type of hash', async function () {
    const manager = new Manager()
    manager.addProvider(Provider.IPFS, ipfs)
    manager.addProvider(Provider.SWARM, {
      url: 'http://localhost:8500'
    })

    const cid = await manager.put('hello world')
    manager.makeActive(Provider.SWARM)
    const hash = await manager.put('hello world')

    expect((await manager.get(cid)).toString()).to.eql('hello world')
    expect((await manager.get(hash)).toString()).to.eql('hello world')
  })

  it('should get Readable based on type of hash', async function () {
    const manager = new Manager()
    manager.addProvider(Provider.IPFS, ipfs)
    manager.addProvider(Provider.SWARM, {
      url: 'http://localhost:8500'
    })

    const cid = await manager.put('hello world')
    manager.makeActive(Provider.SWARM)
    const hash = await manager.put('hello world')

    const ipfsReadable = await manager.getReadable(cid)
    const swarmReadable = await manager.getReadable(hash)

    let count = 0
    for await (const streamElement of ipfsReadable) {
      expect(streamElement).to.be.a('object')
      const result = await streamToString(streamElement.data)
      expect(result).to.equal('hello world')
      count++
    }
    expect(count).eql(1)

    count = 0
    for await (const streamElement of swarmReadable) {
      expect(streamElement).to.be.a('object')
      const result = await streamToString(streamElement.data)
      expect(result).to.equal('hello world')
      count++
    }
    expect(count).eql(1)
  })

  it('should fail get data with invalid hash', function () {
    const manager = new Manager()
    manager.addProvider(Provider.IPFS, ipfs)

    expect(manager.get('invalid_hash')).to.be.eventually.rejectedWith(ValueError)
  })

  it('should fail get data without registered provider', function () {
    const manager = new Manager()

    // Swarm
    expect(manager.get('92672a471f4419b255d7cb0cf313474a6f5856fb347c5ece85fb706d644b630f')).to.be.eventually.rejectedWith(ProviderError)

    // IPFS
    expect(manager.get('bafybeihsido5xl6jjwewt6mj565v3zitjfn3a4vdyi6xpmmv6nnmqr3iqu')).to.be.eventually.rejectedWith(ProviderError)
  })
})
