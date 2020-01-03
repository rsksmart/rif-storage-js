[@rsksmart/rif-storage](../README.md) › ["types"](../modules/_types_.md) › [IpfsStorageProvider](_types_.ipfsstorageprovider.md)

# Interface: IpfsStorageProvider

## Hierarchy

* [StorageProvider](_types_.storageprovider.md)‹CidAddress, object, object›

  ↳ **IpfsStorageProvider**

## Index

### Properties

* [ipfs](_types_.ipfsstorageprovider.md#ipfs)
* [type](_types_.ipfsstorageprovider.md#type)

### Methods

* [get](_types_.ipfsstorageprovider.md#get)
* [getReadable](_types_.ipfsstorageprovider.md#getreadable)
* [put](_types_.ipfsstorageprovider.md#put)

## Properties

###  ipfs

• **ipfs**: *IpfsClient*

*Defined in [src/types.ts:115](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L115)*

___

###  type

• **type**: *[Provider](../enums/_types_.provider.md)*

*Inherited from [StorageProvider](_types_.storageprovider.md).[type](_types_.storageprovider.md#type)*

*Defined in [src/types.ts:72](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L72)*

## Methods

###  get

▸ **get**(`address`: CidAddress, `options?`: GetOpts): *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

*Inherited from [StorageProvider](_types_.storageprovider.md).[get](_types_.storageprovider.md#get)*

*Defined in [src/types.ts:87](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L87)*

Retrieves data from provider's network.

You can distinguish between returned objects using `isDirectory(obj)` or `isFile(obj)` utility functions.

Addresses that point to single files are handled in two ways.
 - if address contains raw data then Buffer is returned
 - if address contains file with metadata (filename) then it is returned as single unit [Directory](../modules/_types_.md#directory)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | CidAddress | string hash or CID |
`options?` | GetOpts | options passed to either IPFS's `get()` or Erebos's `download()` functions |

**Returns:** *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

Buffer object if the address was pointing to raw data. [Directory](../modules/_types_.md#directory) otherwise.

___

###  getReadable

▸ **getReadable**(`address`: CidAddress, `options?`: GetOpts): *Promise‹Readable›*

*Inherited from [StorageProvider](_types_.storageprovider.md).[getReadable](_types_.storageprovider.md#getreadable)*

*Defined in [src/types.ts:96](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L96)*

Retrieves data from provider's network using streaming support.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | CidAddress | string hash or CID |
`options?` | GetOpts | options passed to either IPFS's `get()` or Erebos's `download()` functions |

**Returns:** *Promise‹Readable›*

`Readable` in object mode that yields [Entry](../modules/_types_.md#entry) objects with `Readable` as `data`. The `data` has to be fully processed before moving to next entry.

___

###  put

▸ **put**(`data`: string | Buffer | Readable, `options?`: PutOpts): *Promise‹CidAddress›*

*Inherited from [StorageProvider](_types_.storageprovider.md).[put](_types_.storageprovider.md#put)*

*Defined in [src/types.ts:108](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L108)*

Stores data on provider's network

If to the data are given some metadata (filename), then the original data are wrapped in directory
in order to persist these metadata.

**Parameters:**

Name | Type |
------ | ------ |
`data` | string &#124; Buffer &#124; Readable |
`options?` | PutOpts |

**Returns:** *Promise‹CidAddress›*

Address of the stored data

▸ **put**(`data`: [Directory](../modules/_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer | Readable›, `options?`: PutOpts): *Promise‹CidAddress›*

*Inherited from [StorageProvider](_types_.storageprovider.md).[put](_types_.storageprovider.md#put)*

*Defined in [src/types.ts:109](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L109)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [Directory](../modules/_types_.md#directory)‹string &#124; Buffer &#124; Readable› &#124; [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer &#124; Readable› |
`options?` | PutOpts |

**Returns:** *Promise‹CidAddress›*
