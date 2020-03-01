import cloneDeep from 'lodash-es/cloneDeep'
import {getStateSetError, getWatchers} from './utilities.js'
import {createImmutableProxy, createDeepProxy} from './DeepProxy.js'

export default class State {
  constructor({
    state = {},
    computed = {},
    actions = {},
    debugVariable,
  }) {
    state = cloneDeep(state)
    const queue = []
    const actionHistory = []
    const actionFuture = []
    let recordMutations = true

    // set up getters
    const immutableState = this.getters = createImmutableProxy(state)
    const stateRef = this
    Object.keys(computed).forEach(key => {
      Object.defineProperty(stateRef.getters, key, {
        enumerable: true,
        get: () => computed[key](immutableState),
        set: () => { throw getStateSetError() },
      })
    })

    // set up setters
    const stateProxy = createDeepProxy(
      state,
      { set: (target, key, value) => {
        if (recordMutations) {
          const mutation = {value: target[key], ref: [target, key]}
          actionHistory[0].mutations.push(mutation)
        }
        const prevComputed = Object.keys(computed).reduce((acc, cKey) => {
          acc[cKey] = stateRef.getters[cKey]
          return acc
        }, {})
        target[key] = value

        // call the watchers directly attached to this property
        getWatchers(target, key).forEach(watcher => watcher(value))

        // call the watchers of all computed properties that use this property
        Object.keys(computed).forEach(cKey => {
          const cValue = stateRef.getters[cKey]
          if (prevComputed[cKey] === cValue) return
          getWatchers(state, cKey).forEach(watcher => watcher(cValue))
        })
        recordMutations = true
      }}
    )
    Object.seal(stateProxy)

    // set up watchers
    this.watchers = {}
    const setupWatchers = (srcObj, targetObj, watcherObj) => Object.keys(srcObj).forEach(key => {
      if (typeof srcObj[key] === 'object') {
        targetObj[key] = {}
        return setupWatchers(srcObj[key], targetObj[key], watcherObj[key])
      }
      Object.defineProperty(targetObj, key, {
        enumerable: true,
        value: callback => {
          getWatchers(watcherObj, key).push(callback)
        },
      })
    })
    setupWatchers(this.getters, this.watchers, state)

    // set up actions
    const doAsyncAction = async (action, actionEntry, done) => {

      // wait for the previous action to complete before resolving the current one
      const len = queue.length
      await (len > 1 ? queue[len - 2] : Promise.resolve())
      actionHistory.unshift(actionEntry)
      action({
        state: stateProxy,
        payload: actionEntry.payload,
      }, done)

      // if the done function was not defined as a parameter, automatically call it
      if (action.length < 2) done()
      await queue[len - 1]
    }

    // set up dispatchers
    this.dispatchers = {}
    Object.keys(actions).forEach(name => {
      this.dispatchers[name] = payload => {
        const actionEntry = {name, payload, mutations: []}
  
        // append this action as a promise to the queue
        let done
        queue.push(new Promise(resolve => done = resolve))
        if (queue.length > 100) queue.shift()
  
        // wait for the action to complete before modifying the history
        return doAsyncAction(actions[name], actionEntry, done)
      }
    })

    // set up debugging tools only if in debug mode
    if (!debugVariable) return Object.freeze(this)

    // set up time travel
    this.timeTravel = num => {
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
          const [target, key] = mutation.ref
          recordMutations = false
          const oldVal = target[key]
          target[key] = mutation.value
          mutation.value = oldVal
        })
        fromActions.shift()
        toActions.unshift(action)

        return idx === finalIdx
      })
    }

    // don't allow the dev to misuse the state object
    window[debugVariable] = Object.freeze(this)
  }
}