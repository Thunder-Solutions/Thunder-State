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
    { set: () => { throw getStateSetError() } },
  )

  // add computed values to the getters proxy as well
  for (const key in computed) {
    Object.defineProperty(getters, key, {
      enumerable: true,
      get: () => {

        // if this property exists as a computed value...
        if (key in computed) {
          try {
            return computed[key](getters)
          } catch (err) {
            throw getComputedError(key, err)
          }
        }
      },
      set: () => { throw getStateSetError() },
    })
  }

  // return both types of getters as one object
  return getters
}
