/**
 * Base error for all RDS errors
 */
export declare class RdsError extends Error {
    static code: string;
    constructor(message: string);
}
/**
 * General error for any problems related to passed value that is not related to its type
 * (for that use built in TypeError)
 */
export declare class ValueError extends RdsError {
    static code: string;
    constructor(message: string);
}
/**
 * Error related to Manager and its Providers
 */
export declare class ProviderError extends RdsError {
    static code: string;
    constructor(message: string);
}
