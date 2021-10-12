import { createImmutableProxy } from './DeepProxy'
import { getStateSetError } from './utilities'

/**
 * Get all the value getters from the state - which cannot be used to set the state
 * @param {object} state - The mutable state from the original `new State()` config object
 * @param {object} computed - The dynamic values from the original `new State()` config object
 * @returns {object} - all immutable getters as a combined object
 */
export default (state, computed) => {

  // proxy can only get values, but will throw an error when trying to set
  const getters = createImmutableProxy(state)

  // turn all computed values into getters that behave the same way as above
  const computedGetters = Object.keys(computed).reduce((computedGetters, key) => {
    const allGetters = { ...getters, ...computedGetters }
    Object.defineProperty(computedGetters, key, {
      enumerable: true,
      get: () => {
        try {
          return computed[key](allGetters)
        } catch(err) {
          throw new Error(`Unable to process computed property "${key}"

- Make sure all state properties are spelled correctly.
- If it references other computed properties, make sure they are defined before this one.

Original error:

${err}`)
        }
      },
      set: () => { throw getStateSetError() },
    })
    return computedGetters
  }, {})

  // return both types of getters as one object
  return {
    ...getters,
    ...computedGetters,
  }
}
