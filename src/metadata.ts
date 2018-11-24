import 'reflect-metadata';
import { Constructor, ObjectLiteral } from './types';
import {
  GraphQLArgumentConfig,
  GraphQLFieldConfig, GraphQLFieldConfigArgumentMap,
  GraphQLFieldConfigMap, GraphQLInputFieldConfig, GraphQLInputFieldConfigMap,
  GraphQLInputType,
  GraphQLNonNull,
  GraphQLOutputType,
  GraphQLType,
} from 'graphql';
import { FieldConfig, FieldConfigMap, FieldCreatorConfig } from './fields';
import { resolveThunk, Thunk } from './utils/thunk';
import { mapValues } from 'lodash';
import { graphQLInputTypeForWrapper, graphQLOutputTypeForWrapper } from './wrappers/Wrapper';
import { InputFieldConfig } from './decorators/InputField';

const graphQLTypeKey = Symbol('graphql-type');
const graphQLInputTypeKey = Symbol('graphql-input-type');
const graphQLOutputTypeKey = Symbol('graphql-output-type');
const fieldKey = Symbol('field');
const fieldMapKey = Symbol('field-map');
const inputFieldKey = Symbol('input-field');

const getConstructorChain = (source: Constructor<any>): Array<Constructor<any>> => {
  const parent = Object.getPrototypeOf(source);
  if (parent == null || !parent.prototype) {
    return [source];
  }
  return [source, ...getConstructorChain(parent)];
}

export const graphQLTypeMetadata = (value: GraphQLType) => Reflect.metadata(graphQLTypeKey, new GraphQLNonNull(value));

export const getGraphQLType = (source: Constructor<any>): GraphQLType => {
  const value = Reflect.getMetadata(graphQLTypeKey, source);
  if (!value) {
    throw new Error(`Type not found for source ${source.name}`);
  }
  return value;
}

export const graphQLInputTypeMetadata = (value: GraphQLInputType) => (source: any) => {
  Reflect.metadata(graphQLTypeKey, new GraphQLNonNull(value))(source);
  Reflect.metadata(graphQLInputTypeKey, new GraphQLNonNull(value))(source);
}

export const getGraphQLInputType = (source: Constructor<any>): GraphQLInputType => {
  const value = Reflect.getMetadata(graphQLInputTypeKey, source);
  if (!value) {
    throw new Error(`Input type not found for source ${source.name}`);
  }
  return value;
}

export const graphQLOutputTypeMetadata = (value: GraphQLOutputType) => (source: any) => {
  Reflect.metadata(graphQLTypeKey, new GraphQLNonNull(value))(source);
  Reflect.metadata(graphQLOutputTypeKey, new GraphQLNonNull(value))(source);
}

export const getGraphQLOutputType = (source: Constructor<any>): GraphQLOutputType => {
  const value = Reflect.getMetadata(graphQLOutputTypeKey, source);
  if (!value) {
    throw new Error(`Output type not found for source ${source.name}`);
  }
  return value;
}

type StoredFieldConfig = { [key: string]: Thunk<FieldConfig<any, any, any>> };

const getFieldConfig = (target: Constructor<any>): StoredFieldConfig =>
  Reflect.getMetadata(fieldKey, target.prototype);

const getSavedFieldConfigMap = (target: Constructor<any>): Thunk<FieldConfigMap<any, any>> =>
  Reflect.getMetadata(fieldMapKey, target);

export const getFieldConfigMap = (source: Constructor<any>): Thunk<GraphQLFieldConfigMap<any, any>> => {
  return () => {
    const chain = getConstructorChain(source);
    const allFields: FieldConfigMap<any, any> = chain
      .map(getFieldConfig)
      .map((config) => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    const allMaps: FieldConfigMap<any, any> = chain
      .map(getSavedFieldConfigMap)
      .map(resolveThunk)
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    const merged = {
      ...allMaps,
      ...allFields,
    };

    return mapValues(merged, ((config) => ({
      type: graphQLOutputTypeForWrapper(config.type),
      ...config.args && { args: getArgs(config.args) },
      description: config.description,
      resolve: config.resolve,
    } as GraphQLFieldConfig<any, any>)));
  };
};

export const storeFieldConfig = (prototype: ObjectLiteral, name: string, config: Thunk<FieldConfig<any, any, any, any>>) => {
  const currentFields = Reflect.get(prototype, fieldKey);
  Reflect.defineMetadata(fieldKey, {...currentFields, [name]: config }, prototype);
};

export const storeFieldConfigMap = (
  target: Constructor<any>,
  configMap: Thunk<FieldConfigMap<any, any>>,
) => {
  Reflect.defineMetadata(fieldMapKey, configMap, target);
};

const getInputFieldConfig = (target: Constructor<any>): { [key: string]: InputFieldConfig<any> } => {
  return Reflect.getMetadata(inputFieldKey, target.prototype);
};

export const getInputFieldConfigMap = (source: Constructor<any>): Thunk<GraphQLInputFieldConfigMap> => {
  return () => {
    const chain = getConstructorChain(source);
    const allFields: { [key: string]: InputFieldConfig<any> } = chain
      .map(getInputFieldConfig)
      .map((config) => mapValues(config, resolveThunk))
      .reduce((obj, config) => ({ ...obj, ...config }), {});

    return mapValues(allFields, ((config) => ({
      type: graphQLInputTypeForWrapper(config.type),
      description: config.description,
      defaultValue: config.defaultValue,
    } as GraphQLInputFieldConfig)));
  };
};

export const storeInputFieldConfig = (
  prototype: ObjectLiteral,
  name: string,
  config: Thunk<InputFieldConfig<any>>,
) => {
  const currentFields = Reflect.get(prototype, inputFieldKey);
  Reflect.defineMetadata(inputFieldKey, { ...currentFields, [name]: config }, prototype);
}

export const getArgs = getInputFieldConfigMap as (source: Constructor<any>) => Thunk<GraphQLFieldConfigArgumentMap>;
