import { AnyConstructor } from '../types';
import { FieldProperty } from './Field';
import { storeImplements } from '../metadata';

export type InterfaceImplementation<T> = {
  [key in keyof T]: FieldProperty<any, T[key], any>
};

export type InterfaceImplementationReturn<T> = T extends Array<infer V>
  ? InterfaceImplementationReturnArray<V>
  : InterfaceImplementation<T>;

// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540
interface InterfaceImplementationReturnArray<T> extends Array<InterfaceImplementationReturn<T>> {}

export default <TIface>(iface: AnyConstructor<TIface>) =>
  <TType extends InterfaceImplementation<TIface>>(target: AnyConstructor<TType>) => {
    storeImplements(target, iface);
  };
