const fs = require("fs");
const FAT32BPB = require("./fat32_bpb");
const FAT32Table = require("./fat32_table");

const B = 1;
const KB = 1024 * B;
const MB = 1024 * KB;
const bytesPerSec = 512 * B;

function downAlign(n, align) {
  return (n - align - 1) & ~(align - 1);
}

function FAT32_MK({
  hdPath,
  sizeMB = 10,
  secPerClus = 1,
  rsvdSecCnt = 34,
  numFATs = 2,
}) {
  const hdSizeBytes = sizeMB * MB;

  const totalSecs = Math.floor(hdSizeBytes / bytesPerSec);
  const rsvdSize = rsvdSecCnt * bytesPerSec;
  const clusSize = secPerClus * bytesPerSec;

  const clusCnt = Math.floor((hdSizeBytes - rsvdSize) / (clusSize + 2 * 4));

  const FATSize = downAlign(clusCnt * 4, bytesPerSec);
  const FATSecs = FATSize / bytesPerSec;

  // alloc hd buf
  const hdBuf = Buffer.alloc(hdSizeBytes);

  // write bpb info
  const bpb = FAT32BPB.from(hdBuf);
  bpb.BS_jmpBoot = [0xeb, 0x58, 0x90];
  bpb.BS_OEMName = "GPOS_0.01";
  bpb.BPB_BytsPerSec = 512;
  bpb.BPB_SecPerClus = secPerClus;
  bpb.BPB_RsvdSecCnt = rsvdSecCnt;
  bpb.BPB_NumFATs = numFATs;
  bpb.BPB_RootEntCnt = 0;
  bpb.BPB_TotSec16 = 0;
  bpb.BPB_Media = 0xf8;
  bpb.BPB_FATSz16 = 0;
  bpb.BPB_SecPerTrk = 0;
  bpb.BPB_NumHeads = 0;
  bpb.BPB_HiddSec = 0;
  bpb.BPB_TotSec32 = totalSecs;
  bpb.BPB_FATSz32 = FATSecs;
  bpb.BPB_ExtFlags = 0;
  bpb.BPB_FSVer = 0;
  bpb.BPB_RootClus = 2;
  bpb.BPB_FSInfo = 1;
  bpb.BPB_BkBootSec = 6;
  // bpb.BPB_Reserved
  bpb.BS_DrvNum = 0x80;
  bpb.BS_Reserved1 = 0;
  bpb.BS_BootSig = 0x29;
  bpb.BS_VolID = 0;
  bpb.BS_VolLab = "GPOS_0.01  ";
  bpb.BS_FileSysType = "FAT32   ";

  // write mbr magic
  hdBuf.writeUInt8(0x55, 510);
  hdBuf.writeUInt8(0xaa, 511);

  // write init fat
  const offsetFAT1 = rsvdSecCnt * bytesPerSec;
  const offsetFAT2 = offsetFAT1 + FATSize;

  const fat1Buff = hdBuf.subarray(offsetFAT1, offsetFAT1 + FATSize);
  const fat2Buff = hdBuf.subarray(offsetFAT2, offsetFAT2 + FATSize);

  const fat1 = FAT32Table.from(fat1Buff);
  fat1.setEntry(0, 0x0ffffff8);
  fat1.setEntry(1, 0x0fffffff);
  fat1.setEntry(2, 0x0fffffff);

  const fat2 = FAT32Table.from(fat2Buff);
  fat2.setEntry(0, 0x0ffffff8);
  fat2.setEntry(1, 0x0fffffff);
  fat2.setEntry(2, 0x0fffffff);

  // write file
  console.log(`write ${hdPath} ${sizeMB}MB`);

  const fd = fs.openSync(hdPath, "w");
  fs.writeSync(fd, hdBuf);
  fs.closeSync(fd);
}

module.exports = FAT32_MK;
