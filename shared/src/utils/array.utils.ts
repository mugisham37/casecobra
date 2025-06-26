// Array utilities

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const flatten = <T>(array: (T | T[])[]): T[] => {
  return array.reduce<T[]>((acc, val) => 
    Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val), []
  );
};

export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

export const uniqueBy = <T, K>(array: T[], keyFn: (item: T) => K): T[] => {
  const seen = new Set<K>();
  return array.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export const groupBy = <T, K extends string | number>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

export const sortBy = <T>(array: T[], keyFn: (item: T) => any): T[] => {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);
    
    if (aVal < bVal) return -1;
    if (aVal > bVal) return 1;
    return 0;
  });
};

export const shuffle = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const sample = <T>(array: T[], count: number = 1): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, count);
};

export const randomItem = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const intersection = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => array2.includes(item));
};

export const difference = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter(item => !array2.includes(item));
};

export const union = <T>(array1: T[], array2: T[]): T[] => {
  return unique([...array1, ...array2]);
};

export const partition = <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const truthy: T[] = [];
  const falsy: T[] = [];
  
  array.forEach(item => {
    if (predicate(item)) {
      truthy.push(item);
    } else {
      falsy.push(item);
    }
  });
  
  return [truthy, falsy];
};

export const compact = <T>(array: (T | null | undefined)[]): T[] => {
  return array.filter((item): item is T => item != null);
};

export const zip = <T, U>(array1: T[], array2: U[]): [T, U][] => {
  const length = Math.min(array1.length, array2.length);
  const result: [T, U][] = [];
  
  for (let i = 0; i < length; i++) {
    result.push([array1[i], array2[i]]);
  }
  
  return result;
};

export const unzip = <T, U>(array: [T, U][]): [T[], U[]] => {
  const first: T[] = [];
  const second: U[] = [];
  
  array.forEach(([a, b]) => {
    first.push(a);
    second.push(b);
  });
  
  return [first, second];
};

export const range = (start: number, end?: number, step: number = 1): number[] => {
  if (end === undefined) {
    end = start;
    start = 0;
  }
  
  const result: number[] = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  
  return result;
};

export const sum = (array: number[]): number => {
  return array.reduce((total, num) => total + num, 0);
};

export const average = (array: number[]): number => {
  return sum(array) / array.length;
};

export const min = (array: number[]): number => {
  return Math.min(...array);
};

export const max = (array: number[]): number => {
  return Math.max(...array);
};

export const minBy = <T>(array: T[], keyFn: (item: T) => number): T | undefined => {
  if (array.length === 0) return undefined;
  
  return array.reduce((min, item) => 
    keyFn(item) < keyFn(min) ? item : min
  );
};

export const maxBy = <T>(array: T[], keyFn: (item: T) => number): T | undefined => {
  if (array.length === 0) return undefined;
  
  return array.reduce((max, item) => 
    keyFn(item) > keyFn(max) ? item : max
  );
};

export const countBy = <T, K extends string | number>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, number> => {
  return array.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {} as Record<K, number>);
};

export const first = <T>(array: T[], count: number = 1): T[] => {
  return array.slice(0, count);
};

export const last = <T>(array: T[], count: number = 1): T[] => {
  return array.slice(-count);
};

export const nth = <T>(array: T[], index: number): T | undefined => {
  return index >= 0 ? array[index] : array[array.length + index];
};

export const drop = <T>(array: T[], count: number = 1): T[] => {
  return array.slice(count);
};

export const dropRight = <T>(array: T[], count: number = 1): T[] => {
  return array.slice(0, -count);
};

export const take = <T>(array: T[], count: number): T[] => {
  return array.slice(0, count);
};

export const takeRight = <T>(array: T[], count: number): T[] => {
  return array.slice(-count);
};

export const isEmpty = <T>(array: T[]): boolean => {
  return array.length === 0;
};

export const isNotEmpty = <T>(array: T[]): boolean => {
  return array.length > 0;
};

export const includes = <T>(array: T[], item: T): boolean => {
  return array.includes(item);
};

export const findIndex = <T>(array: T[], predicate: (item: T) => boolean): number => {
  return array.findIndex(predicate);
};

export const findLastIndex = <T>(array: T[], predicate: (item: T) => boolean): number => {
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i])) {
      return i;
    }
  }
  return -1;
};

export const remove = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
  return array.filter(item => !predicate(item));
};

export const removeAt = <T>(array: T[], index: number): T[] => {
  return array.filter((_, i) => i !== index);
};

export const insertAt = <T>(array: T[], index: number, item: T): T[] => {
  const result = [...array];
  result.splice(index, 0, item);
  return result;
};

export const replaceAt = <T>(array: T[], index: number, item: T): T[] => {
  const result = [...array];
  result[index] = item;
  return result;
};

export const move = <T>(array: T[], fromIndex: number, toIndex: number): T[] => {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
};

export const reverse = <T>(array: T[]): T[] => {
  return [...array].reverse();
};

export const rotate = <T>(array: T[], positions: number): T[] => {
  const len = array.length;
  const normalizedPositions = ((positions % len) + len) % len;
  return [...array.slice(normalizedPositions), ...array.slice(0, normalizedPositions)];
};

export const equals = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => item === array2[index]);
};

export const deepEquals = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) return false;
  return array1.every((item, index) => 
    JSON.stringify(item) === JSON.stringify(array2[index])
  );
};
