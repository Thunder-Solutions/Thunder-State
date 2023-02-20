import { AddWatcher, Key, PrivateProps, Store, Watcher, Watchers } from './types'
import { getValueFromPath, isObject } from './utilities'

/**
 * Get properties as "add watcher" methods so the end user can react to state changes
 */
export default <UserDefinedState extends object>({ getters }: Store<UserDefinedState>, { userDefinedWatchers }: PrivateProps<UserDefinedState>) => {

  // create a closure so we have access to the path in the reducer
  const getReducer = (_path: Key[] = []) => (watchers: Watchers, key: Key) => {
    const path = [..._path, key]

    // define the add watcher method
    const addWatcher: AddWatcher = (callback: Watcher) => {
      userDefinedWatchers.get(addWatcher)?.add(callback)
    }
    const _watchers: Set<Watcher> = new Set()
    userDefinedWatchers.set(addWatcher, _watchers)
    watchers[key] = addWatcher
    watchers[key].destroy = (watcher: Watcher) => new Promise(resolve => {

      // use 0 timeout to avoid interfering with async actions
      setTimeout(() => {
        resolve(_watchers.delete(watcher))
      })
    })

    // if the getter value is an object, recursively add child properties
    const value = getValueFromPath(getters, path)
    if (isObject(value)) {
      const nestedWatchers = Object.keys(value).reduce(getReducer(path), {})
      const currentWatcherObj = watchers[key]
      for (const key in nestedWatchers) {
        currentWatcherObj[key] = nestedWatchers[key]
      }
    }

    // return the resulting object
    return watchers
  }

  // kick off the reducer recursion
  return Object.keys(getters).reduce(getReducer(), {})
}
