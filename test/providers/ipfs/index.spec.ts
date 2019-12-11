import { ipfs as ipfsProvider } from '../../../src'
import * as utils from '../../../src/utils'
import { IpfsClient } from 'ipfs-http-client'
import { DirectoryArrayEntry, IpfsStorageProvider } from '../../../src/types'
import createIpfs from './utils'
import { Readable } from 'stream'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import { createReadable, streamToString } from '../../utils'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

describe('IPFS provider', function () {
  let ipfs: IpfsClient
  let provider: IpfsStorageProvider
  let teardown: () => Promise<void[]>
  this.timeout(10 * 1000)

  before(async () => {
    const factory = createIpfs()
    ipfs = await factory.setup()
    teardown = factory.teardown

    provider = ipfsProvider(ipfs)
  })

  after(() => {
    teardown()
  })

  describe('.put()', () => {
    it('should store file', async () => {
      const cid = await provider.put(Buffer.from('hello world'))

      const result = await ipfs.get(cid)
      expect(result.length).to.eq(1)

      const fetchedFromIpfs = result[0]
      expect(fetchedFromIpfs.path).to.equal(cid)
      expect(fetchedFromIpfs.content && fetchedFromIpfs.content.toString()).to.equal('hello world')
    })

    it('should store directory', async () => {
      const file = { data: Buffer.from('data') }

      const dir = {
        file: file,
        'other-file': file,
        'folder/and/file': file
      }

      const rootCid = await provider.put(dir)
      expect(rootCid).to.be.a('string')

      const result = await ipfs.get(rootCid)
      expect(result.length).to.eq(6) // one more then dirResult because dirResult does not have the root folder

      // @ts-ignore
      result.forEach(entry => entry.content && expect(entry.content.toString()).to.eq('data'))

      const paths = result.map(entry => entry.path)
      expect(paths).to.include.members([
        `${rootCid}`,
        `${rootCid}/file`,
        `${rootCid}/folder`,
        `${rootCid}/folder/and`,
        `${rootCid}/folder/and/file`,
        `${rootCid}/other-file`
      ])
    })

    it('should store simple readable file', async () => {
      const cid = await provider.put(createReadable('hello world'))

      const result = await ipfs.get(cid)
      expect(result.length).to.eq(1)

      const fetchedFromIpfs = result[0]
      expect(fetchedFromIpfs.path).to.equal(cid)
      expect(fetchedFromIpfs.content && fetchedFromIpfs.content.toString()).to.equal('hello world')
    })

    it('should store directory in Directory format with Readable', async () => {
      const file = (): { data: Readable, size: number } => { return { data: createReadable('data'), size: 4 } }

      const dir = {
        file: file(),
        'other-file': file(),
        'some/folder/file': file()
      }

      const rootCid = await provider.put(dir)

      const result = await ipfs.get(rootCid)
      expect(result.length).to.eq(6)

      // @ts-ignore
      result.forEach(entry => entry.content && expect(entry.content.toString()).to.eq('data'))

      const paths = result.map(entry => entry.path)
      expect(paths).to.include.members([
        `${rootCid}`,
        `${rootCid}/file`,
        `${rootCid}/some`,
        `${rootCid}/some/folder`,
        `${rootCid}/some/folder/file`,
        `${rootCid}/other-file`
      ])
    })

    it('should store directory in DirectoryArray format with Readable', async () => {
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

      const rootCid = await provider.put(dir)

      const result = await ipfs.get(rootCid)
      expect(result.length).to.eq(6)

      // @ts-ignore
      result.forEach(entry => entry.content && expect(entry.content.toString()).to.eq('data'))

      const paths = result.map(entry => entry.path)
      expect(paths).to.include.members([
        `${rootCid}`,
        `${rootCid}/file`,
        `${rootCid}/other-file`,
        `${rootCid}/some`,
        `${rootCid}/some/folder`,
        `${rootCid}/some/folder/other-file`
      ])
    })

    it('should store DirectoryArray with single element as file', async () => {
      const file = (path: string): DirectoryArrayEntry<Readable> => {
        return {
          path,
          data: createReadable('data'),
          size: 4
        }
      }

      const dir = [file('file')]

      const rootCid = await provider.put(dir)

      const result = await provider.get(rootCid)
      expect(Buffer.isBuffer(result)).to.be.true()
      expect(result.toString()).to.eql('data')
    })
  })

  describe('.get()', () => {
    it('should get file', async () => {
      const cid = (await ipfs.add(Buffer.from('hello world')))[0].hash

      const fetchedFromIpfs = await provider.get(cid)
      expect(utils.isFile(fetchedFromIpfs)).to.be.true()
      expect(fetchedFromIpfs.toString()).to.equal('hello world')
    })

    it('should get readable file', async () => {
      const cid = (await ipfs.add(Buffer.from('hello world')))[0].hash

      const stream = await provider.getReadable(cid)
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
      const emptyDir = (name: string): { path: string } => ({ path: `test-folder/${name}` })
      const content = (name: string, value = 'some-data'): { path: string, content: Buffer } => ({
        path: `test-folder/${name}`,
        content: Buffer.from(value)
      })

      const dir = [
        content('file1'),
        content('file2'),
        content('folder/and/file'),
        content('folder/other_file'),
        emptyDir('so_empty') // This will be ignored
      ]
      const result = await ipfs.add(dir)
      const cid = result[result.length - 1].hash

      const fetchedFromIpfs = await provider.get(cid)
      expect(utils.isDirectory(fetchedFromIpfs)).to.be.true()

      expect(fetchedFromIpfs).to.have.all.keys(
        [
          'file1',
          'file2',
          'folder/and/file',
          'folder/other_file',
          utils.DIRECTORY_SYMBOL
        ]
      )

      Object.values(fetchedFromIpfs).forEach(file => expect(file).to.eql({
        size: 9,
        data: Buffer.from('some-data')
      }))
    })

    it('should get directory with readable', async () => {
      const emptyDir = (name: string): { path: string } => ({ path: `test-folder/${name}` })
      const content = (name: string, value = 'some-data'): { path: string, content: Buffer } => ({
        path: `test-folder/${name}`,
        content: Buffer.from(value)
      })

      const dir = [
        content('file1'),
        content('file2'),
        content('folder/and/file'),
        content('folder/other_file'),
        emptyDir('so_empty') // This will be ignored
      ]
      const result = await ipfs.add(dir)
      const cid = result[result.length - 1].hash

      const stream = await provider.getReadable(cid)

      let count = 0
      const retrievedPaths = []
      for await (const streamElement of stream) {
        expect(streamElement).to.be.a('object')
        const result = await streamToString(streamElement.data)
        expect(result).to.equal('some-data')
        retrievedPaths.push(streamElement.path)
        count++
      }

      expect(count).eql(4)
      expect(retrievedPaths).to.eql(
        [
          'file1',
          'file2',
          'folder/and/file',
          'folder/other_file'
        ]
      )
    })
  })
})
