import { Key, MutationCb, MutationFn } from './types';
export declare const deepClone: <T>(value: T) => T;
/**
 * Checks whether the given value is an object
 */
export declare const isObject: (val: unknown) => boolean;
/**
 * Returns a clone of the given array without the last item
 */
export declare const withoutLast: <T>(arr: T[]) => T[];
/**
 * Trims undefined values from the beginning and end of an array
 */
export declare const trimUndef: (_arr: unknown[]) => unknown[];
/**
 * Gets the specific error to be thrown when the state is set directly
 */
export declare const getStateSetError: () => Error;
/**
 * Gets the specific error to be thrown when a computed property fails to process
 */
export declare const getComputedError: (key: Key, err: Error) => Error;
/**
 * Gets the value at the end of the given path on the given object
 */
export declare const getValueFromPath: (obj: object, path: Key[], idx?: number) => unknown;
/**
 * Returns a "POJO" (plain-old JavaScript object) from a given non-serializeable object
 */
export declare const getPojo: (obj: object) => object;
/**
 * Monkey-patches an array to capture its old and new values
 */
export declare const patchArray: (arr: unknown[], enableDevTools: boolean, mutate: MutationFn, callback: MutationCb) => unknown[];
