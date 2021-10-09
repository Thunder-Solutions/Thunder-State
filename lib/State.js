import getWatchers from './getWatchers'
import { getValueFromPath, isObject, getPojo } from './utilities'
import getGetters from './getGetters'
import getSetters from './getSetters'
import getDispatchers from './getDispatchers'
import getTimeTravel from './getTimeTravel'

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

    // if no window exists, skip this section
    if (typeof window === 'undefined') return

    // send the initial state to the browser extension
    window.postMessage({
      type: 'thunderState_initState',
      message: {
        stateName: name,
        state: getPojo(stateRef.getters),
      }
    }, '*')

    // set up time travel
    const timeTravel = getTimeTravel(internalState)

    // update the state if time traveled from extension
    window.addEventListener('message', event => {
      const data = event.data
      const dataIsObject = data && isObject(data)
      const dataIsValid = event.source === window && dataIsObject
      const {type, stateName, message} = data
      const isType = dataIsValid && type === 'thunderState_timeTravel'
      if (!isType || stateName !== name) return
      const {index, isRewinding} = message
      const lastIdx = isRewinding ? (index > 0 ? -index : -1) : index + 1
      timeTravel(lastIdx)
    })

  }
}
