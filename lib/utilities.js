export const isObject = val => Object.prototype.toString.call(val) === '[object Object]'
export const withoutLast = arr => arr.slice(0, arr.length - 1)
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
 * Checks an old value against a new value. If it is an
 * object which has changed, or it has just become an object,
 * this will return true.
 */ 
export const getObjectChanged = (oldValue, newValue) => {

  const getObjectDiff = (oldObj, newObj) => {
    const oldIsObject = isObject(oldObj)
    const newIsObject = isObject(newObj)
    if (!newIsObject) return []
    const newKeys = Object.keys(newObj)
    return oldIsObject && newIsObject
      ? newKeys.filter(key => !(key in oldObj))
      : newKeys
  }
  
  const getDeepObjectDiff = (oldObj, newObj) => {
    const diff = getObjectDiff(oldObj, newObj)
    const deepDiff = [...diff]
    diff.forEach(key =>
      deepDiff.push(...getDeepObjectDiff(oldObj[key], newObj[key])))
    return deepDiff
  }

  return !!getDeepObjectDiff(oldValue, newValue).length
}

export const getStateSetError = () => new Error(`
Not allowed to set a property on the state directly.
Handle state updates by defining and dispatching actions instead.
`)

export const getValueFromPath = (obj, path, idx = 0) => {
  if (path.length === 0) return obj
  const key = path[idx]
  const value = obj[key]
  const isObj = isObject(value)
  const isLastProp = (path.length - 1) === idx
  if (!isObj && !isLastProp) throw new TypeError(
'Unable to get value from path because at least one of the properties is not an object.')
  return isLastProp ? value : getValueFromPath(value, path, idx + 1)
}
