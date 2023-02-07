import cloneDeep from 'lodash-es/cloneDeep'
import { createDeepProxy } from './DeepProxy'
import getGetters from './getGetters'
import getRunWatchers from './getRunWatchers'
import { ComputedArg, Key, PrivateProps, PublicInstance, Setters, StateArg } from './types'
import { patchArray, withoutLast } from './utilities'

/**
 * Get state as setters so we can intercept the mutations as they occur.
 */
export default (name: string, protectedState: StateArg, computed: ComputedArg, publicInstance: PublicInstance, privateProps: PrivateProps): Setters => {
  const { enableDevTools } = privateProps

  // a reusable function to add a mutation to the action entry in the history
  const recordHistory = (oldValue: unknown, newValue: unknown, path: Key[], { recordMutations, actionHistory }: PrivateProps) => {
    if (!recordMutations || !enableDevTools) return
    actionHistory[0].mutations.push({
      oldValue: cloneDeep(oldValue),
      newValue: cloneDeep(newValue),
      path,
    })
  }

  // track mutations within the current event loop to prevent
  // single mutations from triggering more than once.
  const mutated = new Map()
  const mutate = (target: object, newValue: unknown, mutateCallback: (mutated?: unknown) => void) => {

    // if this isn't an array, run the mutation without extras
    if (!Array.isArray(target)) {
      mutateCallback()

      // refresh the getters proxy if this was an array reassignment
      if (Array.isArray(newValue)) {
        publicInstance.getters = getGetters(protectedState, computed)
      }
    }

    // run the mutation, pass in the "previously mutated" boolean
    mutateCallback(mutated.get(target))

    // set mutated boolean for the current thread
    mutated.set(target, true)

    // reset mutated boolean at the end of the event loop
    setTimeout(() => {
      mutated.set(target, false)
    }, 0)
  }

  // seal and proxy the state so it's non-extensible and intercepts mutations
  return Object.seal(createDeepProxy(
    protectedState,
    {
      get: (target, key, path) => {

        // if this isn't an array, just return the value normally
        const targetIsArray = Array.isArray(target)
        const valueIsArray = Array.isArray(target[key])
        if (!targetIsArray && !valueIsArray) return target[key]

        // prepare watchers before mutating the state
        const runWatchers = getRunWatchers(name, computed, publicInstance, privateProps)

        // monkey-patch array methods to intercept mutations
        const arr = valueIsArray ? target[key] : target
        const patchedArray = patchArray(arr, enableDevTools, mutate, (oldArray: unknown[], newArray: unknown[]) => {
          const watcherPath = withoutLast(path)
          recordHistory(oldArray, newArray, watcherPath, privateProps)
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
        const runWatchers = getRunWatchers(name, computed, publicInstance, privateProps)

        // track the mutation in the action history
        recordHistory(oldValue, newValue, path, privateProps)

        // apply the mutation
        mutate(target, newValue, () => {
          target[key] = newValue
        })

        // trigger the watchers for all impacted properties
        const watcherPath = Array.isArray(target) ? withoutLast(path) : path
        runWatchers(target, watcherPath, newValue)

        // if this mutation happened as a result of time travel,
        // turn "record mutations" back on
        privateProps.recordMutations = true

        // indicate success
        return true
      }
    }
  ))
}
