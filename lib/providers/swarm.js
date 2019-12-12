"use strict";
/**
 * @ignore
 */
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
const api_bzz_node_1 = require("@erebos/api-bzz-node");
const errors_1 = require("../errors");
const utils_1 = require("../utils");
const debug_1 = __importDefault(require("debug"));
const stream_1 = require("stream");
const tar_stream_1 = __importDefault(require("tar-stream"));
const log = debug_1.default('rds:swarm');
function isBzz(client) {
    client = client;
    return typeof client.download === 'function' && typeof client.downloadDirectoryData === 'function';
}
function mapDirectoryArrayToArray(data) {
    return data.reduce((previousValue, currentValue) => {
        if (utils_1.isReadable(currentValue.data) && !currentValue.size && currentValue.size !== 0) {
            throw new errors_1.ValueError(`Missing "size" that is required for Readable streams (path: ${currentValue.path})`);
        }
        const path = currentValue.path;
        delete currentValue.path;
        previousValue[path] = currentValue;
        return previousValue;
    }, {});
}
function uploadStreamDirectory(client, data) {
    const pack = tar_stream_1.default.pack();
    const entries = Object.entries(data);
    if (entries.length === 0) {
        throw new errors_1.ValueError('Nothing to upload!');
    }
    function loadEntries() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [path, entry] of entries) {
                if (Buffer.isBuffer(entry.data) || typeof entry.data === 'string') {
                    pack.entry({ name: path }, entry.data);
                }
                else {
                    yield new Promise((resolve, reject) => {
                        const entryStream = pack.entry({ name: path, size: entry.size }, err => {
                            if (err)
                                reject(err);
                            else
                                resolve();
                        });
                        entry.data.pipe(entryStream);
                    });
                }
            }
            pack.finalize();
        });
    }
    // Fire-up loading entries without awaiting, in order to pass `pack` stream to `uploadFile`
    // as soon as possible, so the streaming kicks in and don't buffer.
    // The result is awaited in `uploadFile` because the response won't be returned before
    // all the streaming is done and hence the Promise returned from `uploadFile` will be
    // resolved with the hash we are looking for.
    loadEntries()
        .catch(err => {
        pack.destroy(err);
    });
    return client.uploadFile(pack, { contentType: 'application/x-tar' });
}
/**
 * Add data to Swarm
 *
 * @param data
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any,require-await
function put(data, options) {
    return __awaiter(this, void 0, void 0, function* () {
        options = options || {};
        // Convert single element DirectoryArray
        if (typeof data === 'object' && Array.isArray(data) && data.length === 1) {
            options.contentType = options.contentType || data[0].contentType;
            options.size = options.size || data[0].size;
            data = data[0].data;
        }
        if (Buffer.isBuffer(data) || typeof data === 'string') {
            log('uploading single file');
            return this.bzz.uploadFile(data, options);
        }
        if (utils_1.isReadable(data)) {
            if (!options.size) {
                throw new errors_1.ValueError('Missing "size" that is required for Readable streams');
            }
            return this.bzz.uploadFile(data, options);
        }
        log('uploading directory');
        if ((typeof data !== 'object' && !Array.isArray(data)) || data === null) {
            throw new TypeError('data have to be string, Readable, Buffer, DirectoryArray or Directory object!');
        }
        if ((Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
            // TODO: [Q] Empty object should throw error? If not then what to return? https://github.com/rsksmart/rds-libjs/issues/4
            throw new errors_1.ValueError('You passed empty Directory');
        }
        if (utils_1.isTSDirectory(data, utils_1.isReadableOrBuffer)) {
            Object.entries(data).forEach(([path, entry]) => {
                if (path === '') {
                    throw new errors_1.ValueError('Empty path (name of property) is not allowed!');
                }
                if (utils_1.isReadable(entry.data) && !entry.size && entry.size !== 0) {
                    throw new errors_1.ValueError(`Missing "size" that is required for Readable streams (path: ${path})`);
                }
            });
            return uploadStreamDirectory(this.bzz, data);
        }
        else if (utils_1.isTSDirectoryArray(data, utils_1.isReadableOrBuffer)) {
            const mappedData = mapDirectoryArrayToArray(data);
            return uploadStreamDirectory(this.bzz, mappedData);
        }
        else {
            throw new errors_1.ValueError('Data has to be Readable or Directory<Readable> or DirectoryArray<Readable>');
        }
    });
}
/**
 * Retrieves data from Swarm
 *
 * @param address
 * @param options
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function get(address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof address !== 'string') {
            throw new errors_1.ValueError(`Address ${address} is not a string!`);
        }
        try {
            const result = yield this.bzz.list(address);
            if (!result.entries) {
                throw new errors_1.ValueError(`Address ${address} does not contain any files/folders!`);
            }
            if (result.entries.length === 1) {
                log(`fetching single file from ${address}`);
                const file = yield this.bzz.download(address, options);
                return utils_1.markFile(Buffer.from(yield file.text()));
            }
        }
        catch (e) {
            // Internal Server error is returned by Swarm when the address is not Manifest
            if (!('status' in e) || e.status !== 500) {
                throw e;
            }
            log(`fetching single raw file from ${address}`);
            const file = yield this.bzz.download(address, Object.assign({ mode: 'raw' }, options));
            return utils_1.markFile(Buffer.from(yield file.text()));
        }
        log(`fetching directory from ${address}`);
        return utils_1.markDirectory(yield this.bzz.downloadDirectoryData(address));
    });
}
/**
 * Helper function that fetch single raw file from Swarm returning Readable
 *
 * @param address
 * @param options
 * @private
 */
function _getRawReadable(address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const stream = yield this.bzz.downloadStream(address, Object.assign({ mode: 'raw' }, options));
        const wrapperStream = new stream_1.Readable({ objectMode: true });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        wrapperStream._read = () => { };
        wrapperStream.push({
            data: stream,
            path: ''
        });
        wrapperStream.push(null);
        return wrapperStream;
    });
}
/**
 * Helper function that fetch file(s)/directory (eq. hash is manifest) from Swarm
 * returning Readable
 *
 * @param address
 * @param options
 * @private
 */
function _getManifestReadable(address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (options.headers == null) {
            options.headers = {};
        }
        options.headers.accept = 'application/x-tar';
        const tarRes = yield this.bzz.downloadStream(address, options);
        const readable = new stream_1.Readable({ objectMode: true });
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        readable._read = () => { };
        const extract = tar_stream_1.default.extract();
        extract.on('entry', (header, stream, next) => {
            if (header.type === 'file') {
                readable.push({
                    data: stream,
                    path: header.name,
                    size: header.size
                });
                stream.on('end', next);
            }
            else {
                next();
            }
        });
        extract.on('finish', () => {
            readable.push(null);
        });
        extract.on('error', (err) => {
            readable.destroy(err);
        });
        tarRes.pipe(extract);
        return readable;
    });
}
/**
 * Fetch data from Swarm and return Readable in object mode that yield
 * objects in format {data: <Readable>, path: 'string'}
 * @param address
 * @param options
 */
// eslint-disable-next-line require-await
function getReadable(address, options) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof address !== 'string') {
            throw new errors_1.ValueError(`Address ${address} is not a string!`);
        }
        options = options || {};
        try {
            return yield _getManifestReadable.call(this, address, options);
        }
        catch (e) {
            // Internal Server error is returned by Swarm when the address is not Manifest
            if (!e.status || e.status !== 500) {
                throw e;
            }
            log(`fetching single raw file from ${address}`);
            return _getRawReadable.call(this, address, options);
        }
    });
}
/**
 * Factory for supporting Swarm
 *
 * @param options
 * @constructor
 */
function SwarmFactory(options) {
    const bzz = isBzz(options) ? options : new api_bzz_node_1.Bzz(options);
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    log(`swarm client connected to ${bzz.url}`);
    return {
        bzz,
        type: types_1.Provider.SWARM,
        get,
        getReadable,
        put
    };
}
exports.default = SwarmFactory;
