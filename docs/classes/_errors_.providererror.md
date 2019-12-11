[rif-storage](../README.md) › ["errors"](../modules/_errors_.md) › [ProviderError](_errors_.providererror.md)

# Class: ProviderError

Error related to Manager and its Providers

## Hierarchy

  ↳ [RdsError](_errors_.rdserror.md)

  ↳ **ProviderError**

## Index

### Constructors

* [constructor](_errors_.providererror.md#constructor)

### Properties

* [message](_errors_.providererror.md#message)
* [name](_errors_.providererror.md#name)
* [stack](_errors_.providererror.md#optional-stack)
* [code](_errors_.providererror.md#static-code)

## Constructors

###  constructor

\+ **new ProviderError**(`message`: string): *[ProviderError](_errors_.providererror.md)*

*Overrides [RdsError](_errors_.rdserror.md).[constructor](_errors_.rdserror.md#constructor)*

*Defined in [src/errors.ts:30](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/errors.ts#L30)*

**Parameters:**

Name | Type |
------ | ------ |
`message` | string |

**Returns:** *[ProviderError](_errors_.providererror.md)*

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

▪ **code**: *string* = "RDS_PROVIDER_ERR"

*Overrides [RdsError](_errors_.rdserror.md).[code](_errors_.rdserror.md#static-code)*

*Defined in [src/errors.ts:30](https://github.com/rsksmart/rds-libjs/blob/1cdc7dd/src/errors.ts#L30)*
