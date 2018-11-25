import { AnyConstructor } from '../types';
import { storeInterfaceTypeConfig } from '../metadata';

export type InterfaceTypeConfig = {
  name?: string,
};

export default (config: InterfaceTypeConfig = {}) => (source: AnyConstructor<any>) => {
  storeInterfaceTypeConfig(source, config);
}
