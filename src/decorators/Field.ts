import 'reflect-metadata';
import { FieldCreatorConfig } from '../fields';
import { GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { ObjectWithKeyVal, Promiseable } from '../types';

export type FieldResolverMethod<TContext, TReturn, TArgs> =
  (args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promiseable<TReturn>;

export type FieldProperty<TContext, TReturn, TArgs> =
  Promiseable<TReturn> | FieldResolverMethod<TContext, TReturn, TArgs>;

export default <TReturn, TArgs>(config: Thunk<FieldCreatorConfig<TReturn, TArgs>>) =>
  <TName extends string, TSource, TContext, RTArgs extends TArgs = TArgs>(
    prototype: ObjectWithKeyVal<TName, FieldProperty<TContext, TReturn, TArgs>>,
    key: TName,
  ) => storeFieldConfig(prototype, key, config);
