import { ipfs as ipfsProvider, swarm as swarmProvider } from '../../src'
import createIpfs from './ipfs/utils'
import { IpfsStorageProvider, SwarmStorageProvider } from '../../src/types'
import { ValueError } from '../../src/errors'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

const PROVIDERS = {
  async ipfs (): Promise<[IpfsStorageProvider, () => void]> {
    const factory = createIpfs()
    const ipfs = await factory.setup()
    const teardown = factory.teardown
    return [ipfsProvider(ipfs), teardown]
  },
  swarm (): Promise<[SwarmStorageProvider, () => void]> {
    return Promise.resolve([swarmProvider({ url: 'http://localhost:8500' }), (): void => {}])
  }
}

describe('Common providers tests', () => {
  Object.entries(PROVIDERS).forEach(([providerName, setup]) => {
    describe(`${providerName} provider`, () => {
      let provider: IpfsStorageProvider | SwarmStorageProvider, teardown: () => void

      before(async () => {
        [provider, teardown] = await setup()
      })

      after(() => {
        teardown()
      })

      describe('put()', () => {
        it('should validate data', () => {
          const inputs = [
            1, 'string', null, undefined, [], {}, { 'some-path': '' }, { '': '' }, { 'some-path': {} },
            { 'some-path': { data: '' } }, { 'some-path': { data: {} } }, { 'some-path': { data: null } }
          ]

          // @ts-ignore
          const promises = inputs.map(entry => expect(provider.put(entry), `failing with ${JSON.stringify(entry)}`).to.be.eventually.rejectedWith(ValueError))
          return Promise.all(promises)
        })

        it('should reject empty directory', () => {
          return expect(provider.put({})).to.be.eventually.rejectedWith(ValueError, /empty/)
        })
      })

      describe('get()', () => {
        it('get() should validate input', function () {
          const inputs = [1, null, undefined, {}, []]

          // @ts-ignore
          const promises = inputs.map(entry => expect(provider.get(entry)).to.be.eventually.rejectedWith(ValueError))
          return Promise.all(promises)
        })
      })
    })
  })
})
