import { Key } from '../types'

export type DeepProxyHandler<T extends object> = {
  get?: (target: T, key: Key, path: Key[]) => unknown;
  set?: (target: T, key: Key, value: unknown, path: Key[]) => boolean;
}

export type ProxyUtility = {
  needsNewProxy: boolean;
  proxy: ProxyConstructor | null;
  getProxy: () => ProxyConstructor;
}

export type ProxyOptions<T> = {
  _this?: T;
  revocable?: boolean;
  path?: Key[];
}
