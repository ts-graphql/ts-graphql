import 'reflect-metadata';
import { FieldCreatorConfig } from '../fields';
import { GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { MaybePromise } from '../types';

export type FieldResolverMethod<TContext, TReturn, TArgs> =
  (args: TArgs, context: TContext, info: GraphQLResolveInfo) => MaybePromise<TReturn>;

export type FieldProperty<TContext, TReturn, TArgs> =
  MaybePromise<TReturn> | FieldResolverMethod<TContext, TReturn, TArgs>;

export default <TReturn, TArgs>(
  config: Thunk<FieldCreatorConfig<TReturn, TArgs>>
) =>
  <TName extends string, TSource, TContext, TRArgs extends TArgs = TArgs>(
    prototype: Record<TName, FieldProperty<TContext, TReturn, TArgs>>,
    key: TName,
  ) => storeFieldConfig(prototype, key, config);
