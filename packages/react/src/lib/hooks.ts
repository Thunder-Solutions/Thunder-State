import { useEffect, useState } from 'react'
import { State, Watchers } from './types'

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
    watcherEffects[key] = (...args: any[]) => {
      useEffect(() => {
        const addWatcher = watchers[key];

        // @ts-ignore: this is a higher order function - the args/types are for the original function to worry about
        addWatcher(...args);

        // destroy the watcher on cleanup
        return () => { addWatcher.destroy(); };
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
export const useStore = (store: State): State => {

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
