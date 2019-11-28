# RIF Storage lib.js

[![CircleCI](https://flat.badgen.net/circleci/github/rsksmart/rds-libjs)](https://circleci.com/gh/rsksmart/rds-libjs/)
[![codecov](https://codecov.io/gh/rsksmart/rds-libjs/master/graph/badge.svg)](https://codecov.io/gh/rsksmart/rds-libjs) 
[![Dependency Status](https://david-dm.org/rsksmart/rds-libjs.svg?style=flat-square)](https://david-dm.org/rsksmart/rds-libjs)
[![](https://img.shields.io/badge/made%20by-IOVLabs-blue.svg?style=flat-square)](http://iovlabs.org)
[![](https://img.shields.io/badge/project-RIF%20Storage-blue.svg?style=flat-square)](https://www.rifos.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Managed by tAsEgir](https://img.shields.io/badge/%20managed%20by-tasegir-brightgreen?style=flat-square)](https://github.com/auhau/tasegir)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square)

> Client library integrating distributed storage projects  

## Table of Contents

- [Install](#install)
  - [npm](#npm)
  - [Use in Node.js](#use-in-nodejs)
  - [Use in a browser with browserify, webpack or any other bundler](#use-in-a-browser-with-browserify-webpack-or-any-other-bundler)
  - [Use in a browser Using a script tag](#use-in-a-browser-using-a-script-tag)
- [Usage](#usage)
- [API](#api)
- [CLI](#cli)
- [Contribute](#contribute)
- [License](#license)

## Install

### npm

```sh
> npm install rds-libjs
```

### Use in Node.js

```js
var RifStorage = require('rds-libjs')
```

### Use in a browser with browserify, webpack or any other bundler

```js
var RifStorage = require('rds-libjs')
```

### Use in a browser Using a script tag

Loading this module through a script tag will make the `Storage` obj available in the global namespace.

```html
<script src="https://unpkg.com/rds-libjs/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/rds-libjs/dist/index.js"></script>
```

## Usage

This is a client library, therefore you need to provide access to the provider's running node for specifics see [Providers](#providers).

```javascript
import RifStorage, { Provider } from 'rds-libjs'

// Connects to locally running node
const storage = RifStorage(Provider.IPFS, { host: 'localhost', port: '5001', protocol: 'http' })

const fileHash = storage.put(Buffer.from('hello world!'))
const retrievedData = storage.get(fileHash) // Returns Buffer
console.log(retrievedData.toString()) // prints 'hello world!'

const directory = {
  'file': { data: Buffer.from('nice essay')},
  'other-file': { data: Buffer.from('nice essay')},
  'folder/with-file': { data: Buffer.from('nice essay')},
  'folder/with-other-folder/and-file': { data: Buffer.from('nice essay')}
}
const rootHash = storage.put(directory)
const retrievedDirectory = storage.get(rootHash)
```

## Providers

This library integrates several (decentralized) storage providers, currently supported is:
 
 - [IPFS](https://ipfs.io/) using [js-ipfs-http-client]
 - [Swarm](http://swarm-guide.readthedocs.io/) using [Erebos] library

### IPFS

 > in-browser node ✅ 

```javascript
RifStorage(Provider.IPFS, ipfsOptions)
```

`ipfsOptions` are directly passed to [js-ipfs-http-client], hence check that for syntax and options.

You can run a node directly in browser using [js-ipfs]. Just create instance and pass it instance instead of `ipfsOption`.

### Swarm

 > in-browser node ❌ 

```javascript
RifStorage(Provider.SWARM, swarmOptions)
```

`swarmOptions` are directly passed to [Erebos], hence check that for syntax and options.

## API

TBD

## Contribute

There are some ways you can make this module better:

- Consult our [open issues](https://github.com/rsksmart/rds-libjs/issues) and take on one of them
- Help our tests reach 100% coverage!

## License

[MIT](./LICENSE)

[js-ipfs-http-client]: https://github.com/ipfs/js-ipfs-http-client/
[js-ipfs]: https://github.com/ipfs/js-ipfs
[Erebos]: https://erebos.js.org/docs/api-bzz
