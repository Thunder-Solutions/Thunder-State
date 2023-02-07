import { ComputedArg, PrivateProps, PublicInstance } from './types';
/**
 * Prepares the runWatchers function with prerequisite data and a closure
 */
declare const _default: (name: string, computed: ComputedArg, publicInstance: PublicInstance, { userDefinedWatchers, enableDevTools }: PrivateProps) => (target: any, path: any, _newValue: any) => void;
export default _default;
