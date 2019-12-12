/**
 * @ignore
 */
import { SwarmStorageProvider } from '../types';
import { BzzConfig } from '@erebos/api-bzz-base';
import { Bzz } from '@erebos/api-bzz-node';
/**
 * Factory for supporting Swarm
 *
 * @param options
 * @constructor
 */
export default function SwarmFactory(options: BzzConfig | Bzz): SwarmStorageProvider;
