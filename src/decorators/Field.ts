import 'reflect-metadata';
import { FieldCreatorConfig } from '../fields';
import { GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { MaybePromise } from '../types';
import { resolveThunk } from '../utils/thunk';
import { resolveType } from './utils';
import { InterfaceImplementation } from './Implements';

export type FieldResolverMethod<TContext, TReturn, TArgs> =
  (args: TArgs, context: TContext, info: GraphQLResolveInfo) => TReturn | InterfaceImplementation<TReturn>;

export type FieldProperty<TContext, TReturn, TArgs> =
  TReturn | FieldResolverMethod<TContext, TReturn, TArgs>;

type FieldPropertyDecorator<TReturn, TArgs> = <TName extends string, TSource, TContext, TRArgs extends TArgs = TArgs>(
  prototype: Record<TName, FieldProperty<TContext, TReturn, TArgs>>,
  key: TName,
) => void;

type FieldOverloads = {
  <TArgs>(config?: Thunk<Partial<FieldCreatorConfig<undefined, TArgs>>>):
    <TName extends string, TSource, TContext, TRArgs extends TArgs = TArgs>(
      prototype:
        Record<TName, FieldProperty<TContext, string, TArgs>> |
        Record<TName, FieldProperty<TContext, boolean, TArgs>> |
        Record<TName, FieldProperty<TContext, number, TArgs>>,
      key: TName,
    ) => void;
  <TReturn, TArgs>(
    config: Thunk<FieldCreatorConfig<TReturn, TArgs>>
  ): FieldPropertyDecorator<MaybePromise<TReturn>, TArgs>
}

const Field = <TReturn, TArgs>(
  config?: Thunk<Partial<FieldCreatorConfig<TReturn, TArgs>>>
) =>
  <TName extends string, TSource, TContext, TRArgs extends TArgs = TArgs>(
    prototype: Record<TName, FieldProperty<TContext, TReturn, TRArgs>>,
    key: TName,
  ) => {
    storeFieldConfig(prototype, key, () => {
      const resolved = config && resolveThunk(config);
      const type = resolveType(resolved && resolved.type, prototype, key);

      return {
        ...resolved,
        type,
      };
    });
  }

export default Field as FieldOverloads;
