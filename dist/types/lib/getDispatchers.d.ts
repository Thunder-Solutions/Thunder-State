import { ActionsArg, Dispatchers, PrivateProps, PublicInstance } from './types';
/**
 * Get dispatchers for each user-defined action
 */
declare const _default: (name: string, actions: ActionsArg, publicInstance: PublicInstance, { setters, queue, actionHistory, enableDevTools }: PrivateProps) => Dispatchers;
export default _default;
