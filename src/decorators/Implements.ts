import { AbstractConstructor, Constructor } from '../types';
import { FieldProperty } from './Field';

type InterfaceImplementation<T> = {
  [key in keyof T]: FieldProperty<any, T[key], any>
}

export default <TIface>(iface: AbstractConstructor<TIface>) =>
  <TType extends InterfaceImplementation<TIface>>(target: Constructor<TType>) => {

  }
