import 'reflect-metadata';
import { GraphQLInputType, Thunk } from 'graphql';
import { storeInputFieldConfig } from '../metadata';
import { WrapperOrType } from '../wrappers/Wrapper';
import { resolveThunk } from '../utils/thunk';
import { resolveType } from './utils';
import { Constructor } from '../types';

export type InputFieldConfig<TValue> = {
  type: () => WrapperOrType<TValue, GraphQLInputType>,
  defaultValue?: TValue,
  description?: string,
}

export type PrimitiveInputFieldConfig<TValue> =
  Pick<InputFieldConfig<TValue>, 'defaultValue' | 'description'>;

type InputFieldOverloads = {
  <TValue extends string | number | boolean>(config?: Thunk<PrimitiveInputFieldConfig<TValue>>):
    <TName extends string>(
      prototype:
        Record<TName, string> |
        Record<TName, boolean> |
        Record<TName, number>,
      key: TName,
    ) => void;
  <TValue>(
    config: Thunk<InputFieldConfig<TValue>>,
  ): <TName extends string>(prototype: Record<TName, TValue>, key: TName) => void;
}

const getDefaultValueFromPrototype = (prototype: Record<any, any>, key: string) => {
  const Args = prototype.constructor as Constructor<any>;
  if (!Args || typeof Args !== 'function' || Args.length > 0) {
    return undefined;
  }
  return new Args()[key];
}

const InputField = <TValue>(config?: Thunk<Partial<InputFieldConfig<TValue>>>) =>
  <TName extends string>(prototype: Record<TName, TValue>, key: TName) =>
    storeInputFieldConfig(prototype, key, () => {
      const resolved = config && resolveThunk(config) || {};
      const defaultValue = resolved.defaultValue || getDefaultValueFromPrototype(prototype, key);
      return {
        ...resolved,
        defaultValue,
        type: () => {
          const typeOption = resolved && resolved.type ? resolved.type() : undefined;
          return resolveType(typeOption, prototype, key);
        },
      } as InputFieldConfig<any>;
    });

export default InputField as InputFieldOverloads;
