import 'reflect-metadata';
import { Constructor } from '../types';
import { FieldCreatorConfig } from '../fields';
import {
  GraphQLFieldConfig,
  GraphQLInputFieldConfig,
  GraphQLInputFieldConfigMap,
  Thunk,
} from 'graphql';
import { resolveThunk } from '../utils/thunk';
import { mapValues } from 'lodash';
import { getGraphQLOutputType } from '../metadata';
import { isWrapper } from '../wrappers/Wrapper';

const inputFieldsKey = Symbol('input-fields');

const getRawInputFields = (type: Constructor<any>): { [key: string]: () => GraphQLInputFieldConfig } => {
  return Reflect.getMetadata(inputFieldsKey, type) || {};
}

export const getInputFields = (type: Constructor<any>): () => GraphQLInputFieldConfigMap => {
  const fields = getRawInputFields(type.prototype);
  return () => mapValues(fields, (field) => field());
}

export default (options: Thunk<FieldCreatorConfig<any, any>>) => (target: any, key: string) => {
  const configThunk: () => GraphQLFieldConfig<any, any> = () => {
    const { type } = resolveThunk(options);
    return {
      type: isWrapper(type) ? type.graphQLType : getGraphQLOutputType(type),
    };
  };
  const currentFields = getRawInputFields(target);
  Reflect.defineMetadata(inputFieldsKey, { ...currentFields, [key]: configThunk }, target)
}
