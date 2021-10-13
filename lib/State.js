import getWatchers from './getWatchers'
import getGetters from './getGetters'
import getSetters from './getSetters'
import getDispatchers from './getDispatchers'
import connectToDevTools from './connectToDevTools'
import cloneDeep from 'lodash-es/cloneDeep'

class State {
  constructor({
    state = {},
    computed = {},
    actions = {},
    name,
    enableDevTools = true,
  }) {
    
    // clone so the user can't modify the state from the object they fed in
    const protectedState = cloneDeep(state)
    const publicInstance = this

    // establish an internal state for tracking things privately
    const privateProps = {
      queue: [],
      actionHistory: [],
      actionFuture: [],
      recordMutations: true,
      userDefinedWatchers: new Map(),
      enableDevTools: enableDevTools === true,
    }

    // add getters to the state so they can be accessed externally
    publicInstance.getters = getGetters(protectedState, computed)

    // group "add watcher" methods corresponding to each property,
    // so the end user can react to state changes
    publicInstance.watchers = getWatchers(publicInstance, privateProps)

    // setters are not accessible externally, except via action methods
    const setters = getSetters(name, protectedState, computed, publicInstance, privateProps)

    // add dispatchers for each action defined in the state config
    publicInstance.dispatchers = getDispatchers(name, actions, setters, privateProps)

    // connect to the browser dev tools extension
    if (privateProps.enableDevTools) {
      connectToDevTools(name, publicInstance, setters, privateProps)
    }
  }
}

// add a functional alternative for creating state
State.createState = config => new State(config)

export default State
