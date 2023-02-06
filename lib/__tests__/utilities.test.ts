import { getStateSetError, getValueFromPath } from '../utilities'
import getWatchers from '../getWatchers'

describe('Utilities', () => {

  it('creates an error that reports illegal state set', () => {
    const error = getStateSetError()
    expect(error).toStrictEqual(new Error(`
Not allowed to set a property on the state directly.
Handle state updates by defining and dispatching actions instead.
`))
  })

  it('gets watchers of current property from current object', () => {
    const propWatchers = [() => {}]
    const obj = {
      prop: 'prop',
      _prop_watchers: propWatchers,
    }
    const watchers = getWatchers(obj, 'prop')
    expect(watchers).toBe(propWatchers)
  })

  it('gets the value of a property on an object by using the given path', () => {
    const obj = { one: { two: { three: 'value' }, twoB: 'not an object'}}

    expect(getValueFromPath(obj, ['one'])).toEqual(obj.one)
    expect(getValueFromPath(obj, ['one', 'two'])).toEqual(obj.one.two)
    expect(getValueFromPath(obj, ['one', 'two', 'three'])).toEqual(obj.one.two.three)
    expect(() => getValueFromPath(obj, ['one', 'twoB', 'three'])).toThrow(TypeError)
  })
})