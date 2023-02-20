import { DeepProxyHandler, ProxyOptions, ProxyUtility } from './deepProxyTypes'
import { isObject } from '../utilities'

const DEFAULT_HANDLER = { get: () => null, set: () => false }

/** 
 * The syntax and behavior is basically the same as the native `Proxy`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * This one, however, proxies all child objects infinitely deep.
*/
export const createDeepProxy = <T extends object>(
  target: T,
  handler: DeepProxyHandler<T> = DEFAULT_HANDLER,
  {
    _this, // this side effect is intended only for classes.
    path: basePath = [],
    revocable = false,
  }: ProxyOptions<T> = {}
): T => {

  // create a proxy with the usual constructor, or from the `revocable` factory function,
  // depending on the options passed to `createDeepProxy`
  const createProxy = revocable
    ? <T extends object>(target: T, handler: ProxyHandler<T>) => new Proxy(target, handler)
    : Proxy.revocable

  // define the proxy
  const result = _this ?? createDeepProxy(target, handler)
  Object.keys(target).forEach(key => {
    const path = [...basePath, key]

    // a small utility for managing nested proxies efficiently
    const proxyUtility: ProxyUtility = {
      needsNewProxy: true,
      proxy: null,
      getProxy() {
        if (this.needsNewProxy) {
          this.needsNewProxy = false
          this.proxy = Array.isArray(target[key])
            ? createProxy(target[key], {
              get: (target, key) => {
                const get = handler.get ?? (() => target[key])
                return get(target, key, [...path, key])
              },
              set: (target, key, value) => {
                handler.set?.(target, key, value, [...path, key])
                return true
              },
            })
            : createDeepProxy(target[key], handler, { path, revocable })
        }
        return this.proxy
      }
    }

    const get = () => {
      if (key === '__isProxy') return true
      const defaultGetter = () => target[key]
      const getter = handler.get || defaultGetter
      return getter(target, key, path)
    }

    const set = (newValue: unknown) => {

      // check if this change requires setting
      // a new proxy for the getter.
      proxyUtility.needsNewProxy = isObject(newValue) || Array.isArray(newValue)

      const defaultSetter = () => target[key] = newValue
      const setter = handler.set || defaultSetter
      setter(target, key, newValue, path)
    }

    // only use the provided getter on non-objects.
    // This avoids problems with getters overriding the proxies on child objects.
    const proxyGetter = () => {
      const valueIsObject = isObject(target[key]) || Array.isArray(target[key])
      return valueIsObject ? proxyUtility.getProxy() : get()
    }

    Object.defineProperty(result, key, { enumerable: true, get: proxyGetter, set })
  })

  return result
}
