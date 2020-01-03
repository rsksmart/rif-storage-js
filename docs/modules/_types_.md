[@rsksmart/rif-storage](../README.md) › ["types"](_types_.md)

# External module: "types"

## Index

### Enumerations

* [Provider](../enums/_types_.provider.md)

### Interfaces

* [DirectoryEntry](../interfaces/_types_.directoryentry.md)
* [IpfsStorageProvider](../interfaces/_types_.ipfsstorageprovider.md)
* [PutOptions](../interfaces/_types_.putoptions.md)
* [StorageProvider](../interfaces/_types_.storageprovider.md)
* [SwarmStorageProvider](../interfaces/_types_.swarmstorageprovider.md)

### Type aliases

* [Address](_types_.md#address)
* [AllProviders](_types_.md#allproviders)
* [Directory](_types_.md#directory)
* [DirectoryArray](_types_.md#directoryarray)
* [Entry](_types_.md#entry)
* [ProviderOptions](_types_.md#provideroptions)
* [PutInputs](_types_.md#putinputs)

## Type aliases

###  Address

Ƭ **Address**: *string*

*Defined in [src/types.ts:16](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L16)*

___

###  AllProviders

Ƭ **AllProviders**: *[IpfsStorageProvider](../interfaces/_types_.ipfsstorageprovider.md) | [SwarmStorageProvider](../interfaces/_types_.swarmstorageprovider.md) | [Manager](../classes/_manager_.manager.md)*

*Defined in [src/types.ts:122](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L122)*

___

###  Directory

Ƭ **Directory**: *Record‹string, [DirectoryEntry](../interfaces/_types_.directoryentry.md)‹T››*

*Defined in [src/types.ts:40](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L40)*

Object that represents directory structure.
Keys are paths and values are `DirectoryEntry` objects.

___

###  DirectoryArray

Ƭ **DirectoryArray**: *Array‹[Entry](_types_.md#entry)‹T››*

*Defined in [src/types.ts:52](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L52)*

Alternative data structure for representing directories. Used mainly together with streaming.

___

###  Entry

Ƭ **Entry**: *[DirectoryEntry](../interfaces/_types_.directoryentry.md)‹T› & object*

*Defined in [src/types.ts:47](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L47)*

Object representing single file.

**`see`** DirectoryEntry

___

###  ProviderOptions

Ƭ **ProviderOptions**: *IpfsClient | ClientOptions | BzzConfig*

*Defined in [src/types.ts:18](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L18)*

___

###  PutInputs

Ƭ **PutInputs**: *string | Buffer | Readable | [Directory](_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](_types_.md#directoryarray)‹Buffer | Readable›*

*Defined in [src/types.ts:54](https://github.com/rsksmart/rds-libjs/blob/813b1b1/src/types.ts#L54)*
