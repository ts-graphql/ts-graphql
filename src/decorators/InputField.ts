import 'reflect-metadata';
import {
  GraphQLInputType,
  Thunk,
} from 'graphql';
import { storeInputFieldConfig } from '../metadata';
import { WrapperOrType } from '../wrappers/Wrapper';
import { ObjectWithKeyVal } from '../types';

export type InputFieldConfig<TValue> = {
  type: WrapperOrType<TValue, GraphQLInputType>,
  defaultValue?: TValue,
  description?: string,
}

export default <TValue>(options: Thunk<InputFieldConfig<TValue>>) =>
  <TName extends string>(prototype: ObjectWithKeyVal<TName, TValue>, key: TName) =>
    storeInputFieldConfig(prototype, key, options);
