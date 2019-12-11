[rif-storage](../README.md) › ["errors"](../modules/_errors_.md) › [ValueError](_errors_.valueerror.md)

# Class: ValueError

General error for any problems related to passed value that is not related to its type
(for that use built in TypeError)

## Hierarchy

  ↳ [RdsError](_errors_.rdserror.md)

  ↳ **ValueError**

## Index

### Constructors

* [constructor](_errors_.valueerror.md#constructor)

### Properties

* [message](_errors_.valueerror.md#message)
* [name](_errors_.valueerror.md#name)
* [stack](_errors_.valueerror.md#optional-stack)
* [code](_errors_.valueerror.md#static-code)

## Constructors

###  constructor

\+ **new ValueError**(`message`: string): *[ValueError](_errors_.valueerror.md)*

*Overrides [RdsError](_errors_.rdserror.md).[constructor](_errors_.rdserror.md#constructor)*

*Defined in [src/errors.ts:18](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/errors.ts#L18)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |

**Returns:** *[ValueError](_errors_.valueerror.md)*

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

### `Static` code

▪ **code**: *string* = "RDS_VALUE_ERR"

*Overrides [RdsError](_errors_.rdserror.md).[code](_errors_.rdserror.md#static-code)*

*Defined in [src/errors.ts:18](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/errors.ts#L18)*
