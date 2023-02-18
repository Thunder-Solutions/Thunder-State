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
export type Dispatcher = (payload: unknown) => Promise<void>
export type Dispatchers = KV<Dispatcher>

export type State = {
  getters: Getters;
  watchers: Watchers;
  dispatchers: Dispatchers;
}

export type StateHooks = {
  useWatch: (path: string | string[], watcherCallback: Watcher) => void;
  useGet: (path: string | string[]) => any; // note: user is expected to type this, not us
  useDispatcher: (key: string) => (payload: unknown) => Promise<void>;
}
