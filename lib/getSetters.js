import { createDeepProxy } from './DeepProxy'
import getRunWatchers from './getRunWatchers'

/**
 * Get state as setters so we can intercept the mutations as they occur.
 * @param {object} state - The mutable state from the original `new State()` config object
 * @param {object} computed - The dynamic values from the original `new State()` config object
 * @returns {object} - A non-extensible object used to set values on the state
 */
export default (state, computed, stateRef, internalState) => Object.seal(createDeepProxy(
  state,
  {
    set: (target, key, newValue, path) => {
      const oldValue = target[key]

      // do nothing if there is nothing to change
      if (oldValue === newValue) return true

      // prepare watchers before mutating the state
      const runWatchers = getRunWatchers(computed, stateRef, internalState)

      // track the mutation in the action history
      const { recordMutations, actionHistory } = internalState
      if (recordMutations) {
        const mutation = {oldValue, newValue, path}
        actionHistory[0].mutations.push(mutation)
      }

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
