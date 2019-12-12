import { IpfsStorageProvider } from '../types';
import { ClientOptions, IpfsClient } from 'ipfs-http-client';
/**
 * Factory for supporting IPFS
 *
 * @param options
 * @constructor
 */
export default function IpfsFactory(options: ClientOptions | IpfsClient): IpfsStorageProvider;
