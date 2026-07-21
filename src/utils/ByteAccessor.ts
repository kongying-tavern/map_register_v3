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
  // #endregion internal

  // #region uint8 / byte
  writeUint8(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF, mode)
    this.#ensureCapacity(1)
    this.#buffer[this.#pointer++] = value
    return this
  }

  setUint8(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF, mode)
    this.#ensureCapacity(1)
    this.#buffer[this.#pointer] = value
    return this
  }

  writeByte = this.writeUint8
  setByte = this.setUint8
  // #endregion uint8 / byte

  // #region uint16LE
  writeUint16LE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer++] = value & 0xFF
    this.#buffer[this.#pointer++] = (value >> 0o10) & 0xFF
    return this
  }

  setUint16LE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer] = value & 0xFF
    this.#buffer[this.#pointer + 1] = (value >> 0o10) & 0xFF
    return this
  }
  // #endregion uint16LE

  // #region uint16BE
  writeUint16BE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer++] = (value >> 0o10) & 0xFF
    this.#buffer[this.#pointer++] = value & 0xFF
    return this
  }

  setUint16BE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF, mode)
    this.#ensureCapacity(2)
    this.#buffer[this.#pointer] = (value >> 0o10) & 0xFF
    this.#buffer[this.#pointer + 1] = value & 0xFF
    return this
  }
  // #endregion uint16BE

  // #region uint32LE
  writeUint32LE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF_FF_FF, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer++] = value & 0xFF
    this.#buffer[this.#pointer++] = (value >> 0o10) & 0xFF
    this.#buffer[this.#pointer++] = (value >> 0o20) & 0xFF
    this.#buffer[this.#pointer++] = (value >> 0o30) & 0xFF
    return this
  }

  setUint32LE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF_FF_FF, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer] = value & 0xFF
    this.#buffer[this.#pointer + 1] = (value >> 0o10) & 0xFF
    this.#buffer[this.#pointer + 2] = (value >> 0o20) & 0xFF
    this.#buffer[this.#pointer + 3] = (value >> 0o30) & 0xFF
    return this
  }
  // #endregion uint32LE

  // #region uint32BE
  writeUint32BE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF_FF_FF, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer++] = (value >> 0o30) & 0xFF
    this.#buffer[this.#pointer++] = (value >> 0o20) & 0xFF
    this.#buffer[this.#pointer++] = (value >> 0o10) & 0xFF
    this.#buffer[this.#pointer++] = value & 0xFF
    return this
  }

  setUint32BE(value: number, mode: ByteAccessorTruncateMode = 'truncate') {
    value = this.#checkRange(value, 0, 0xFF_FF_FF_FF, mode)
    this.#ensureCapacity(4)
    this.#buffer[this.#pointer] = (value >> 0o30) & 0xFF
    this.#buffer[this.#pointer + 1] = (value >> 0o20) & 0xFF
    this.#buffer[this.#pointer + 2] = (value >> 0o10) & 0xFF
    this.#buffer[this.#pointer + 3] = value & 0xFF
    return this
  }
  // #endregion uint32BE

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
  readUint8() {
    this.#checkReadable(1)
    return this.#buffer[this.#pointer++]
  }

  getUint8() {
    return this.#buffer[this.#pointer] ?? 0
  }

  readByte = this.readUint8
  getByte = this.getUint8
  // #endregion uint8 / byte

  // #region uint16LE
  readUint16LE() {
    this.#checkReadable(2)
    const v = this.#buffer[this.#pointer] | (this.#buffer[this.#pointer + 1] << 0o10)
    this.#pointer += 2
    return v
  }

  getUint16LE() {
    return (this.#buffer[this.#pointer] ?? 0) | ((this.#buffer[this.#pointer + 1] ?? 0) << 0o10)
  }
  // #endregion uint16LE

  // #region uint16BE
  readUint16BE() {
    this.#checkReadable(2)
    const v = (this.#buffer[this.#pointer] << 0o10) | this.#buffer[this.#pointer + 1]
    this.#pointer += 2
    return v
  }

  getUint16BE() {
    return ((this.#buffer[this.#pointer] ?? 0) << 0o10) | (this.#buffer[this.#pointer + 1] ?? 0)
  }
  // #endregion uint16BE

  // #region uint32LE
  readUint32LE() {
    this.#checkReadable(4)
    const v = this.#buffer[this.#pointer]
      | (this.#buffer[this.#pointer + 1] << 0o10)
      | (this.#buffer[this.#pointer + 2] << 0o20)
      | (this.#buffer[this.#pointer + 3] << 0o30)
    this.#pointer += 4
    return v >>> 0
  }

  getUint32LE() {
    return ((this.#buffer[this.#pointer] ?? 0)
      | ((this.#buffer[this.#pointer + 1] ?? 0) << 0o10)
      | ((this.#buffer[this.#pointer + 2] ?? 0) << 0o20)
      | ((this.#buffer[this.#pointer + 3] ?? 0) << 0o30)) >>> 0
  }
  // #endregion uint32LE

  // #region uint32BE
  readUint32BE() {
    this.#checkReadable(4)
    const v = (this.#buffer[this.#pointer] << 0o30)
      | (this.#buffer[this.#pointer + 1] << 0o20)
      | (this.#buffer[this.#pointer + 2] << 0o10)
      | this.#buffer[this.#pointer + 3]
    this.#pointer += 4
    return v >>> 0
  }

  getUint32BE() {
    return (((this.#buffer[this.#pointer] ?? 0) << 0o30)
      | ((this.#buffer[this.#pointer + 1] ?? 0) << 0o20)
      | ((this.#buffer[this.#pointer + 2] ?? 0) << 0o10)
      | (this.#buffer[this.#pointer + 3] ?? 0)) >>> 0
  }
  // #endregion uint32BE

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
