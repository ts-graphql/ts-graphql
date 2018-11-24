import { Constructor } from '../types';

export default (instance: any, constructors: Array<Constructor<any>>) => {
  for (const ctor of constructors) {
    if (instance instanceof ctor) {
      return ctor;
    }
  }
  return null;
}
