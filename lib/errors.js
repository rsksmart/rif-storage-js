"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Base error for all RDS errors
 */
class RdsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'RdsError';
    }
}
exports.RdsError = RdsError;
RdsError.code = 'RDS_ERR';
/**
 * General error for any problems related to passed value that is not related to its type
 * (for that use built in TypeError)
 */
class ValueError extends RdsError {
    constructor(message) {
        super(message);
        this.name = 'ValueError';
    }
}
exports.ValueError = ValueError;
ValueError.code = 'RDS_VALUE_ERR';
/**
 * Error related to Manager and its Providers
 */
class ProviderError extends RdsError {
    constructor(message) {
        super(message);
        this.name = 'ProviderError';
    }
}
exports.ProviderError = ProviderError;
ProviderError.code = 'RDS_PROVIDER_ERR';
