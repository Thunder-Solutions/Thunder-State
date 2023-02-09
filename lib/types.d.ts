import { DeepProxy } from './proxy/deepProxy'

export type Key = string | symbol
type KV<T> = { [key: Key]: T }

export type Mutation = {
  oldValue: unknown;
  newValue: unknown;
  path: Key[];
}

export type ActionEntry = {
  name: string;
  payload: unknown;
  mutations: Mutation[];
}

export type DestroyWatcher = (watcher: Watcher) => void
export type Watcher = {
  destroy: DestroyWatcher;
  (value: unknown, callback: (destroy: DestroyWatcher) => void): void;
}

export type AddWatcher = {
  (watcher: Watcher): void;
}

export type ActionArgs = {
  state: DeepProxy<object>,
  getters: DeepProxy<object>,
  dispatchers: KV<Dispatcher>,
  payload: unknown,
}

export type Action = (args: ActionArgs, done?: (value: void | PromiseLike<void>) => void) => Promise<void> | void
export type Dispatcher = (payload: unknown) => Promise<void>
export type Setters = DeepProxy<StateObj>

export type PrivateProps = {
  setters: Setters;
  queue: Promise<void>[];
  actionHistory: ActionEntry[];
  actionFuture: ActionEntry[];
  recordMutations: boolean;
  userDefinedWatchers: Map<AddWatcher, Set<Watcher>>;
  enableDevTools: boolean;
}

export type StateObj = {

  // TODO: use generic instead of `any`
  [key: Key]: any;
}

export type Getters = DeepProxy<StateObj> & StateObj
export type Watchers = KV<AddWatcher> & StateObj
export type Dispatchers = KV<Dispatcher>

export type PublicInstance = {
  getters: Getters;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

export type ComputedArg = KV<(getters?: Getters) => unknown>
export type ActionsArg = KV<Action>

export type StoreConfig = {
  name: string;
  state: StateObj;
  computed?: ComputedArg;
  actions?: ActionsArg;
  enableDevTools?: boolean;
}

export type MutationFn = (arr1: unknown[], arr2: unknown[], callback: (previouslyMutated: boolean) => void) => void

export type MutationCb = (arr1: unknown[], arr2: unknown[]) => void
