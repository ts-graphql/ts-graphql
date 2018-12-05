import { AnyConstructor, EmptyConstructor, isEmptyConstructor, Maybe, ObjectLiteral } from '../types';
import { resolveThunk, Thunk } from '../utils/thunk';
import { GraphQLFieldConfigMap, GraphQLFieldResolver } from 'graphql';
import { FieldConfig, FieldConfigMap, FieldResolver } from '../fields';
import {
  getArgsConfig,
  getFieldConfig,
  getImplements, getInputFieldConfig,
  getSavedFieldConfigMap,
  isArgs,
  isInputObjectType,
} from '../metadata';
import { FieldResolverMethod } from '../decorators/Field';
import { getConstructorChain } from './utils';
import { mapValues } from 'lodash';
import getArgs from './buildArgs';
import { buildOutputType } from '../typeHelpers';
import { isWrapper } from '../wrappers/Wrapper';

const convertResolverMethod = (prototype: ObjectLiteral, key: string): FieldResolver<any, any, any> | null => {
  if (typeof prototype[key] === 'function') {
    const resolverMethod = prototype[key] as FieldResolverMethod<any, any, any>;
    return (source: any, ...rest) => resolverMethod.apply(source, rest);
  }
  return null;
}

type InputConstructorChildren = {
  [key: string]: InputConstructorNode<any>
}

type InputConstructorNode<T> = {
  constructor: EmptyConstructor<T>,
  children: InputConstructorChildren,
}

const buildInputConstructorTree = <T>(InputClass: EmptyConstructor<T>): Maybe<InputConstructorNode<T>> => {
  const map = isArgs(InputClass) ? getArgsConfig(InputClass) : getInputFieldConfig(InputClass);
  if (!map) {
    return null;
  }
  const children: InputConstructorChildren = {};
  for (const key in map) {
    if (!map.hasOwnProperty(key)) {
      continue;
    }
    const config = resolveThunk(map[key]);
    const { type } = config;
    if (!isWrapper(type) && isEmptyConstructor(type) && isInputObjectType(type)) {
      const tree = buildInputConstructorTree(type);
      if (tree) {
        children[key] = tree;
      }
    }
  }

  return {
    constructor: InputClass,
    children,
  };
}

const instantiateInputConstructorTree = <T>(tree: InputConstructorNode<T>, values: ObjectLiteral): T => {
  const instantiatedValues = { ...values };
  for (const key in tree.children) {
    if (!tree.children.hasOwnProperty(key)) {
      continue;
    }
    if (values[key] != null) {
      instantiatedValues[key] = instantiateInputConstructorTree(tree.children[key], values[key]);
    }
  }
  const instantiated: T = new tree.constructor();
  return Object.assign(instantiated, instantiatedValues);
}

const wrapResolverOnConfig = <TArgs>(
  config: FieldConfig<any, any, TArgs>
): FieldConfig<any, any, any> => {
  const { resolve, type, args: Args } = config;
  const transformOutput = isWrapper(type) && type.transformOutput;
  if (resolve) {
    const inputConstructorTree = Args && buildInputConstructorTree(Args);
    const wrapped: GraphQLFieldResolver<any, any> = inputConstructorTree
      ? (source: any, args: ObjectLiteral, ...rest) =>
        resolve(source, instantiateInputConstructorTree(inputConstructorTree, args), ...rest)
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
    type: buildOutputType(config.type, true),
    args: config.args ? resolveThunk(getArgs(config.args)) : undefined,
  }));
};

const defaultResolver = (key: string) => (source: ObjectLiteral, ...rest: any[]) => {
  const resolve = convertResolverMethod(source, key);
  if (resolve) {
    return (resolve as any)(source, ...rest);
  }
  return source[key];
}

export default (source: AnyConstructor<any>): Thunk<GraphQLFieldConfigMap<any, any>> => {
  return () => {
    const interfaces = getImplements(source) || [];
    const chain = [...getConstructorChain(source), ...interfaces].reverse();

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
      resolve: config.resolve || convertResolverMethod(source.prototype, key) || defaultResolver(key),
    });

    const merged = mapValues<FieldConfigMap<any, any>, FieldConfig<any, any, any>>({
      ...allMaps,
      ...allFields,
    }, (value, key) => wrapResolverOnConfig(addDefaultResolver(value, key)));

    return buildFieldConfigMap(merged);
  };
};
