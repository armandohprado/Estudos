export function upsert<T extends Record<any, any>, K extends keyof T = keyof T>(
  array: T[],
  newItem: T | (Partial<T> & { [key in K]: T[K] }),
  idKey: K
): T[] {
  array ??= [];
  if (array.some(item => item[idKey] === newItem[idKey])) {
    return array.map(item => {
      if (item[idKey] === newItem[idKey]) {
        item = { ...item, ...newItem };
      }
      return item;
    });
  } else {
    return [...array, newItem as T];
  }
}

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function isNil(value: any): value is null | undefined {
  return value == null;
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isObject(value: any): value is Record<any, any> {
  return typeof value === 'object';
}

export function isDate(value: any): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

export function coerceBooleanProperty(value: any): boolean {
  return !isNil(value) && `${value}` !== 'false';
}

export function isValidBase64(str: string): boolean {
  try {
    atob(str);
    return true;
  } catch {
    return false;
  }
}

export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function uniqBy<T extends Record<any, any>, K extends keyof T>(array: T[], key: K): T[] {
  const map = new Map<T[K], T>();
  for (const item of array) {
    const itemKey = item[key];
    if (!map.has(itemKey)) {
      map.set(itemKey, item);
    }
  }
  return [...map.values()];
}

export function roundNumber(number: number, decimals = 2): number {
  return +number.toFixed(decimals);
}
