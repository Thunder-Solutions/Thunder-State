import { ComputedArg, PrivateProps, PublicInstance, Setters, StateObj } from './types';
/**
 * Get state as setters so we can intercept the mutations as they occur.
 */
declare const _default: (name: string, protectedState: StateObj, computed: ComputedArg, publicInstance: PublicInstance, privateProps: PrivateProps) => Setters;
export default _default;
