import 'reflect-metadata';
import { FieldCreatorConfig } from '../fields';
import { GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { AnyConstructor, MaybePromise } from '../types';
import { resolveThunk } from '../utils/thunk';
import { resolveType } from './utils';
import { InterfaceImplementation } from './Implements';

export type FieldDecoratorConfig<TReturn, TArgs = {}, TContext = any> = FieldCreatorConfig<TReturn, TArgs> & {
  context?: AnyConstructor<TContext>
};

export type FieldResolverMethod<TContext, TReturn, TArgs> =
  (args: TArgs, context: TContext, info: GraphQLResolveInfo) => MaybePromise<TReturn | InterfaceImplementation<TReturn>>;

export type FieldProperty<TContext, TReturn, TArgs> =
  MaybePromise<TReturn> | FieldResolverMethod<TContext, TReturn, TArgs>;

type FieldPropertyDecorator<TReturn, TArgs, TContext = undefined> = <TName extends string, TSource>(
  prototype: Record<TName, FieldProperty<TContext, TReturn, TArgs>>,
  key: TName,
) => void;

type InferredFieldPropertyDecorator = <TName extends string>(
  prototype: Record<TName, string> | Record<TName, boolean> | Record<TName, number>,
  key: TName,
) => void;

type FieldOverloads = {
  <TArgs>(
    config?: Thunk<Partial<FieldCreatorConfig<undefined, TArgs>>>
  ): InferredFieldPropertyDecorator;

  <TReturn, TArgs, TContext = undefined>(
    config: Thunk<FieldDecoratorConfig<TReturn, TArgs, TContext>>
  ): FieldPropertyDecorator<TReturn, TArgs, TContext>
};

export type FieldForContextOverloads<TContext> = {
  <TArgs>(
    config?: Thunk<Partial<FieldCreatorConfig<undefined, TArgs>>>
  ): InferredFieldPropertyDecorator;

  <TReturn, TArgs>(
    config: Thunk<Partial<FieldCreatorConfig<TReturn, TArgs>>>
  ): FieldPropertyDecorator<TReturn, TArgs, TContext>
};

export const fieldDecoratorForContext = <TContext>(context: AnyConstructor<TContext>): FieldForContextOverloads<TContext> =>
  <TReturn, TArgs>(config?: Thunk<Partial<FieldCreatorConfig<TReturn, TArgs>>>) =>
    Field({ ...config, context });

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
  };

export default Field as FieldOverloads;
