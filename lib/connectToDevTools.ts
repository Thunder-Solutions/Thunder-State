import { isObject, getPojo } from './utilities'
import timeTravel from './timeTravel'
import { PrivateProps, PublicInstance } from './types'

/**
 * Prepares the "Thunder State Dev Tools" browser extension.
 */
export default (name: string, { getters }: PublicInstance, privateProps: PrivateProps) => {

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

  // update the state if time traveled from extension
  window.addEventListener('message', ({ data, source }) => {
    const dataIsValid = source === window && isObject(data)

    // do nothing if the type or name doesn't match
    const { type, stateName, message } = data
    const isType = dataIsValid && type === 'thunderState_timeTravel'
    if (!isType || stateName !== name) return

    // establish direction and amount, then do time travel
    const { index, isRewinding } = message
    const lastIdx = isRewinding ? (index > 0 ? -index : -1) : index + 1
    timeTravel(lastIdx, privateProps)
  })
}
