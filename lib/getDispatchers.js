/**
 * Get dispatchers for each user-defined action
 * @param {string} name - The name of the state instance
 * @param {object} actions - The action methods from the original `new State()` config object
 * @param {object} setters - A non-extensible object used to set values on the state
 * @param {object} privateProps - The state used to track various things privately
 * @param {Array<Promise>} queue - The backlog of async actions
 * @param {Array<object>} actionHistory - A list of previously dispatched actions
 * @returns {object} - All dispatchers corresponding with each user-defined action
 */
export default (name, actions, setters, { queue, actionHistory, enableDevTools }) => {
  return Object.keys(actions).reduce((dispatchers, key) => {

    // define the dispatcher method corresponding to the action
    dispatchers[key] = async payload => {
      const action = actions[key]
      
      // append this action as a promise to the queue
      let done
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