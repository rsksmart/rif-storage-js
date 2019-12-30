import { ipfs as ipfsProvider, swarm as swarmProvider } from '../../src'
import createIpfs from './ipfs/utils'
import { IpfsStorageProvider, SwarmStorageProvider } from '../../src/types'
import { ValueError } from '../../src/errors'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import { randomBuffer } from '../utils'
import * as utils from '../../src/utils'

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
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return Promise.resolve([swarmProvider({ url: 'http://localhost:8500' }), (): void => {}])
  }
}

describe('Common providers tests', () => {
  Object.entries(PROVIDERS).forEach(([providerName, setup]) => {
    describe(`${providerName} provider`, function () {
      let provider: IpfsStorageProvider | SwarmStorageProvider, teardown: () => void
      this.timeout(10 * 1000)

      before(async () => {
        [provider, teardown] = await setup()
      })

      after(() => {
        teardown()
      })

      describe('put', () => {
        it('should validate data', () => {
          const inputs = [
            [1, TypeError],
            [null, TypeError],
            [undefined, TypeError],
            [[], ValueError],
            [{}, ValueError],
            [{ 'some-path': '' }, ValueError],
            [{ '': '' }, ValueError],
            [{ 'some-path': {} }, ValueError],
            [{ 'some-path': { data: '' } }, ValueError],
            [{ 'some-path': { data: {} } }, ValueError],
            [{ 'some-path': { data: null } }, ValueError]
          ]
          // @ts-ignore
          const promises = inputs.map(([entry, err]) => expect(provider.put(entry), `failing with ${JSON.stringify(entry)}`).to.be.eventually.rejectedWith(err))
          return Promise.all(promises)
        })

        it('should reject empty directory', async () => {
          await expect(provider.put({})).to.be.eventually.rejectedWith(ValueError)
          await expect(provider.put([])).to.be.eventually.rejectedWith(ValueError)
        })

        it('should reject directory with empty property', () => {
          return expect(provider.put({ '': { data: Buffer.from('asd') } })).to.be.eventually.rejectedWith(ValueError, 'Empty path (name of property) is not allowed')
        })
      })

      describe('get()', () => {
        it('get() should validate input', function () {
          const inputs = [1, null, undefined, {}, []]

          // @ts-ignore
          const promises = inputs.map(entry => expect(provider.get(entry)).to.be.eventually.rejectedWith(ValueError))
          return Promise.all(promises)
        })

        it('getReadable() should validate input', function () {
          const inputs = [1, null, undefined, {}, []]

          // @ts-ignore
          const promises = inputs.map(entry => expect(provider.getReadable(entry)).to.be.eventually.rejectedWith(ValueError))
          return Promise.all(promises)
        })
      })
      describe('integration', () => {
        it('should correctly handle binary data', async function () {
          const data = randomBuffer(100)

          const hash = await provider.put(data) as string
          const featchedData = await provider.get(hash)

          expect(utils.isFile(featchedData)).to.be.true()
          expect(data.equals(featchedData as Buffer)).to.be.true()
        })
      })
    })
  })
})
