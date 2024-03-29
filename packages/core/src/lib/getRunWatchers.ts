import { AddWatcher, ComputedArg, Key, PrivateProps, PublicInstance, Watcher } from './types'
import { getValueFromPath, trimUndef } from './utilities'

/**
 * Prepares the runWatchers function with prerequisite data and a closure
 */
export default (name: string, computed: ComputedArg, publicInstance: PublicInstance, { userDefinedWatchers, enableDevTools }: PrivateProps) => {

  // store previous values from computed properties
  const { getters } = publicInstance
  const prevComputed = Object.keys(computed).reduce((acc, cKey) => {
    const cValue = getters[cKey]
    acc[cKey] = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue
    return acc
  }, {})

  /**
   * The runWatchers function triggers user-defined watcher methods for the given property
   */
  return (target, path, _newValue) => {
    const { getters, watchers } = publicInstance

    // handle array watchers by passing the entire array
    // instead of just the one value in the array
    const parent = getValueFromPath(getters, path)
    const newValue = Array.isArray(target) ? parent : _newValue
    const watcherValue = Array.isArray(newValue) ? trimUndef(newValue) : newValue

    // call the watchers directly attached to this property (and its parents)
    for (const idxStr in path) {

      // build the current full path of this iteration
      const idx = Number(idxStr)
      const _path: Key[] = []
      for (let i = 0; i <= idx; i++) {
        _path.push(path[i])
      }

      // call the watchers at the current path
      const addWatcher = getValueFromPath(watchers, _path) as AddWatcher
      const _watchers: Set<Watcher> = userDefinedWatchers.get(addWatcher) ?? new Set()
      _watchers.forEach(watcher =>
        watcher(watcherValue, () => { addWatcher.destroy(watcher) }))
    }

    // call the watchers of all computed properties that use this property
    for (const cKey in computed) {
      const cValue = getters[cKey]
      const _cValue = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue
      if (prevComputed[cKey] === _cValue) continue
      const cWatchers = userDefinedWatchers.get(watchers[cKey]) ?? new Set()
      cWatchers.forEach(watcher =>
        watcher(cValue, destroyWatcher => destroyWatcher(watcher)))

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
