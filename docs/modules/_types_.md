[rif-storage](../README.md) › ["types"](_types_.md)

# External module: "types"

## Index

### Enumerations

* [Provider](../enums/_types_.provider.md)

### Interfaces

* [DirectoryEntry](../interfaces/_types_.directoryentry.md)
* [IpfsStorageProvider](../interfaces/_types_.ipfsstorageprovider.md)
* [StorageProvider](../interfaces/_types_.storageprovider.md)
* [SwarmStorageProvider](../interfaces/_types_.swarmstorageprovider.md)

### Type aliases

* [Address](_types_.md#address)
* [AllProviders](_types_.md#allproviders)
* [Directory](_types_.md#directory)
* [DirectoryArray](_types_.md#directoryarray)
* [DirectoryArrayEntry](_types_.md#directoryarrayentry)
* [Options](_types_.md#options)
* [PutInputs](_types_.md#putinputs)

## Type aliases

###  Address

Ƭ **Address**: *string*

*Defined in [src/types.ts:16](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L16)*

___

###  AllProviders

Ƭ **AllProviders**: *[IpfsStorageProvider](../interfaces/_types_.ipfsstorageprovider.md) | [SwarmStorageProvider](../interfaces/_types_.swarmstorageprovider.md) | [Manager](../classes/_manager_.manager.md)*

*Defined in [src/types.ts:114](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L114)*

___

###  Directory

Ƭ **Directory**: *Record‹string, [DirectoryEntry](../interfaces/_types_.directoryentry.md)‹T››*

*Defined in [src/types.ts:46](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L46)*

Object that represents directory structure.
Keys are paths and values are `DirectoryEntry` objects.

___

###  DirectoryArray

Ƭ **DirectoryArray**: *Array‹[DirectoryArrayEntry](_types_.md#directoryarrayentry)‹T››*

*Defined in [src/types.ts:58](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L58)*

Alternative data structure for representing directories. Used mainly together with streaming.

___

###  DirectoryArrayEntry

Ƭ **DirectoryArrayEntry**: *[DirectoryEntry](../interfaces/_types_.directoryentry.md)‹T› & object*

*Defined in [src/types.ts:53](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L53)*

Object representing single file.

**`see`** DirectoryEntry

___

###  Options

Ƭ **Options**: *IpfsClient | ClientOptions | BzzConfig*

*Defined in [src/types.ts:18](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L18)*

___

###  PutInputs

Ƭ **PutInputs**: *string | Buffer | Readable | [Directory](_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](_types_.md#directoryarray)‹Buffer | Readable›*

*Defined in [src/types.ts:60](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/types.ts#L60)*
