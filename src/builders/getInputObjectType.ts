import { GraphQLInputObjectType, isInputObjectType } from 'graphql';
import { getObjectTypeConfig } from '../metadata';
import { Constructor } from '../types';
import getInputFieldConfigMap from './getInputFieldConfigMap';

export default (source: Constructor<any>): GraphQLInputObjectType => {
  const config = getObjectTypeConfig(source);
  if (!config || !isInputObjectType(source)) {
    throw new Error(`Input object type config not found for ${source.name}`);
  }
  const { name, description } = config;
  return new GraphQLInputObjectType({
    name: name || source.name,
    fields: getInputFieldConfigMap(source),
    description,
  });
};
