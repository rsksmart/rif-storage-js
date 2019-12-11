[rif-storage](../README.md) › ["manager"](../modules/_manager_.md) › [Manager](_manager_.manager.md)

# Class: Manager

Utility class that supports easy usage of multiple providers in your applications.
It allows registration of all supported providers and then easy putting/getting data with
the same interface as providers.

It has concept of active provider which is the one to which the data are `put()`.
When registering providers the first one will become the active one by default.

For getting data it is decided based on provided address what Provider should be used. If
provider for given address is not given, then error is thrown.

For putting data, there is concept of "active" provider, that the data are passed to.
The first provider that you register automatically becomes the active provider. You can
change that anytime using `makeActive()` method.

**`example`** 
```javascript
import { Manager, Provider } from 'rif-storage'

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

## Hierarchy

* **Manager**

## Implements

* [StorageProvider](../interfaces/_types_.storageprovider.md)‹string, object, object›

## Index

### Constructors

* [constructor](_manager_.manager.md#constructor)

### Accessors

* [activeProvider](_manager_.manager.md#activeprovider)

### Methods

* [addProvider](_manager_.manager.md#addprovider)
* [get](_manager_.manager.md#get)
* [getReadable](_manager_.manager.md#getreadable)
* [makeActive](_manager_.manager.md#makeactive)
* [put](_manager_.manager.md#put)

## Constructors

###  constructor

\+ **new Manager**(): *[Manager](_manager_.manager.md)*

*Defined in [src/manager.ts:56](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L56)*

**Returns:** *[Manager](_manager_.manager.md)*

## Accessors

###  activeProvider

• **get activeProvider**(): *[AllProviders](../modules/_types_.md#allproviders) | undefined*

*Defined in [src/manager.ts:66](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L66)*

Returns the active provider

**Returns:** *[AllProviders](../modules/_types_.md#allproviders) | undefined*

## Methods

###  addProvider

▸ **addProvider**(`type`: [Provider](../enums/_types_.provider.md), `options`: [Options](../modules/_types_.md#options)): *void*

*Defined in [src/manager.ts:79](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L79)*

Register new provider to be used by the Manager

**`throws`** {TypeError} if no type is provided

**`throws`** {ValueError} if invalid type is provided

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`type` | [Provider](../enums/_types_.provider.md) | enum value |
`options` | [Options](../modules/_types_.md#options) | - |

**Returns:** *void*

___

###  get

▸ **get**(`address`: string, `options?`: undefined | object): *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

*Defined in [src/manager.ts:139](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L139)*

Retrieves data from provider.

It detects which provider to use based on the format of provided address. If the detected
provider is not registered then exception is raised

**`throws`** {ProviderError} when provider is not registered for given type of address

**`throws`** {ValueError} if given address does not have expected format

**`see`** Storage#get

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |
`options?` | undefined &#124; object |

**Returns:** *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

___

###  getReadable

▸ **getReadable**(`address`: string, `options?`: undefined | object): *Promise‹Readable›*

*Defined in [src/manager.ts:155](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L155)*

Retrieves data from provider.

It detects which provider to use based on the format of provided address. If the detected
provider is not registered then exception is raised.

**`throws`** {ProviderError} when provider is not registered for given type of address

**`throws`** {ValueError} if given address does not have expected format

**`see`** Storage#get

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |
`options?` | undefined &#124; object |

**Returns:** *Promise‹Readable›*

___

###  makeActive

▸ **makeActive**(`name`: [Provider](../enums/_types_.provider.md)): *void*

*Defined in [src/manager.ts:98](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L98)*

Specify active provider

**`throws`** {ProviderError} When provider is not registered

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`name` | [Provider](../enums/_types_.provider.md) | enum value  |

**Returns:** *void*

___

###  put

▸ **put**(`data`: string | Buffer | Readable, `options?`: undefined | object): *Promise‹string›*

*Defined in [src/manager.ts:167](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L167)*

Puts data to provider.

**`throws`** {ProviderError} if there is no activeProvider (and hence no provider registered)

**`see`** Storage#put

**Parameters:**

Name | Type |
------ | ------ |
`data` | string &#124; Buffer &#124; Readable |
`options?` | undefined &#124; object |

**Returns:** *Promise‹string›*

▸ **put**(`data`: [Directory](../modules/_types_.md#directory)‹string | Buffer | Readable› | Array‹[DirectoryArrayEntry](../modules/_types_.md#directoryarrayentry)‹Buffer | Readable››, `options?`: undefined | object): *Promise‹string›*

*Defined in [src/manager.ts:168](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/manager.ts#L168)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [Directory](../modules/_types_.md#directory)‹string &#124; Buffer &#124; Readable› &#124; Array‹[DirectoryArrayEntry](../modules/_types_.md#directoryarrayentry)‹Buffer &#124; Readable›› |
`options?` | undefined &#124; object |

**Returns:** *Promise‹string›*
