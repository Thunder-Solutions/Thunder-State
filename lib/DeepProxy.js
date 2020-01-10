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

      const get = () => {
        const defaultGetter = () => target[key]
        const getter = handler.get || defaultGetter
        return getter(target, key)
      }

      const set = newValue => {
        const defaultSetter = () => target[key] = newValue
        const setter = handler.set || defaultSetter
        setter(target, key, newValue)
      }

      // only use the provided getter on non-objects.
      // This avoids problems with getters overriding the DeepProxy on child objects.
      const proxyGetter = () => {
        const isObject = typeof target[key] === 'object'
        return isObject ? new DeepProxy(target[key], handler) : get()
      }

      Object.defineProperty(this, key, { get: proxyGetter, set })
    })
  }
}
