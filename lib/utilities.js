export const isObject = val => Object.prototype.toString.call(val) === '[object Object]'

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

export const getWatchers = (watcherObj, key) => {
  const watchersKey = `_${key}_watchers`
  if (!Array.isArray(watcherObj[watchersKey]))
    watcherObj[watchersKey] = []
  return watcherObj[watchersKey]
}

export const getValueFromPath = (obj, path, idx = 0) => {
  if (path.length === 0) return obj
  const key = path[idx]
  const value = obj[key]
  const isObject = isObject(value)
  const isLastProp = (path.length - 1) === idx
  if (!isObject && !isLastProp) throw new TypeError(
'Unable to get value from path because at least one of the properties is not an object.')
  return isLastProp ? value : getValueFromPath(value, path, idx + 1)
}
