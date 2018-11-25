import { AnyConstructor } from '../types';

export const getConstructorChain = (source: AnyConstructor<any>): Array<AnyConstructor<any>> => {
  const parent = Object.getPrototypeOf(source);
  if (parent == null || !parent.prototype) {
    return [source];
  }
  return [source, ...getConstructorChain(parent)];
}
