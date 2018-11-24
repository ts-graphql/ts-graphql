import { Constructor, ObjectLiteral } from '../types';
import { resolveThunk, Thunk } from '../utils/thunk';
import { GraphQLFieldConfig, GraphQLFieldConfigMap } from 'graphql';
import { FieldConfigMap, FieldResolver } from '../fields';
import { graphQLOutputTypeForWrapper } from '../wrappers/Wrapper';
import { getFieldConfig, getImplements, getSavedFieldConfigMap } from '../metadata';
import { FieldResolverMethod } from '../decorators/Field';
import { getConstructorChain } from './utils';
import { mapValues } from 'lodash';
import getArgs from './getArgs';

const getDefaultFieldResolver = (prototype: ObjectLiteral, key: string): FieldResolver<any, any, any> | null => {
  if (typeof prototype[key] === 'function') {
    const resolverMethod = prototype[key] as FieldResolverMethod<any, any, any>;
    return (source: any, ...args) => resolverMethod.apply(source, args);
  }
  return null;
}

export default (source: Constructor<any>): Thunk<GraphQLFieldConfigMap<any, any>> => {
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

    const merged = {
      ...allMaps,
      ...allFields,
    };

    return mapValues(merged, ((config, key) => ({
      type: graphQLOutputTypeForWrapper(config.type),
      ...config.args && { args: getArgs(config.args) },
      description: config.description,
      resolve: config.resolve || getDefaultFieldResolver(source.prototype, key) || undefined,
    } as GraphQLFieldConfig<any, any>)));
  };
};
