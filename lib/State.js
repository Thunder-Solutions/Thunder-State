import cloneDeep from 'lodash-es/cloneDeep'
import isEqual from 'lodash-es/isEqual'
import {getStateSetError, getWatchers, getValueFromPath, isObject} from './utilities.js'
import {createImmutableProxy, createDeepProxy} from './DeepProxy.js'

export default class State {
  constructor({
    state = {},
    computed = {},
    actions = {},
    name,
  }) {
    state = cloneDeep(state)
    const queue = []
    const actionHistory = []
    const actionFuture = []
    let recordMutations = true

    // set up getters
    const stateRef = this
    stateRef.getters = createImmutableProxy(state)
    Object.keys(computed).forEach(key => {
      Object.defineProperty(stateRef.getters, key, {
        enumerable: true,
        get: () => computed[key](stateRef.getters),
        set: () => { throw getStateSetError() },
      })
    })

    // set up setters
    const stateProxy = createDeepProxy(
      state,
      {
        get(target, key, path) {
          if (!Array.isArray(target[key])) return target[key]
          return new Proxy(target[key], {
            get: (arrTarget, arrPropKey) => {
              if (typeof arrTarget[arrPropKey] !== 'function') return arrTarget[arrPropKey]
              const oldFunc = arrTarget[arrPropKey]
              return (...args) => {
                const newArr = [...arrTarget]
                const returnValue = oldFunc.call(newArr, ...args)
                if (isEqual(arrTarget, newArr)) return returnValue
                const parentPath = path.length > 1 ? path.slice(0, path.length - 1) : []
                const proxyTarget = getValueFromPath(stateProxy, parentPath)
                proxyTarget[key] = newArr
                return returnValue
              }
            }
          })
        },
        set: (target, key, value, path) => {
          if (recordMutations) {
            const mutation = {oldValue: target[key], newValue: value, path}
            actionHistory[0].mutations.push(mutation)
          }
          const prevComputed = Object.keys(computed).reduce((acc, cKey) => {
            acc[cKey] = stateRef.getters[cKey]
            return acc
          }, {})
          target[key] = value

          // define destroy function for cleanup
          const destroyWatcher = (watchers, ref) => {
            const idx = watchers.findIndex(watcher => watcher === ref)

            // use 0 timeout to avoid interfering with the current stack
            setTimeout(() => watchers.splice(idx, 1), 0)
          }

          // call the watchers directly attached to this property
          const watchers = getWatchers(target, key)
          watchers.forEach(watcher =>
            watcher(value, () => destroyWatcher(watchers, watcher)))

          // call the watchers of all computed properties that use this property
          Object.keys(computed).forEach(cKey => {
            const cValue = stateRef.getters[cKey]
            if (prevComputed[cKey] === cValue) return
            const cWatchers = getWatchers(state, cKey)
            cWatchers.forEach(watcher =>
              watcher(cValue, () => destroyWatcher(watchers, watcher)))
          })
          recordMutations = true
        }
      }
    )
    Object.seal(stateProxy)

    // set up watchers
    this.watchers = {}
    const setupWatchers = (srcObj, targetObj, watcherObj) => Object.keys(srcObj).forEach(key => {
      if (isObject(srcObj[key])) {
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

      // run the user-defined action and pass in the necessary arguments
      action({
        state: stateProxy,
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

    // set up time travel
    const timeTravel = num => {
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
          recordMutations = false
          const { oldValue, newValue, path } = mutation
          const parentPath = path.length > 1 ? path.slice(0, path.length - 1) : []
          const lastKey = path[path.length - 1]
          const ref = getValueFromPath(stateProxy, parentPath)
          ref[lastKey] = isRewinding ? oldValue : newValue
        })
        fromActions.shift()
        toActions.unshift(action)

        return idx === finalIdx
      })
    }

    // evaluate all the getters to get a JSON-ifiable object
    const evaluateGetters = getters => {
      return Object.keys(getters).reduce((accumulator, key) => {
        const evaluatedResult = getters[key]
        accumulator[key] = evaluatedResult && isObject(evaluatedResult.constructor)
          ? evaluateGetters(evaluatedResult)
          : evaluatedResult
        return accumulator
      }, {})
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
