import getWatchers from './getWatchers'
import getGetters from './getGetters'
import getSetters from './getSetters'
import getDispatchers from './getDispatchers'
import connectToDevTools from './connectToDevTools'
import { deepClone } from './utilities'
import { StoreConfig, PrivateProps, Store, ComputedArg } from './types'
import { createDeepProxy } from './proxy/deepProxy'

// The factory function for creating a new state
const createStore = <UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>>(
  {
    actions: _actions = {},
    computed: _computed = {} as UserDefinedComputed,
    ...config
  }: StoreConfig<UserDefinedState, UserDefinedComputed>,
): Store<UserDefinedState, UserDefinedComputed> => {

  // clone to create a private reference that can't be mutated from outside
  const {
    state: protectedState,
    name,
    enableDevTools = true,
  } = deepClone(config) as StoreConfig<UserDefinedState, UserDefinedComputed>

  // shallow clone objects with methods
  const actions = { ..._actions }
  const computed = { ..._computed }

  // keep a reference to the returned object
  const publicInstance: Store<UserDefinedState, UserDefinedComputed> = Object.seal({
    getters: createDeepProxy({ ...protectedState, ...computed }, {}),
    watchers: {},
    dispatchers: {},
  })

  // establish an internal state for tracking things privately
  const privateProps: PrivateProps<UserDefinedState> = {
    setters: createDeepProxy(protectedState, {}),
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
