import { AnyConstructor, ObjectLiteral } from '../types';
import { resolveThunk, Thunk } from '../utils/thunk';
import { GraphQLFieldConfig, GraphQLFieldConfigMap } from 'graphql';
import { FieldConfig, FieldConfigMap, FieldResolver } from '../fields';
import { getFieldConfig, getImplements, getSavedFieldConfigMap } from '../metadata';
import { FieldResolverMethod } from '../decorators/Field';
import { getConstructorChain } from './utils';
import { mapValues } from 'lodash';
import getArgs from './getArgs';
import { getOutputType } from '../typeHelpers';

const getDefaultFieldResolver = (prototype: ObjectLiteral, key: string): FieldResolver<any, any, any> | null => {
  if (typeof prototype[key] === 'function') {
    console.log(key);
    const resolverMethod = prototype[key] as FieldResolverMethod<any, any, any>;
    return (source: any, ...args) => resolverMethod.apply(source, args);
  }
  return null;
}

export const buildFieldConfigMap = <TSource, TContext>(
  map: FieldConfigMap<TSource, TContext>,
): GraphQLFieldConfigMap<TSource, TContext> => {
  return mapValues(map, (config) => ({
    ...config,
    type: getOutputType(config.type, true),
    args: config.args ? resolveThunk(getArgs(config.args)) : undefined,
  }))
};

export default (source: AnyConstructor<any>): Thunk<GraphQLFieldConfigMap<any, any>> => {
  return () => {
    const interfaces = getImplements(source) || [];
    const chain = [...getConstructorChain(source), ...interfaces];
    const allFields: FieldConfigMap<any, any> = chain
      .map(getFieldConfig)
      .filter((value) => !!value)
      .map((config) => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    const mapThunkArray = chain
      .map(getSavedFieldConfigMap)
      .filter((value) => !!value) as Array<Thunk<FieldConfigMap<any, any>>>;

    const allMaps: FieldConfigMap<any, any> = mapThunkArray
      .map(resolveThunk)
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    const merged: FieldConfigMap<any, any> = {
      ...allMaps,
      ...allFields,
    };

    const addDefaultResolver = (config: FieldConfig<any, any, any>, key: string) => ({
      ...config,
      resolve: config.resolve || getDefaultFieldResolver(source.prototype, key) || undefined,
    })

    return buildFieldConfigMap(mapValues(merged, addDefaultResolver));
  };
};
