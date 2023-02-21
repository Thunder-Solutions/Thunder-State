export type Key = string | symbol
type KV<T> = { [key: Key]: T }

export type Watcher = (value: unknown, callback: (destroy: DestroyWatcher) => void) => void;
export type AddWatcher = {
  (watcher: Watcher): void;
  destroy?: DestroyWatcher;
} & {
  [key: Key]: AddWatcher;
}

export type DestroyWatcher = () => void

export type Getters = {

  // TODO: use generic instead of `any`
  [key: Key]: any;
}
export type Watchers = {
  [key: Key]: AddWatcher;
}

// TODO: use a generic here instead of any
export type Dispatcher = (payload: any) => Promise<void>
export type Dispatchers = KV<Dispatcher>


export type ComputedArg<UserDefinedState extends object> = KV<(state?: UserDefinedState) => unknown>
export type ComputedGetters<UserDefinedComputed> = {
  [key in keyof UserDefinedComputed]: unknown;
}

export type Store<UserDefinedState extends object, UserDefinedComputed extends ComputedArg<UserDefinedState>> = {
  getters: UserDefinedState & ComputedGetters<UserDefinedComputed>;
  watchers: Watchers;
  dispatchers: Dispatchers;
}
