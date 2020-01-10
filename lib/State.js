import DeepProxy from './DeepProxy.js'

export const getStateSetError = () => new Error(`
Not allowed to set a property on the state directly.
Handle state updates by defining and dispatching actions instead.
`)

export const getNotActionError = type => new Error(`
${JSON.stringify(type)} is not an action.
Make sure the action was passed into the State constructor.
`)


export default class State {
  constructor({
    state = {},
    actions = {},
    debugVariable
  }) {
    const actionHistory = []
    const actionFuture = []
    
    // set up setters
    const stateProxy = new DeepProxy(
      state,
      { set: (target, key, value) => {
        const mutation = {value: target[key], ref: [target, key]}
        actionHistory[0].prevData.push(mutation)
        target[key] = value
      }}
    )
    Object.seal(stateProxy)
 
    // set up getters
    this.getters = new DeepProxy(
      state,
      { set: () => {
        throw getStateSetError()
      }}
    )
    
    // set up actions
    this.dispatch = (name, payload) => {
      const actionExists = Object.keys(actions).some(
        existingAction => existingAction === name)
      if (!actionExists) throw getNotActionError(name)
      const newAction = {name, payload, prevData: []}
      actionHistory.unshift(newAction)
      actions[name](stateProxy, payload)
      if (debugVariable) return {actionHistory, actionFuture}
    }
    
    // set up debugging tools only if in debug mode
    if (!debugVariable) return Object.freeze(this)
      
    // set up time travel
    this.timeTravel = num => {
      const isRewinding = num < 0
      const clone = isRewinding ? [...actionHistory] : [...actionFuture]
      clone.some((action, idx) => {
        if (isRewinding) {
          action.prevData.forEach(data => {
            const [target, key] = data.ref
            target[key] = data.value
          })
          actionHistory.shift()
          actionFuture.unshift(action)
        } else {
          actionFuture.shift()
          actionHistory.unshift(action)
          actions[action.name](stateProxy, action.payload)
        }
        const absNum = Math.abs(num)
        const maxNum = isRewinding ? actionHistory.length : actionFuture.length
        const finalIdx =
          absNum >= maxNum ? maxNum - 1
          : absNum > 0 ? absNum - 1 : 0
        return idx === finalIdx
      })
      
      const action = actionHistory[actionHistory.length-1]
        || {name: 'initial', data: null, prevData: null}
      return {action, state, actionHistory, actionFuture}
    }

    // don't allow the dev to misuse the state object
    window[debugVariable] = Object.freeze(this)
  }
}