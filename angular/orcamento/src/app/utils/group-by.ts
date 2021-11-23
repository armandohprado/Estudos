export function groupBy<T extends Record<any, any>, K extends keyof T = keyof T>(array: T[], key: K): Map<T[K], T[]> {
  const map = new Map<T[K], T[]>();
  for (const item of array) {
    const itemKey = item[key];
    const itens = map.get(itemKey) ?? [];
    map.set(itemKey, [...itens, item]);
  }
  return map;
}
