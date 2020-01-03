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

* [contentType](_types_.directoryentry.md#optional-contenttype)
* [data](_types_.directoryentry.md#data)
* [size](_types_.directoryentry.md#optional-size)

## Properties

### `Optional` contentType

• **contentType**? : *undefined | string*

*Defined in [src/types.ts:33](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/types.ts#L33)*

Applicable only for Swarm provider.
When left undefined than the data are stored as `raw`.

___

###  data

• **data**: *T*

*Defined in [src/types.ts:27](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/types.ts#L27)*

___

### `Optional` size

• **size**? : *undefined | number*

*Defined in [src/types.ts:39](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/types.ts#L39)*

Applicable mainly for Swarm provider.
Required when `data` is Readable.
