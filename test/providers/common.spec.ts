import { Ipfs, ipfs as ipfsProvider, StorageProvider, swarm as swarmProvider } from '../../src'
import createIpfs from './ipfs/utils'
import { Directory, IpfsStorageProvider, SwarmStorageProvider } from '../../src/definitions'
import { ValueError } from '../../src/errors'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import { randomBuffer, streamToBuffer } from '../utils'
import * as utils from '../../src/utils'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

const PROVIDERS = {
  async ipfs (): Promise<[IpfsStorageProvider, () => void]> {
    const factory = await createIpfs()
    return [ipfsProvider(factory.ipfs as unknown as Ipfs), factory.teardown]
  },
  swarm (): Promise<[SwarmStorageProvider, () => void]> {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return Promise.resolve([swarmProvider({ url: 'http://localhost:8500' }), (): void => {}])
  }
}

describe('Common providers tests', () => {
  Object.entries(PROVIDERS).forEach(([providerName, setup]) => {
    describe(`${providerName} provider`, function () {
      let provider: StorageProvider<any, any, any>, teardown: () => void
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
          // @ts-ignore: testing failures
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

          const promises = inputs.map(entry => expect(provider.get(entry)).to.be.eventually.rejectedWith(ValueError))
          return Promise.all(promises)
        })

        it('getReadable() should validate input', function () {
          const inputs = [1, null, undefined, {}, []]

          const promises = inputs.map(entry => expect(provider.getReadable(entry)).to.be.eventually.rejectedWith(ValueError))
          return Promise.all(promises)
        })
      })

      describe('integration tests', () => {
        it('should wrap files with metadata in directory', async function () {
          const hash = await provider.put(Buffer.from('hello world'), { fileName: 'poem.txt' }) as string
          const fetched = await provider.get(hash) as Directory<Buffer>

          expect(utils.isDirectory(fetched)).to.be.true()
          expect(fetched).to.have.all.keys(['poem.txt', utils.DIRECTORY_SYMBOL])
          expect(fetched['poem.txt'].data.toString()).to.eql('hello world')
        })

        describe('should correctly handle binary data', function () {
          const data = randomBuffer(20)

          it('Buffer - file', async function () {
            const hash = await provider.put(data) as string
            const fetched = await provider.get(hash)

            expect(utils.isFile(fetched)).to.be.true()
            expect(data.equals(fetched as Buffer)).to.be.true()
          })

          it('Buffer - directory', async function () {
            const dirHash = await provider.put({ file: { data }, other: { data } } as Directory<Buffer>) as string
            const fetched = await provider.get(dirHash) as Directory<Buffer>

            expect(utils.isDirectory(fetched)).to.be.true()
            expect(data.equals(fetched.file.data)).to.be.true()
          })

          it('Stream - file', async function () {
            const hash = await provider.put(data) as string
            const readable = await provider.getReadable(hash)

            let count = 0
            for await (const streamElement of readable) {
              expect(streamElement).to.be.a('object')
              const result = await streamToBuffer(streamElement.data)
              expect(data.equals(result)).to.be.true()
              count++
            }
            expect(count).eql(1)
          })

          it('Stream - directory', async function () {
            const dirHash = await provider.put({ file: { data } } as Directory<Buffer>) as string
            const readable = await provider.getReadable(dirHash)

            let count = 0
            for await (const streamElement of readable) {
              expect(streamElement).to.be.a('object')
              const result = await streamToBuffer(streamElement.data)
              expect(data.equals(result)).to.be.true()
              expect(streamElement.path).to.equal('file')
              count++
            }
            expect(count).eql(1)
          })
        })
      })
    })
  })
})
