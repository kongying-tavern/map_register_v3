/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ElForm, ElUpload } from 'element-plus'

export type AnyObject = Record<string, any>
export type AnyArray = any[]
export type AnyFunction<T = any> = (...args: AnyArray) => T
export type ElFormType = InstanceType<typeof ElForm>
export type ElUploadType = InstanceType<typeof ElUpload>
