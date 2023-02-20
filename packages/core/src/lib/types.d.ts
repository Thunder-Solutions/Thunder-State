import { DeepProxy } from './proxy/deepProxy'

export type Key = string | symbol
type KV<T> = { [key: Key]: T }

export type StateProxy<UserDefinedState extends object> = DeepProxy<UserDefinedState>

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
export type Watcher = (value: unknown, callback: (destroy: DestroyWatcher) => void) => void;

export type AddWatcher = {
  destroy?: DestroyWatcher;
  (watcher: Watcher): void;
}

export type ActionArgs<UserDefinedState extends object> = {
  state: DeepProxy<UserDefinedState>,
  getters: DeepProxy<UserDefinedState>,
  dispatchers: KV<Dispatcher>,
  payload: unknown,
}

export type Action = <UserDefinedState extends object>(args: ActionArgs<UserDefinedState>, done?: (value: void | PromiseLike<void>) => void) => Promise<void> | void
export type Dispatcher = (payload: unknown) => Promise<void>

export type PrivateProps<UserDefinedState extends object> = {
  setters: DeepProxy<UserDefinedState>;
  queue: Promise<void>[];
  actionHistory: ActionEntry[];
  actionFuture: ActionEntry[];
  recordMutations: boolean;
  userDefinedWatchers: Map<AddWatcher, Set<Watcher>>;
  enableDevTools: boolean;
}

export type Watchers = KV<AddWatcher>
export type Dispatchers = KV<Dispatcher>

export type Store<UserDefinedState extends object> = {
  getters: StateProxy<UserDefinedState>;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

export type ComputedArg<UserDefinedState extends object> = KV<(getters?: StateProxy<UserDefinedState>) => unknown>
export type ActionsArg = KV<Action>

export type StoreConfig<UserDefinedState extends object> = {
  name: string;
  state: UserDefinedState;
  computed?: ComputedArg<UserDefinedState>;
  actions?: ActionsArg;
  enableDevTools?: boolean;
}

export type MutationFn = (arr1: unknown[], arr2: unknown[], callback: (previouslyMutated: boolean) => void) => void

export type MutationCb = (arr1: unknown[], arr2: unknown[]) => void
