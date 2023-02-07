import { ComputedArg, Getters, StateObj } from './types';
/**
 * Get all the value getters from the state - which cannot be used to set the state
 */
declare const _default: (protectedState: StateObj, computed: ComputedArg) => Getters;
export default _default;
