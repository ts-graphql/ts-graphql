import 'reflect-metadata';
import { FieldCreatorConfig } from '../fields';
import { GraphQLOutputType, GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { Constructor, MaybePromise } from '../types';
import { resolveThunk } from '../utils/thunk';
import TSGraphQLString from '../wrappers/TSGraphQLString';
import TSGraphQLBoolean from '../wrappers/TSGraphQLBoolean';
import TSGraphQLFloat from '../wrappers/TSGraphQLFloat';
import { WrapperOrType } from '../wrappers/Wrapper';
import { isFunction } from 'lodash';

export type FieldResolverMethod<TContext, TReturn, TArgs> =
  (args: TArgs, context: TContext, info: GraphQLResolveInfo) => TReturn;

export type FieldProperty<TContext, TReturn, TArgs> =
  TReturn | FieldResolverMethod<TContext, TReturn, TArgs>;

type FieldPropertyDecorator<TReturn, TArgs> = <TName extends string, TSource, TContext, TRArgs extends TArgs = TArgs>(
  prototype: Record<TName, FieldProperty<TContext, TReturn, TArgs>>,
  key: TName,
) => void;

const wrapperForPrimitive = (type: typeof String | typeof Boolean | typeof Number) => {
  switch (type) {
    case String:
      return TSGraphQLString;
    case Boolean:
      return TSGraphQLBoolean;
    case Number:
      return TSGraphQLFloat;
  }
  return undefined;
}

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
  config: Thunk<Partial<FieldCreatorConfig<TReturn, TArgs>>>
) =>
  <TName extends string, TSource, TContext, TRArgs extends TArgs = TArgs>(
    prototype: Record<TName, FieldProperty<TContext, TReturn, TRArgs>>,
    key: TName,
  ) => {
    storeFieldConfig(prototype, key, () => {
      const resolved = resolveThunk(config);
      let type: WrapperOrType<TReturn, GraphQLOutputType> | undefined = resolved && resolved.type
        ? resolved.type
        : undefined;
      if (!type) {
        const fieldType = isFunction(prototype[key])
          ? Reflect.getMetadata('design:returntype', prototype, key)
          : Reflect.getMetadata('design:type', prototype, key);
        type = wrapperForPrimitive(fieldType) as any;
      }

      if (!type) {
        const name = prototype.constructor ? prototype.constructor.name : '';
        throw new Error(`Type option not supplied and ${name}#${key} is not a type retrievable by reflection`);
      }

      return {
        ...resolved,
        type: type!,
      };
    });
  }

export default Field as FieldOverloads;
