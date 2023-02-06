import {DeepProxy, createDeepProxy} from '../DeepProxy'

describe('DeepProxy', () => {

  it('creates a proxy from an object', () => {
    const originalObject = { test: { test: 'test'} }
    const proxy = new DeepProxy(originalObject)
    expect(proxy).not.toBe(originalObject)
    expect(proxy.test.test).toBe('test')
  })

  it('assigns a custom getter and setter', () => {
    const originalObject = {test: { test: 'test'}}
    const proxy = new DeepProxy(originalObject, {
      get(target, key) {
        const val = target[key]
        const result = typeof val === 'string' ? `${val} custom getter` : val
        return result
      },
      set(target, key, value) {
        target[key] = value + ' custom setter'
      },
    })
    expect(proxy.test.test).toBe('test custom getter')
    proxy.test.test = 'new'
    expect(originalObject.test.test).toBe('new custom setter')
    expect(proxy.test.test).toBe('new custom setter custom getter')
    proxy.test = 'new'
    expect(originalObject.test).toBe('new custom setter')
    expect(proxy.test).toBe('new custom setter custom getter')
  })

  it('creates a DeepProxy from a factory function without `new`', () => {
    const target = {test: 'test'}
    const handlers = {
      get() {return 'test'},
      set(newVal) {return newVal},
    }
    const expectedProxy = new DeepProxy(target, handlers)
    const resultProxy = createDeepProxy(target, handlers)
    expect(resultProxy).toStrictEqual(expectedProxy)
  })

})