/// <reference types="node" />
import { Directory, DirectoryArray, Provider } from './types';
import { Readable } from 'stream';
export declare const FILE_SYMBOL: unique symbol;
export declare const DIRECTORY_SYMBOL: unique symbol;
/**
 * Function that marks an object with Symbol signaling that it is a Directory object.
 *
 * @see isFile
 * @param obj
 */
export declare function markFile<T extends object>(obj: T): T;
/**
 * Function that marks an object with Symbol signaling that it is a File object no matter what
 * sort of implementation it is (Readable|Buffer|async generator etc)
 *
 * @see isDirectory
 * @param obj
 */
export declare function markDirectory<T extends object>(obj: T): T;
/**
 * Verifies if the returned object is a file
 *
 * @param obj
 */
export declare function isFile(obj: object): boolean;
/**
 * Verifies if the returned object is a directory
 *
 * @param obj
 */
export declare function isDirectory(obj: object): boolean;
export declare function isTSDirectory<T>(data: object, genericTest: (entry: T) => boolean): data is Directory<T>;
export declare function isTSDirectoryArray<T>(data: object, genericTest: (entry: T) => boolean): data is DirectoryArray<T>;
export declare function isReadable(entry: unknown): entry is Readable;
export declare function isReadableOrBuffer(entry: unknown): entry is Readable | Buffer;
export declare function detectAddress(address: string): Provider | false;
