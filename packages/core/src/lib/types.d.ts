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
export type Watcher = (value: unknown, callback: (destroy: DestroyWatcher) => void) => void;

export type AddWatcher = {
  destroy?: DestroyWatcher;
  (watcher: Watcher): void;
}

export type ActionArgs<UserDefinedState extends object> = {
  state: UserDefinedState,
  getters: UserDefinedState,
  dispatchers: KV<Dispatcher>,
  payload: unknown,
}

export type Action = <UserDefinedState extends object>(args: ActionArgs<UserDefinedState>, done?: (value: void | PromiseLike<void>) => void) => Promise<void> | void
export type Dispatcher = (payload: unknown) => Promise<void>

export type PrivateProps<UserDefinedState extends object> = {
  setters: UserDefinedState;
  queue: Promise<void>[];
  actionHistory: ActionEntry[];
  actionFuture: ActionEntry[];
  recordMutations: boolean;
  userDefinedWatchers: Map<AddWatcher, Set<Watcher>>;
  enableDevTools: boolean;
}

export type Watchers = KV<AddWatcher>
export type Dispatchers = KV<Dispatcher>
export type ComputedArg<UserDefinedState extends object> = KV<(state?: UserDefinedState) => unknown>
export type ActionsArg = KV<Action>

export type ComputedGetters<UserDefinedComputed> = {
  [key in keyof UserDefinedComputed]: unknown;
}

export type Store<UserDefinedState extends object, UserDefinedComputed extends object> = {
  getters: UserDefinedState & ComputedGetters<UserDefinedComputed>;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

export type StoreConfig<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = {
  name: string;
  state: UserDefinedState;
  computed?: UserDefinedComputed;
  actions?: ActionsArg;
  enableDevTools?: boolean;
}

export type MutationFn = (arr1: unknown[], arr2: unknown[], callback: (previouslyMutated: boolean) => void) => void

export type MutationCb = (arr1: unknown[], arr2: unknown[]) => void
