import { Constructor } from '../types';
import { storeInterfaceTypeConfig } from '../metadata';

export type InterfaceTypeConfig = {
  name?: string,
};

export default (config: InterfaceTypeConfig = {}) => (source: Constructor<any>) => {
  storeInterfaceTypeConfig(source, config);
}
