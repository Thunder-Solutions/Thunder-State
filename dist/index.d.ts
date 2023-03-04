interface DeepProxyHandler<T extends object> {
  get?: (target: T, key: Key, path: Key[]) => unknown;
  set?: (target: T, key: Key, value: unknown, path: Key[]) => boolean;
}

/**
 * The syntax and behavior is basically the same as the native `Proxy`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * This one, however, proxies all child objects infinitely deep.
*/
declare class DeepProxy<T extends Object> {
    constructor(target: T, handler?: DeepProxyHandler<T>, basePath?: Key[]);
}

type Key = string | symbol
type KV<T> = { [key: Key]: T }

type DestroyWatcher = (watcher: Watcher) => void
type Watcher = (value: unknown, callback: (destroy: DestroyWatcher) => void) => void;

type AddWatcher = {
  destroy?: DestroyWatcher;
  (watcher: Watcher): void;
}

type ActionArgs = {
  state: DeepProxy<object>,
  getters: DeepProxy<object>,
  dispatchers: KV<Dispatcher>,
  payload: unknown,
}

type Action = (args: ActionArgs, done?: (value: void | PromiseLike<void>) => void) => Promise<void> | void
type Dispatcher = (payload: unknown) => Promise<void>

type StateObj = {

  // TODO: use generic instead of `any`
  [key: Key]: any;
}

type Getters = DeepProxy<StateObj> & StateObj
type Watchers = KV<AddWatcher> & StateObj
type Dispatchers = KV<Dispatcher>

type PublicInstance = {
  getters: Getters;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

type ComputedArg = KV<(getters?: Getters) => unknown>
type ActionsArg = KV<Action>

type StoreConfig = {
  name: string;
  state: StateObj;
  computed?: ComputedArg;
  actions?: ActionsArg;
  enableDevTools?: boolean;
}

declare const createStore: ({ actions: _actions, computed: _computed, ...config }: StoreConfig) => PublicInstance;

export { createStore };
