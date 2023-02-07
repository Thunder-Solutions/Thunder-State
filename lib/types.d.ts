import { DeepProxy } from './DeepProxy'
import State from './State';


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
export type Setters = DeepProxy<StateArg>

export type PrivateProps = {
  setters: Setters;
  queue: Promise<void>[];
  actionHistory: ActionEntry[];
  actionFuture: ActionEntry[];
  recordMutations: boolean;
  userDefinedWatchers: Map<AddWatcher, Set<Watcher>>;
  enableDevTools: boolean;
}

export type NestedObj = {

  // TODO: fix this `any`
  [key: string]: any;
}

export type Getters = DeepProxy<StateArg> & NestedObj
export type Watchers = KV<AddWatcher> & NestedObj
export type Dispatchers = KV<Dispatcher>
export type CreateState = (config: StateConfig) => State

export type PublicInstance = {
  getters: Getters;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

export type StateArg = KV<unknown>
export type ComputedArg = KV<(getters?: Getters) => unknown>
export type ActionsArg = KV<Action>

export type StateConfig = {
  state: StateArg;
  computed?: ComputedArg;
  actions?: ActionsArg;
  name?: string;
  enableDevTools?: boolean;
}
