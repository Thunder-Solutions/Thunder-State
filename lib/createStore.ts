import getWatchers from './getWatchers'
import getGetters from './getGetters'
import getSetters from './getSetters'
import getDispatchers from './getDispatchers'
import connectToDevTools from './connectToDevTools'
import { StoreConfig, PrivateProps, PublicInstance } from './types'

// The factory function for creating a new state
const createStore = (config: StoreConfig): PublicInstance => {

  // clone so the user can't modify the state from the object reference they fed in
  const {
    state: protectedState = {},
    computed = {},
    actions = {},
    name,
    enableDevTools = true,
  } = structuredClone(config)

  // keep a reference to the returned object
  const publicInstance: PublicInstance = Object.seal({
    getters: {},
    watchers: {},
    dispatchers: {},
  })

  // establish an internal state for tracking things privately
  const privateProps: PrivateProps = {
    setters: {},
    queue: [],
    actionHistory: [],
    actionFuture: [],
    recordMutations: true,
    userDefinedWatchers: new Map(),
    enableDevTools: enableDevTools === true,
  }

  // add getters to the public instance so they can be accessed externally
  publicInstance.getters = getGetters(protectedState, computed)

  // group "add watcher" methods corresponding to each property,
  // so the end user can react to state changes
  publicInstance.watchers = getWatchers(publicInstance, privateProps)

  // setters are not accessible externally; they are injected via action methods
  privateProps.setters = getSetters(name, protectedState, computed, publicInstance, privateProps)

  // add dispatchers for each action defined in the state config
  publicInstance.dispatchers = getDispatchers(name, actions, publicInstance, privateProps)

  // connect to the browser dev tools extension
  if (privateProps.enableDevTools) connectToDevTools(name, publicInstance, privateProps)

  // return the public object
  return publicInstance
}

export default createStore
