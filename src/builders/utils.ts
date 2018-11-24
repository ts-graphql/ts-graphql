import { Constructor } from '../types';

export const getConstructorChain = (source: Constructor<any>): Array<Constructor<any>> => {
  const parent = Object.getPrototypeOf(source);
  if (parent == null || !parent.prototype) {
    return [source];
  }
  return [source, ...getConstructorChain(parent)];
}
