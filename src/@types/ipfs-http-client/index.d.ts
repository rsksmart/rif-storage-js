// WIP ==> NOT ALL FUNCTIONS ARE COVERED!!!

// TODO: Add pull-stream supports

declare module 'ipfs-http-client' {
  import multiaddr, { Multiaddr } from 'multiaddr'
  import CID from 'cids'

  export type CidAddress = CID | Buffer | string

  interface Options {
    timeout?: number
    headers?: object
    signal?: any
  }

  namespace RegularFiles {

    interface GetOptions extends Options {
      offset?: string
      length?: string
      compress?: string
      compressionLevel?: string
    }

    interface LsOptions extends Options {
      recursive?: boolean
    }

    interface AddOptions extends Options {
      chunker?: string
      cidVersion?: 0 | 1
      cidBase?: string // TODO: Add base values
      hashAlg?: string // TODO: Add possible hash-functions values
      hash?: string
      onlyHash?: boolean
      pin?: boolean
      quiet?: boolean
      quieter?: boolean
      rawLeaves?: boolean
      recursive?: boolean
      shardSplitThreshold?: number
      silent?: boolean
      trickle?: boolean
      wrapWithDirectory?: boolean
    }

    interface IpfsResult {
      path: string
      size: number
      hash: string
    }

    interface IpfsObject {
      path: string
      content?: Buffer | AsyncIterator<Buffer> | ReadableStream
    }

    interface BufferIpfsObject extends IpfsObject {
      content?: Buffer
    }

    interface LsResult extends IpfsResult {
      name: string
      type: string
      depth: number
    }

    export interface RegularFilesCommands {
      add (data: Buffer | File | ReadableStream | Array<IpfsObject>, options?: AddOptions): Promise<Array<IpfsResult>>
      // addFromFs
      // addFromStream
      // addFromUrl
      // addFromPullStream

      cat (path: CidAddress, options?: Options): AsyncIterator<Buffer>

      _getAsyncIterator (path: CidAddress, options?: GetOptions): AsyncIterator<IpfsObject>
      get (path: CidAddress, options?: GetOptions): Promise<Array<BufferIpfsObject>>
      getReadableStream (path: CidAddress, options?: GetOptions): ReadableStream<IpfsObject>
      // getPullStream

      _lsAsyncIterator (path: CidAddress, options?: LsOptions): AsyncIterator<LsResult>
      ls (path: CidAddress, options?: LsOptions): Promise<Array<LsResult>>
      lsReadableStream (path: CidAddress, options?: LsOptions): ReadableStream<LsResult>
    }

  }

  export interface Identity {
    id: string
    publicKey: string
    addresses: Array<string>
    agentVersion: string
    protocolVersion: string
  }

  export interface IpfsClient extends RegularFiles.RegularFilesCommands {
    send (options: object, cb: () => void): void
    id (): Identity
  }

  interface Port {
    port: string
  }

  export interface ClientOptions {
    host: string
    port: number
    protocol: string
    'api-path': string
    'user-agent': string
    headers: object
  }

  export default function ipfsClient (hostOrMultiaddr?: Multiaddr | ClientOptions | string, port?: Port | string, userOptions?: ClientOptions): IpfsClient
  export { multiaddr, CID }
}
