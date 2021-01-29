/* eslint-disable camelcase */
import { DownloadProgress } from 'ky'

export interface ListEntry {
  hash: string
  path: string
  contentType: string
  size: number
  mod_time: string
}

export interface ListResult {
  common_prefixes?: Array<string>
  entries?: Array<ListEntry>
}

export interface KyOptions {
  timeout?: number | false
  headers?: Record<string, any>
  onDownloadProgress?: (progress: DownloadProgress, chunk: Uint8Array) => void
}

export type BzzMode = 'default' | 'immutable' | 'raw'

export interface FileOptions extends KyOptions {
  contentType?: string
  path?: string
  mode?: BzzMode
}

export type DownloadOptions = FileOptions

export interface UploadOptions extends FileOptions {
  fileName?: string
  defaultPath?: string
  manifestHash?: string
  size?: number
}

export interface BzzConfig {
  timeout?: number
  url: string
}
