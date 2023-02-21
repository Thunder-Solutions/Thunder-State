import { AddWatcher, ComputedArg, Key, PrivateProps, Store, Watcher, Watchers } from './types'
import { getValueFromPath, isObject } from './utilities'

/**
 * Get properties as "add watcher" methods so the end user can react to state changes
 */
export default <UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>>(
  { getters }: Store<UserDefinedState, UserDefinedComputed>,
  { userDefinedWatchers }: PrivateProps<UserDefinedState>,
): Watchers => {

  // create a closure so we have access to the path in the reducer
  const getReducer = (_path: Key[] = []) => (watchers: Watchers, key: Key) => {
    const path = [..._path, key]

    // if the getter value is an object, recursively add child properties
    const value = getValueFromPath(getters, path)
    const nestedWatchers = isObject(value)
      ? Object.keys(value).reduce(getReducer(path), {})
      : {}

    // define the add watcher method
    const addWatcher: AddWatcher = Object.assign((callback: Watcher) => {
      userDefinedWatchers.get(addWatcher)?.add(callback)
    }, nestedWatchers)

    const addedWatchers: Set<Watcher> = new Set()
    userDefinedWatchers.set(addWatcher, addedWatchers)

    watchers[key] = addWatcher

    // return the resulting object
    return watchers
  }

  // kick off the reducer recursion
  return Object.keys(getters).reduce(getReducer(), {})
}
