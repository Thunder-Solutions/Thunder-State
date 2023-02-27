export type Key = string | symbol
type KV<T> = { [key: Key]: T }

export type Mutation = {
  oldValue: unknown;
  newValue: unknown;
  path: Key[];
}

export type ActionEntry = {
  name: string;
  payload: any; // TODO: use a generic here instead of any
  mutations: Mutation[];
}

export type Watcher = (value: unknown, destroy: () => void) => void;

export type AddWatcher = {
  (watcher: Watcher): void;
  [key: Key]: AddWatcher;
}

export type ActionArgs<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = {
  state: UserDefinedState,
  getters: UserDefinedState & ComputedGetters<UserDefinedComputed>,
  dispatchers: KV<Dispatcher>,
  payload: any, // TODO: use a generic here instead of any
}

export type Action<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = (args: ActionArgs<UserDefinedState, UserDefinedComputed>, done?: (value: void | PromiseLike<void>) => void) => Promise<void> | void

// TODO: use a generic here instead of any
export type Dispatcher = (payload?: any) => Promise<void>

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
export type ActionsArg<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = KV<Action<UserDefinedState, UserDefinedComputed>>

// TODO: Replace `unknown` with the return types of each computed method
export type ComputedGetters<UserDefinedComputed> = {
  [key in keyof UserDefinedComputed]: unknown;
}

export type Store<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = {
  getters: UserDefinedState & ComputedGetters<UserDefinedComputed>;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

export type StoreConfig<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = {
  name: string;
  state: UserDefinedState;
  computed?: UserDefinedComputed;
  actions?: ActionsArg<UserDefinedState, UserDefinedComputed>;
  enableDevTools?: boolean;
}

export type MutationFn = (arr1: unknown[], arr2: unknown[], callback: (previouslyMutated: boolean) => void) => void

export type MutationCb = (arr1: unknown[], arr2: unknown[]) => void
