/**
 * @refrence Microsoft Extensible Firmware Initiative
 *              FAT32 File System Specification
 *
 * FAT32 BIOS Parameter Block
 *
 * BS_jmpBoot      ; offset: 0  size: 3
 * BS_OEMName      ; offset: 3  size: 8
 * BPB_BytsPerSec  ; offset: 11 size: 2
 * BPB_SecPerClus  ; offset: 13 size: 1
 * BPB_RsvdSecCnt  ; offset: 14 size: 2
 * BPB_NumFATs     ; offset: 16 size: 1
 * BPB_RootEntCnt  ; offset: 17 size: 2
 * BPB_TotSec16    ; offset: 19 size: 2
 * BPB_Media       ; offset: 21 size: 1
 * BPB_FATSz16     ; offset: 22 size: 2
 * BPB_SecPerTrk   ; offset: 24 size: 2
 * BPB_NumHeads    ; offset: 26 size: 2
 * BPB_HiddSec     ; offset: 28 size: 4
 * BPB_TotSec32    ; offset: 32 size: 4
 * BPB_FATSz32     ; offset: 36 size: 4
 * BPB_ExtFlags    ; offset: 40 size: 2
 * BPB_FSVer       ; offset: 42 size: 2
 * BPB_RootClus    ; offset: 44 size: 4
 * BPB_FSInfo      ; offset: 48 size: 2
 * BPB_BkBootSec   ; offset: 50 size: 2
 * BPB_Reserved    ; offset: 52 size: 12
 * BS_DrvNum       ; offset: 64 size: 1
 * BS_Reserved1    ; offset: 65 size: 1
 * BS_BootSig      ; offset: 66 size: 1
 * BS_VolID        ; offset: 67 size: 4
 * BS_VolLab       ; offset: 71 size: 11
 * BS_FilSysType   ; offset: 82 size: 8
 *
 */
class FAT32BPB {
  buf = Buffer.alloc(90);

  constructor(buf) {
    this.buf = buf;
  }

  static from(buf) {
    return new FAT32BPB(buf);
  }

  /**
   * offset: 0 size: 3
   *
   * Jump instruction to boot code. This field has two allowed forms:
   * jmpBoot[0] = 0xEB, jmpBoot[1] = 0x??, jmpBoot[2] = 0x90
   * and
   * jmpBoot[0] = 0xE9, jmpBoot[1] = 0x??, jmpBoot[2] = 0x??
   * 0x?? indicates that any 8-bit value is allowed in that byte. What this
   * forms is a three-byte Intel x86 unconditional branch (jump)
   * instruction that jumps to the start of the operating system bootstrap
   * code. This code typically occupies the rest of sector 0 of the volume
   * following the BPB and possibly other sectors. Either of these forms
   * is acceptable. JmpBoot[0] = 0xEB is the more frequently used
   * format
   */
  get BS_jmpBoot() {
    return this.buf.subarray(0, 3);
  }
  set BS_jmpBoot(v) {
    for (let i = 0; i < 3; i++) {
      this.buf.writeUInt8(v[i], i);
    }
  }

  /**
   * offset: 3 size: 8
   *
   * “MSWIN4.1” There are many misconceptions about this field. It is
   * only a name string. Microsoft operating systems don’t pay any
   * attention to this field. Some FAT drivers do. This is the reason that
   * the indicated string, “MSWIN4.1”, is the recommended setting,
   * because it is the setting least likely to cause compatibility problems.
   * If you want to put something else in here, that is your option, but
   * the result may be that some FAT drivers might not recognize the
   * volume. Typically this is some indication of what system formatted
   * the volume.
   */
  get BS_OEMName() {
    return this.buf.subarray(3, 3 + 8).toString();
  }
  set BS_OEMName(v) {
    for (let i = 0; i < 8; i++) {
      const ch = (v[i] || " ").charCodeAt(0);
      this.buf.writeUInt8(ch, i + 3);
    }
  }

  /**
   * offset: 11 size: 2
   *
   * Count of bytes per sector. This value may take on only the
   * following values: 512, 1024, 2048 or 4096. If maximum
   * compatibility with old implementations is desired, only the value
   * 512 should be used. There is a lot of FAT code in the world that is
   * basically “hard wired” to 512 bytes per sector and doesn’t bother to
   * check this field to make sure it is 512. Microsoft operating systems
   * will properly support 1024, 2048, and 4096.
   * Note: Do not misinterpret these statements about maximum
   * compatibility. If the media being recorded has a physical sector size
   * N, you must use N and this must still be less than or equal to 4096.
   * Maximum compatibility is achieved by only using media with
   * specific sector sizes.
   */
  get BPB_BytsPerSec() {
    return this.buf.readUInt16LE(11);
  }
  set BPB_BytsPerSec(v) {
    this.buf.writeUInt16LE(v, 11);
  }

  /**
   * offset: 13 size: 1
   *
   * Number of sectors per allocation unit. This value must be a power
   * of 2 that is greater than 0. The legal values are 1, 2, 4, 8, 16, 32, 64,
   * and 128. Note however, that a value should never be used that
   * results in a “bytes per cluster” value (BPB_BytsPerSec *
   * BPB_SecPerClus) greater than 32K (32 * 1024). There is a
   * misconception that values greater than this are OK. Values that
   * cause a cluster size greater than 32K bytes do not work properly; do
   * not try to define one. Some versions of some systems allow 64K
   * bytes per cluster value. Many application setup programs will not
   * work correctly on such a FAT volume.
   */
  get BPB_SecPerClus() {
    return this.buf.readUInt8(13);
  }
  set BPB_SecPerClus(v) {
    this.buf.writeUInt8(v, 13);
  }

  /**
   * offset: 14 size: 2
   *
   * Number of reserved sectors in the Reserved region of the volume
   * starting at the first sector of the volume. This field must not be 0.
   * For FAT12 and FAT16 volumes, this value should never be
   * anything other than 1. For FAT32 volumes, this value is typically
   * 32. There is a lot of FAT code in the world “hard wired” to 1
   * reserved sector for FAT12 and FAT16 volumes and that doesn’t
   * bother to check this field to make sure it is 1. Microsoft operating
   * systems will properly support any non-zero value in this field.
   */
  get BPB_RsvdSecCnt() {
    return this.buf.readUInt16LE(14);
  }
  set BPB_RsvdSecCnt(v) {
    this.buf.writeUInt16LE(v, 14);
  }

  /**
   * offset: 16 size: 1
   *
   * The count of FAT data structures on the volume. This field should
   * always contain the value 2 for any FAT volume of any type.
   * Although any value greater than or equal to 1 is perfectly valid,
   * many software programs and a few operating systems’ FAT file
   * system drivers may not function properly if the value is something
   * other than 2. All Microsoft file system drivers will support a value
   * other than 2, but it is still highly recommended that no value other
   * than 2 be used in this field.
   * The reason the standard value for this field is 2 is to provide redundancy
   * for the FAT data structure so that if a sector goes bad in one
   * of the FATs, that data is not lost because it is duplicated in the other
   * FAT. On non-disk-based media, such as FLASH memory cards,
   * where such redundancy is a useless feature, a value of 1 may be
   * used to save the space that a second copy of the FAT uses, but
   * some FAT file system drivers might not recognize such a volume
   * properly.
   */
  get BPB_NumFATs() {
    return this.buf.readUInt8(16);
  }
  set BPB_NumFATs(v) {
    this.buf.writeUInt8(v, 16);
  }

  /**
   * offset: 17 size: 2
   *
   * For FAT12 and FAT16 volumes, this field contains the count of 32-
   * byte directory entries in the root directory. For FAT32 volumes,
   * this field must be set to 0. For FAT12 and FAT16 volumes, this
   * value should always specify a count that when multiplied by 32
   * results in an even multiple of BPB_BytsPerSec. For maximum
   * compatibility, FAT16 volumes should use the value 512.
   */
  get BPB_RootEntCnt() {
    return this.buf.readUInt16LE(17);
  }
  set BPB_RootEntCnt(v) {
    this.buf.writeUInt16LE(v, 17);
  }

  /**
   * offset: 19 size: 2
   *
   * This field is the old 16-bit total count of sectors on the volume.
   * This count includes the count of all sectors in all four regions of the
   * volume. This field can be 0; if it is 0, then BPB_TotSec32 must be
   * non-zero. For FAT32 volumes, this field must be 0. For FAT12 and
   * FAT16 volumes, this field contains the sector count, and
   * BPB_TotSec32 is 0 if the total sector count “fits” (is less than
   * 0x10000).
   */
  get BPB_TotSec16() {
    return this.buf.readUInt16LE(19);
  }
  set BPB_TotSec16(v) {
    this.buf.writeUInt16LE(v, 19);
  }

  /**
   * offset: 21 size: 1
   *
   * 0xF8 is the standard value for “fixed” (non-removable) media. For
   * removable media, 0xF0 is frequently used. The legal values for this
   * field are 0xF0, 0xF8, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, and
   * 0xFF. The only other important point is that whatever value is put
   * in here must also be put in the low byte of the FAT[0] entry. This
   * dates back to the old MS-DOS 1.x media determination noted
   * earlier and is no longer usually used for anything.
   */
  get BPB_Media() {
    return this.buf.readUInt8(21);
  }
  set BPB_Media(v) {
    this.buf.writeUInt8(v, 21);
  }

  /**
   * offset: 22 size: 2
   *
   * This field is the FAT12/FAT16 16-bit count of sectors occupied by
   * ONE FAT. On FAT32 volumes this field must be 0, and
   * BPB_FATSz32 contains the FAT size count.
   */
  get BPB_FATSz16() {
    return this.buf.readUInt8(22);
  }
  set BPB_FATSz16(v) {
    this.buf.writeUInt8(v, 22);
  }

  /**
   * offset: 24 size: 2
   *
   * Sectors per track for interrupt 0x13. This field is only relevant for
   * media that have a geometry (volume is broken down into tracks by
   * multiple heads and cylinders) and are visible on interrupt 0x13.
   * This field contains the “sectors per track” geometry value.
   */
  get BPB_SecPerTrk() {
    return this.buf.readUInt16LE(24);
  }
  set BPB_SecPerTrk(v) {
    this.buf.writeUInt16LE(v, 24);
  }

  /**
   * offset: 26 size: 2
   *
   * Number of heads for interrupt 0x13. This field is relevant as
   * discussed earlier for BPB_SecPerTrk. This field contains the one
   * based “count of heads”. For example, on a 1.44 MB 3.5-inch floppy
   * drive this value is 2.
   */
  get BPB_NumHeads() {
    return this.buf.readUInt16LE(26);
  }
  set BPB_NumHeads(v) {
    this.buf.writeUInt16LE(v, 26);
  }

  /**
   * offset: 28 size: 4
   *
   * Count of hidden sectors preceding the partition that contains this
   * FAT volume. This field is generally only relevant for media visible
   * on interrupt 0x13. This field should always be zero on media that
   * are not partitioned. Exactly what value is appropriate is operating
   * system specific.
   */
  get BPB_HiddSec() {
    return this.buf.readUInt32LE(28);
  }
  set BPB_HiddSec(v) {
    this.buf.writeUInt32LE(v, 28);
  }

  /**
   * offset: 32 size: 4
   *
   * This field is the new 32-bit total count of sectors on the volume.
   * This count includes the count of all sectors in all four regions of the
   * volume. This field can be 0; if it is 0, then BPB_TotSec16 must be
   * non-zero. For FAT32 volumes, this field must be non-zero. For
   * FAT12/FAT16 volumes, this field contains the sector count if
   * BPB_TotSec16 is 0 (count is greater than or equal to 0x10000).
   */
  get BPB_TotSec32() {
    return this.buf.readUInt32LE(32);
  }
  set BPB_TotSec32(v) {
    this.buf.writeUInt32LE(v, 32);
  }

  /**
   * offset: 36 size: 4
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media. This field is the FAT32 32-bit count of
   * sectors occupied by ONE FAT. BPB_FATSz16 must be 0.
   */
  get BPB_FATSz32() {
    return this.buf.readUInt32LE(36);
  }
  set BPB_FATSz32(v) {
    this.buf.writeUInt32LE(v, 36);
  }

  /**
   * offset: 40 size: 2
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media.
   * Bits 0-3 -- Zero-based number of active FAT. Only valid if mirroring
   * is disabled.
   * Bits 4-6 -- Reserved.
   * Bit 7 -- 0 means the FAT is mirrored at runtime into all FATs.
   * -- 1 means only one FAT is active; it is the one referenced
   * in bits 0-3.
   * Bits 8-15 -- Reserved.
   */
  get BPB_ExtFlags() {
    return this.buf.readUInt16LE(40);
  }
  set BPB_ExtFlags(v) {
    this.buf.writeUInt16LE(v, 40);
  }

  /**
   * offset: 42 size: 2
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media. High byte is major revision number.
   * Low byte is minor revision number. This is the version number of
   * the FAT32 volume. This supports the ability to extend the FAT32
   * media type in the future without worrying about old FAT32 drivers
   * mounting the volume. This document defines the version to 0:0. If
   * this field is non-zero, back-level Windows versions will not mount
   * the volume.
   * NOTE: Disk utilities should respect this field and not operate on
   * volumes with a higher major or minor version number than that for
   * which they were designed. FAT32 file system drivers must check
   * this field and not mount the volume if it does not contain a version
   * number that was defined at the time the driver was written.
   */
  get BPB_FSVer() {
    return this.buf.readUInt16LE(42);
  }
  set BPB_FSVer(v) {
    this.buf.writeUInt16LE(v, 42);
  }

  /**
   * offset: 44 size: 4
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media. This is set to the cluster number of the
   * first cluster of the root directory, usually 2 but not required to be 2.
   * NOTE: Disk utilities that change the location of the root directory
   * should make every effort to place the first cluster of the root
   * directory in the first non-bad cluster on the drive (i.e., in cluster 2,
   * unless it’s marked bad). This is specified so that disk repair utilities
   * can easily find the root directory if this field accidentally gets
   * zeroed.
   */
  get BPB_RootClus() {
    return this.buf.readUInt32LE(44);
  }
  set BPB_RootClus(v) {
    this.buf.writeUInt32LE(v, 44);
  }

  /**
   * offset: 48 size: 2
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media. Sector number of FSINFO structure in the
   * reserved area of the FAT32 volume. Usually 1.
   * NOTE: There will be a copy of the FSINFO structure in BackupBoot,
   * but only the copy pointed to by this field will be kept up to date (i.e.,
   * both the primary and backup boot record will point to the same
   * FSINFO sector).
   */
  get BPB_FSInfo() {
    return this.buf.readUInt16LE(48);
  }
  set BPB_FSInfo(v) {
    this.buf.writeUInt16LE(v, 48);
  }

  /**
   * offset: 50 size: 2
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media. If non-zero, indicates the sector number
   * in the reserved area of the volume of a copy of the boot record.
   * Usually 6. No value other than 6 is recommended.
   */
  get BPB_BkBootSec() {
    return this.buf.readUInt16LE(50);
  }
  set BPB_BkBootSec(v) {
    this.buf.writeUInt16LE(v, 50);
  }

  /**
   * offset: 52 size: 12
   *
   * This field is only defined for FAT32 media and does not exist on
   * FAT12 and FAT16 media. Reserved for future expansion. Code
   * that formats FAT32 volumes should always set all of the bytes of
   * this field to 0.
   */
  get BPB_Reserved() {
    return this.buf.subarray(52, 52 + 12);
  }
  set BPB_Reserved(v) {
    for (let i = 0; i < 12; i++) {
      this.buf.writeUInt8(v[i], 52 + i);
    }
  }

  /**
   * offset: 64 size: 1
   *
   * This field has the same definition as it does for FAT12 and FAT16
   * media. The only difference for FAT32 media is that the field is at a
   * different offset in the boot sector.
   */
  get BS_DrvNum() {
    return this.buf.readUInt8(64);
  }
  set BS_DrvNum(v) {
    this.buf.writeUInt8(v, 64);
  }

  /**
   * offset: 65 size: 1
   *
   * This field has the same definition as it does for FAT12 and FAT16
   * media. The only difference for FAT32 media is that the field is at a
   * different offset in the boot sector.
   */
  get BS_Reserved1() {
    return this.buf.readUInt8(65);
  }
  set BS_Reserved1(v) {
    this.buf.writeUInt8(v, 65);
  }

  /**
   * offset: 66 size: 1
   *
   * This field has the same definition as it does for FAT12 and FAT16
   * media. The only difference for FAT32 media is that the field is at a
   * different offset in the boot sector.
   */
  get BS_BootSig() {
    return this.buf.readUInt8(66);
  }
  set BS_BootSig(v) {
    this.buf.writeUInt8(v, 66);
  }

  /**
   * offset: 67 size: 4
   *
   * This field has the same definition as it does for FAT12 and FAT16
   * media. The only difference for FAT32 media is that the field is at a
   * different offset in the boot sector.
   */
  get BS_VolID() {
    return this.buf.readUInt32LE(67);
  }
  set BS_VolID(v) {
    this.buf.writeUInt32LE(v, 67);
  }

  /**
   * offset: 71 size: 11
   *
   * This field has the same definition as it does for FAT12 and FAT16
   * media. The only difference for FAT32 media is that the field is at a
   * different offset in the boot sector.
   */
  get BS_VolLab() {
    return this.buf.subarray(71, 11).toString();
  }
  set BS_VolLab(v) {
    for (let i = 0; i < 11; i++) {
      const ch = (v[i] || " ").charCodeAt(0);
      this.buf.writeUInt8(ch, 71 + i);
    }
  }

  /**
   * offset: 82 size: 8
   *
   * Always set to the string ”FAT32 ”. Please see the note for this
   * field in the FAT12/FAT16 section earlier. This field has nothing to
   * do with FAT type determination..
   */
  get BS_FileSysType() {
    return this.buf.subarray(82, 8).toString();
  }
  set BS_FileSysType(v) {
    for (let i = 0; i < 8; i++) {
      const ch = (v[i] || " ").charCodeAt(0);
      this.buf.writeUInt8(ch, 82 + i);
    }
  }
}

module.exports = FAT32BPB;
