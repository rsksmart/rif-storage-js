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

### Type aliases

* [Address](_types_.md#address)
* [AllProviders](_types_.md#allproviders)
* [Directory](_types_.md#directory)
* [DirectoryArray](_types_.md#directoryarray)
* [Entry](_types_.md#entry)
* [ProviderOptions](_types_.md#provideroptions)
* [PutInputs](_types_.md#putinputs)
* [SwarmStorageProvider](_types_.md#swarmstorageprovider)

## Type aliases

###  Address

Ƭ **Address**: *string*

*Defined in [src/types.ts:15](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L15)*

___

###  AllProviders

Ƭ **AllProviders**: *[IpfsStorageProvider](../interfaces/_types_.ipfsstorageprovider.md) | [SwarmStorageProvider](_types_.md#swarmstorageprovider) | [Manager](../classes/_manager_.manager.md)*

*Defined in [src/types.ts:125](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L125)*

___

###  Directory

Ƭ **Directory**: *Record‹string, [DirectoryEntry](../interfaces/_types_.directoryentry.md)‹T››*

*Defined in [src/types.ts:45](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L45)*

Object that represents directory structure.
Keys are paths and values are `DirectoryEntry` objects.

___

###  DirectoryArray

Ƭ **DirectoryArray**: *Array‹[Entry](_types_.md#entry)‹T››*

*Defined in [src/types.ts:57](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L57)*

Alternative data structure for representing directories. Used mainly together with streaming.

___

###  Entry

Ƭ **Entry**: *[DirectoryEntry](../interfaces/_types_.directoryentry.md)‹T› & object*

*Defined in [src/types.ts:52](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L52)*

Object representing single file.

**`see`** DirectoryEntry

___

###  ProviderOptions

Ƭ **ProviderOptions**: *IpfsClient | ClientOptions | [BzzConfig](../interfaces/_swarm_mini_types_.bzzconfig.md)*

*Defined in [src/types.ts:17](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L17)*

___

###  PutInputs

Ƭ **PutInputs**: *string | Buffer | Readable | [Directory](_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](_types_.md#directoryarray)‹Buffer | Readable›*

*Defined in [src/types.ts:59](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L59)*

___

###  SwarmStorageProvider

Ƭ **SwarmStorageProvider**: *[StorageProvider](../interfaces/_types_.storageprovider.md)‹[Address](_types_.md#address), [DownloadOptions](_swarm_mini_types_.md#downloadoptions), [UploadOptions](../interfaces/_swarm_mini_types_.uploadoptions.md)›*

*Defined in [src/types.ts:123](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/types.ts#L123)*
