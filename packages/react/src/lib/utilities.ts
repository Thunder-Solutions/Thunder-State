/**
 * Use this to get the value at the end of a property chain via an array of keys.
 */
export const getValueFromPath = (obj: object, path: string[], idx: number = 0) => {
  if (!Array.isArray(path)) {
    const ERROR_MESSAGE = 'Unable to get value from path because the path must be an array of strings.'
    throw new TypeError(ERROR_MESSAGE)
  }
  if (path.length === 0) return obj
  const key = path[idx]
  const value = obj[key]
  const isObject = (typeof value === 'object' && value !== null) || typeof value === 'function'
  const isLastProp = (path.length - 1) === idx
  if (!isObject && !isLastProp) {
    const ERROR_MESSAGE = 'Unable to get value from path because at least one of the properties in the chain is not an object.'
    throw new TypeError(ERROR_MESSAGE)
  }
  return isLastProp ? value : getValueFromPath(value, path, idx + 1)
}
