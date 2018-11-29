import 'reflect-metadata';
import { FieldCreatorConfig } from '../fields';
import { GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { AnyConstructor, MaybePromise } from '../types';
import { resolveThunk } from '../utils/thunk';
import { resolveType } from './utils';
import { InterfaceImplementation } from './Implements';
import { TSGraphQLInt } from '../index';

export type FieldDecoratorConfig<TReturn, TArgs = {}, TContext = any> = FieldCreatorConfig<TReturn, TArgs> & {
  context?: AnyConstructor<TContext>
}

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
      prototype: Record<TName, string> | Record<TName, boolean> | Record<TName, number>,
      key: TName,
    ) => void;
  <TReturn, TArgs>(
    config: Thunk<FieldCreatorConfig<TReturn, TArgs>>
  ): FieldPropertyDecorator<MaybePromise<TReturn>, TArgs>
}

export const fieldDecoratorForContext = <TContext>(context: AnyConstructor<TContext>) =>
  <TReturn, TArgs>(config?: Thunk<Partial<FieldCreatorConfig<TReturn, TArgs>>>) =>
    Field<TReturn, TArgs, TContext>({ ...config, context, });

const Field = <TReturn, TArgs, TContext>(
  config?: Thunk<Partial<FieldDecoratorConfig<TReturn, TArgs, TContext>>>
) =>
  <TName extends string, TSource, TRArgs extends TArgs = TArgs>(
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
