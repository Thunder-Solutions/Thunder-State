import { getValueFromPath, trimUndef } from './utilities'

/**
 * Prepares the runWatchers function with prerequisite data and a closure
 * @param {string} name - The name of the state instance
 * @param {object} computed - The dynamic values from the original `new State()` config object
 * @param {object} stateRef - A reference to the full constructed instance from `new State()`
 * @param {object} internalState - The state used to track various things privately
 * @param {Map} internalState.userDefinedWatchers - Map to track watchers with "add watcher" methods used as keys
 * @returns {function} - the runWatchers function
 */
export default (name, computed, stateRef, { userDefinedWatchers, enableDevTools }) => {

  // store previous values from computed properties
  const prevComputed = Object.keys(computed).reduce((acc, cKey) => {
    const cValue = stateRef.getters[cKey]
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

    // handle array watchers by passing the entire array
    // instead of just the one value in the array
    const parent = getValueFromPath(stateRef.getters, path)
    const newValue = Array.isArray(target) ? parent : _newValue
    const watcherValue = Array.isArray(newValue) ? trimUndef(newValue) : newValue

    // define destroy function for cleanup
    const destroyWatcher = (_watchers, ref) => {
      const idx = _watchers.findIndex(watcher => watcher === ref)

      // use 0 timeout to avoid interfering with the current stack
      setTimeout(() => _watchers.splice(idx, 1), 0)
    }

    // call the watchers directly attached to this property
    const addWatcher = getValueFromPath(stateRef.watchers, path)
    const _watchers = userDefinedWatchers.get(addWatcher)
    _watchers.forEach(watcher =>
      watcher(watcherValue, () => destroyWatcher(_watchers, watcher)))

    // call the watchers of all computed properties that use this property
    Object.keys(computed).forEach(cKey => {
      const cValue = stateRef.getters[cKey]
      const _cValue = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue
      if (prevComputed[cKey] === _cValue) return
      const cAddWatcher = stateRef.watchers[cKey]
      const _cWatchers = userDefinedWatchers.get(cAddWatcher)
      _cWatchers.forEach(watcher =>
        watcher(cValue, () => destroyWatcher(_cWatchers, watcher)))
      
      // tell the browser extension about the new computed value
      if (!enableDevTools || typeof window === 'undefined') return
      window.postMessage({
        type: 'thunderState_computed',
        message: {
          stateName: name,
          key: cKey,
          value: cValue,
        },
      }, '*')
    })
  }
}
