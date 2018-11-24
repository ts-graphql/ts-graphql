import { SimpleConstructor } from '../types';
import { storeIsArgs } from '../metadata';

export default (target: SimpleConstructor<any>) => {
  storeIsArgs(target);
}
