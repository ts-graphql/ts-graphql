import 'reflect-metadata';
import {
  GraphQLInputType,
  Thunk,
} from 'graphql';
import { storeInputFieldConfig } from '../metadata';
import { WrapperOrType } from '../wrappers/Wrapper';

export type InputFieldConfig<TValue> = {
  type: WrapperOrType<TValue, GraphQLInputType>,
  defaultValue?: TValue,
  description?: string,
}

export default <TValue>(options: Thunk<InputFieldConfig<TValue>>) =>
  <TName extends string>(prototype: Record<TName, TValue>, key: TName) =>
    storeInputFieldConfig(prototype, key, options);
