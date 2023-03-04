import { DeepProxyHandler, ProxyUtility } from './deepProxyTypes'
import { Key } from '../types'
import { isObject } from '../utilities'

const DEFAULT_HANDLER = { get: () => null, set: () => false }

/** 
 * The syntax and behavior is basically the same as the native `Proxy`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * This one, however, proxies all child objects infinitely deep.
*/
export class DeepProxy<T extends Object> {
  constructor(
    target: T,
    handler: DeepProxyHandler<T> = DEFAULT_HANDLER,
    basePath: Key[] = [],
  ) {

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
              ? new Proxy(target[key], {
                get: (target, key) => {
                  const get = handler.get ?? (() => target[key])
                  return get(target, key, [...path, key])
                },
                set: (target, key, value) => {
                  handler.set?.(target, key, value, [...path, key])
                  return true
                },
              })
              : new DeepProxy(target[key], handler, path)
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
      // This avoids problems with getters overriding the DeepProxy on child objects.
      const proxyGetter = () => {
        const valueIsObject = isObject(target[key]) || Array.isArray(target[key])
        return valueIsObject ? proxyUtility.getProxy() : get()
      }

      Object.defineProperty(this, key, { enumerable: true, get: proxyGetter, set })
    })
  }
}

// the only purpose this serves is to get rid of the class import inside State.ts,
// because Jest evidently hates classes. A lot.
export const createDeepProxy = <T extends Object>(target: T, handler: DeepProxyHandler<T>) => new DeepProxy(target, handler)
