export type ByteAccessorTruncateMode = 'truncate' | 'error' | 'clamp'

// #region ByteWriter
export class ByteWriter {
  #buffer: Uint8Array
  #pointer = 0
  #end = 0

  constructor(initialCapacity = 32) {
    this.#buffer = new Uint8Array(initialCapacity)
  }

  get pointer() { return this.#pointer }
  get byteLength() { return this.#end }
  get capacity() { return this.#buffer.length }

  // #region internal
  #ensureCapacity(extra: number) {
    const needed = this.#pointer + extra
    if (needed > this.#buffer.length) {
      let newSize = this.#buffer.length
      while (newSize < needed) newSize *= 2
      const newBuffer = new Uint8Array(newSize)
      newBuffer.set(this.#buffer)
      this.#buffer = newBuffer
    }
    if (needed > this.#end)
      this.#end = needed
  }

  #checkRange(value: number, min: number, max: number, mode: ByteAccessorTruncateMode) {
    if (value < min || value > max) {
      if (mode === 'error')
        throw new RangeError(`Value ${value} out of range [${min}, ${max}]`)
      if (mode === 'clamp')
        return value < min ? min : max
      return value & max
    }
    return value
  }

  #normalizeInt(
    value: number | bigint,
    min: bigint,
    max: bigint,
    mode: ByteAccessorTruncateMode,
    truncateMask = max,
  ): bigint {
    const bigintValue = BigInt(value)
    if (bigintValue < min || bigintValue > max) {
      if (mode === 'error')
        throw new RangeError(`Value ${bigintValue} out of range [${min}, ${max}]`)
      if (mode === 'clamp')
        return bigintValue < min ? min : max
      return bigintValue & truncateMask
    }
    return bigintValue
  }
  // #endregion internal

  // #region uint8 / byte
  writeUint8(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFFn, mode)
    this.#ensureCapacity(1)
    this.#buffer[this.#pointer++] = Number(v)
    return this
  }

  setUint8(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFFn, mode)
    this.#ensureCapacity(1)
    this.#buffer[this.#pointer] = Number(v)
    return this
  }

  writeByte = this.writeUint8
  setByte = this.setUint8
  // #endregion uint8 / byte

  // #region int8
  writeInt8(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x80n, 0x7Fn, mode, 0xFFn)
    this.#ensureCapacity(1)
    this.#buffer[this.#pointer++] = Number(bigintValue & 0xFFn)
    return this
  }

  setInt8(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x80n, 0x7Fn, mode, 0xFFn)
    this.#ensureCapacity(1)
    this.#buffer[this.#pointer] = Number(bigintValue & 0xFFn)
    return this
  }
  // #endregion int8

  // #region uint16LE
  writeUint16LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FFn, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer++] = Number(v & 0xFFn)
    this.#buffer[this.#pointer++] = Number((v >> 8n) & 0xFFn)
    return this
  }

  setUint16LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FFn, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer] = Number(v & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number((v >> 8n) & 0xFFn)
    return this
  }
  // #endregion uint16LE

  // #region int16LE
  writeInt16LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000n, 0x7FFFn, mode, 0xFF_FFn)
    this.#ensureCapacity(2)
    const unsigned = bigintValue & 0xFF_FFn
    this.#buffer[this.#pointer++] = Number(unsigned & 0xFFn)
    this.#buffer[this.#pointer++] = Number((unsigned >> 8n) & 0xFFn)
    return this
  }

  setInt16LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000n, 0x7FFFn, mode, 0xFF_FFn)
    this.#ensureCapacity(2)
    const unsigned = bigintValue & 0xFF_FFn
    this.#buffer[this.#pointer] = Number(unsigned & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number((unsigned >> 8n) & 0xFFn)
    return this
  }
  // #endregion int16LE

  // #region uint16BE
  writeUint16BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FFn, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer++] = Number((v >> 8n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number(v & 0xFFn)
    return this
  }

  setUint16BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FFn, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer] = Number((v >> 8n) & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number(v & 0xFFn)
    return this
  }
  // #endregion uint16BE

  // #region int16BE
  writeInt16BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000n, 0x7FFFn, mode, 0xFF_FFn)
    this.#ensureCapacity(2)
    const unsigned = bigintValue & 0xFF_FFn
    this.#buffer[this.#pointer++] = Number((unsigned >> 8n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number(unsigned & 0xFFn)
    return this
  }

  setInt16BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000n, 0x7FFFn, mode, 0xFF_FFn)
    this.#ensureCapacity(2)
    const unsigned = bigintValue & 0xFF_FFn
    this.#buffer[this.#pointer] = Number((unsigned >> 8n) & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number(unsigned & 0xFFn)
    return this
  }
  // #endregion int16BE

  // #region uint32LE
  writeUint32LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FF_FF_FFn, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer++] = Number(v & 0xFFn)
    this.#buffer[this.#pointer++] = Number((v >> 8n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((v >> 16n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((v >> 24n) & 0xFFn)
    return this
  }

  setUint32LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FF_FF_FFn, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer] = Number(v & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number((v >> 8n) & 0xFFn)
    this.#buffer[this.#pointer + 2] = Number((v >> 16n) & 0xFFn)
    this.#buffer[this.#pointer + 3] = Number((v >> 24n) & 0xFFn)
    return this
  }
  // #endregion uint32LE

  // #region int32LE
  writeInt32LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000n, 0x7FFF_FFFFn, mode, 0xFF_FF_FF_FFn)
    this.#ensureCapacity(4)
    const unsigned = bigintValue & 0xFF_FF_FF_FFn
    this.#buffer[this.#pointer++] = Number(unsigned & 0xFFn)
    this.#buffer[this.#pointer++] = Number((unsigned >> 8n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((unsigned >> 16n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((unsigned >> 24n) & 0xFFn)
    return this
  }

  setInt32LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000n, 0x7FFF_FFFFn, mode, 0xFF_FF_FF_FFn)
    this.#ensureCapacity(4)
    const unsigned = bigintValue & 0xFF_FF_FF_FFn
    this.#buffer[this.#pointer] = Number(unsigned & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number((unsigned >> 8n) & 0xFFn)
    this.#buffer[this.#pointer + 2] = Number((unsigned >> 16n) & 0xFFn)
    this.#buffer[this.#pointer + 3] = Number((unsigned >> 24n) & 0xFFn)
    return this
  }
  // #endregion int32LE

  // #region uint32BE
  writeUint32BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FF_FF_FFn, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer++] = Number((v >> 24n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((v >> 16n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((v >> 8n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number(v & 0xFFn)
    return this
  }

  setUint32BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const v = this.#normalizeInt(value, 0n, 0xFF_FF_FF_FFn, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer] = Number((v >> 24n) & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number((v >> 16n) & 0xFFn)
    this.#buffer[this.#pointer + 2] = Number((v >> 8n) & 0xFFn)
    this.#buffer[this.#pointer + 3] = Number(v & 0xFFn)
    return this
  }
  // #endregion uint32BE

  // #region int32BE
  writeInt32BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000n, 0x7FFF_FFFFn, mode, 0xFF_FF_FF_FFn)
    this.#ensureCapacity(4)
    const unsigned = bigintValue & 0xFF_FF_FF_FFn
    this.#buffer[this.#pointer++] = Number((unsigned >> 24n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((unsigned >> 16n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number((unsigned >> 8n) & 0xFFn)
    this.#buffer[this.#pointer++] = Number(unsigned & 0xFFn)
    return this
  }

  setInt32BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000n, 0x7FFF_FFFFn, mode, 0xFF_FF_FF_FFn)
    this.#ensureCapacity(4)
    const unsigned = bigintValue & 0xFF_FF_FF_FFn
    this.#buffer[this.#pointer] = Number((unsigned >> 24n) & 0xFFn)
    this.#buffer[this.#pointer + 1] = Number((unsigned >> 16n) & 0xFFn)
    this.#buffer[this.#pointer + 2] = Number((unsigned >> 8n) & 0xFFn)
    this.#buffer[this.#pointer + 3] = Number(unsigned & 0xFFn)
    return this
  }
  // #endregion int32BE

  // #region uint64LE
  writeUint64LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, 0n, 0xFFFF_FFFF_FFFF_FFFFn, mode)
    this.#ensureCapacity(8)
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer++] = Number((bigintValue >> BigInt(i * 8)) & 0xFFn)
    }
    return this
  }

  setUint64LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, 0n, 0xFFFF_FFFF_FFFF_FFFFn, mode)
    this.#ensureCapacity(8)
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer + i] = Number((bigintValue >> BigInt(i * 8)) & 0xFFn)
    }
    return this
  }
  // #endregion uint64LE

  // #region int64LE
  writeInt64LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000_0000_0000n, 0x7FFF_FFFF_FFFF_FFFFn, mode, 0xFFFF_FFFF_FFFF_FFFFn)
    this.#ensureCapacity(8)
    const unsigned = bigintValue & 0xFFFF_FFFF_FFFF_FFFFn
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer++] = Number((unsigned >> BigInt(i * 8)) & 0xFFn)
    }
    return this
  }

  setInt64LE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000_0000_0000n, 0x7FFF_FFFF_FFFF_FFFFn, mode, 0xFFFF_FFFF_FFFF_FFFFn)
    this.#ensureCapacity(8)
    const unsigned = bigintValue & 0xFFFF_FFFF_FFFF_FFFFn
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer + i] = Number((unsigned >> BigInt(i * 8)) & 0xFFn)
    }
    return this
  }
  // #endregion int64LE

  // #region uint64BE
  writeUint64BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, 0n, 0xFFFF_FFFF_FFFF_FFFFn, mode)
    this.#ensureCapacity(8)
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer++] = Number((bigintValue >> BigInt((7 - i) * 8)) & 0xFFn)
    }
    return this
  }

  setUint64BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, 0n, 0xFFFF_FFFF_FFFF_FFFFn, mode)
    this.#ensureCapacity(8)
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer + i] = Number((bigintValue >> BigInt((7 - i) * 8)) & 0xFFn)
    }
    return this
  }
  // #endregion uint64BE

  // #region int64BE
  writeInt64BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000_0000_0000n, 0x7FFF_FFFF_FFFF_FFFFn, mode, 0xFFFF_FFFF_FFFF_FFFFn)
    this.#ensureCapacity(8)
    const unsigned = bigintValue & 0xFFFF_FFFF_FFFF_FFFFn
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer++] = Number((unsigned >> BigInt((7 - i) * 8)) & 0xFFn)
    }
    return this
  }

  setInt64BE(value: number | bigint, mode: ByteAccessorTruncateMode = 'truncate') {
    const bigintValue = this.#normalizeInt(value, -0x8000_0000_0000_0000n, 0x7FFF_FFFF_FFFF_FFFFn, mode, 0xFFFF_FFFF_FFFF_FFFFn)
    this.#ensureCapacity(8)
    const unsigned = bigintValue & 0xFFFF_FFFF_FFFF_FFFFn
    for (let i = 0; i < 8; i++) {
      this.#buffer[this.#pointer + i] = Number((unsigned >> BigInt((7 - i) * 8)) & 0xFFn)
    }
    return this
  }
  // #endregion int64BE

  // #region bytes
  writeBytes(data: Uint8Array) {
    this.#ensureCapacity(data.length)
    this.#buffer.set(data, this.#pointer)
    this.#pointer += data.length
    return this
  }

  setBytes(data: Uint8Array) {
    this.#ensureCapacity(data.length)
    this.#buffer.set(data, this.#pointer)
    return this
  }
  // #endregion bytes

  // #region string
  writeString(value: string) {
    return this.writeBytes(new TextEncoder().encode(value))
  }

  setString(value: string) {
    return this.setBytes(new TextEncoder().encode(value))
  }
  // #endregion string

  // #region bit
  setBit(value: number, bitPosStart: number, bitPosEnd: number, mode: ByteAccessorTruncateMode = 'truncate') {
    if (bitPosStart < 1 || bitPosEnd < bitPosStart)
      throw new RangeError('Invalid bit range')
    const bitCount = bitPosEnd - bitPosStart + 1
    const max = (1 << bitCount) - 1
    value = this.#checkRange(value, 0, max, mode)
    const endByte = Math.floor((bitPosEnd - 1) / 8)
    this.#ensureCapacity(endByte + 1)
    let remaining = bitCount
    let msb0 = bitPosStart - 1
    while (remaining > 0) {
      const byteIndex = Math.floor(msb0 / 8)
      const byteMsb0 = msb0 % 8
      const bitsInThisByte = Math.min(8 - byteMsb0, remaining)
      const lsbEnd = 7 - byteMsb0 - bitsInThisByte + 1
      const mask = ((1 << bitsInThisByte) - 1) << lsbEnd
      const _shift = remaining - bitsInThisByte
      const valueBits = (value >> _shift) & ((1 << bitsInThisByte) - 1)
      this.#buffer[this.#pointer + byteIndex]
        = (this.#buffer[this.#pointer + byteIndex] & ~mask) | (valueBits << lsbEnd)
      remaining -= bitsInThisByte
      msb0 += bitsInThisByte
    }
    return this
  }
  // #endregion bit

  // #region static
  static byteLength(data: Uint8Array) {
    return data.length
  }

  static stringByteLength(str: string) {
    return new TextEncoder().encode(str).length
  }
  // #endregion static

  // #region pointer
  moveTo(pos: number) {
    this.#pointer = pos
    return this
  }

  moveBy(offset: number) {
    this.#pointer += offset
    return this
  }
  // #endregion pointer

  // #region output
  toUint8Array() { return this.#buffer.slice(0, this.#end) }
  slice(start = 0, end = this.#end) { return this.#buffer.slice(start, end) }
  // #endregion output
}
// #endregion ByteWriter

// #region ByteReader
export class ByteReader {
  #buffer: Uint8Array
  #pointer = 0

  constructor(buffer: Uint8Array) {
    this.#buffer = buffer
  }

  get pointer() { return this.#pointer }
  get length() { return this.#buffer.length }
  get byteLength() { return this.#buffer.length }
  get remaining() { return this.#buffer.length - this.#pointer }

  // #region internal
  #checkReadable(bytes: number) {
    if (this.#pointer + bytes > this.#buffer.length) {
      throw new RangeError(`Cannot read ${bytes} bytes: only ${this.remaining} bytes remaining`)
    }
  }
  // #endregion internal

  // #region uint8 / byte
  readUint8(): bigint {
    this.#checkReadable(1)
    return BigInt(this.#buffer[this.#pointer++])
  }

  getUint8(): bigint {
    return BigInt(this.#buffer[this.#pointer] ?? 0)
  }

  readByte = this.readUint8
  getByte = this.getUint8
  // #endregion uint8 / byte

  // #region int8
  readInt8(): bigint {
    const value = this.readUint8()
    return value >= 0x80n ? value - 0x100n : value
  }

  getInt8(): bigint {
    const value = this.getUint8()
    return value >= 0x80n ? value - 0x100n : value
  }
  // #endregion int8

  // #region uint16LE
  readUint16LE(): bigint {
    this.#checkReadable(2)
    const v = BigInt(this.#buffer[this.#pointer]) | (BigInt(this.#buffer[this.#pointer + 1]) << 8n)
    this.#pointer += 2
    return v
  }

  getUint16LE(): bigint {
    return BigInt(this.#buffer[this.#pointer] ?? 0) | (BigInt(this.#buffer[this.#pointer + 1] ?? 0) << 8n)
  }
  // #endregion uint16LE

  // #region int16LE
  readInt16LE(): bigint {
    const value = this.readUint16LE()
    return value >= 0x8000n ? value - 0x1_0000n : value
  }

  getInt16LE(): bigint {
    const value = this.getUint16LE()
    return value >= 0x8000n ? value - 0x1_0000n : value
  }
  // #endregion int16LE

  // #region uint16BE
  readUint16BE(): bigint {
    this.#checkReadable(2)
    const v = (BigInt(this.#buffer[this.#pointer]) << 8n) | BigInt(this.#buffer[this.#pointer + 1])
    this.#pointer += 2
    return v
  }

  getUint16BE(): bigint {
    return (BigInt(this.#buffer[this.#pointer] ?? 0) << 8n) | BigInt(this.#buffer[this.#pointer + 1] ?? 0)
  }
  // #endregion uint16BE

  // #region int16BE
  readInt16BE(): bigint {
    const value = this.readUint16BE()
    return value >= 0x8000n ? value - 0x1_0000n : value
  }

  getInt16BE(): bigint {
    const value = this.getUint16BE()
    return value >= 0x8000n ? value - 0x1_0000n : value
  }
  // #endregion int16BE

  // #region uint32LE
  readUint32LE(): bigint {
    this.#checkReadable(4)
    const v
      = BigInt(this.#buffer[this.#pointer])
        | (BigInt(this.#buffer[this.#pointer + 1]) << 8n)
        | (BigInt(this.#buffer[this.#pointer + 2]) << 16n)
        | (BigInt(this.#buffer[this.#pointer + 3]) << 24n)
    this.#pointer += 4
    return v
  }

  getUint32LE(): bigint {
    return BigInt(this.#buffer[this.#pointer] ?? 0)
      | (BigInt(this.#buffer[this.#pointer + 1] ?? 0) << 8n)
      | (BigInt(this.#buffer[this.#pointer + 2] ?? 0) << 16n)
      | (BigInt(this.#buffer[this.#pointer + 3] ?? 0) << 24n)
  }
  // #endregion uint32LE

  // #region int32LE
  readInt32LE(): bigint {
    const value = this.readUint32LE()
    return value >= 0x8000_0000n ? value - 0x1_0000_0000n : value
  }

  getInt32LE(): bigint {
    const value = this.getUint32LE()
    return value >= 0x8000_0000n ? value - 0x1_0000_0000n : value
  }
  // #endregion int32LE

  // #region uint32BE
  readUint32BE(): bigint {
    this.#checkReadable(4)
    const v
      = (BigInt(this.#buffer[this.#pointer]) << 24n)
        | (BigInt(this.#buffer[this.#pointer + 1]) << 16n)
        | (BigInt(this.#buffer[this.#pointer + 2]) << 8n)
        | BigInt(this.#buffer[this.#pointer + 3])
    this.#pointer += 4
    return v
  }

  getUint32BE(): bigint {
    return (BigInt(this.#buffer[this.#pointer] ?? 0) << 24n)
      | (BigInt(this.#buffer[this.#pointer + 1] ?? 0) << 16n)
      | (BigInt(this.#buffer[this.#pointer + 2] ?? 0) << 8n)
      | BigInt(this.#buffer[this.#pointer + 3] ?? 0)
  }
  // #endregion uint32BE

  // #region int32BE
  readInt32BE(): bigint {
    const value = this.readUint32BE()
    return value >= 0x8000_0000n ? value - 0x1_0000_0000n : value
  }

  getInt32BE(): bigint {
    const value = this.getUint32BE()
    return value >= 0x8000_0000n ? value - 0x1_0000_0000n : value
  }
  // #endregion int32BE

  // #region uint64LE
  readUint64LE(): bigint {
    this.#checkReadable(8)
    let value = 0n
    for (let i = 7; i >= 0; i--)
      value = (value << 8n) | BigInt(this.#buffer[this.#pointer + i])
    this.#pointer += 8
    return value
  }

  getUint64LE(): bigint {
    let value = 0n
    for (let i = 7; i >= 0; i--)
      value = (value << 8n) | BigInt(this.#buffer[this.#pointer + i] ?? 0)
    return value
  }
  // #endregion uint64LE

  // #region int64LE
  readInt64LE(): bigint {
    const value = this.readUint64LE()
    return value >= 0x8000_0000_0000_0000n ? value - 0x1_0000_0000_0000_0000n : value
  }

  getInt64LE(): bigint {
    const value = this.getUint64LE()
    return value >= 0x8000_0000_0000_0000n ? value - 0x1_0000_0000_0000_0000n : value
  }
  // #endregion int64LE

  // #region uint64BE
  readUint64BE(): bigint {
    this.#checkReadable(8)
    let value = 0n
    for (let i = 0; i < 8; i++)
      value = (value << 8n) | BigInt(this.#buffer[this.#pointer + i])
    this.#pointer += 8
    return value
  }

  getUint64BE(): bigint {
    let value = 0n
    for (let i = 0; i < 8; i++)
      value = (value << 8n) | BigInt(this.#buffer[this.#pointer + i] ?? 0)
    return value
  }
  // #endregion uint64BE

  // #region int64BE
  readInt64BE(): bigint {
    const value = this.readUint64BE()
    return value >= 0x8000_0000_0000_0000n ? value - 0x1_0000_0000_0000_0000n : value
  }

  getInt64BE(): bigint {
    const value = this.getUint64BE()
    return value >= 0x8000_0000_0000_0000n ? value - 0x1_0000_0000_0000_0000n : value
  }
  // #endregion int64BE

  // #region bytes
  readBytes(length: number) {
    this.#checkReadable(length)
    const chunk = this.#buffer.slice(this.#pointer, this.#pointer + length)
    this.#pointer += length
    return chunk
  }

  getBytes(length: number) {
    return this.#buffer.slice(this.#pointer, this.#pointer + length)
  }
  // #endregion bytes

  // #region string
  readString(length: number) {
    return new TextDecoder().decode(this.readBytes(length))
  }

  getString(length: number) {
    return new TextDecoder().decode(this.#buffer.slice(this.#pointer, this.#pointer + length))
  }
  // #endregion string

  // #region bit
  readBit(bitPosStart: number, bitPosEnd: number) {
    if (bitPosStart < 1 || bitPosEnd < bitPosStart)
      throw new RangeError('Invalid bit range')
    const bitCount = bitPosEnd - bitPosStart + 1
    const endByte = Math.floor((bitPosEnd - 1) / 8)
    this.#checkReadable(endByte + 1)
    let value = 0
    let remaining = bitCount
    let msb0 = bitPosStart - 1
    while (remaining > 0) {
      const byteIndex = Math.floor(msb0 / 8)
      const byteMsb0 = msb0 % 8
      const bitsInThisByte = Math.min(8 - byteMsb0, remaining)
      const lsbEnd = 7 - byteMsb0 - bitsInThisByte + 1
      const mask = ((1 << bitsInThisByte) - 1) << lsbEnd
      const byteVal = (this.#buffer[this.#pointer + byteIndex] & mask) >> lsbEnd
      value = (value << bitsInThisByte) | byteVal
      remaining -= bitsInThisByte
      msb0 += bitsInThisByte
    }
    return value
  }
  // #endregion bit

  // #region static
  static byteLength(data: Uint8Array) {
    return data.length
  }

  static stringByteLength(str: string) {
    return new TextEncoder().encode(str).length
  }
  // #endregion static

  // #region pointer
  moveTo(pos: number) {
    this.#pointer = pos
    return this
  }

  moveBy(offset: number) {
    this.#pointer += offset
    return this
  }
  // #endregion pointer
}
// #endregion ByteReader
