import { getValueFromPath } from './utilities'

export default internalState => num => {
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
