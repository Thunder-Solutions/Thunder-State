import { DeepProxy } from './deepProxy'
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

export type ProxyOptions = {
  _this?: DeepProxy<{ [key: Key]: unknown }>;
  revocable?: boolean;
  path?: Key[];
}
