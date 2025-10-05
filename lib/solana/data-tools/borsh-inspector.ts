import { Buffer } from 'buffer'

export interface BorshSchema {
  name: string
  type: BorshType
  description?: string
}

export interface BorshType {
  kind: 'struct' | 'enum' | 'primitive' | 'array' | 'option' | 'vec' | 'map' | 'set'
  fields?: BorshField[]
  variants?: BorshVariant[]
  elementType?: BorshType
  keyType?: BorshType
  valueType?: BorshType
  length?: number // for fixed arrays
}

export interface BorshField {
  name: string
  type: BorshType
  description?: string
}

export interface BorshVariant {
  name: string
  fields?: BorshField[]
  discriminator?: number
}

export interface BorshDecodedData {
  schema: BorshSchema
  data: any
  rawData: Uint8Array
  isValid: boolean
  error?: string
}

export interface BorshEncodeResult {
  encoded: Uint8Array
  hex: string
  base64: string
  size: number
  isValid: boolean
  error?: string
}

export class BorshInspector {
  /**
   * Decode Borsh data using provided schema
   */
  static decode(data: Uint8Array, schema: BorshSchema): BorshDecodedData {
    try {
      const reader = new BorshReader(data)
      const decoded = this.decodeValue(reader, schema.type)
      
      return {
        schema,
        data: decoded,
        rawData: data,
        isValid: true
      }
    } catch (error) {
      return {
        schema,
        data: null,
        rawData: data,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown decode error'
      }
    }
  }

  /**
   * Encode data to Borsh format using schema
   */
  static encode(data: any, schema: BorshSchema): BorshEncodeResult {
    try {
      const writer = new BorshWriter()
      this.encodeValue(writer, data, schema.type)
      
      const encoded = writer.toArray()
      
      return {
        encoded,
        hex: Buffer.from(encoded).toString('hex'),
        base64: Buffer.from(encoded).toString('base64'),
        size: encoded.length,
        isValid: true
      }
    } catch (error) {
      return {
        encoded: new Uint8Array(0),
        hex: '',
        base64: '',
        size: 0,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown encode error'
      }
    }
  }

  /**
   * Decode a value based on its type
   */
  private static decodeValue(reader: BorshReader, type: BorshType): any {
    switch (type.kind) {
      case 'primitive':
        return this.decodePrimitive(reader, type)
      case 'struct':
        return this.decodeStruct(reader, type)
      case 'enum':
        return this.decodeEnum(reader, type)
      case 'array':
        return this.decodeArray(reader, type)
      case 'vec':
        return this.decodeVec(reader, type)
      case 'option':
        return this.decodeOption(reader, type)
      case 'map':
        return this.decodeMap(reader, type)
      case 'set':
        return this.decodeSet(reader, type)
      default:
        throw new Error(`Unsupported type: ${type.kind}`)
    }
  }

  /**
   * Encode a value based on its type
   */
  private static encodeValue(writer: BorshWriter, value: any, type: BorshType): void {
    switch (type.kind) {
      case 'primitive':
        this.encodePrimitive(writer, value, type)
        break
      case 'struct':
        this.encodeStruct(writer, value, type)
        break
      case 'enum':
        this.encodeEnum(writer, value, type)
        break
      case 'array':
        this.encodeArray(writer, value, type)
        break
      case 'vec':
        this.encodeVec(writer, value, type)
        break
      case 'option':
        this.encodeOption(writer, value, type)
        break
      case 'map':
        this.encodeMap(writer, value, type)
        break
      case 'set':
        this.encodeSet(writer, value, type)
        break
      default:
        throw new Error(`Unsupported type: ${type.kind}`)
    }
  }

  /**
   * Decode primitive types
   */
  private static decodePrimitive(reader: BorshReader, type: BorshType): any {
    const primitiveType = (type as any).primitiveType || 'u8'
    
    switch (primitiveType) {
      case 'u8': return reader.readU8()
      case 'u16': return reader.readU16()
      case 'u32': return reader.readU32()
      case 'u64': return reader.readU64()
      case 'u128': return reader.readU128()
      case 'i8': return reader.readI8()
      case 'i16': return reader.readI16()
      case 'i32': return reader.readI32()
      case 'i64': return reader.readI64()
      case 'i128': return reader.readI128()
      case 'f32': return reader.readF32()
      case 'f64': return reader.readF64()
      case 'bool': return reader.readU8() !== 0
      case 'string': return reader.readString()
      case 'pubkey': return reader.readPubkey()
      default:
        throw new Error(`Unknown primitive type: ${primitiveType}`)
    }
  }

  /**
   * Encode primitive types
   */
  private static encodePrimitive(writer: BorshWriter, value: any, type: BorshType): void {
    const primitiveType = (type as any).primitiveType || 'u8'
    
    switch (primitiveType) {
      case 'u8': writer.writeU8(value); break
      case 'u16': writer.writeU16(value); break
      case 'u32': writer.writeU32(value); break
      case 'u64': writer.writeU64(value); break
      case 'u128': writer.writeU128(value); break
      case 'i8': writer.writeI8(value); break
      case 'i16': writer.writeI16(value); break
      case 'i32': writer.writeI32(value); break
      case 'i64': writer.writeI64(value); break
      case 'i128': writer.writeI128(value); break
      case 'f32': writer.writeF32(value); break
      case 'f64': writer.writeF64(value); break
      case 'bool': writer.writeU8(value ? 1 : 0); break
      case 'string': writer.writeString(value); break
      case 'pubkey': writer.writePubkey(value); break
      default:
        throw new Error(`Unknown primitive type: ${primitiveType}`)
    }
  }

  /**
   * Decode struct
   */
  private static decodeStruct(reader: BorshReader, type: BorshType): any {
    const result: any = {}
    
    if (type.fields) {
      for (const field of type.fields) {
        result[field.name] = this.decodeValue(reader, field.type)
      }
    }
    
    return result
  }

  /**
   * Encode struct
   */
  private static encodeStruct(writer: BorshWriter, value: any, type: BorshType): void {
    if (type.fields) {
      for (const field of type.fields) {
        if (value[field.name] !== undefined) {
          this.encodeValue(writer, value[field.name], field.type)
        } else {
          throw new Error(`Missing field: ${field.name}`)
        }
      }
    }
  }

  /**
   * Decode enum
   */
  private static decodeEnum(reader: BorshReader, type: BorshType): any {
    const discriminator = reader.readU8()
    
    if (type.variants && discriminator < type.variants.length) {
      const variant = type.variants[discriminator]
      
      if (variant.fields && variant.fields.length > 0) {
        const result: any = { variant: variant.name }
        for (const field of variant.fields) {
          result[field.name] = this.decodeValue(reader, field.type)
        }
        return result
      } else {
        return { variant: variant.name }
      }
    }
    
    throw new Error(`Invalid enum discriminator: ${discriminator}`)
  }

  /**
   * Encode enum
   */
  private static encodeEnum(writer: BorshWriter, value: any, type: BorshType): void {
    if (!type.variants) {
      throw new Error('Enum type must have variants')
    }
    
    const variantName = value.variant
    const variantIndex = type.variants.findIndex(v => v.name === variantName)
    
    if (variantIndex === -1) {
      throw new Error(`Unknown enum variant: ${variantName}`)
    }
    
    writer.writeU8(variantIndex)
    
    const variant = type.variants[variantIndex]
    if (variant.fields) {
      for (const field of variant.fields) {
        this.encodeValue(writer, value[field.name], field.type)
      }
    }
  }

  /**
   * Decode fixed array
   */
  private static decodeArray(reader: BorshReader, type: BorshType): any {
    const length = type.length || 0
    const result = []
    
    if (type.elementType) {
      for (let i = 0; i < length; i++) {
        result.push(this.decodeValue(reader, type.elementType))
      }
    }
    
    return result
  }

  /**
   * Encode fixed array
   */
  private static encodeArray(writer: BorshWriter, value: any[], type: BorshType): void {
    const length = type.length || 0
    
    if (value.length !== length) {
      throw new Error(`Array length mismatch: expected ${length}, got ${value.length}`)
    }
    
    if (type.elementType) {
      for (const item of value) {
        this.encodeValue(writer, item, type.elementType)
      }
    }
  }

  /**
   * Decode vector
   */
  private static decodeVec(reader: BorshReader, type: BorshType): any {
    const length = reader.readU32()
    const result = []
    
    if (type.elementType) {
      for (let i = 0; i < length; i++) {
        result.push(this.decodeValue(reader, type.elementType))
      }
    }
    
    return result
  }

  /**
   * Encode vector
   */
  private static encodeVec(writer: BorshWriter, value: any[], type: BorshType): void {
    writer.writeU32(value.length)
    
    if (type.elementType) {
      for (const item of value) {
        this.encodeValue(writer, item, type.elementType)
      }
    }
  }

  /**
   * Decode option
   */
  private static decodeOption(reader: BorshReader, type: BorshType): any {
    const hasValue = reader.readU8() !== 0
    
    if (hasValue && type.elementType) {
      return this.decodeValue(reader, type.elementType)
    }
    
    return null
  }

  /**
   * Encode option
   */
  private static encodeOption(writer: BorshWriter, value: any, type: BorshType): void {
    if (value === null || value === undefined) {
      writer.writeU8(0)
    } else {
      writer.writeU8(1)
      if (type.elementType) {
        this.encodeValue(writer, value, type.elementType)
      }
    }
  }

  /**
   * Decode map
   */
  private static decodeMap(reader: BorshReader, type: BorshType): any {
    const length = reader.readU32()
    const result = new Map()
    
    if (type.keyType && type.valueType) {
      for (let i = 0; i < length; i++) {
        const key = this.decodeValue(reader, type.keyType)
        const value = this.decodeValue(reader, type.valueType)
        result.set(key, value)
      }
    }
    
    return result
  }

  /**
   * Encode map
   */
  private static encodeMap(writer: BorshWriter, value: Map<any, any>, type: BorshType): void {
    writer.writeU32(value.size)
    
    if (type.keyType && type.valueType) {
      for (const [key, val] of value) {
        this.encodeValue(writer, key, type.keyType)
        this.encodeValue(writer, val, type.valueType)
      }
    }
  }

  /**
   * Decode set
   */
  private static decodeSet(reader: BorshReader, type: BorshType): any {
    const length = reader.readU32()
    const result = new Set()
    
    if (type.elementType) {
      for (let i = 0; i < length; i++) {
        result.add(this.decodeValue(reader, type.elementType))
      }
    }
    
    return result
  }

  /**
   * Encode set
   */
  private static encodeSet(writer: BorshWriter, value: Set<any>, type: BorshType): void {
    writer.writeU32(value.size)
    
    if (type.elementType) {
      for (const item of value) {
        this.encodeValue(writer, item, type.elementType)
      }
    }
  }

  /**
   * Create common schema templates
   */
  static getCommonSchemas(): { name: string; schema: BorshSchema }[] {
    return [
      {
        name: 'Simple Account',
        schema: {
          name: 'SimpleAccount',
          type: {
            kind: 'struct',
            fields: [
              { name: 'authority', type: { kind: 'primitive', primitiveType: 'pubkey' } as any },
              { name: 'balance', type: { kind: 'primitive', primitiveType: 'u64' } as any },
              { name: 'isInitialized', type: { kind: 'primitive', primitiveType: 'bool' } as any }
            ]
          }
        }
      },
      {
        name: 'Token Account',
        schema: {
          name: 'TokenAccount',
          type: {
            kind: 'struct',
            fields: [
              { name: 'mint', type: { kind: 'primitive', primitiveType: 'pubkey' } as any },
              { name: 'owner', type: { kind: 'primitive', primitiveType: 'pubkey' } as any },
              { name: 'amount', type: { kind: 'primitive', primitiveType: 'u64' } as any },
              { name: 'delegate', type: { kind: 'option', elementType: { kind: 'primitive', primitiveType: 'pubkey' } } },
              { name: 'state', type: { kind: 'primitive', primitiveType: 'u8' } as any },
              { name: 'isNative', type: { kind: 'option', elementType: { kind: 'primitive', primitiveType: 'u64' } } },
              { name: 'delegatedAmount', type: { kind: 'primitive', primitiveType: 'u64' } as any },
              { name: 'closeAuthority', type: { kind: 'option', elementType: { kind: 'primitive', primitiveType: 'pubkey' } } }
            ]
          }
        }
      },
      {
        name: 'User Profile',
        schema: {
          name: 'UserProfile',
          type: {
            kind: 'struct',
            fields: [
              { name: 'owner', type: { kind: 'primitive', primitiveType: 'pubkey' } as any },
              { name: 'name', type: { kind: 'primitive', primitiveType: 'string' } as any },
              { name: 'level', type: { kind: 'primitive', primitiveType: 'u32' } as any },
              { name: 'experience', type: { kind: 'primitive', primitiveType: 'u64' } as any },
              { name: 'items', type: { kind: 'vec', elementType: { kind: 'primitive', primitiveType: 'u32' } } }
            ]
          }
        }
      }
    ]
  }
}

/**
 * Borsh data reader
 */
class BorshReader {
  private data: Uint8Array
  private offset: number

  constructor(data: Uint8Array) {
    this.data = data
    this.offset = 0
  }

  readU8(): number {
    if (this.offset >= this.data.length) {
      throw new Error('Unexpected end of data')
    }
    return this.data[this.offset++]
  }

  readU16(): number {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 2).getUint16(0, true)
    this.offset += 2
    return value
  }

  readU32(): number {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 4).getUint32(0, true)
    this.offset += 4
    return value
  }

  readU64(): bigint {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 8).getBigUint64(0, true)
    this.offset += 8
    return value
  }

  readU128(): bigint {
    // Read as two u64s (little endian)
    const low = this.readU64()
    const high = this.readU64()
    return (high << BigInt(64)) | low
  }

  readI8(): number {
    return new Int8Array([this.readU8()])[0]
  }

  readI16(): number {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 2).getInt16(0, true)
    this.offset += 2
    return value
  }

  readI32(): number {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 4).getInt32(0, true)
    this.offset += 4
    return value
  }

  readI64(): bigint {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 8).getBigInt64(0, true)
    this.offset += 8
    return value
  }

  readI128(): bigint {
    // Read as two i64s (little endian)
    const low = this.readU64()
    const high = this.readI64()
    return (high << BigInt(64)) | low
  }

  readF32(): number {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 4).getFloat32(0, true)
    this.offset += 4
    return value
  }

  readF64(): number {
    const value = new DataView(this.data.buffer, this.data.byteOffset + this.offset, 8).getFloat64(0, true)
    this.offset += 8
    return value
  }

  readString(): string {
    const length = this.readU32()
    const bytes = this.data.slice(this.offset, this.offset + length)
    this.offset += length
    return new TextDecoder().decode(bytes)
  }

  readPubkey(): string {
    const bytes = this.data.slice(this.offset, this.offset + 32)
    this.offset += 32
    return Buffer.from(bytes).toString('base64')
  }
}

/**
 * Borsh data writer
 */
class BorshWriter {
  private buffer: number[]

  constructor() {
    this.buffer = []
  }

  writeU8(value: number): void {
    this.buffer.push(value & 0xFF)
  }

  writeU16(value: number): void {
    this.buffer.push(value & 0xFF)
    this.buffer.push((value >> 8) & 0xFF)
  }

  writeU32(value: number): void {
    this.buffer.push(value & 0xFF)
    this.buffer.push((value >> 8) & 0xFF)
    this.buffer.push((value >> 16) & 0xFF)
    this.buffer.push((value >> 24) & 0xFF)
  }

  writeU64(value: bigint | number): void {
    const bigValue = BigInt(value)
    for (let i = 0; i < 8; i++) {
      this.buffer.push(Number((bigValue >> BigInt(i * 8)) & BigInt(0xFF)))
    }
  }

  writeU128(value: bigint | number): void {
    const bigValue = BigInt(value)
    for (let i = 0; i < 16; i++) {
      this.buffer.push(Number((bigValue >> BigInt(i * 8)) & BigInt(0xFF)))
    }
  }

  writeI8(value: number): void {
    this.writeU8(value)
  }

  writeI16(value: number): void {
    this.writeU16(value)
  }

  writeI32(value: number): void {
    this.writeU32(value)
  }

  writeI64(value: bigint | number): void {
    this.writeU64(value)
  }

  writeI128(value: bigint | number): void {
    this.writeU128(value)
  }

  writeF32(value: number): void {
    const buffer = new ArrayBuffer(4)
    new DataView(buffer).setFloat32(0, value, true)
    const bytes = new Uint8Array(buffer)
    this.buffer.push(...bytes)
  }

  writeF64(value: number): void {
    const buffer = new ArrayBuffer(8)
    new DataView(buffer).setFloat64(0, value, true)
    const bytes = new Uint8Array(buffer)
    this.buffer.push(...bytes)
  }

  writeString(value: string): void {
    const encoded = new TextEncoder().encode(value)
    this.writeU32(encoded.length)
    this.buffer.push(...encoded)
  }

  writePubkey(value: string): void {
    const bytes = Buffer.from(value, 'base64')
    if (bytes.length !== 32) {
      throw new Error('Public key must be 32 bytes')
    }
    this.buffer.push(...bytes)
  }

  toArray(): Uint8Array {
    return new Uint8Array(this.buffer)
  }
}