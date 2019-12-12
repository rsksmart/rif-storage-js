"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
const cids_1 = __importDefault(require("cids"));
exports.FILE_SYMBOL = Symbol.for('@rds-lib/file');
exports.DIRECTORY_SYMBOL = Symbol.for('@rds-lib/directory');
/**
 * Function that marks an object with Symbol signaling that it is a Directory object.
 *
 * @see isFile
 * @param obj
 */
function markFile(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw TypeError('obj is not object!');
    }
    // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
    // @ts-ignore
    obj[exports.FILE_SYMBOL] = true;
    return obj;
}
exports.markFile = markFile;
/**
 * Function that marks an object with Symbol signaling that it is a File object no matter what
 * sort of implementation it is (Readable|Buffer|async generator etc)
 *
 * @see isDirectory
 * @param obj
 */
function markDirectory(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw TypeError('obj is not object!');
    }
    // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
    // @ts-ignore
    obj[exports.DIRECTORY_SYMBOL] = true;
    return obj;
}
exports.markDirectory = markDirectory;
/**
 * Verifies if the returned object is a file
 *
 * @param obj
 */
function isFile(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw TypeError('obj is not object!');
    }
    // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
    // @ts-ignore
    return Boolean(obj[exports.FILE_SYMBOL]);
}
exports.isFile = isFile;
/**
 * Verifies if the returned object is a directory
 *
 * @param obj
 */
function isDirectory(obj) {
    if (typeof obj !== 'object' || obj === null) {
        throw TypeError('obj is not object!');
    }
    // TS does not support indexing with Symbols - https://github.com/microsoft/TypeScript/issues/1863
    // @ts-ignore
    return Boolean(obj[exports.DIRECTORY_SYMBOL]);
}
exports.isDirectory = isDirectory;
function isTSDirectory(data, genericTest) {
    if (typeof data !== 'object' || Array.isArray(data) || data === null) {
        return false;
    }
    return !Object.values(data).some(entry => typeof entry !== 'object' ||
        !('data' in entry) ||
        !genericTest(entry.data));
}
exports.isTSDirectory = isTSDirectory;
function isTSDirectoryArray(data, genericTest) {
    if (!Array.isArray(data)) {
        return false;
    }
    return !data.some(entry => typeof entry !== 'object' ||
        !entry.data ||
        !entry.path ||
        !genericTest(entry.data));
}
exports.isTSDirectoryArray = isTSDirectoryArray;
function isReadable(entry) {
    return typeof entry === 'object' &&
        entry !== null &&
        typeof entry.pipe === 'function' &&
        entry.readable !== false &&
        typeof entry._read === 'function';
}
exports.isReadable = isReadable;
function isReadableOrBuffer(entry) {
    return Buffer.isBuffer(entry) || isReadable(entry);
}
exports.isReadableOrBuffer = isReadableOrBuffer;
function detectAddress(address) {
    try {
        // eslint-disable-next-line no-new
        new cids_1.default(address);
        return types_1.Provider.IPFS;
    }
    catch (e) {
        if (address.length !== 64) {
            return false;
        }
        return types_1.Provider.SWARM;
    }
}
exports.detectAddress = detectAddress;
