import { StateConfig, PublicInstance, Dispatchers, Getters, Watchers, CreateState } from './types';
declare class State implements PublicInstance {
    [key: string]: unknown;
    getters: Getters;
    watchers: Watchers;
    dispatchers: Dispatchers;
    static createState: CreateState;
    constructor(config: StateConfig);
}
export default State;
