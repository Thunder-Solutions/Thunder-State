import { DeepProxyHandler } from './deepProxyTypes';
import { Key } from '../types';
/**
 * The syntax and behavior is basically the same as the native `Proxy`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
 *
 * This one, however, proxies all child objects infinitely deep.
*/
export declare class DeepProxy<T extends Object> {
    constructor(target: T, handler?: DeepProxyHandler<T>, basePath?: Key[]);
}
export declare const createDeepProxy: <T extends Object>(target: T, handler: DeepProxyHandler<T>) => DeepProxy<T>;
