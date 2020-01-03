[@rsksmart/rif-storage](../README.md) › ["types"](../modules/_types_.md) › [DirectoryEntry](_types_.directoryentry.md)

# Interface: DirectoryEntry <**T**>

Object represents a file and some of its metadata in [Directory](../modules/_types_.md#directory) object.

Used both for data input (eq. as part of [Directory](../modules/_types_.md#directory) for `put()`)
or when retrieving data using `get()` in case the address is not a single file.

## Type parameters

▪ **T**

## Hierarchy

* **DirectoryEntry**

## Index

### Properties

* [data](_types_.directoryentry.md#data)
* [size](_types_.directoryentry.md#optional-size)

## Properties

###  data

• **data**: *T*

*Defined in [src/types.ts:27](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L27)*

___

### `Optional` size

• **size**? : *undefined | number*

*Defined in [src/types.ts:33](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L33)*

Applicable mainly for Swarm provider.
Required when `data` is Readable.
