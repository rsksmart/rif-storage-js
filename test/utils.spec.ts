import * as utils from '../src/utils'

import chai from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'

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
})
