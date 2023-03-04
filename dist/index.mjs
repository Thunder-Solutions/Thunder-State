const deepClone = (value) => {
  const isPrimitive = value === null || typeof value !== "object" && typeof value !== "function";
  if (isPrimitive)
    return value;
  if (typeof structuredClone !== "undefined")
    return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};
const isEqual = (val1, val2) => {
  const sameType = typeof val1 === typeof val2;
  const sameConstructor = val1.constructor.name === val2.constructor.name;
  if (!sameType || !sameConstructor)
    return false;
  if (typeof val1 === "object" && typeof val2 === "object") {
    const keys = /* @__PURE__ */ new Set([...Object.keys(val1), ...Object.keys(val2)]);
    for (const key of keys) {
      const keyInBoth = key in val1 && key in val2;
      if (!keyInBoth)
        return false;
      const equal = isEqual(val1[key], val2[key]);
      if (!equal)
        return false;
    }
    return true;
  } else {
    return val1 === val2;
  }
};
const isObject = (val) => !!val && val.toString() === "[object Object]";
const withoutLast = (arr) => arr.slice(0, -1);
const trimUndef = (_arr) => {
  const arr = [..._arr];
  for (let i = _arr.length - 1; i >= 0; i--) {
    if (typeof _arr[i] === "undefined")
      arr.pop();
    else
      break;
  }
  for (const el of _arr) {
    if (typeof el === "undefined")
      arr.shift();
    else
      break;
  }
  return arr;
};
const getStateSetError = () => new Error(`
Not allowed to set a property on the state directly.
Handle state updates by defining and dispatching actions instead.
`);
const getComputedError = (key, err) => new Error(`
Unable to process computed property "${String(key)}"
  - Make sure all state properties are spelled correctly.
  - If it references other computed properties, make sure they are defined before this one.
  - If both of the above are valid, see the original error below.

Original error:

${err}`);
const getValueFromPath = (obj, path, idx = 0) => {
  if (path.length === 0)
    return obj;
  const key = path[idx];
  const value = obj[key];
  const isObj = typeof value === "object" || typeof value === "function";
  const isLastProp = path.length - 1 === idx;
  if (!isObj && !isLastProp)
    throw new TypeError(
      "Unable to get value from path because at least one of the parent properties is not an object."
    );
  return isLastProp ? value : getValueFromPath(value, path, idx + 1);
};
const getPojo = (obj) => {
  const initAccumulator = Array.isArray(obj) ? [] : {};
  return Object.keys(obj).reduce((pojo, key) => {
    const value = obj[key];
    if (typeof value === "function")
      return pojo;
    pojo[key] = isObject(value) || Array.isArray(value) ? getPojo(value) : value;
    return pojo;
  }, initAccumulator);
};
const patchArray = (arr, enableDevTools, mutate, callback) => {
  const patchedArray = deepClone(arr);
  const proto = Array.prototype;
  const protoKeys = Object.getOwnPropertyNames(proto);
  for (const protoKey of protoKeys) {
    const protoVal = proto[protoKey];
    if (typeof protoVal !== "function")
      continue;
    if (protoKey.startsWith("__"))
      continue;
    if (protoKey === "constructor")
      continue;
    patchedArray[protoKey] = (...args) => {
      let result = null;
      mutate(arr, arr, (previouslyMutated) => {
        if (enableDevTools || !previouslyMutated) {
          const oldArray = deepClone(arr);
          result = protoVal.call(arr, ...args);
          const newArray = deepClone(arr);
          if (!isEqual(oldArray, newArray)) {
            callback(oldArray, newArray);
          }
        } else {
          result = protoVal.call(arr, ...args);
          callback(null, arr);
        }
      });
      return result;
    };
  }
  return patchedArray;
};

const getWatchers = ({ getters }, { userDefinedWatchers }) => {
  const getReducer = (_path = []) => (watchers, key) => {
    const path = [..._path, key];
    const addWatcher = (callback) => {
      userDefinedWatchers.get(addWatcher)?.add(callback);
    };
    const _watchers = /* @__PURE__ */ new Set();
    userDefinedWatchers.set(addWatcher, _watchers);
    watchers[key] = addWatcher;
    watchers[key].destroy = (watcher) => new Promise((resolve) => {
      setTimeout(() => {
        resolve(_watchers.delete(watcher));
      });
    });
    const value = getValueFromPath(getters, path);
    if (isObject(value)) {
      const nestedWatchers = Object.keys(value).reduce(getReducer(path), {});
      const currentWatcherObj = watchers[key];
      for (const key2 in nestedWatchers) {
        currentWatcherObj[key2] = nestedWatchers[key2];
      }
    }
    return watchers;
  };
  return Object.keys(getters).reduce(getReducer(), {});
};

const DEFAULT_HANDLER = { get: () => null, set: () => false };
class DeepProxy {
  constructor(target, handler = DEFAULT_HANDLER, basePath = []) {
    Object.keys(target).forEach((key) => {
      const path = [...basePath, key];
      const proxyUtility = {
        needsNewProxy: true,
        proxy: null,
        getProxy() {
          if (this.needsNewProxy) {
            this.needsNewProxy = false;
            this.proxy = Array.isArray(target[key]) ? new Proxy(target[key], {
              get: (target2, key2) => {
                const get2 = handler.get ?? (() => target2[key2]);
                return get2(target2, key2, [...path, key2]);
              },
              set: (target2, key2, value) => {
                handler.set?.(target2, key2, value, [...path, key2]);
                return true;
              }
            }) : new DeepProxy(target[key], handler, path);
          }
          return this.proxy;
        }
      };
      const get = () => {
        if (key === "__isProxy")
          return true;
        const defaultGetter = () => target[key];
        const getter = handler.get || defaultGetter;
        return getter(target, key, path);
      };
      const set = (newValue) => {
        proxyUtility.needsNewProxy = isObject(newValue) || Array.isArray(newValue);
        const defaultSetter = () => target[key] = newValue;
        const setter = handler.set || defaultSetter;
        setter(target, key, newValue, path);
      };
      const proxyGetter = () => {
        const valueIsObject = isObject(target[key]) || Array.isArray(target[key]);
        return valueIsObject ? proxyUtility.getProxy() : get();
      };
      Object.defineProperty(this, key, { enumerable: true, get: proxyGetter, set });
    });
  }
}
const createDeepProxy = (target, handler) => new DeepProxy(target, handler);

const getGetters = (protectedState, computed) => {
  const getters = createDeepProxy(
    protectedState,
    { set: () => {
      throw getStateSetError();
    } }
  );
  for (const key in computed) {
    Object.defineProperty(getters, key, {
      enumerable: true,
      get: () => {
        if (key in computed) {
          try {
            return computed[key](getters);
          } catch (err) {
            throw getComputedError(key, err);
          }
        }
      },
      set: () => {
        throw getStateSetError();
      }
    });
  }
  return getters;
};

const getRunWatchers = (name, computed, publicInstance, { userDefinedWatchers, enableDevTools }) => {
  const { getters } = publicInstance;
  const prevComputed = Object.keys(computed).reduce((acc, cKey) => {
    const cValue = getters[cKey];
    acc[cKey] = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue;
    return acc;
  }, {});
  return (target, path, _newValue) => {
    const { getters: getters2, watchers } = publicInstance;
    const parent = getValueFromPath(getters2, path);
    const newValue = Array.isArray(target) ? parent : _newValue;
    const watcherValue = Array.isArray(newValue) ? trimUndef(newValue) : newValue;
    for (const idxStr in path) {
      const idx = Number(idxStr);
      const _path = [];
      for (let i = 0; i <= idx; i++) {
        _path.push(path[i]);
      }
      const addWatcher = getValueFromPath(watchers, _path);
      const _watchers = userDefinedWatchers.get(addWatcher) ?? /* @__PURE__ */ new Set();
      _watchers.forEach((watcher) => watcher(watcherValue, () => {
        addWatcher.destroy(watcher);
      }));
    }
    for (const cKey in computed) {
      const cValue = getters2[cKey];
      const _cValue = Array.isArray(cValue) ? JSON.stringify(cValue) : cValue;
      if (prevComputed[cKey] === _cValue)
        continue;
      const cWatchers = userDefinedWatchers.get(watchers[cKey]) ?? /* @__PURE__ */ new Set();
      cWatchers.forEach((watcher) => watcher(cValue, (destroyWatcher) => destroyWatcher(watcher)));
      if (!enableDevTools || typeof window === "undefined")
        continue;
      window.postMessage({
        type: "thunderState_computed",
        message: {
          stateName: name,
          key: cKey,
          value: cValue
        }
      }, "*");
    }
  };
};

const getSetters = (name, protectedState, computed, publicInstance, privateProps) => {
  const { enableDevTools } = privateProps;
  const recordHistory = (oldValue, newValue, path, { recordMutations, actionHistory }) => {
    if (!recordMutations || !enableDevTools)
      return;
    actionHistory[0].mutations.push({
      oldValue: deepClone(oldValue),
      newValue: deepClone(newValue),
      path
    });
  };
  const mutated = /* @__PURE__ */ new Map();
  const mutate = (target, newValue, mutateCallback) => {
    if (!Array.isArray(target)) {
      mutateCallback();
      if (Array.isArray(newValue)) {
        publicInstance.getters = getGetters(protectedState, computed);
      }
    }
    mutateCallback(mutated.get(target));
    mutated.set(target, true);
    setTimeout(() => {
      mutated.set(target, false);
    }, 0);
  };
  return Object.seal(createDeepProxy(
    protectedState,
    {
      get: (target, key, path) => {
        const targetIsArray = Array.isArray(target);
        const valueIsArray = Array.isArray(target[key]);
        if (!targetIsArray && !valueIsArray)
          return target[key];
        const runWatchers = getRunWatchers(name, computed, publicInstance, privateProps);
        const arr = valueIsArray ? target[key] : target;
        const patchedArray = patchArray(arr, enableDevTools, mutate, (oldArray, newArray) => {
          const watcherPath = withoutLast(path);
          recordHistory(oldArray, newArray, watcherPath, privateProps);
          runWatchers(arr, watcherPath, newArray);
        });
        return valueIsArray ? patchedArray : patchedArray[key];
      },
      set: (target, key, newValue, path) => {
        const oldValue = target[key];
        if (oldValue === newValue)
          return true;
        const runWatchers = getRunWatchers(name, computed, publicInstance, privateProps);
        recordHistory(oldValue, newValue, path, privateProps);
        mutate(target, newValue, () => {
          target[key] = newValue;
        });
        const watcherPath = Array.isArray(target) ? withoutLast(path) : path;
        runWatchers(target, watcherPath, newValue);
        privateProps.recordMutations = true;
        return true;
      }
    }
  ));
};

const getDispatchers = (name, actions, publicInstance, { setters, queue, actionHistory, enableDevTools }) => {
  return Object.keys(actions).reduce((dispatchers, key) => {
    dispatchers[key] = async (payload) => {
      const action = actions[key];
      let done = () => {
      };
      queue.push(new Promise((resolve) => done = resolve));
      if (queue.length > 100)
        queue.shift();
      const len = queue.length;
      await (len > 1 ? queue[len - 2] : Promise.resolve());
      const actionEntry = { name: key, payload, mutations: [] };
      actionHistory.unshift(actionEntry);
      await action({
        state: setters,
        getters: publicInstance.getters,
        dispatchers: publicInstance.dispatchers,
        payload
      }, done);
      if (action.length < 2)
        done();
      await queue[len - 1];
      if (!enableDevTools || typeof window === "undefined")
        return;
      window.postMessage({
        type: "thunderState_action",
        message: {
          stateName: name,
          name: actionEntry.name,
          mutations: actionEntry.mutations
        }
      }, "*");
    };
    return dispatchers;
  }, {});
};

const timeTravel = (num, privateProps) => {
  const { setters, actionHistory, actionFuture } = privateProps;
  const isRewinding = num < 0;
  const absNum = Math.abs(num);
  const maxNum = isRewinding ? actionHistory.length : actionFuture.length;
  const finalIdx = absNum >= maxNum ? maxNum - 1 : absNum > 0 ? absNum - 1 : 0;
  const actions = isRewinding ? [...actionHistory] : [...actionFuture];
  actions.some((action, idx) => {
    const fromActions = isRewinding ? actionHistory : actionFuture;
    const toActions = isRewinding ? actionFuture : actionHistory;
    action.mutations.forEach((mutation) => {
      privateProps.recordMutations = false;
      const { oldValue, newValue, path } = mutation;
      const parentPath = path.length > 1 ? path.slice(0, path.length - 1) : [];
      const lastKey = path[path.length - 1];
      const ref = getValueFromPath(setters, parentPath);
      ref[lastKey] = isRewinding ? deepClone(oldValue) : deepClone(newValue);
    });
    fromActions.shift();
    toActions.unshift(action);
    return idx === finalIdx;
  });
};

const connectToDevTools = (name, { getters }, privateProps) => {
  if (typeof window === "undefined")
    return;
  window.postMessage({
    type: "thunderState_initState",
    message: {
      stateName: name,
      state: getPojo(getters)
    }
  }, "*");
  window.addEventListener("message", ({ data, source }) => {
    const dataIsValid = source === window && isObject(data);
    const { type, stateName, message } = data;
    const isType = dataIsValid && type === "thunderState_timeTravel";
    if (!isType || stateName !== name)
      return;
    const { index, isRewinding } = message;
    const lastIdx = isRewinding ? index > 0 ? -index : -1 : index + 1;
    timeTravel(lastIdx, privateProps);
  });
};

const createStore = ({
  actions: _actions = {},
  computed: _computed = {},
  ...config
}) => {
  const {
    state: protectedState = {},
    name,
    enableDevTools = true
  } = deepClone(config);
  const actions = { ..._actions };
  const computed = { ..._computed };
  const publicInstance = Object.seal({
    getters: {},
    watchers: {},
    dispatchers: {}
  });
  const privateProps = {
    setters: {},
    queue: [],
    actionHistory: [],
    actionFuture: [],
    recordMutations: true,
    userDefinedWatchers: /* @__PURE__ */ new Map(),
    enableDevTools: enableDevTools === true
  };
  publicInstance.getters = getGetters(protectedState, computed);
  publicInstance.watchers = getWatchers(publicInstance, privateProps);
  privateProps.setters = getSetters(name, protectedState, computed, publicInstance, privateProps);
  publicInstance.dispatchers = getDispatchers(name, actions, publicInstance, privateProps);
  if (privateProps.enableDevTools)
    connectToDevTools(name, publicInstance, privateProps);
  return publicInstance;
};

export { createStore };
