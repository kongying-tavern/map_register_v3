/* eslint-disable @typescript-eslint/no-explicit-any */

export type AnyObject = Record<string, any>
export type AnyArray = any[]
export type AnyFunction<T = any> = (...args: AnyArray) => T
