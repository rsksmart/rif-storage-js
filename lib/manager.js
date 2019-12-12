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
const types_1 = require("./types");
const index_1 = __importDefault(require("./index"));
const errors_1 = require("./errors");
const utils_1 = require("./utils");
/**
 * Utility class that supports easy usage of multiple providers in your applications.
 * It allows registration of all supported providers and then easy putting/getting data with
 * the same interface as providers.
 *
 * It has concept of active provider which is the one to which the data are `put()`.
 * When registering providers the first one will become the active one by default.
 *
 * For getting data it is decided based on provided address what Provider should be used. If
 * provider for given address is not given, then error is thrown.
 *
 * For putting data, there is concept of "active" provider, that the data are passed to.
 * The first provider that you register automatically becomes the active provider. You can
 * change that anytime using `makeActive()` method.
 *
 * @example
 * ```javascript
 * import { Manager, Provider } from 'rif-storage'

 const storage = new Manager()

 // The first added provider becomes also the active one
 storage.addProvider(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })
 storage.addProvider(Provider.SWARM, { url: 'http://localhost:8500' })

 const ipfsHash = await storage.put(Buffer.from('hello ipfs!')) // Stored to IPFS

 storage.makeActive(Provider.SWARM)
 const swarmHash = await storage.put(Buffer.from('hello swarm!')) // Stored to Swarm

 console.log(storage.get(ipfsHash)) // Retrieves data from IPFS and prints 'hello ipfs!'
 console.log(storage.get(swarmHash)) // Retrieves data from Swarm and prints 'hello swarm!'
 ```
 */
class Manager {
    constructor() {
        this.providers = {};
        this.type = types_1.Provider.MANAGER;
    }
    /**
     * Returns the active provider
     */
    get activeProvider() {
        if (!this.active) {
            return undefined;
        }
        return this.providers[this.active];
    }
    /**
     * Register new provider to be used by the Manager
     * @param type {@link Provider} enum value
     * @param options
     * @throws {TypeError} if no type is provided
     * @throws {ValueError} if invalid type is provided
     */
    addProvider(type, options) {
        if (!type) {
            throw new TypeError('type is required!');
        }
        if (!this.active) {
            this.active = type;
        }
        // Type value is checked in factory
        this.providers[type] = index_1.default(type, options);
    }
    /**
     * Specify active provider
     *
     * @throws {ProviderError} When provider is not registered
     * @param name {@link Provider} enum value
     */
    makeActive(name) {
        if (!this.providers[name]) {
            throw new errors_1.ProviderError(`${name} is not registered provider!`);
        }
        this.active = name;
    }
    // eslint-disable-next-line require-await
    getHelper(fnName, address, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const detected = utils_1.detectAddress(address);
            if (detected === types_1.Provider.IPFS) {
                if (this.providers[types_1.Provider.IPFS] === undefined) {
                    throw new errors_1.ProviderError('You wanted to fetched IPFS address, but you haven\'t register IPFS provider!');
                }
                return this.providers[types_1.Provider.IPFS][fnName](address, options);
            }
            else if (detected === types_1.Provider.SWARM) {
                if (this.providers[types_1.Provider.SWARM] === undefined) {
                    throw new errors_1.ProviderError('You wanted to fetched Swarm address, but you haven\'t register Swarm provider!');
                }
                return this.providers[types_1.Provider.SWARM][fnName](address, options);
            }
            else {
                throw new errors_1.ValueError('Address does not have expected format');
            }
        });
    }
    /**
     * Retrieves data from provider.
     *
     * It detects which provider to use based on the format of provided address. If the detected
     * provider is not registered then exception is raised
     *
     * @param address
     * @param options
     * @throws {ProviderError} when provider is not registered for given type of address
     * @throws {ValueError} if given address does not have expected format
     * @see Storage#get
     */
    get(address, options) {
        return this.getHelper('get', address, options);
    }
    /**
     * Retrieves data from provider.
     *
     * It detects which provider to use based on the format of provided address. If the detected
     * provider is not registered then exception is raised.
     *
     * @param address
     * @param options
     * @throws {ProviderError} when provider is not registered for given type of address
     * @throws {ValueError} if given address does not have expected format
     * @see Storage#get
     */
    getReadable(address, options) {
        return this.getHelper('getReadable', address, options);
    }
    put(data, options) {
        if (!this.activeProvider) {
            throw new errors_1.ProviderError('Before putting any data, you have to first add some provider!');
        }
        // TypeScript does have problems with overloading, the implementation
        // signature is actually matching but he looks only to the function definitions.
        // @ts-ignore
        return this.activeProvider.put(data, options);
    }
}
exports.Manager = Manager;
