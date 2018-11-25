import 'reflect-metadata';
import {
  GraphQLInputType, GraphQLOutputType,
  Thunk,
} from 'graphql';
import { storeInputFieldConfig } from '../metadata';
import { WrapperOrType } from '../wrappers/Wrapper';
import { resolveThunk } from '../utils/thunk';
import { isFunction } from 'lodash';
import { resolveType } from './utils';

export type InputFieldConfig<TValue> = {
  type: WrapperOrType<TValue, GraphQLInputType>,
  defaultValue?: TValue,
  description?: string,
}

export type PrimitiveInputFieldConfig<TValue> =
  Exclude<InputFieldConfig<TValue>, { type: WrapperOrType<TValue, GraphQLInputType> }>

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
    config: Thunk<InputFieldConfig<TValue>>
  ): <TName extends string>(prototype: Record<TName, TValue>, key: TName) => void;
}

const InputField = <TValue>(config?: Thunk<Partial<InputFieldConfig<TValue>>>) =>
  <TName extends string>(prototype: Record<TName, TValue>, key: TName) =>
    storeInputFieldConfig(prototype, key, () => {
      const resolved = config && resolveThunk(config);
      const type = resolveType(resolved && resolved.type, prototype, key);
      return {
        ...resolved,
        type,
      };
    });

export default InputField as InputFieldOverloads;
