import { EmptyConstructor } from '../types';
import { storeIsArgs } from '../metadata';

export default () => (target: EmptyConstructor<any>) => {
  storeIsArgs(target);
}
