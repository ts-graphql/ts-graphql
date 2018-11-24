import 'reflect-metadata';
import { FieldConfig, FieldCreatorConfig } from '../fields';
import { GraphQLResolveInfo, Thunk } from 'graphql';
import { storeFieldConfig } from '../metadata';
import { ObjectWithKeyVal, Promiseable } from '../types';
import { resolveThunk } from '../utils/thunk';

export type FieldResolverMethod<TContext, TReturn, TArgs> =
  (args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promiseable<TReturn>;

export default <TReturn, TArgs>(config: Thunk<FieldCreatorConfig<TReturn, TArgs>>) =>
  <TName extends string, TSource, TContext, RTArgs extends TArgs = TArgs>(
    prototype: ObjectWithKeyVal<TName, Promiseable<TReturn> | FieldResolverMethod<TContext, TReturn, TArgs>>,
    key: TName,
  ) => {
    storeFieldConfig(prototype, key, () => {
      const resolved = resolveThunk(config);
      const fieldConfig: FieldConfig<TSource, any, TReturn, TArgs> = { ...resolved };
      if (typeof prototype[key] === 'function') {
        const resolverMethod = prototype[key] as FieldResolverMethod<TContext, TReturn, TArgs>;
        fieldConfig.resolve = (source: TSource, ...args) => resolverMethod.apply(source, args);
      }
      return fieldConfig;
    });
  }
