import { Constructor } from '../types';
import { FieldProperty } from './Field';
import { storeImplements } from '../metadata';

type InterfaceImplementation<T> = {
  [key in keyof T]: FieldProperty<any, T[key], any>
}

export default <TIface>(iface: Constructor<TIface>) =>
  <TType extends InterfaceImplementation<TIface>>(target: Constructor<TType>) => {
    storeImplements(target, iface);
  }
