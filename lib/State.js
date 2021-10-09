import getWatchers from './getWatchers'
import { getValueFromPath, isObject } from './utilities'
import getGetters from './getGetters'
import getSetters from './getSetters'
import getDispatchers from './getDispatchers'

export default class State {
  constructor({
    state = {},
    computed = {},
    actions = {},
    name,
  }) {
    const stateRef = this

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

    // set up time travel
    const timeTravel = num => {
      const { actionHistory, actionFuture } = internalState
      const isRewinding = num < 0
      const absNum = Math.abs(num)
      const maxNum = isRewinding ? actionHistory.length : actionFuture.length
      const finalIdx =
        absNum >= maxNum ? maxNum - 1
        : absNum > 0 ? absNum - 1 : 0
      const actions = isRewinding ? [...actionHistory] : [...actionFuture]

      actions.some((action, idx) => {
        const fromActions = isRewinding ? actionHistory : actionFuture
        const toActions = isRewinding ? actionFuture : actionHistory

        action.mutations.forEach(mutation => {
          internalState.recordMutations = false
          const { oldValue, newValue, path } = mutation
          const parentPath = path.length > 1 ? path.slice(0, path.length - 1) : []
          const lastKey = path[path.length - 1]
          const ref = getValueFromPath(setters, parentPath)
          ref[lastKey] = isRewinding ? oldValue : newValue
        })
        fromActions.shift()
        toActions.unshift(action)

        return idx === finalIdx
      })
    }

    // evaluate all the getters to get a JSON-ifiable object
    const evaluateGetters = (getters, asArray = false) => {
      const accumulator = asArray ? [] : {}
      const evaluatedGetters = Object.keys(getters).reduce((accumulator, key) => {
        const evaluatedResult = getters[key]
        const isArray = Array.isArray(evaluatedResult)
        const isObjOrArr = evaluatedResult
          && (isObject(evaluatedResult.constructor) || isArray)
        accumulator[key] = isObjOrArr
          ? evaluateGetters(evaluatedResult, isArray)
          : evaluatedResult
        return accumulator
      }, accumulator)
      return evaluatedGetters
    }

    // if no window exists, skip this section
    if (typeof window === 'undefined') return

    // send the initial state to the browser extension
    window.postMessage({
      type: 'thunderState_initState',
      message: {
        stateName: name,
        state: evaluateGetters(stateRef.getters),
      }
    }, '*')

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
