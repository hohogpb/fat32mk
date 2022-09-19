class FAT32Table {
  constructor(buf) {
    this.buf = buf;
  }

  static from(buf) {
    return new FAT32Table(buf);
  }

  getEntry(i) {
    const offset = i * 4;
    return this.buf.readUInt32LE(offset);
  }

  setEntry(i, clus) {
    const offset = i * 4;
    return this.buf.writeUInt32LE(clus, offset);
  }
}

module.exports = FAT32Table;
