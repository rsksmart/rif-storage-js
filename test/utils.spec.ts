import * as utils from '../src/utils'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import { Provider } from '../src'
import { detectAddress } from './utils'

// Do not reorder these statements - https://github.com/chaijs/chai/issues/1298
chai.use(chaiAsPromised)
chai.use(dirtyChai)
const expect = chai.expect

describe('utils', () => {
  describe('markFile', () => {
    it('should add symbol to object', function () {
      const a = { some: 'object' }
      const markedA = utils.markFile(a)

      expect(Object.getOwnPropertySymbols(a)).to.include(Symbol.for('@rds-lib/file'))
      expect(Object.getOwnPropertySymbols(markedA)).to.include(Symbol.for('@rds-lib/file'))
    })

    it('should fail with primitives', function () {
      const data = [1, true, 'string', undefined, null]

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      data.forEach(entry => expect(() => utils.markFile(entry)).to.throw(TypeError)) // eslint-disable-line max-nested-callbacks
    })
  })

  describe('markDirectory', () => {
    it('should add symbol to object', function () {
      const a = { some: 'object' }
      const markedA = utils.markDirectory(a)

      expect(Object.getOwnPropertySymbols(a)).to.include(Symbol.for('@rds-lib/directory'))
      expect(Object.getOwnPropertySymbols(markedA)).to.include(Symbol.for('@rds-lib/directory'))
    })

    it('should fail with primitives', function () {
      const data = [1, true, 'string', undefined, null]

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      data.forEach(entry => expect(() => utils.markDirectory(entry)).to.throw(TypeError)) // eslint-disable-line max-nested-callbacks
    })
  })

  describe('isFile', () => {
    it('should recognized marked file', function () {
      const tmp = { some: 'object' }
      expect(utils.isFile(tmp)).to.be.false()

      const markedTmp = utils.markFile(tmp)
      expect(utils.isFile(markedTmp)).to.be.true()
    })

    it('should fail with primitives', function () {
      const data = [1, true, 'string', undefined, null]

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      data.forEach(entry => expect(() => utils.isFile(entry)).to.throw(TypeError)) // eslint-disable-line max-nested-callbacks
    })
  })

  describe('isDirectory', () => {
    it('should recognized marked directory', function () {
      const tmp = { some: 'object' }
      expect(utils.isDirectory(tmp)).to.be.false()

      const markedTmp = utils.markDirectory(tmp)
      expect(utils.isDirectory(markedTmp)).to.be.true()
    })

    it('should fail with primitives', function () {
      const data = [1, true, 'string', undefined, null]

      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      data.forEach(entry => expect(() => utils.isDirectory(entry), `Expected to throw with ${entry} value`).to.throw(TypeError)) // eslint-disable-line max-nested-callbacks
    })
  })

  describe('detectAddress', function () {
    it('should detect addresses', function () {
      const data = {
        QmeeJjvDq78aZfp1ECxY2eHSnR2SSTWxCpwJy3a4jTc2N8: Provider.IPFS,
        bafybeihsido5xl6jjwewt6mj565v3zitjfn3a4vdyi6xpmmv6nnmqr3iqu: Provider.IPFS,
        '9a48cf41c56ddd3f9b79fe47fd875f6ced7992afcacb4fb3e0cef5748a37fc6c': Provider.SWARM,
        '92672a471f4419b255d7cb0cf313474a6f5856fb347c5ece85fb706d644b630f': Provider.SWARM,
        '92672a471f4419b255d7cb0cf313474a6f58asdf56fb347c5ec644b630f': false
      }

      Object.entries(data).forEach(([hash, result]) => expect(detectAddress(hash), hash).to.eql(result))
    })
  })
})
