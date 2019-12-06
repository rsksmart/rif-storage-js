import { swarm as swarmProvider } from '../../../src'
import { DirectoryArrayEntry, SwarmStorageProvider } from '../../../src/types'
import { Bzz } from '@erebos/api-bzz-node'
import * as utils from '../../../src/utils'
import debug from 'debug'
import { createReadable, streamToString } from '../../utils'
import { Readable } from 'stream'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'

const log = debug('rds:test:swarm')

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

describe('Swarm provider', () => {
  let provider: SwarmStorageProvider
  let bzz: Bzz

  before(async () => {
    provider = swarmProvider({
      url: 'http://localhost:8500'
    })
    bzz = provider.bzz

    try {
      await bzz.upload('test')
    } catch (e) {
      if (e.name === 'FetchError' && e.message.includes('ECONNREFUSED')) {
        expect.fail('Swarm node is not running! Cannot run tests. ')
      }
    }
  })

  describe('.put()', () => {
    it('should store file', async () => {
      const hash = await provider.put(Buffer.from('hello world'))
      log(`uploaded file ${hash}`)

      const result = await bzz.download(hash, { mode: 'raw' })
      log(`downloaded file ${hash}`)

      expect(await result.text()).to.equal('hello world')
    })

    it('should store directory with flat structure', async () => {
      const file = { data: Buffer.from('data') }

      const dir = {
        file: file,
        'other-file': file
      }

      const rootCid = await provider.put(dir)
      log(`uploaded directory ${rootCid}`)

      const result = await bzz.downloadDirectoryData(rootCid)
      log(`downloaded directory ${result}`)
      expect(Object.keys(result).length).to.eq(2)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members([
        'file',
        'other-file'
      ])
    })

    // TODO: https://github.com/MainframeHQ/erebos/issues/125
    it.skip('should store directory with empty folder', async () => {
      const file = { data: Buffer.from('') }

      const dir = {
        'folder/empty/': file
      }

      const rootCid = await provider.put(dir)
      const result = await bzz.downloadDirectoryData(rootCid)
      expect(Object.keys(result).length).to.eq(1)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members(['folder/empty/'])
    }).timeout(20000)

    it('should store directory with nested directories', async () => {
      const file = { data: Buffer.from('data') }

      const dir = {
        file: file,
        'other-file': file,
        'folder/and/file': file
      }

      const rootCid = await provider.put(dir)
      expect(rootCid).to.be.a('string')

      const result = await bzz.downloadDirectoryData(rootCid)
      expect(Object.keys(result).length).to.eq(3)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))
      expect(Object.keys(result)).to.include.members([
        'file',
        'folder/and/file',
        'other-file'
      ])
    })

    it('should store readable file', async () => {
      const hash = await provider.put(createReadable('hello world'), { size: 11 })
      log(`uploaded file ${hash}`)

      const result = await bzz.download(hash, { mode: 'raw' })
      log(`downloaded file ${hash}`)

      expect(await result.text()).to.equal('hello world')
    })

    it('should store directory in Directory format with readable', async () => {
      const file = (): { data: Readable, size: number } => { return { data: createReadable('data'), size: 4 } }

      const dir = {
        file: file(),
        'other-file': file(),
        'some/folder/file': file()
      }

      const rootHash = await provider.put(dir)
      log(`uploaded directory ${rootHash}`)

      const result = await bzz.downloadDirectoryData(rootHash)
      log(`downloaded directory ${result}`)
      expect(Object.keys(result).length).to.eq(3)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members([
        'file',
        'some/folder/file',
        'other-file'
      ])
    })

    it('should store directory in DirectoryArray format with readable', async () => {
      const file = (path: string): DirectoryArrayEntry<Readable> => {
        return {
          path,
          data: createReadable('data'),
          size: 4
        }
      }

      const dir = [
        file('file'),
        file('other-file'),
        file('some/folder/other-file')
      ]

      const rootHash = await provider.put(dir)
      log(`uploaded directory ${rootHash}`)

      const result = await bzz.downloadDirectoryData(rootHash)
      log(`downloaded directory ${result}`)
      expect(Object.keys(result).length).to.eq(3)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members([
        'file',
        'other-file'
      ])
    })

    it('should store directory with mixed styles nested directories', async () => {
      const file = (): { data: Readable, size: number } => { return { data: createReadable('data'), size: 4 } }

      const dir = {
        file: file(),
        'other-file': file(),
        'buffer-file': { data: Buffer.from('data') },
        'folder/and/file': file()
      }

      const rootCid = await provider.put(dir)
      expect(rootCid).to.be.a('string')

      const result = await bzz.downloadDirectoryData(rootCid)
      expect(Object.keys(result).length).to.eq(4)

      // @ts-ignore
      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))
      expect(Object.keys(result)).to.include.members([
        'file',
        'folder/and/file',
        'other-file',
        'buffer-file'
      ])
    })
  })

  describe('.get()', () => {
    it('should get raw file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world')))

      const fetched = await provider.get(hash)
      expect(utils.isFile(fetched)).to.be.true()
      expect(fetched.toString()).to.equal('hello world')
    })

    it('should get content-typed file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world'), { contentType: 'plain/text' }))

      const fetched = await provider.get(hash)
      expect(utils.isFile(fetched)).to.be.true()
      expect(fetched.toString()).to.equal('hello world')
    })

    it.skip('should get readable file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world'), { contentType: 'plain/text' }))

      const stream = await provider.getReadable(hash)
      let count = 0

      for await (const streamElement of stream) {
        expect(streamElement).to.be.a('object')
        const result = await streamToString(streamElement.data)
        expect(result).to.equal('hello world')
        count++
      }

      expect(count).eql(1)
    })

    it('should get raw readable file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world')))

      const stream = await provider.getReadable(hash)
      let count = 0

      for await (const streamElement of stream) {
        expect(streamElement).to.be.a('object')
        const result = await streamToString(streamElement.data)
        expect(result).to.equal('hello world')
        count++
      }

      expect(count).eql(1)
    })

    // it('should throw when not found', () => {
    //   const cid = 'QmY2ERw3nB19tVKKVF18Wq5idNL91gaNzCk1eaSq6S1J1i'
    //
    //   return expect(provider.get(cid)).to.be.eventually.fulfilled()
    // })

    it('should get directory', async () => {
      const file = { data: Buffer.from('some-data') }

      const dir = {
        file: file,
        'other-file': file,
        'folder/and/some/file': file
      }
      const result = await bzz.uploadDirectory(dir)

      const fetched = await provider.get(result)
      expect(utils.isDirectory(fetched)).to.be.true()

      expect(fetched).to.have.all.keys(
        [
          'file',
          'other-file',
          'folder/and/some/file',
          utils.DIRECTORY_SYMBOL
        ]
      )

      Object.values(fetched).forEach(file => expect(file).to.eql({
        size: 9,
        data: Buffer.from('some-data')
      }))
    })

    it('should get directory with readable', async () => {
      const file = { data: Buffer.from('some-data') }

      const dir = {
        file: file,
        'folder/and/some/file': file,
        'other-file': file
      }
      const result = await bzz.uploadDirectory(dir)

      const stream = await provider.getReadable(result)

      let count = 0
      const retrievedPaths = []
      for await (const streamElement of stream) {
        expect(streamElement).to.be.a('object')
        const result = await streamToString(streamElement.data)
        expect(result).to.equal('some-data')
        retrievedPaths.push(streamElement.path)
        count++
      }

      expect(count).eql(3)
      expect(retrievedPaths).to.eql(Object.keys(dir))
    })
  })
})
