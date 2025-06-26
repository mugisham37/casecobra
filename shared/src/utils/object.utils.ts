// Object utilities

export const pick = <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T;
  if (typeof obj === 'object') {
    const cloned = {} as T;
    Object.keys(obj).forEach(key => {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
};

export const merge = <T extends object, U extends object>(obj1: T, obj2: U): T & U => {
  return { ...obj1, ...obj2 };
};

export const deepMerge = <T extends object, U extends object>(obj1: T, obj2: U): T & U => {
  const result = { ...obj1 } as T & U;
  
  Object.keys(obj2).forEach(key => {
    const key2 = key as keyof U;
    if (obj2[key2] !== undefined) {
      if (
        typeof obj2[key2] === 'object' &&
        obj2[key2] !== null &&
        !Array.isArray(obj2[key2]) &&
        typeof (result as any)[key] === 'object' &&
        (result as any)[key] !== null &&
        !Array.isArray((result as any)[key])
      ) {
        (result as any)[key] = deepMerge((result as any)[key], obj2[key2]);
      } else {
        (result as any)[key] = obj2[key2];
      }
    }
  });
  
  return result;
};

export const isEmpty = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

export const isNotEmpty = (obj: object): boolean => {
  return Object.keys(obj).length > 0;
};

export const hasKey = <T extends object>(obj: T, key: string | number | symbol): key is keyof T => {
  return key in obj;
};

export const get = <T>(obj: any, path: string, defaultValue?: T): T => {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') {
      return defaultValue as T;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue as T;
};

export const set = (obj: any, path: string, value: any): void => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
};

export const unset = (obj: any, path: string): boolean => {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      return false;
    }
    current = current[key];
  }
  
  const lastKey = keys[keys.length - 1];
  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }
  
  return false;
};

export const keys = <T extends object>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

export const values = <T extends object>(obj: T): T[keyof T][] => {
  return Object.values(obj);
};

export const entries = <T extends object>(obj: T): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

export const fromEntries = <K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> => {
  return Object.fromEntries(entries) as Record<K, V>;
};

export const invert = <T extends Record<string, string>>(obj: T): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(obj).forEach(([key, value]) => {
    result[value] = key;
  });
  return result;
};

export const mapKeys = <T extends object, K extends string>(
  obj: T,
  mapper: (key: keyof T, value: T[keyof T]) => K
): Record<K, T[keyof T]> => {
  const result = {} as Record<K, T[keyof T]>;
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = mapper(key as keyof T, value);
    result[newKey] = value;
  });
  return result;
};

export const mapValues = <T extends object, U>(
  obj: T,
  mapper: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> => {
  const result = {} as Record<keyof T, U>;
  Object.entries(obj).forEach(([key, value]) => {
    result[key as keyof T] = mapper(value, key as keyof T);
  });
  return result;
};

export const filterKeys = <T extends object>(
  obj: T,
  predicate: (key: keyof T, value: T[keyof T]) => boolean
): Partial<T> => {
  const result = {} as Partial<T>;
  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(key as keyof T, value)) {
      result[key as keyof T] = value;
    }
  });
  return result;
};

export const filterValues = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> => {
  const result = {} as Partial<T>;
  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(value, key as keyof T)) {
      result[key as keyof T] = value;
    }
  });
  return result;
};

export const compact = <T extends object>(obj: T): Partial<T> => {
  return filterValues(obj, value => value != null && value !== '');
};

export const defaults = <T extends object, U extends object>(obj: T, defaultObj: U): T & U => {
  const result = { ...defaultObj, ...obj };
  return result as T & U;
};

export const flatten = (obj: any, prefix: string = '', separator: string = '.'): Record<string, any> => {
  const result: Record<string, any> = {};
  
  Object.keys(obj).forEach(key => {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    const value = obj[key];
    
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flatten(value, newKey, separator));
    } else {
      result[newKey] = value;
    }
  });
  
  return result;
};

export const unflatten = (obj: Record<string, any>, separator: string = '.'): any => {
  const result: any = {};
  
  Object.keys(obj).forEach(key => {
    set(result, key.replace(new RegExp(`\\${separator}`, 'g'), '.'), obj[key]);
  });
  
  return result;
};

export const equals = <T extends object>(obj1: T, obj2: T): boolean => {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  return keys1.every(key => {
    const val1 = (obj1 as any)[key];
    const val2 = (obj2 as any)[key];
    
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      return equals(val1, val2);
    }
    
    return val1 === val2;
  });
};

export const deepEquals = <T extends object>(obj1: T, obj2: T): boolean => {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
};

export const size = (obj: object): number => {
  return Object.keys(obj).length;
};

export const transform = <T extends object, U>(
  obj: T,
  transformer: (result: U, value: T[keyof T], key: keyof T) => void,
  accumulator: U
): U => {
  const result = accumulator;
  Object.entries(obj).forEach(([key, value]) => {
    transformer(result, value, key as keyof T);
  });
  return result;
};

export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const keyBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T> => {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    result[key] = item;
    return result;
  }, {} as Record<string, T>);
};

export const sortKeys = <T extends object>(obj: T): T => {
  const sortedKeys = Object.keys(obj).sort();
  const result = {} as T;
  
  sortedKeys.forEach(key => {
    (result as any)[key] = (obj as any)[key];
  });
  
  return result;
};

export const renameKey = <T extends object, K extends keyof T, N extends string>(
  obj: T,
  oldKey: K,
  newKey: N
): Omit<T, K> & Record<N, T[K]> => {
  const { [oldKey]: value, ...rest } = obj;
  return { ...rest, [newKey]: value } as Omit<T, K> & Record<N, T[K]>;
};

export const renameKeys = <T extends object>(
  obj: T,
  keyMap: Partial<Record<keyof T, string>>
): any => {
  const result: any = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    const newKey = keyMap[key as keyof T] || key;
    result[newKey] = value;
  });
  
  return result;
};
