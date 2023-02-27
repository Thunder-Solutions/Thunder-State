import { ActionsArg, ComputedArg, Dispatchers, PrivateProps, Store } from './types'

/**
 * Get dispatchers for each user-defined action
 */
const getDispatchers = <UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>>(
  name: string,
  actions: ActionsArg<UserDefinedState, UserDefinedComputed>,
  publicInstance: Store<UserDefinedState, UserDefinedComputed>,
  { setters, queue, actionHistory, enableDevTools }: PrivateProps<UserDefinedState>,
): Dispatchers => {
  return Object.keys(actions).reduce((dispatchers, key) => {

    // define the dispatcher method corresponding to the action
    // TODO: use a generic here instead of any
    dispatchers[key] = async (payload?: any) => {
      const action = actions[key]

      // append this action as a promise to the queue
      let done: (value: void | PromiseLike<void>) => void = () => {}
      queue.push(new Promise(resolve => done = resolve))
      if (queue.length > 100) queue.shift()

      // wait for the previous action to complete before resolving the current one
      const len = queue.length
      await (len > 1 ? queue[len - 2] : Promise.resolve())
      const actionEntry = {name: key, payload, mutations: []}
      actionHistory.unshift(actionEntry)

      // run the user-defined action and pass in the necessary arguments
      await action({
        state: setters,
        getters: publicInstance.getters,
        dispatchers: publicInstance.dispatchers,
        payload,
      }, done)

      // if the done function was not defined as a parameter, automatically call it
      if (action.length < 2) done()
      await queue[len - 1]

      // tell the browser extension about the action and its mutations
      if (!enableDevTools || typeof window === 'undefined') return
      window.postMessage({
        type: 'thunderState_action',
        message: {
          stateName: name,
          name: actionEntry.name,
          mutations: actionEntry.mutations,
        },
      }, '*')
    }

    // return all the dispatchers as an object
    return dispatchers
  }, {})
}

export default getDispatchers
