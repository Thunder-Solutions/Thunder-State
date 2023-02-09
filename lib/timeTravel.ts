import { PrivateProps } from './types'
import { getValueFromPath } from './utilities'

/**
 * The "time travel" function used to rewind and fast-forward actions
 */
export default (num: number, privateProps: PrivateProps) => {
  const { setters, actionHistory, actionFuture } = privateProps

  // rewind if num is negative
  const isRewinding = num < 0

  // get all relevant numbers for comparisons and conditions
  const absNum = Math.abs(num)
  const maxNum = isRewinding ? actionHistory.length : actionFuture.length
  const finalIdx =
    absNum >= maxNum ? maxNum - 1
    : absNum > 0 ? absNum - 1 : 0
  
  // clone the list of actions so they can be modified during iterations
  // without causing problems with the rest of the loop
  const actions = isRewinding ? [...actionHistory] : [...actionFuture]

  // using `some` so it stops iterating when the threshold is reached
  actions.some((action, idx) => {

    // determine which lists we're moving to and from
    const fromActions = isRewinding ? actionHistory : actionFuture
    const toActions = isRewinding ? actionFuture : actionHistory

    // undo or redo all of this action's mutations
    action.mutations.forEach(mutation => {

      // stop recording mutations so the setters don't overwrite the action history
      privateProps.recordMutations = false

      // get a reference to the property in question
      const { oldValue, newValue, path } = mutation
      const parentPath = path.length > 1 ? path.slice(0, path.length - 1) : []
      const lastKey = path[path.length - 1]
      const ref = getValueFromPath(setters, parentPath)

      // apply the mutation to the state
      ref[lastKey] = isRewinding ? structuredClone(oldValue) : structuredClone(newValue)
    })

    // move the action from one list to the other
    fromActions.shift()
    toActions.unshift(action)

    // stop iterating when the threshold is reached
    return idx === finalIdx
  })
}
