[rif-storage](../README.md) › ["utils"](_utils_.md)

# External module: "utils"

## Index

### Variables

* [DIRECTORY_SYMBOL](_utils_.md#const-directory_symbol)
* [FILE_SYMBOL](_utils_.md#const-file_symbol)

### Functions

* [isDirectory](_utils_.md#isdirectory)
* [isFile](_utils_.md#isfile)
* [isReadable](_utils_.md#isreadable)
* [isReadableOrBuffer](_utils_.md#isreadableorbuffer)
* [isTSDirectory](_utils_.md#istsdirectory)
* [isTSDirectoryArray](_utils_.md#istsdirectoryarray)
* [markDirectory](_utils_.md#markdirectory)
* [markFile](_utils_.md#markfile)

## Variables

### `Const` DIRECTORY_SYMBOL

• **DIRECTORY_SYMBOL**: *unique symbol* =  Symbol.for('@rds-lib/directory')

*Defined in [src/utils.ts:5](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L5)*

___

### `Const` FILE_SYMBOL

• **FILE_SYMBOL**: *unique symbol* =  Symbol.for('@rds-lib/file')

*Defined in [src/utils.ts:4](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L4)*

## Functions

###  isDirectory

▸ **isDirectory**(`obj`: object): *boolean*

*Defined in [src/utils.ts:62](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L62)*

Verifies if the returned object is a directory

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | object |   |

**Returns:** *boolean*

___

###  isFile

▸ **isFile**(`obj`: object): *boolean*

*Defined in [src/utils.ts:47](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L47)*

Verifies if the returned object is a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | object |   |

**Returns:** *boolean*

___

###  isReadable

▸ **isReadable**(`entry`: unknown): *entry is Readable*

*Defined in [src/utils.ts:97](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L97)*

**Parameters:**

Name | Type |
------ | ------ |
`entry` | unknown |

**Returns:** *entry is Readable*

___

###  isReadableOrBuffer

▸ **isReadableOrBuffer**(`entry`: unknown): *entry is Readable | Buffer*

*Defined in [src/utils.ts:105](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L105)*

**Parameters:**

Name | Type |
------ | ------ |
`entry` | unknown |

**Returns:** *entry is Readable | Buffer*

___

###  isTSDirectory

▸ **isTSDirectory**<**T**>(`data`: object, `genericTest`: function): *data is Directory<T>*

*Defined in [src/utils.ts:72](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L72)*

**Type parameters:**

▪ **T**

**Parameters:**

▪ **data**: *object*

▪ **genericTest**: *function*

▸ (`entry`: T): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`entry` | T |

**Returns:** *data is Directory<T>*

___

###  isTSDirectoryArray

▸ **isTSDirectoryArray**<**T**>(`data`: object, `genericTest`: function): *data is DirectoryArray<T>*

*Defined in [src/utils.ts:84](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L84)*

**Type parameters:**

▪ **T**

**Parameters:**

▪ **data**: *object*

▪ **genericTest**: *function*

▸ (`entry`: T): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`entry` | T |

**Returns:** *data is DirectoryArray<T>*

___

###  markDirectory

▸ **markDirectory**<**T**>(`obj`: T): *T*

*Defined in [src/utils.ts:31](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L31)*

Function that marks an object with Symbol signaling that it is a File object no matter what
sort of implementation it is (Readable|Buffer|async generator etc)

**`see`** isDirectory

**Type parameters:**

▪ **T**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | T |   |

**Returns:** *T*

___

###  markFile

▸ **markFile**<**T**>(`obj`: T): *T*

*Defined in [src/utils.ts:13](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/utils.ts#L13)*

Function that marks an object with Symbol signaling that it is a Directory object.

**`see`** isFile

**Type parameters:**

▪ **T**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | T |   |

**Returns:** *T*
