import { getValueFromPath, isObject } from "./utilities"

/**
 * Get properties as "add watcher" methods so the end user can react to state changes
 * @param {object} publicInstance - A reference to the full constructed instance from `new State()`
 * @param {object} publicInstance.getters - The immutable getters; attempting to set throws an error
 * @param {object} privateProps - The internal state used to track various things privately
 * @param {Map} privateProps.userDefinedWatchers - Map to track watchers with "add watcher" methods used as keys
 * @returns {object} - All the "add watcher" methods corresponding to every property on the state
 */
export default ({ getters }, { userDefinedWatchers }) => {

  // create a closure so we have access to the path in the reducer
  const getReducer = (_path = []) => (watchers, key) => {
    const path = [..._path, key]

    // if the getter value is an object, recursively add child properties
    const value = getValueFromPath(getters, path)
    if (isObject(value)) {
      watchers[key] = Object.keys(value).reduce(getReducer(path), {})
    } else {

      // define the add watcher method
      const addWatcher = callback => {
        userDefinedWatchers.get(addWatcher).push(callback)
      }
      userDefinedWatchers.set(addWatcher, [])
      watchers[key] = addWatcher
    }

    // return the resulting object
    return watchers
  }

  // kick off the reducer recursion
  return Object.keys(getters).reduce(getReducer(), {})
}
