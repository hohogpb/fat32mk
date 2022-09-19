# fat32mk

[![npm](https://img.shields.io/npm/v/fat32mk)](https://www.npmjs.com/package/fat32mk)
[![downloads](https://img.shields.io/npm/dw/fat32mk)](https://www.npmjs.com/package/fat32mk)

fat32 image maker written in js

## usage

```sh
npm i fat32mk
```

```javascript
const FAT32MK = require("fat32_mk");
FAT32MK({ hdPath: 'c.img', sizeMB: 20 });
```

or your can add global and use "fat32mk" cmd

```sh
npm install fat32mk -g
```

```sh
cmd> fat32_mk c.img -m 20
```
