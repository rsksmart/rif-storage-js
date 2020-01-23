[@rsksmart/rif-storage](../README.md) › ["swarm-mini/index"](../modules/_swarm_mini_index_.md) › [Bzz](_swarm_mini_index_.bzz.md)

# Class: Bzz

Small simple client library for Bzz part of Swarm project.
It communicate using HTTP API.

## Hierarchy

* **Bzz**

## Index

### Constructors

* [constructor](_swarm_mini_index_.bzz.md#constructor)

### Methods

* [get](_swarm_mini_index_.bzz.md#get)
* [getReadable](_swarm_mini_index_.bzz.md#getreadable)
* [put](_swarm_mini_index_.bzz.md#put)

## Constructors

###  constructor

\+ **new Bzz**(`config`: [BzzConfig](../interfaces/_swarm_mini_types_.bzzconfig.md)): *[Bzz](_swarm_mini_index_.bzz.md)*

*Defined in [src/swarm-mini/index.ts:103](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/swarm-mini/index.ts#L103)*

**Parameters:**

Name | Type |
------ | ------ |
`config` | [BzzConfig](../interfaces/_swarm_mini_types_.bzzconfig.md) |

**Returns:** *[Bzz](_swarm_mini_index_.bzz.md)*

## Methods

###  get

▸ **get**(`hash`: string, `options`: [DownloadOptions](../modules/_swarm_mini_index_.md#downloadoptions)): *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

*Defined in [src/swarm-mini/index.ts:195](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/swarm-mini/index.ts#L195)*

Method for fetching file/directory from Swarm.

Buffer is returned when it is single raw hash. You can use isFile() utility function to verify if file was returned.
Directory object is returned when it is manifest hash. You can use isDirectory() utility function to verify that it is directory.

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`hash` | string | - | - |
`options` | [DownloadOptions](../modules/_swarm_mini_index_.md#downloadoptions) | {} |   |

**Returns:** *Promise‹[Directory](../modules/_types_.md#directory)‹Buffer› | Buffer›*

___

###  getReadable

▸ **getReadable**(`hash`: string, `options`: [DownloadOptions](../modules/_swarm_mini_index_.md#downloadoptions)): *Promise‹Readable›*

*Defined in [src/swarm-mini/index.ts:307](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/swarm-mini/index.ts#L307)*

Fetch data from Swarm and return Readable in object mode that yield
objects in format {data: <Readable>, path: 'string', size: number | undefined}

**Parameters:**

Name | Type | Default | Description |
------ | ------ | ------ | ------ |
`hash` | string | - | - |
`options` | [DownloadOptions](../modules/_swarm_mini_index_.md#downloadoptions) | {} |   |

**Returns:** *Promise‹Readable›*

___

###  put

▸ **put**(`data`: string | Buffer | Readable, `options?`: [UploadOptions](../modules/_swarm_mini_index_.md#uploadoptions)): *Promise‹string›*

*Defined in [src/swarm-mini/index.ts:350](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/swarm-mini/index.ts#L350)*

Add data to Swarm

If to the data are given some metadata (filename), then the original data are wrapped in directory
in order to persist these metadata.

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`data` | string &#124; Buffer &#124; Readable | - |
`options?` | [UploadOptions](../modules/_swarm_mini_index_.md#uploadoptions) |   |

**Returns:** *Promise‹string›*

▸ **put**(`data`: [Directory](../modules/_types_.md#directory)‹string | Buffer | Readable› | [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer | Readable›, `options?`: [UploadOptions](../modules/_swarm_mini_index_.md#uploadoptions)): *Promise‹string›*

*Defined in [src/swarm-mini/index.ts:351](https://github.com/rsksmart/rds-libjs/blob/5474bd0/src/swarm-mini/index.ts#L351)*

**Parameters:**

Name | Type |
------ | ------ |
`data` | [Directory](../modules/_types_.md#directory)‹string &#124; Buffer &#124; Readable› &#124; [DirectoryArray](../modules/_types_.md#directoryarray)‹Buffer &#124; Readable› |
`options?` | [UploadOptions](../modules/_swarm_mini_index_.md#uploadoptions) |

**Returns:** *Promise‹string›*
