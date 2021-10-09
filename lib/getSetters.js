import { createDeepProxy } from './DeepProxy'
import getRunWatchers from './getRunWatchers'
import { patchArray, withoutLast } from './utilities'

/**
 * Get state as setters so we can intercept the mutations as they occur.
 * @param {object} state - The mutable state from the original `new State()` config object
 * @param {object} computed - The dynamic values from the original `new State()` config object
 * @param {object} stateRef - A reference to the full constructed instance from `new State()`
 * @param {object} internalState - The state used to track various things privately
 * @returns {object} - A non-extensible object used to set values on the state
 */
export default (state, computed, stateRef, internalState) => {

  // a reusable function to add a mutation to the action entry in the history
  const recordHistory = (oldValue, newValue, path, { recordMutations, actionHistory }) => {
    if (!recordMutations) return
    const mutation = {oldValue, newValue, path}
    actionHistory[0].mutations.push(mutation)
  }

  // seal and proxy the state so it's non-extensible and intercepts mutations
  return Object.seal(createDeepProxy(
    state,
    {
      get: (target, key, path) => {

        // if this isn't an array, just return the value normally
        const targetIsArray = Array.isArray(target)
        const valueIsArray = Array.isArray(target[key])
        if (!targetIsArray && !valueIsArray) return target[key]

        // prepare watchers before mutating the state
        const runWatchers = getRunWatchers(computed, stateRef, internalState)

        // monkey-patch array methods to intercept mutations
        const arr = valueIsArray ? target[key] : target
        const patchedArray = patchArray(arr, (oldArray, newArray) => {
          const watcherPath = withoutLast(path)
          recordHistory(oldArray, newArray, watcherPath, internalState)
          runWatchers(arr, watcherPath, newArray)
        })

        // return the monkey-patched array
        return valueIsArray ? patchedArray : patchedArray[key]
      },
      set: (target, key, newValue, path) => {
        const oldValue = target[key]

        // do nothing if there is nothing to change
        if (oldValue === newValue) return true

        // prepare watchers before mutating the state
        const runWatchers = getRunWatchers(computed, stateRef, internalState)

        // track the mutation in the action history
        recordHistory(oldValue, newValue, path, internalState)

        // apply the mutation
        target[key] = newValue

        // trigger the watchers for all impacted properties
        runWatchers(target, path, newValue)

        // if this mutation happened as a result of time travel,
        // turn "record mutations" back on
        internalState.recordMutations = true

        // indicate success
        return true
      }
    }
  ))
}
