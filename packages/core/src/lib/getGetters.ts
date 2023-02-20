import { createDeepProxy } from './proxy/deepProxy'
import { ComputedArg, ComputedGetters } from './types'
import { getStateSetError, getComputedError } from './utilities'

/**
 * Get all the value getters from the state - which cannot be used to set the state
 */
export default <UserDefinedState extends object, UserDefinedComputed extends object>(
  protectedState: UserDefinedState,
  computed: ComputedArg<UserDefinedState>,
): UserDefinedState & ComputedGetters<UserDefinedComputed> => {

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
  return getters as UserDefinedState & ComputedGetters<UserDefinedComputed>
}
