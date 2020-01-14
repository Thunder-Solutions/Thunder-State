import { getObjectChanged } from '../utilities.js'

describe('Utilities', () => {

  it('checks for an object difference between two values', () => {
    const obj1 = { test1: 'hello', test2: 'world' }
    const obj2 = { test1: 'hello', test2: 'world' }
    const obj3 = { test1: 'hello2', test2: 'world2' }
    const obj4 = { demo1: 'hello', demo2: 'world' }
    const obj5 = { demo1: 'hello', test2: 'world'}
    expect(getObjectChanged(obj1, obj2)).toBe(false)
    expect(getObjectChanged(obj2, obj3)).toBe(false)
    expect(getObjectChanged(obj3, obj4)).toBe(true)
    expect(getObjectChanged(obj4, obj5)).toBe(true)
    expect(getObjectChanged('hello', obj1)).toBe(true)
    expect(getObjectChanged(obj1, 'hello')).toBe(false)
    expect(getObjectChanged('hello', 'world')).toBe(false)
  })

})