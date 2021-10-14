import { createDeepProxy } from './DeepProxy'
import { getStateSetError, getComputedError } from './utilities'

/**
 * Get all the value getters from the state - which cannot be used to set the state
 * @param {object} protectedState - The mutable state from the original `new State()` config object
 * @param {object} computed - The dynamic values from the original `new State()` config object
 * @returns {object} - all immutable getters as a combined object
 */
export default (protectedState, computed) => {

  // proxy can only get values, but will throw an error when trying to set
  const getters = createDeepProxy(
    protectedState,
    {
      get: (target, key, path) => {

        // if this property exists on the original state object...
        if (key in target) return target[key]

        // if this property exists as a computed value...
        const isRoot = path.length === 1
        if (isRoot && key in computed) {
          try {
            return computed[key](getters)
          } catch (err) {
            throw getComputedError(key, err)
          }
        }
      },
      set: () => { throw getStateSetError() },
    }
  )

  // return both types of getters as one object
  return getters
}
