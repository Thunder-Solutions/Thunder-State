import getWatchers from './getWatchers'
import getGetters from './getGetters'
import getSetters from './getSetters'
import getDispatchers from './getDispatchers'
import connectToDevTools from './connectToDevTools'

export default class State {
  constructor({
    state = {},
    computed = {},
    actions = {},
    name,
  }) {
    const stateRef = this

    // establish an internal state for tracking things privately
    const internalState = {
      queue: [],
      actionHistory: [],
      actionFuture: [],
      recordMutations: true,
      userDefinedWatchers: new Map(),
    }

    // add getters to the state so they can be accessed externally
    const getters = stateRef.getters = getGetters(state, computed)

    // group "add watcher" methods corresponding to each property,
    // so the end user can react to state changes
    stateRef.watchers = getWatchers(getters, internalState)

    // setters are not accessible externally, except via action methods
    const setters = getSetters(state, computed, stateRef, internalState)

    // add dispatchers for each action defined in the state config
    stateRef.dispatchers = getDispatchers(name, actions, setters, internalState)

    // connect to the browser dev tools extension
    connectToDevTools(name, getters, internalState) 
  }
}
