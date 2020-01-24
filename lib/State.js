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
    debugVariable,
  }) {
    const queue = []
    const actionHistory = []
    const actionFuture = []
    let recordMutations = true

    // set up setters
    const stateProxy = new DeepProxy(
      state,
      { set: (target, key, value) => {
        if (recordMutations) {
          const mutation = {value: target[key], ref: [target, key]}
          actionHistory[0].mutations.push(mutation)
        }
        target[key] = value
        recordMutations = true
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

    // set up dispatcher
    this.dispatch = (name, payload) => {
      const actionExists = Object.keys(actions).some(
        existingAction => existingAction === name)
      if (!actionExists) throw getNotActionError(name)
      const actionEntry = {name, payload, mutations: []}

      // append this action as a promise to the queue
      let done
      queue.push(new Promise(resolve => done = resolve))
      if (queue.length > 100) queue.shift()

      // wait for the action to complete before modifying the history
      return doAsyncAction(actions[name], actionEntry, done)
    }

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