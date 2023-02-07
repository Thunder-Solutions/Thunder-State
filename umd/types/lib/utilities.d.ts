/**
 * Checks whether the given value is an object
 * @param {*} val - The value to test
 * @returns {boolean} - True if the value is an object
 */
export declare const isObject: (val: any) => boolean;
/**
 * Returns a clone of the given array without the last item
 * @param {Array} arr - The reference array
 * @returns {Array} - A copy of the array without the last item
 */
export declare const withoutLast: (arr: any) => any;
/**
 * Trims undefined values from the beginning and end of an array
 * @param {Array} _arr - The reference array
 * @returns {Array} - A trimmed copy of the array
 */
export declare const trimUndef: (_arr: any) => any[];
/**
 * Gets the specific error to be thrown when the state is set directly
 * @returns {Error} - The error to be thrown when the state is set directly
 */
export declare const getStateSetError: () => Error;
/**
 * Gets the specific error to be thrown when a computed property fails to process
 * @returns {Error} - The error to be thrown when a computed property fails to process
 */
export declare const getComputedError: (key: any, err: any) => Error;
/**
 * Gets the value at the end of the given path on the given object
 * @param {object} obj - The reference object
 * @param {Array<string>} path - The list of keys to follow (from object dot-notation)
 * @param {number} idx - The index of the current key in the path
 * @returns {*} - The value at the end of the given path on the given object
 */
export declare const getValueFromPath: (obj: any, path: any, idx?: number) => any;
/**
 * Returns a "POJO" (plain-old JavaScript object) from a given non-serializeable object
 * @param {object|Array} obj - The (potentially) non-serializeable object to convert
 * @returns {object} - The "POJO" converted from the given object
 */
export declare const getPojo: (obj: any) => {};
/**
 * Monkey-patches an array to capture its old and new values
 * @param {Array} arr - The reference array
 * @param {function} callback - Runs when any method is called; old and new values are passed in
 * @returns {Array} - A monkey-patched copy of the given array
 */
export declare const patchArray: (arr: any, enableDevTools: any, mutate: any, callback: any) => any;
