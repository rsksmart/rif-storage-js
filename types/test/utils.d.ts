/// <reference types="node" />
import { Readable } from 'stream';
import { Provider } from '../src';
export declare function createReadable(input: string): Readable;
export declare function streamToString(stream: Readable): Promise<string>;
export declare function detectAddress(address: string): Provider | false;
