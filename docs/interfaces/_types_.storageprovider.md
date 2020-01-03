[@rsksmart/rif-storage](../README.md) › ["types"](../modules/_types_.md) › [StorageProvider](_types_.storageprovider.md)

# Interface: StorageProvider <**Addr, GetOpts, PutOpts**>

Generic interface that every provider has to implement.

## Type parameters

▪ **Addr**

▪ **GetOpts**

▪ **PutOpts**: *[PutOptions](_types_.putoptions.md)*

## Hierarchy

* **StorageProvider**

  ↳ [IpfsStorageProvider](_types_.ipfsstorageprovider.md)

  ↳ [SwarmStorageProvider](_types_.swarmstorageprovider.md)

## Implemented by

* [Manager](../classes/_manager_.manager.md)

## Index

### Properties

* [type](_types_.storageprovider.md#type)

### Methods

* [get](_types_.storageprovider.md#get)
* [getReadable](_types_.storageprovider.md#getreadable)
* [put](_types_.storageprovider.md#put)

## Properties

###  type

• **type**: *[Provider](../enums/_types_.provider.md)*

*Defined in [src/types.ts:72](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L72)*

## Methods

###  get

▸ **get**(`address`: Addr, `options?`: GetOpts): *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

*Defined in [src/types.ts:87](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L87)*

Retrieves data from provider's network.

You can distinguish between returned objects using `isDirectory(obj)` or `isFile(obj)` utility functions.

Addresses that point to single files are handled in two ways.
 - if address contains raw data then Buffer is returned
 - if address contains file with metadata (filename) then it is returned as single unit [Directory](../modules/_types_.md#directory)

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | Addr | string hash or CID |
`options?` | GetOpts | options passed to either IPFS's `get()` or Erebos's `download()` functions |

**Returns:** *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

Buffer object if the address was pointing to raw data. [Directory](../modules/_types_.md#directory) otherwise.

___

###  getReadable

▸ **getReadable**(`address`: Addr, `options?`: GetOpts): *Promise‹Readable›*

*Defined in [src/types.ts:96](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L96)*

Retrieves data from provider's network using streaming support.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | Addr | string hash or CID |
`options?` | GetOpts | options passed to either IPFS's `get()` or Erebos's `download()` functions |

**Returns:** *Promise‹Readable›*

`Readable` in object mode that yields [Entry](../modules/_types_.md#entry) objects with `Readable` as `data`. The `data` has to be fully processed before moving to next entry.

___

###  put

▸ **put**(`data`: string | Buffer | Readable, `options?`: PutOpts): *Promise‹Addr›*

*Defined in [src/types.ts:108](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L108)*

Stores data on provider's network

If to the data are given some metadata (filename), then the original data are wrapped in directory
in order to persist these metadata.

**Parameters:**

Name | Type |
------ | ------ |
`data` | string &#124; Buffer &#124; Readable |
`options?` | PutOpts |

**Returns:** *Promise‹Addr›*

Address of the stored data

▸ **put**(`data`: [Directory](../modules/_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer | Readable›, `options?`: PutOpts): *Promise‹Addr›*

*Defined in [src/types.ts:109](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L109)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [Directory](../modules/_types_.md#directory)‹string &#124; Buffer &#124; Readable› &#124; [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer &#124; Readable› |
`options?` | PutOpts |

**Returns:** *Promise‹Addr›*
