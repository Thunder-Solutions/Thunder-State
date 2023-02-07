import { Key } from './types'

export interface DeepProxyHandler<T extends object> {
  get?: (target: T, key: Key, path: Key[]) => unknown;
  set?: (target: T, key: Key, value: unknown, path: Key[]) => boolean;
}

export interface ProxyUtility {
  needsNewProxy: boolean;
  proxy: ProxyConstructor | null;
  getProxy: () => ProxyConstructor;
}
