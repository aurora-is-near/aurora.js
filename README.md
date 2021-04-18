# Aurora Engine Client for JavaScript

[![Project license](https://img.shields.io/badge/License-Public%20Domain-blue.svg)](https://creativecommons.org/publicdomain/zero/1.0/)
[![Discord](https://img.shields.io/discord/490367152054992913?label=Discord)](https://discord.gg/jNjHYUF8vw)
[![Lints](https://github.com/aurora-is-near/aurora.js/actions/workflows/lints.yml/badge.svg)](https://github.com/aurora-is-near/aurora.js/actions/workflows/lints.yml)

## Prerequisites

- Node.js (v14+)

## Installation

```shell
npm install -D aurora-is-near/aurora.js
```

```json
  "dependencies": {
    "@aurora-is-near/engine": "git://github.com/aurora-is-near/aurora.js",
  }
```

## Usage

```js
import Aurora from '@aurora-is-near/engine';
```

See the [Aurora CLI] source code for example usage.

### Key Management

The library will load the following local keys by default, if found:

- `$HOME/.near-credentials/*/*.json`: credentials stored by the NEAR CLI

- `$HOME/.near/validator_key.json`: the local `nearcore` validator key
  (for the `test.near` master account)

[Aurora CLI]: https://github.com/aurora-is-near/aurora-cli/blob/master/src/aurora.ts
