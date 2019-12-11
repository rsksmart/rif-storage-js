[rif-storage](../README.md) › ["errors"](../modules/_errors_.md) › [RdsError](_errors_.rdserror.md)

# Class: RdsError

Base error for all RDS errors

## Hierarchy

* Error

  ↳ **RdsError**

  ↳ [ValueError](_errors_.valueerror.md)

  ↳ [ProviderError](_errors_.providererror.md)

## Index

### Constructors

* [constructor](_errors_.rdserror.md#constructor)

### Properties

* [message](_errors_.rdserror.md#message)
* [name](_errors_.rdserror.md#name)
* [stack](_errors_.rdserror.md#optional-stack)
* [Error](_errors_.rdserror.md#static-error)
* [code](_errors_.rdserror.md#static-code)

## Constructors

###  constructor

\+ **new RdsError**(`message`: string): *[RdsError](_errors_.rdserror.md)*

*Defined in [src/errors.ts:5](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/errors.ts#L5)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |

**Returns:** *[RdsError](_errors_.rdserror.md)*

## Properties

###  message

• **message**: *string*

*Inherited from void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:974

___

###  name

• **name**: *string*

*Inherited from void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:973

___

### `Optional` stack

• **stack**? : *undefined | string*

*Inherited from void*

*Overrides void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:975

___

### `Static` Error

▪ **Error**: *ErrorConstructor*

Defined in node_modules/typescript/lib/lib.es5.d.ts:984

___

### `Static` code

▪ **code**: *string* = "RDS_ERR"

*Defined in [src/errors.ts:5](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/errors.ts#L5)*
