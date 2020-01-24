# RIF Storage.js

[![CircleCI](https://flat.badgen.net/circleci/github/rsksmart/rif-storage-js/master)](https://circleci.com/gh/rsksmart/rif-storage-js/)
[![Dependency Status](https://david-dm.org/rsksmart/rif-storage-js.svg?style=flat-square)](https://david-dm.org/rsksmart/rif-storage-js)
[![](https://img.shields.io/badge/made%20by-IOVLabs-blue.svg?style=flat-square)](http://iovlabs.org)
[![](https://img.shields.io/badge/project-RIF%20Storage-blue.svg?style=flat-square)](https://www.rifos.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Managed by tAsEgir](https://img.shields.io/badge/%20managed%20by-tasegir-brightgreen?style=flat-square)](https://github.com/auhau/tasegir)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/runs%20in-browser%20%7C%20node%20%7C%20webworker%20%7C%20electron-orange)

> Client library integrating distributed storage projects  

**Warning: This project is in alpha state. There might (and most probably will) be changes in the future to its API and working. Also, no guarantees can be made about its stability, efficiency, and security at this stage.**

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
  - [Manager](#manager)
- [Providers](#providers)
  - [IPFS](#ipfs)
  - [Swarm](#swarm)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm install @rsksmart/rif-storage
```

### Use in Node.js

```js
var RifStorage = require('@rsksmart/rif-storage')
```

### Use in a browser with browserify, webpack or any other bundler

```js
var RifStorage = require('@rsksmart/rif-storage')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `RifStorage` obj available in the global namespace.

```html
<script src="https://unpkg.com/@rsksmart/rif-storage/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/@rsksmart/rif-storage/dist/index.js"></script>
```

## Usage

This is a client library, therefore you need to provide access to the provider's running node for specifics see [Providers](#providers).

```javascript
import RifStorage, { Provider } from '@rsksmart/rif-storage'

// Connects to locally running node
const storage = RifStorage(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })

const fileHash = await storage.put(Buffer.from('hello world!'))
const retrievedData = await storage.get(fileHash) // Returns Buffer
console.log(retrievedData.toString()) // prints 'hello world!'

const directory = {
  'file': { data: Buffer.from('nice essay')},
  'other-file': { data: Buffer.from('nice essay')},
  'folder/with-file': { data: Buffer.from('nice essay')},
  'folder/with-other-folder/and-file': { data: Buffer.from('nice essay')}
}
const rootHash = await storage.put(directory)
const retrievedDirectory = await storage.get(rootHash)
```

### Manager

This tool ships with utility class `Manager` that supports easy usage of multiple providers in your applications.
It allows registration of all supported providers and then easy putting/getting data with
the same interface as providers.

It has concept of active provider which is the one to which the data are `put()`.
When registering providers the first one will become the active one by default.
 
```javascript
import { Manager, Provider } from '@rsksmart/rif-storage'

const storage = new Manager()

// The first added provider becomes also the active one
storage.addProvider(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })
storage.addProvider(Provider.SWARM, { url: 'http://localhost:8500' })

const ipfsHash = await storage.put(Buffer.from('hello ipfs!')) // Stored to IPFS

storage.makeActive(Provider.SWARM)
const swarmHash = await storage.put(Buffer.from('hello swarm!')) // Stored to Swarm

console.log(storage.get(ipfsHash)) // Retrieves data from IPFS and prints 'hello ipfs!'
console.log(storage.get(swarmHash)) // Retrieves data from Swarm and prints 'hello swarm!'
```

[See Manager's API documentation](./docs/classes/_manager_.manager.md)

## Providers

This library integrates several (decentralized) storage providers, currently supported is:
 
 - [IPFS](https://ipfs.io/) using [js-ipfs-http-client]
 - [Swarm](http://swarm-guide.readthedocs.io/)

### IPFS

 > in-browser node ✅ <br>
 > content-type support ❌ 

```javascript
RifStorage(Provider.IPFS, ipfsOptions)
```

`ipfsOptions` are directly passed to [js-ipfs-http-client], hence check that for syntax and options.

You can run a node directly in browser using [js-ipfs]. Just create instance and pass it instance instead of `ipfsOption`.

When data are putted to IPFS they are automatically pinned on the node and CIDv1 is returned. 

You can access the [js-ipfs-http-client] instance using `.ipfs` property of the `StorageProvider` object.

### Swarm

 > in-browser node ❌ <br>
 > content-type support ✅ 

```javascript
RifStorage(Provider.SWARM, bzzOptions)
```

`bzzOptions` can be:
 * `url?: string`: URL of the running Swarm node. If not specified than requests will be aimed to from which URL the script of served (in browser). Or it fails (in NodeJs).
 * `timeout?: number | false`: number which specifies timeout period. Default value is `10000` (ms). If `false` then no timeout. 

## API

Bellow is summary of the main APIs. [See full API documentation here](./docs/README.md)

### `factory(type: Provider, options: object) -> IpfsStorageProvider | SwarmStorageProvider` 

> exposed as default export of the library

```javascript
import RifStorage, {Provider} from '@rsksmart/rif-storage'
const provider = RifStorage(Provider.IPFS, options)
```

### [`Provider`] enum

> IPFS | SWARM | MANAGER

Enum of supported providers.

```javascript
import {Provider} from '@rsksmart/rif-storage'
Provider.IPFS
```

### [`Directory`] interface

Directory represents directory structure where keys are paths and values is `DirectoryEntry` object. For example like:

```javascript
const directory = {
  'some/directory/with/file': {
    data: 'some string to store',
    contentType: 'text/plain',
    size: 20
  }
}
```

#### `DirectoryEntry` interface

Object represents a file and some of its metadata in [`Directory`] object.
Used both for data input (eq. as part of [`Directory`] for `put()`) or when retrieving data using `get()` in case the address is not a single file.

 * `data` can be `string`, `Buffer`, `Readable`
 * `size?: number` can be left out except when `data` is `Readable`. Only applicable for Swarm.
 * `contentType?: string` is applicable only for Swarm provider.

### [`DirectoryArray`] 

Alternative data structure for representing directories. Used mainly together with streaming. 
It is an array containing `Entry` objects that is `DirectoryEntry & { path: string }`

Example:

```javascript
const directory = [
  {
    path: 'file',
    data: 'some string to store',
  },
  {
    path: 'folder/and/file',
    data: 'some string to store',
  }
]
```

### [`StorageProvider`] interface

Interface implemented by IPFS and Swarm providers. Returned by [`factory()`](#factorytype-provider-options-object---ipfsstorageprovider--swarmstorageproviderdocsmodules_index_md).

#### [`StorageProvider.put(data, options) -> Promise<string>`](./docs/interfaces/_types_.storageprovider.md#put)

Parameters:
 * `data` - one of the following: 
    * `string`, `Buffer`, `Readable` that represents single file
    * [`Directory<string | Buffer | Readable>`](#directory-interface) | [`DirectoryArray<Buffer | Readable>`](#directoryarray)
 * `options` - options passed to either IPFS's `add()` or Swarms `upload()` functions, they share:
    * `fileName?: string` - applicable only for single files, see [note](#filenames) before
 
##### Filenames

When you are adding single-file or buffer/string/readable you can specify file-name under which it should be stored, using
the `options`. When you do that the original data are wrapped in folder in order to persist this information. Therefore
when you `.get()` this address then the result will be [`Directory`](#directory-interface) of one file.

#### [`StorageProvider.get(address, options) -> Promise<Directory<Buffer> | Buffer>`](./docs/interfaces/_types_.storageprovider.md#get)

Retrieves data from provider's network.

Parameters:
 * `address` - string hash or CID
 * `options` - options passed to either IPFS's `get()` or Swarm.
 
Returns:
 * `Buffer` if the address was pointing to single raw file
 * `Directory` if the address was pointing to directory or single file with metadata
 
You can distinguish between these two using `isDirectory(obj)` or `isFile(obj)`.

```javascript
import {isFile, isDirectory} from '@rsksmart/rif-storage'

const data = await provider.get('some directory hash')

console.log(isFile(data)) // false
console.log(isDirectory(data)) // true
```
 
#### [`StorageProvider.getReadable(address, options) -> Promise<Readable<DirectoryArray>>`](./docs/interfaces/_types_.storageprovider.md#getReadable)

Retrieves data from provider's network using streaming support.

Parameters:
 * `address` - string hash or CID
 * `options` - options passed to either IPFS's `getReadable()` or Swarm.
 
Returns `Readable` in object mode that yields [`Entry`] objects with `Readable` as `data`.
The `data` has to be fully processed before moving to next entry.
 
## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/rsksmart/rif-storage-js/issues) and take on one of them
- Help our tests reach 100% coverage!

## License

[MIT](./LICENSE)

[js-ipfs-http-client]: https://github.com/ipfs/js-ipfs-http-client/
[js-ipfs]: https://github.com/ipfs/js-ipfs
[`Provider`]: ./docs/enums/_types_.provider.md
[`StorageProvider`]: ./docs/interfaces/_types_.storageprovider.md
[`Directory`]: ./docs/modules/_types_.md#Directory
[`DirectoryArray`]: ./docs/modules/_types_.md#DirectoryArray
[`Entry`]: ./docs/modules/_types_.md#Entry
