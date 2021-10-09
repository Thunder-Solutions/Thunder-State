import { isObject, getPojo } from './utilities'
import getTimeTravel from './getTimeTravel'

export default (name, getters, internalState) => {

  // if not using browser, can't connect to dev tools; skip
  if (typeof window === 'undefined') return

  // send the initial state to the browser extension
  window.postMessage({
    type: 'thunderState_initState',
    message: {
      stateName: name,
      state: getPojo(getters),
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