import { AnyConstructor, EmptyConstructor, ObjectLiteral } from '../types';
import { resolveThunk, Thunk } from '../utils/thunk';
import { GraphQLFieldConfigMap, GraphQLFieldResolver } from 'graphql';
import { FieldConfig, FieldConfigMap, FieldResolver } from '../fields';
import { getFieldConfig, getImplements, getSavedFieldConfigMap } from '../metadata';
import { FieldResolverMethod } from '../decorators/Field';
import { getConstructorChain } from './utils';
import { mapValues } from 'lodash';
import getArgs from './getArgs';
import { getOutputType } from '../typeHelpers';
import { isWrapper } from '../wrappers/Wrapper';

const convertResolverMethod = (prototype: ObjectLiteral, key: string, Args?: EmptyConstructor<any>): FieldResolver<any, any, any> | null => {
  if (typeof prototype[key] === 'function') {
    const resolverMethod = prototype[key] as FieldResolverMethod<any, any, any>;
    return (source: any, args: ObjectLiteral, ...rest) => resolverMethod.apply(source, [
      Args ? Object.assign(new Args(), args) : args,
      rest,
    ]);
  }
  return null;
}

const wrapResolver = <TArgs>(
  config: FieldConfig<any, any, TArgs>
): FieldConfig<any, any, any> => {
  const { resolve, type, args: Args } = config;
  const transformOutput = isWrapper(type) && type.transformOutput;
  if (resolve) {
    const wrapped: GraphQLFieldResolver<any, any> = Args
      ? (source: any, args: ObjectLiteral, ...rest) => resolve(source, Object.assign(new Args(), args), ...rest)
      : resolve;
    return {
      ...config,
      resolve: transformOutput
        ? (...args) => transformOutput(wrapped(...args))
        : wrapped,
    }
  }
  return config;
}

export const buildFieldConfigMap = <TSource, TContext>(
  map: FieldConfigMap<TSource, TContext>,
): GraphQLFieldConfigMap<TSource, TContext> => {
  return mapValues(map, (config) => ({
    ...config,
    type: getOutputType(config.type, true),
    args: config.args ? resolveThunk(getArgs(config.args)) : undefined,
  }));
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

    const addDefaultResolver = (config: FieldConfig<any, any, any>, key: string) => ({
      ...config,
      resolve: config.resolve || convertResolverMethod(source.prototype, key, config.args) || undefined,
    });

    const merged = mapValues<FieldConfigMap<any, any>, FieldConfig<any, any, any>>({
      ...allMaps,
      ...allFields,
    }, (value, key) => wrapResolver(addDefaultResolver(value, key)));

    return buildFieldConfigMap(merged);
  };
};
