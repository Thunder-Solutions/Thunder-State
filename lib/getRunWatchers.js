import { getValueFromPath, trimUndef } from './utilities'

/**
 * Prepares the runWatchers function with prerequisite data and a closure
 * @param {string} name - The name of the state instance
 * @param {object} computed - The dynamic values from the original `new State()` config object
 * @param {object} publicInstance - A reference to the full constructed instance from `new State()`
 * @param {object} privateProps - The state used to track various things privately
 * @param {Map} privateProps.userDefinedWatchers - Map to track watchers with "add watcher" methods used as keys
 * @param {boolean} privateProps.enableDevTools - Flag for whether to enable time travel with the browser extension
 * @returns {function} - the runWatchers function
 */
export default (name, computed, publicInstance, { userDefinedWatchers, enableDevTools }) => {

  // store previous values from computed properties
  const { getters } = publicInstance
  const prevComputed = Object.keys(computed).reduce((acc, cKey) => {
    const cValue = getters[cKey]
    acc[cKey] = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue
    return acc
  }, {})

  /**
   * The runWatchers function triggers user-defined watcher methods for the given property
   * @param {object|Array} target - The parent object of the property being changed
   * @param {Array<string>} path - The object key path of the property being changed
   * @param {*} _newValue - The new value being assigned to the given property
   */
  return (target, path, _newValue) => {
    const { getters, watchers } = publicInstance

    // handle array watchers by passing the entire array
    // instead of just the one value in the array
    const parent = getValueFromPath(getters, path)
    const newValue = Array.isArray(target) ? parent : _newValue
    const watcherValue = Array.isArray(newValue) ? trimUndef(newValue) : newValue

    // call the watchers directly attached to this property
    const addWatcher = getValueFromPath(watchers, path)
    const _watchers = userDefinedWatchers.get(addWatcher)
    _watchers.forEach(watcher =>
      watcher(watcherValue, () => { addWatcher.destroy(watcher) }))

    // call the watchers of all computed properties that use this property
    for (const cKey in computed) {
      const cValue = getters[cKey]
      const _cValue = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue
      if (prevComputed[cKey] === _cValue) continue
      const cWatchers = userDefinedWatchers.get(watchers[cKey])
      cWatchers.forEach(watcher =>
        watcher(cValue, () => destroyWatcher(cWatchers, watcher)))

      // tell the browser extension about the new computed value
      if (!enableDevTools || typeof window === 'undefined') continue
      window.postMessage({
        type: 'thunderState_computed',
        message: {
          stateName: name,
          key: cKey,
          value: cValue,
        },
      }, '*')
    }
  }
}
