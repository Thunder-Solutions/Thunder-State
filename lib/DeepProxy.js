/** 
 * The syntax and behavior is basically the same as the native `Proxy`.
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 * This one, however, proxies all child objects infinitely deep.
*/
export default class DeepProxy {
  constructor(
    target = {},
    handler = {}
  ) {
    Object.keys(target).forEach(key => {
      if (typeof target[key] === 'object')
        this[key] = new DeepProxy(
          target[key],
          handler
        )
      else
        Object.defineProperty(this, key, {
          get() {
            const defaultGetter = () => target[key]
            const getter = handler.get || defaultGetter
            return getter(target, key)
          },
          set(value) {
            const defaultSetter = () => target[key] = value
            const setter = handler.set || defaultSetter
            setter(target, key, value)
          }
        })
    })
  }
}
