#! /usr/bin/env node

const { program } = require("commander");
const FAT32MK = require("./fat32_mk");

program
  .name("fat32mk")
  .description("FAT32 image maker")
  .version("1.0.0")
  .argument("<imgpath>", "dest image location")
  .option("-m, --mb <number>", "image size in mb", 10)
  .parse();

const options = program.opts();
const args = program.args;

FAT32MK({ hdPath: args[0], sizeMB: options.mb });
