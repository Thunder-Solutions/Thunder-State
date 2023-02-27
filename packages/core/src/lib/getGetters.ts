import { createDeepProxy } from './proxy/deepProxy'
import { ComputedArg, ComputedGetters } from './types'
import { getStateSetError, getComputedError } from './utilities'

/**
 * Get all the value getters from the state - which cannot be used to set the state
 */
const getGetters = <UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>>(
  protectedState: UserDefinedState,
  computed: UserDefinedComputed,
): UserDefinedState & ComputedGetters<UserDefinedComputed> => {

  // proxy can only get values, but will throw an error when trying to set
  const getters = createDeepProxy(
    protectedState,
    { set: () => { throw getStateSetError() } },
  )

  // convert computed functions into getters
  // (so they can be referenced without manually running the function)
  const computedGetters = {}
  for (const key in computed) {
    Object.defineProperty(computedGetters, key, {
      enumerable: true,
      get: () => {

        // if this property exists as a computed value...
        if (key in computed) {
          try {
            return computed[key]({ ...getters, ...computedGetters })
          } catch (err) {
            throw getComputedError(key, err)
          }
        }
      },
      set: () => { throw getStateSetError() },
    })
  }

  // return both types of getters as one object
  return Object.seal({
    ...getters,
    ...computedGetters as ComputedGetters<UserDefinedComputed>,
  })
}

export default getGetters
