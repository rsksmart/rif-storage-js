declare module 'async-iterator-to-stream' {
  import { Readable } from 'stream'

  function convert<T = any> (iter: AsyncIterable<T>): Readable

  function convertObj<T = any> (iter: AsyncIterable<T>): Readable

  // @ts-ignore: IgnoreZ
  convert.obj = convertObj

  export default convert
}
