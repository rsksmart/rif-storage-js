"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ipfs_1 = __importDefault(require("./providers/ipfs"));
exports.ipfs = ipfs_1.default;
const swarm_1 = __importDefault(require("./providers/swarm"));
exports.swarm = swarm_1.default;
const types_1 = require("./types");
exports.Provider = types_1.Provider;
const manager_1 = require("./manager");
exports.Manager = manager_1.Manager;
/**
 * Main entry point of the library that serves as a factory to create instances of StorageProvider
 * for given provider.
 *
 * @param provider
 * @param options
 */
function factory(provider, options) {
    if (!options) {
        throw new Error('You have to pass options!');
    }
    switch (provider) {
        case types_1.Provider.IPFS:
            return ipfs_1.default(options);
        case types_1.Provider.SWARM:
            return swarm_1.default(options);
        case types_1.Provider.MANAGER: // returns Local Storage StorageProvider's implementation
            return new manager_1.Manager();
        default:
            throw Error('unknown provider');
    }
}
exports.default = factory;
var utils_1 = require("./utils");
exports.isFile = utils_1.isFile;
exports.isDirectory = utils_1.isDirectory;
