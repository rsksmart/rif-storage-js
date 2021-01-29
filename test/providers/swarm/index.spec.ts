import { swarm as swarmProvider } from '../../../src'
import { Directory, Entry, SwarmStorageProvider } from '../../../src/definitions'
import { Bzz } from '@erebos/api-bzz-node'
import * as utils from '../../../src/utils'
import debug from 'debug'
import { createReadable, streamToString } from '../../utils'
import { Readable } from 'stream'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'

const log = debug('rds:test:swarm')
const AssertionError = chai.AssertionError

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
    bzz = new Bzz({
      url: 'http://localhost:8500'
    })

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

    it('should store file with filename', async () => {
      const hash = await provider.put(Buffer.from('hello world'), { fileName: 'some_file_name.pdf' })
      log(`uploaded file ${hash}`)
      const listResult = await bzz.list(hash)

      if (!listResult || !listResult.entries) {
        throw new AssertionError('Entries are wrong!')
      }

      expect(listResult.entries).to.be.an('Array')
      expect(listResult.entries.length).to.eq(1)
      expect(listResult.entries[0]).to.include({
        path: 'some_file_name.pdf',
        size: 11
      })

      const result = await bzz.download(listResult.entries[0].hash, { mode: 'raw' })
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

    it('should store readable file with filename', async () => {
      const hash = await provider.put(createReadable('hello world'), {
        fileName: 'nice_poem.txt',
        contentType: 'text/plain',
        size: 11
      })
      log(`uploaded file ${hash}`)

      const listResult = await bzz.list(hash)

      if (!listResult || !listResult.entries) {
        throw new AssertionError('Entries are wrong!')
      }

      expect(listResult.entries).to.be.an('Array')
      expect(listResult.entries.length).to.eq(1)
      expect(listResult.entries[0]).to.include({
        path: 'nice_poem.txt',
        contentType: 'text/plain',
        size: 11
      })

      const result = await bzz.download(listResult.entries[0].hash, { mode: 'raw' })
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

      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members([
        'file',
        'some/folder/file',
        'other-file'
      ])
    })

    it('should store directory in DirectoryArray format with readable', async () => {
      const file = (path: string): Entry<Readable> => {
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

      Object.values(result).forEach(entry => entry.data && expect(entry.data.toString()).to.eq('data'))

      expect(Object.keys(result)).to.include.members([
        'file',
        'other-file',
        'some/folder/other-file'
      ])
    })

    it('should store DirectoryArray with one entry as directory', async () => {
      const file = (path: string): Entry<Readable> => {
        return {
          path,
          data: createReadable('data'),
          size: 4
        }
      }

      const dir = [file('file.pdf')]

      const hash = await provider.put(dir)
      log(`uploaded file ${hash}`)

      const listResult = await bzz.list(hash)

      if (!listResult || !listResult.entries) {
        throw new AssertionError('Entries are wrong!')
      }

      expect(listResult.entries).to.be.an('Array')
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(listResult.entries.length).to.eq(1)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(listResult.entries[0]).to.include({
        path: 'file.pdf',
        size: 4
      })

      const result = await bzz.download(listResult.entries[0].hash, { mode: 'raw' })
      log(`downloaded file ${hash}`)

      expect(await result.text()).to.equal('data')

      const singleFileDirectory = await provider.get(hash) as Directory<Buffer>
      expect(utils.isDirectory(singleFileDirectory)).to.be.true()
      expect(singleFileDirectory).to.have.all.keys(['file.pdf', utils.DIRECTORY_SYMBOL])
      expect(singleFileDirectory['file.pdf'].data.toString()).to.eql('data')
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

    it('should get named file as directory', async () => {
      const hash = await provider.put(Buffer.from('hello world'), {
        fileName: 'some_file_name.pdf',
        contentType: 'text/plain'
      })

      const fetched = await provider.get(hash) as Directory<Buffer>
      expect(utils.isDirectory(fetched)).to.be.true()
      expect(fetched).to.have.all.keys(['some_file_name.pdf', utils.DIRECTORY_SYMBOL])
      expect(fetched['some_file_name.pdf'].data.toString()).to.equal('hello world')
    })

    it('should get readable file', async () => {
      const hash = (await bzz.uploadFile(Buffer.from('hello world'), { contentType: 'text/plain' }))

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

    it('should get directory with one entry but common prefixes', async () => {
      const file = { data: Buffer.from('some-data') }

      const dir = {
        file: file,
        'folder/and/some/other-file': file,
        'folder/and/some/file': file
      }
      const result = await bzz.uploadDirectory(dir)

      const fetched = await provider.get(result)
      expect(utils.isDirectory(fetched)).to.be.true()

      expect(fetched).to.have.all.keys(
        [
          'file',
          'folder/and/some/other-file',
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
