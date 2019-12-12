"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../types");
const ipfs_http_client_1 = __importDefault(require("ipfs-http-client"));
const cids_1 = __importDefault(require("cids"));
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const debug_1 = __importDefault(require("debug"));
const stream_1 = require("stream");
const log = debug_1.default('rds:ipfs');
function isIpfs(client) {
    client = client;
    return typeof client.get === 'function' && typeof client.add === 'function';
}
/**
 * Validates if an address is valid CID representative.
 *
 * @private
 * @throws ValueError if address is not valid
 * @param address
 */
function validateAddress(address) {
    const isAddress = typeof address === 'string' || cids_1.default.isCID(address) || Buffer.isBuffer(address);
    if (!isAddress) {
        throw new errors_1.ValueError(`Address ${address} is not valid IPFS's CID`);
    }
    return true;
}
/**
 * Converts IPFS style of returned data into Directory object
 *
 * @private
 * @example
 * const ipfs = [{
 *   path: '/tmp/myfile.txt',
 *   content: <data as T>
 * }]
 * mapDataFromIpfs(ipfs)
 * // returns:
 * // {
 * //   '/tmp/myfile.txt': {
 * //     data: <data as T>
 * //     size: <data as T>.length
 * //   }
 * // }
 *
 * @param data - IPFS data returned from ipfs.get()
 * @param originalAddress - Original CID address that is supposed to be removed from path
 */
function mapDataFromIpfs(data, originalAddress) {
    return data.reduce((directory, file) => {
        // TODO: [Q] What about empty directories? Currently ignored
        if (!file.content)
            return directory;
        directory[file.path.replace(originalAddress.toString() + '/', '')] = {
            data: file.content,
            size: file.content.length
        };
        return directory;
    }, {});
}
/**
 * Converts and validate Directory object to IPFS style of data
 *
 * @private
 * @example
 * const directory = {
 *   '/tmp/myfile.txt': {
 *     data: <data as a Buffer>
 *   }
 * }
 * mapDataFromIpfs(ipfs)
 * // returns:
 * // const ipfs = [{
 * //   path: '/tmp/myfile.txt',
 * //   content: <data as a Buffer >
 * // }]
 *
 * @param data - Directory data
 * @return Array of objects that is consumable using ipfs.add()
 */
function mapDataToIpfs(data) {
    return Object.entries(data).map(([path, entry]) => {
        if (path === '') {
            throw new errors_1.ValueError('Empty path (name of property) is not allowed!');
        }
        return {
            path,
            content: entry.data
        };
    });
}
/**
 * Add data to IPFS
 *
 * @see Storage#put
 * @param data
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function put(data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = Object.assign({ cidVersion: 1 }, options);
        if (typeof data === 'string') {
            data = Buffer.from(data);
        }
        // Convert single element DirectoryArray
        if (typeof data === 'object' && Array.isArray(data) && data.length === 1) {
            data = data[0].data;
        }
        if (Buffer.isBuffer(data) || utils_1.isReadable(data)) {
            log('uploading single file');
            return (yield this.ipfs.add(data, options))[0].hash;
        }
        log('uploading directory');
        options.wrapWithDirectory = options.wrapWithDirectory !== false;
        if ((typeof data !== 'object' && !Array.isArray(data)) || data === null) {
            throw new TypeError('data have to be string, Readable, Buffer, DirectoryArray or Directory object!');
        }
        if ((Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
            // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
            throw new errors_1.ValueError('You passed empty Directory');
        }
        if (utils_1.isTSDirectory(data, utils_1.isReadableOrBuffer)) {
            const mappedData = mapDataToIpfs(data);
            const results = yield this.ipfs.add(mappedData, options);
            return results[results.length - 1].hash;
        }
        else if (utils_1.isTSDirectoryArray(data, utils_1.isReadableOrBuffer)) {
            const mappedData = data.map(entry => {
                return {
                    content: entry.data,
                    path: entry.path
                };
            });
            const results = yield this.ipfs.add(mappedData, options);
            return results[results.length - 1].hash;
        }
        else {
            throw new errors_1.ValueError('data have to be string, Readable, Buffer, DirectoryArray<Buffer | Readable> or Directory<Buffer | Readable> object!');
        }
    });
}
/**
 * Retrieves data from IPFS
 *
 * @see Storage#get
 * @param address - CID compatible address
 * @param options
 */
function get(address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        validateAddress(address);
        const result = yield this.ipfs.get(address, options);
        // `result[0].content === undefined` means that downloaded empty directory
        if (result.length > 1 || result[0].content === undefined) {
            log(`fetching directory from ${address}`);
            return utils_1.markDirectory(mapDataFromIpfs(result, address));
        }
        log(`fetching single file from ${address}`);
        return utils_1.markFile(result[0].content);
    });
}
/**
 * Fetch data from IPFS network and returns it as Readable stream in object mode
 * that yield objects in format {data: <Readable>, path: 'string'}
 *
 * @param address
 * @param options
 * @see Storage#getReadable
 */
// eslint-disable-next-line require-await
function getReadable(address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        validateAddress(address);
        const trans = new stream_1.Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                // We ignore folders, returning only files
                if (!chunk.content) {
                    callback(null, null);
                }
                else {
                    let pathWithoutRootHash;
                    if (chunk.path.includes('/')) {
                        const splittedPath = chunk.path.split('/');
                        pathWithoutRootHash = splittedPath.slice(1).join('/');
                    }
                    else { // Should be root
                        pathWithoutRootHash = '/';
                    }
                    // eslint-disable-next-line standard/no-callback-literal
                    callback(null, {
                        path: pathWithoutRootHash,
                        data: chunk.content
                    });
                }
            }
        });
        this.ipfs.getReadableStream(address, options).pipe(trans);
        return trans;
    });
}
/**
 * Factory for supporting IPFS
 *
 * @param options
 * @constructor
 */
function IpfsFactory(options) {
    let ipfsClient;
    if (isIpfs(options)) {
        ipfsClient = options;
        log('ipfs client using an embedded node');
    }
    else {
        ipfsClient = ipfs_http_client_1.default(options);
        const addr = typeof options === 'string' ? options : options.host;
        log('ipfs client using http api to ', addr);
    }
    return Object.freeze({
        ipfs: ipfsClient,
        type: types_1.Provider.IPFS,
        put,
        get,
        getReadable
    });
}
exports.default = IpfsFactory;
