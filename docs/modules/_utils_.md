[@rsksmart/rif-storage](../README.md) › ["utils"](_utils_.md)

# External module: "utils"

## Index

### Variables

* [DIRECTORY_SYMBOL](_utils_.md#const-directory_symbol)
* [FILE_SYMBOL](_utils_.md#const-file_symbol)

### Functions

* [detectAddress](_utils_.md#detectaddress)
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

*Defined in [src/utils.ts:6](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L6)*

___

### `Const` FILE_SYMBOL

• **FILE_SYMBOL**: *unique symbol* =  Symbol.for('@rds-lib/file')

*Defined in [src/utils.ts:5](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L5)*

## Functions

###  detectAddress

▸ **detectAddress**(`address`: string): *[Provider](../enums/_types_.provider.md) | false*

*Defined in [src/utils.ts:110](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L110)*

**Parameters:**

Name | Type |
------ | ------ |
`address` | string |

**Returns:** *[Provider](../enums/_types_.provider.md) | false*

___

###  isDirectory

▸ **isDirectory**(`obj`: object): *obj is Directory<any>*

*Defined in [src/utils.ts:63](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L63)*

Verifies if the returned object is a directory

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | object |   |

**Returns:** *obj is Directory<any>*

___

###  isFile

▸ **isFile**(`obj`: object): *obj is Entry<any>*

*Defined in [src/utils.ts:48](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L48)*

Verifies if the returned object is a file

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | object |   |

**Returns:** *obj is Entry<any>*

___

###  isReadable

▸ **isReadable**(`entry`: unknown): *entry is Readable*

*Defined in [src/utils.ts:98](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L98)*

**Parameters:**

Name | Type |
------ | ------ |
`entry` | unknown |

**Returns:** *entry is Readable*

___

###  isReadableOrBuffer

▸ **isReadableOrBuffer**(`entry`: unknown): *entry is Readable | Buffer*

*Defined in [src/utils.ts:106](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L106)*

**Parameters:**

Name | Type |
------ | ------ |
`entry` | unknown |

**Returns:** *entry is Readable | Buffer*

___

###  isTSDirectory

▸ **isTSDirectory**<**T**>(`data`: object, `genericTest`: function): *data is Directory<T>*

*Defined in [src/utils.ts:73](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L73)*

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

*Defined in [src/utils.ts:85](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L85)*

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

*Defined in [src/utils.ts:32](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L32)*

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

*Defined in [src/utils.ts:14](https://github.com/rsksmart/rds-libjs/blob/b42e838/src/utils.ts#L14)*

Function that marks an object with Symbol signaling that it is a Directory object.

**`see`** isFile

**Type parameters:**

▪ **T**: *object*

**Parameters:**

Name | Type | Description |
------ | ------ | ------ |
`obj` | T |   |

**Returns:** *T*
