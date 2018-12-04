import { AnyConstructor, MaybePromise } from '../types';
import { FieldProperty } from './Field';
import { storeImplements } from '../metadata';

export type InterfaceImplementation<T> = {
  [key in keyof T]: FieldProperty<any, T[key], any>
}

export default <TIface>(iface: AnyConstructor<TIface>) =>
  <TType extends InterfaceImplementation<TIface>>(target: AnyConstructor<TType>) => {
    storeImplements(target, iface);
  }
