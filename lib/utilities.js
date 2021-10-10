import { isEqual, cloneDeep } from 'lodash-es'

/**
 * Checks whether the given value is an object
 * @param {*} val - The value to test
 * @returns {boolean} - True if the value is an object
 */
export const isObject = val => Object.prototype.toString.call(val) === '[object Object]'

/**
 * Returns a clone of the given array without the last item
 * @param {Array} arr - The reference array
 * @returns {Array} - A copy of the array without the last item
 */
export const withoutLast = arr => arr.slice(0, arr.length - 1)

/**
 * Trims undefined values from the beginning and end of an array
 * @param {Array} _arr - The reference array
 * @returns {Array} - A trimmed copy of the array
 */
export const trimUndef = _arr => {
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
 * Compares values to see if they are objects and whether they changed shape
 * @param {*} oldValue - The old value to compare
 * @param {*} newValue - The new value to compare
 * @returns {boolean} - True if the object has changed shape, or the value became an object
 */ 
export const getObjectChanged = (oldValue, newValue) => {

  // get a list of diffs
  const getObjectDiff = (oldObj, newObj) => {
    const oldIsObject = isObject(oldObj)
    const newIsObject = isObject(newObj)

    // if the new value is not an object, return 0 diffs
    if (!newIsObject) return []

    // return all the freshly added keys as diffs
    const newObjKeys = Object.keys(newObj)
    return oldIsObject && newIsObject
      ? newObjKeys.filter(key => !(key in oldObj))
      : newObjKeys
  }
  
  // get a list of diffs in child properties also
  const getDeepObjectDiff = (oldObj, newObj) => {
    const diff = getObjectDiff(oldObj, newObj)

    // check all child properties recursively
    const deepDiff = [...diff]
    diff.forEach(key =>
      deepDiff.push(...getDeepObjectDiff(oldObj[key], newObj[key])))

    // return ALL diffs
    return deepDiff
  }

  // if there's any diffs in the list at all, return true
  return !!getDeepObjectDiff(oldValue, newValue).length
}

/**
 * Gets the specific error to be thrown when the state is set directly
 * @returns {Error} - The error to be thrown when the state is set directly
 */
export const getStateSetError = () => new Error(`
Not allowed to set a property on the state directly.
Handle state updates by defining and dispatching actions instead.
`)

/**
 * Gets the value at the end of the given path on the given object
 * @param {object} obj - The reference object
 * @param {Array<string>} path - The list of keys to follow (from object dot-notation)
 * @param {number} idx - The index of the current key in the path
 * @returns {*} - The value at the end of the given path on the given object
 */
export const getValueFromPath = (obj, path, idx = 0) => {

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
 * @param {object|Array} obj - The (potentially) non-serializeable object to convert
 * @returns {object} - The "POJO" converted from the given object
 */
export const getPojo = obj => {

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
 * @param {Array} arr - The reference array
 * @param {function} callback - Runs when any method is called; old and new values are passed in
 * @returns {Array} - A monkey-patched copy of the given array
 */
export const patchArray = (arr, enableDevTools, mutate, callback) => {
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
    patchedArray[protoKey] = (...args) => {
      let result = null

      mutate(arr, (previouslyMutated) => {
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
