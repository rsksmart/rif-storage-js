[rif-storage](../README.md) › ["types"](../modules/_types_.md) › [StorageProvider](_types_.storageprovider.md)

# Interface: StorageProvider <**Addr, GetOpts, PutOpts**>

Generic interface that every provider has to implement.

## Type parameters

▪ **Addr**

▪ **GetOpts**

▪ **PutOpts**

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

*Defined in [src/types.ts:71](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L71)*

## Methods

###  get

▸ **get**(`address`: Addr, `options?`: GetOpts): *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

*Defined in [src/types.ts:82](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L82)*

Retrieves data from provider's network.

You can distinguish between returned objects using `isDirectory(obj)` or `isFile(obj)`.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | Addr | string hash or CID |
`options?` | GetOpts | options passed to either IPFS's `get()` or Erebos's `download()` functions |

**Returns:** *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

`Buffer` if the address was pointing to single file. [Directory](../modules/_types_.md#directory) if the address was pointing to directory

___

###  getReadable

▸ **getReadable**(`address`: Addr, `options?`: GetOpts): *Promise‹Readable›*

*Defined in [src/types.ts:91](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L91)*

Retrieves data from provider's network using streaming support.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`address` | Addr | string hash or CID |
`options?` | GetOpts | options passed to either IPFS's `get()` or Erebos's `download()` functions |

**Returns:** *Promise‹Readable›*

`Readable` in object mode that yields [DirectoryArrayEntry](../modules/_types_.md#directoryarrayentry) objects with `Readable` as `data`. The `data` has to be fully processed before moving to next entry.

___

###  put

▸ **put**(`data`: string | Buffer | Readable, `options?`: PutOpts): *Promise‹Addr›*

*Defined in [src/types.ts:100](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L100)*

Stores data on provider's network

**Parameters:**

Name | Type |
------ | ------ |
`data` | string &#124; Buffer &#124; Readable |
`options?` | PutOpts |

**Returns:** *Promise‹Addr›*

Address of the stored data

▸ **put**(`data`: [Directory](../modules/_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer | Readable›, `options?`: PutOpts): *Promise‹Addr›*

*Defined in [src/types.ts:101](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L101)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [Directory](../modules/_types_.md#directory)‹string &#124; Buffer &#124; Readable› &#124; [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer &#124; Readable› |
`options?` | PutOpts |

**Returns:** *Promise‹Addr›*
