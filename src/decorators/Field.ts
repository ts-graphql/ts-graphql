import 'reflect-metadata';
import { Constructor } from '../types';
import { FieldCreatorOptions } from '../fields';
import { GraphQLFieldConfig, GraphQLFieldConfigMap, Thunk } from 'graphql';
import resolveThunk from '../utils/resolveThunk';
import { mapValues } from 'lodash';
import { getGraphQLOutputType } from '../metadata';
import { isWrapper } from '../wrappers/Wrapper';

const fieldsKey = Symbol('field');

const getRawFields = (type: Constructor<any>): { [key: string]: () => GraphQLFieldConfig<any, any> } => {
  return Reflect.getMetadata(fieldsKey, type) || {};
}

export const getFields = (type: Constructor<any>): () => GraphQLFieldConfigMap<any, any> => {
  const fields = getRawFields(type.prototype);
  return () => mapValues(fields, (field: () => GraphQLFieldConfig<any, any>) => field());
}

export default (options: Thunk<FieldCreatorOptions<any, any>>) => (target: any, key: string) => {
  const configThunk: () => GraphQLFieldConfig<any, any> = () => {
    const { type } = resolveThunk(options);
    return {
      type: isWrapper(type) ? type.graphQLType : getGraphQLOutputType(type),
    }
  }
  const currentFields = getRawFields(target);
  Reflect.defineMetadata(fieldsKey, { ...currentFields, [key]: configThunk }, target)
}
