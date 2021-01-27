declare module 'merge-options' {
  export default function mergeOptions (config: Record<string, any>, ...options: Array<Record<string, any>>): Record<string, any>
}
