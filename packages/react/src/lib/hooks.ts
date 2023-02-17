import { useEffect, useState } from 'react'
import { AddWatcher, State, StateHooks, Watcher } from './types'
import { getValueFromPath } from './utilities'

/**
 * Returns useful hooks as methods, concerning the provided store.
 */
export const useStore = (state: State): StateHooks => ({

  /**
   * Respond to state changes with a callback.
   * @example
   * ```js
   * const store = useStore(userStore);
   * store.useWatch('user.firstName', (newValue) => {
   *  // respond to change
   * });
   * ```
   */
  useWatch: (path: string | string[], watcherCallback: Watcher): void => {
    useEffect(() => {
      const _path = typeof path === 'string' ? path.split('.') : path
      const addWatcher = getValueFromPath(state, ['watchers', ..._path]) as AddWatcher
      addWatcher(watcherCallback)
      return () => {
        if (typeof addWatcher.destroy === 'undefined') return
        addWatcher.destroy(watcherCallback)
      }
    }, [])
  },

  /**
   * Get a value that auto-updates to stay in sync with the state.
   * @example
   * ```jsx
   * const store = useStore(userStore);
   * const firstName = store.useGet('user.firstName');
   * return (
   *  <h2>Welcome back, {firstName}</h2>
   * );
   * ```
   */
  useGet: (path: string | string[]): any => {
    const _path = typeof path === 'string' ? path.split('.') : path
    const getter = getValueFromPath(state, ['getters', ..._path])
    const [value, setValue] = useState(getter)
    useEffect(() => {
      setValue(getter)
    }, [getter])
    return value
  },

  /**
   * Dispatch a state action with the provided payload.
   * @example
   * ```jsx
   * const store = useStore(userStore);
   * const updateUser = store.useDispatcher('updateUser');
   * const handleLogin = async () => {
   *   // ...
   *   await updateUser(user);
   * };
   * return (
   *   <!-- ... -->
   *   <button onClick={handleLogin}>Login</button>
   * );
   * ```
   */
  useDispatcher: (key: string) => (payload: unknown): Promise<void> => {
    const dispatcher = state.dispatchers[key]
    return dispatcher(payload)
  },
})
