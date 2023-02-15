import { StoreConfig, PublicInstance } from './types';
declare const createStore: ({ actions: _actions, computed: _computed, ...config }: StoreConfig) => PublicInstance;
export default createStore;
