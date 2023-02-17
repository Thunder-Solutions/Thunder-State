export type Key = string | symbol
type KV<T> = { [key: Key]: T }

export type Watcher = (value: unknown, callback: (destroy: DestroyWatcher) => void) => void;
export type AddWatcher = {
  destroy?: DestroyWatcher;
  (watcher: Watcher): void;
}
export type DestroyWatcher = (watcher: Watcher) => void

export type Getters = {

  // TODO: use generic instead of `any`
  [key: Key]: any;
}
export type Watchers = {
  [key: Key]: AddWatcher | Watchers;
}
export type Dispatcher = (payload: unknown) => Promise<void>
export type Dispatchers = KV<Dispatcher>

export type State = {
  getters: Getters;
  watchers: Watchers;
  dispatchers: Dispatchers;
}
