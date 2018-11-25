import { AnyConstructor } from '../types';

export default (instance: any, constructors: Array<AnyConstructor<any>>) => {
  for (const ctor of constructors) {
    if (instance instanceof ctor) {
      return ctor;
    }
  }
  return null;
}
