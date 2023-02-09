import { isEqual, cloneDeep } from 'lodash-es'
import { Key, MutationCb, MutationFn } from './types'

/**
 * Checks whether the given value is an object
 */
export const isObject = (val: unknown): boolean => !!val && val.toString() === '[object Object]'

/**
 * Returns a clone of the given array without the last item
 */
export const withoutLast = (arr: unknown[]): unknown[] => arr.slice(0, -1)

/**
 * Trims undefined values from the beginning and end of an array
 */
export const trimUndef = (_arr: unknown[]): unknown[] => {
  const arr = [..._arr]

  // backward
  for (let i = _arr.length - 1; i >= 0; i--) {
    if (typeof _arr[i] === 'undefined') arr.pop()
    else break
  }

  // forward
  for (const el of _arr) {
    if (typeof el === 'undefined') arr.shift()
    else break
  }

  return arr
}

/**
 * Gets the specific error to be thrown when the state is set directly
 */
export const getStateSetError = () => new Error(`
Not allowed to set a property on the state directly.
Handle state updates by defining and dispatching actions instead.
`)

/**
 * Gets the specific error to be thrown when a computed property fails to process
 */
export const getComputedError = (key: Key, err: Error) => new Error(`
Unable to process computed property "${String(key)}"
  - Make sure all state properties are spelled correctly.
  - If it references other computed properties, make sure they are defined before this one.
  - If both of the above are valid, see the original error below.

Original error:

${err}`)

/**
 * Gets the value at the end of the given path on the given object
 */
export const getValueFromPath = (obj: object, path: string[], idx: number = 0): unknown => {

  // if path is empty, just return the target
  if (path.length === 0) return obj

  // get prerequisite values
  const key = path[idx]
  const value = obj[key]
  const isObj = typeof value === 'object' || typeof value === 'function'
  const isLastProp = (path.length - 1) === idx

  // throw an error if unable to follow the path to completion
  if (!isObj && !isLastProp) throw new TypeError(
'Unable to get value from path because at least one of the parent properties is not an object.')

  // if this is not the final key in the path, keep running recursively
  return isLastProp ? value : getValueFromPath(value, path, idx + 1)
}

/**
 * Returns a "POJO" (plain-old JavaScript object) from a given non-serializeable object
 */
export const getPojo = (obj: object): object => {

  // if the provided object is an array, initialize accordingly
  const initAccumulator = Array.isArray(obj) ? [] : {}

  // return a POJO reduced from the provided object
  return Object.keys(obj).reduce((pojo, key) => {
    const value = obj[key]

    // skip this property if it's a method
    if (typeof value === 'function') return pojo

    // if this is an object or array, get nested POJO recursively
    pojo[key] = (isObject(value) || Array.isArray(value))
      ? getPojo(value)
      : value
    return pojo
  }, initAccumulator)
}

/**
 * Monkey-patches an array to capture its old and new values
 */
export const patchArray = (arr: unknown[], enableDevTools: boolean, mutate: MutationFn, callback: MutationCb) => {
  const patchedArray = cloneDeep(arr)

  // iterate over each property on the original Array prototype
  const proto = Array.prototype
  const protoKeys = Object.getOwnPropertyNames(proto)
  for (const protoKey of protoKeys) {
    const protoVal = proto[protoKey]

    // skip this iteration if necessary
    if (typeof protoVal !== 'function') continue
    if (protoKey.startsWith('__')) continue
    if (protoKey === 'constructor') continue

    // assign a method based on the original prototype
    patchedArray[protoKey] = (...args: unknown[]) => {
      let result = null

      mutate(arr, arr, (previouslyMutated) => {
        if (enableDevTools || !previouslyMutated) {

          // capture the old and new arrays
          const oldArray = cloneDeep(arr)
          result = protoVal.call(arr, ...args)
          const newArray = cloneDeep(arr)

          // only run the callback if something changed
          if (!isEqual(oldArray, newArray)) {
            callback(oldArray, newArray)
          }
        } else {
          result = protoVal.call(arr, ...args)
          callback(null, arr)
        }
      })

      // return the result of the original prototype method
      return result
    }
  }

  // return the fully patched array
  return patchedArray
}
