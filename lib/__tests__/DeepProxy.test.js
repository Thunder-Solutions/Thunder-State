import DeepProxy from '../DeepProxy.js'

describe('DeepProxy', () => {

  it('creates a proxy from an object', () => {
    const originalObject = {test: { test: 'test'}}
    const proxy = new DeepProxy(originalObject)
    expect(proxy).not.toBe(originalObject)
    expect(proxy.test).not.toStrictEqual({ test: 'test'})
    expect(proxy.test.test).toBe('test')
  })

  it('assigns a custom getter and setter', () => {
    const originalObject = {test: { test: 'test'}}
    const proxy = new DeepProxy(originalObject, {
      get(target, key) {
        return target[key] + ' custom getter'
      },
      set(target, key, value) {
        target[key] = value + ' custom setter'
      },
    })
    expect(proxy.test.test).toBe('test custom getter')
    proxy.test.test = 'new'
    expect(originalObject.test.test).toBe('new custom setter')
    expect(proxy.test.test).toBe('new custom setter custom getter')
  })

})