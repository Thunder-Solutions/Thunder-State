import getWatchers from './getWatchers'
import { getValueFromPath, isObject } from './utilities.js'
import getGetters from './getGetters.js'
import getSetters from './getSetters.js'

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

    // set up actions
    const doAsyncAction = async (action, actionEntry, done) => {

      const { queue, actionHistory } = internalState

      // wait for the previous action to complete before resolving the current one
      const len = queue.length
      await (len > 1 ? queue[len - 2] : Promise.resolve())
      actionHistory.unshift(actionEntry)

      // run the user-defined action and pass in the necessary arguments
      action({
        state: setters,
        payload: actionEntry.payload,
      }, done)

      // if the done function was not defined as a parameter, automatically call it
      if (action.length < 2) done()
      await queue[len - 1]

      const { mutations } = actionEntry

      if (typeof window === 'undefined') return
      window.postMessage({
        type: 'thunderState_action',
        message: {
          stateName: name,
          name: action.name,
          mutations,
        },
      }, '*')
    }

    // set up dispatchers
    stateRef.dispatchers = {}
    Object.keys(actions).forEach(name => {
      stateRef.dispatchers[name] = payload => {
        const actionEntry = {name, payload, mutations: []}
        const { queue } = internalState

        // append this action as a promise to the queue
        let done
        queue.push(new Promise(resolve => done = resolve))
        if (queue.length > 100) queue.shift()

        // wait for the action to complete before modifying the history
        return doAsyncAction(actions[name], actionEntry, done)
      }
    })

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
