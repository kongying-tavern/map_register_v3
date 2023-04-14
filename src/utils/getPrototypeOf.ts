export const getPrototypeOf = <T>(v: T) => {
  return Object.prototype.toString.call(v).match(/\S+(?=])/)?.[0] ?? 'unknown'
}
