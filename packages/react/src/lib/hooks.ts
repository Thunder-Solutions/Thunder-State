import { useEffect, useState } from 'react'

// TODO: after the core package is published, import this as a peer dependency
import { ComputedArg, Store, Watcher, Watchers } from '../../../core/src/index'

/**
 * Local function to wrap all watchers on the state with the useEffect hook from React
 */
const wrapWatchersInEffects = (watchers: Watchers): Watchers => {
  const watcherEffects = {};
  for (const key in watchers) {

    // Don't wrap `destroy()` methods
    if (key === 'destroy') {
      watcherEffects[key] = watchers[key];
      continue;
    }

    // Wrap each watcher in useEffect
    watcherEffects[key] = (watcher: Watcher) => {
      useEffect(() => {
        const addWatcher = watchers[key];

        let isActive = true
        const _watcher: Watcher = (newVal, destroy) => {
          if (!isActive) destroy();
          else watcher(newVal, destroy);
        };
        addWatcher(_watcher);

        // set the flag to make sure watcher is destroyed on cleanup
        return () => { isActive = false };
      }, [watchers[key]]);
    };

    // Recursively assign subproperties the same way
    for (const subKey in watchers[key]) {
      watcherEffects[key][subKey] = wrapWatchersInEffects(watchers[key][subKey])
    }
  }
  return watcherEffects;
}

/**
 * A React hook for safely using a Thunder State store in a component function
 */
export const useStore = <UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>>(
  store: Store<UserDefinedState, UserDefinedComputed>,
): Store<UserDefinedState, UserDefinedComputed> => {

  // Track Thunder State as React State
  const [getters, updateGetters] = useState(store.getters);

  // Keep local React state in sync with Thunder State
  useEffect(() => {
    updateGetters(store.getters);
  }, [store.getters]);

  return {
    getters,
    watchers: wrapWatchersInEffects(store.watchers),
    dispatchers: store.dispatchers,
  };
}
