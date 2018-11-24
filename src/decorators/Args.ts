import { SimpleConstructor } from '../types';
import { saveIsArgs } from '../metadata';

export default (target: SimpleConstructor<any>) => {
  saveIsArgs(target);
}
