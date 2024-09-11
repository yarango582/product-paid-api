import { removeCircularReferences } from '../../../utils/circular.util';

describe('removeCircularReferences', () => {
  it('should remove circular references from an object', () => {
    const obj: any = { name: 'Alice' };
    obj.self = obj;

    const result = removeCircularReferences(obj);
    expect(result).toEqual({ name: 'Alice', self: '[Circular]' });
  });

  it('should handle nested circular references', () => {
    const obj: any = { name: 'Alice', child: { name: 'Bob' } };
    obj.child.parent = obj;

    const result = removeCircularReferences(obj);
    expect(result).toEqual({
      name: 'Alice',
      child: {
        name: 'Bob',
        parent: '[Circular]',
      },
    });
  });

  it('should handle arrays with circular references', () => {
    const obj: any = { name: 'Alice', children: [] };
    obj.children.push(obj);

    const result = removeCircularReferences(obj);
    expect(result).toEqual({
      name: 'Alice',
      children: ['[Circular]'],
    });
  });

  it('should return primitive values as is', () => {
    expect(removeCircularReferences(42)).toBe(42);
    expect(removeCircularReferences('hello')).toBe('hello');
    expect(removeCircularReferences(null)).toBe(null);
    expect(removeCircularReferences(undefined)).toBe(undefined);
  });

  it('should handle non-circular objects correctly', () => {
    const obj = { name: 'Alice', age: 30, address: { city: 'Wonderland' } };
    const result = removeCircularReferences(obj);
    expect(result).toEqual({
      name: 'Alice',
      age: 30,
      address: { city: 'Wonderland' },
    });
  });
});
