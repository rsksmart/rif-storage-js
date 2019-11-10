// WIP ==> NOT ALL FUNCTIONS ARE COVERED!!!

declare module 'ipfsd-ctl' {

  import { Identity, IpfsClient } from 'ipfs-http-client'

  /**
   * @param {boolean} [opts.remote] - Use remote endpoint to spawn the nodes. Defaults to `true` when not in node.
   * @param {number} [opts.port=43134] - Remote endpoint port.
   * @param {string} [opts.exec] - IPFS executable path. ipfsd-ctl will attempt to locate it by default.
   * If you desire to spawn js-ipfs instances in the same process, pass the reference to the module instead (e.g exec: `require('ipfs')`)
   * @param {string} [opts.type] - The daemon type, see below the options:
   * - go - spawn go-ipfs daemon
   * - js - spawn js-ipfs daemon
   * - proc - spawn in-process js-ipfs instance. Needs to be called also with exec. Example: `IPFSFactory.create({type: 'proc', exec: require('ipfs') })`.
   * @param {Object} IpfsClient - A custom IPFS API constructor to use instead of the packaged one `js-ipfs-http-client`.
   */
  export interface FactoryOptions {
    type?: string
    remote?: boolean
    port?: number
    exec?: string
    IpfsClient?: object
  }

  /**
   * @typedef {Object} SpawnOptions
   * @property {Boolean} [init=true] - Should the node be initialized.
   * @property {Object} initOptions - Should be of the form `{bits: <size>}`, which sets the desired key size.
   * @property {Boolean} [start=true] - Should the node be started.
   * @property {string} [repoPath] - The repository path to use for this node, ignored if node is disposable.
   * @property {Boolean} [disposable=true] - A new repo is created and initialized for each invocation, as well as cleaned up automatically once the process exits.
   * @property {Boolean} [defaultAddrs=false] - Use the daemon default Swarm addrs.
   * @property {String[]} [args] - Array of cmd line arguments to be passed to the IPFS daemon.
   * @property {Object} [config] - IPFS configuration options. {@link https://github.com/ipfs/js-ipfs#optionsconfig IPFS config}
   * @property {Object} env - Additional environment variables, passed to executing shell. Only applies for Daemon controllers.
   *
   */
  export interface SpawnOptions {
    init?: boolean
    initOptions?: object
    start?: boolean
    repoPath?: string
    disposable?: boolean
    defaultAddrs?: boolean
    args?: string[]
    config?: object
    env?: object
  }

  // TODO: Not completely true
  type ProcOptions = FactoryOptions & SpawnOptions

  export class Factory {
    constructor (options: FactoryOptions);

    /**
     * Utility method to get a temporary directory
     * useful in browsers to be able to generate temp
     * repos manually
     */
    tmpDir (): Promise<string>

    /**
     * Get the version of the currently used js|go-ipfs binary.
     */
    version (options: SpawnOptions): Promise<number>

    spawn (options: SpawnOptions): Promise<Proc>
  }

  export class Proc {
    constructor (opts: ProcOptions);

    /**
     * Get the current repo path
     *
     * @member {string}
     */
    repoPath: string
    /**
     * Is the environment
     *
     * @member {Object}
     */
    env: object

    apiAddr: string
    api: IpfsClient & { apiHost: string, apiPort: number, peerId: Identity }

    /**
     * Initialize a repo.
     *
     * @param {Object} [initOptions={}]
     * @param {number} [initOptions.bits=2048] - The bit size of the identiy key.
     * @param {string} [initOptions.directory=IPFS_PATH] - The location of the repo.
     * @param {string} [initOptions.pass] - The passphrase of the keychain.
     * @returns {Promise}
     */
    init (initOptions?: {
      bits?: number
      directory?: string
      pass?: string
    }): Promise<Proc>;

    /**
     * Delete the repo that was being used.
     * If the node was marked as `disposable` this will be called
     * automatically when the process is exited.
     *
     * @returns {Promise}
     */
    cleanup (): Promise<void>;

    /**
     * Start the daemon.
     *
     * @returns {Promise}
     */
    start (flags?: Array<string>): Promise<IpfsClient>;

    /**
     * Stop the daemon.
     *
     * @returns {Promise}
     */
    stop (timeout?: number): Promise<void>;

    /**
     * Kill the `ipfs daemon` process.
     *
     * First `SIGTERM` is sent, after 10.5 seconds `SIGKILL` is sent
     * if the process hasn't exited yet.
     *
     * @returns {Promise}
     */
    killProcess (timeout?: number): Promise<void>;

    /**
     * Get the pid of the `ipfs daemon` process.
     * TODO: Really number?
     */
    pid (): number;

    /**
     * Call `ipfs config`
     *
     * If no `key` is passed, the whole config is returned as an object.
     *
     * @param {string} [key] - A specific config to retrieve.
     * @returns {Promise}
     */
    getConfig (key?: string): Promise<string | object>;

    /**
     * Set a config value.
     *
     * @param {string} key
     * @param {string} value
     * @returns {Promise}
     */
    setConfig (key: string, value: string): Promise<void>;

    /**
     * Replace the current config with the provided one
     *
     * @param {Object} config
     * @return {Promise}
     */
    replaceConfig (config: object): Promise<void>;

    /**
     * Get the version of ipfs
     *
     * @returns {Promise}
     */
    version (): Promise<number>;
  }

  export class Server {
    constructor (options: {
      port?: number
    });

    /**
     * Start the server
     */
    start (): Promise<void>;

    /**
     * Stop the server
     */
    stop (): void;
  }

  export function createServer (options: { port: number } | number): Server;

  export function create (options: FactoryOptions): Factory;
}
