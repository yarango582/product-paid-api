export function removeCircularReferences(obj: any, seen = new WeakSet()): any {
  if (typeof obj === 'object' && obj !== null) {
    if (seen.has(obj)) {
      return '[Circular]';
    }
    seen.add(obj);
    const newObj: any = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      newObj[key] = removeCircularReferences(obj[key], seen);
    }
    return newObj;
  }
  return obj;
}
